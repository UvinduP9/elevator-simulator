import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import { catchUpSpawns, trafficInterval } from "../../src/simulation/traffic";
import { SimulationService } from "../../src/simulation/simulationService";
import { formatSimTime } from "../../src/simulation/format";
import { SPAWN_CATCHUP_CAP } from "../../src/simulation/config";
import type { Speed, TrafficPreset } from "../../src/simulation/types";
import {
  hallPairArb,
  realDtArb,
  rngArb,
  simCommandListArb,
  speedArb,
  trafficArb,
  type SimCommand,
} from "./generators";

function assertProperty(name: string, property: fc.IProperty<unknown>): void {
  try {
    fc.assert(property, { numRuns: 100 });
  } catch (error) {
    const fromField =
      error && typeof error === "object" && "seed" in error ? (error as { seed: unknown }).seed : undefined;
    const fromMessage =
      error instanceof Error ? error.message.match(/seed:\s*(-?\d+)/)?.[1] : undefined;
    console.error(`PBT failure [${name}] seed=${String(fromField ?? fromMessage ?? "unknown")}`);
    throw error;
  }
}

function validDest(pickup: number, direction: "up" | "down", dest: number): boolean {
  if (direction === "up") return dest > pickup && dest <= 10;
  return dest < pickup && dest >= 1;
}

type Model = {
  now: number;
  paused: boolean;
  speed: Speed;
  traffic: TrafficPreset;
  spawnDebt: number;
  autoCount: number;
};

function initialModel(): Model {
  return { now: 0, paused: false, speed: 1, traffic: "Off", spawnDebt: 0, autoCount: 0 };
}

function applyModel(model: Model, command: SimCommand): Model {
  switch (command.kind) {
    case "pause":
      return { ...model, paused: true };
    case "resume":
      return { ...model, paused: false };
    case "setSpeed":
      return { ...model, speed: command.speed };
    case "setTraffic":
      return {
        ...model,
        traffic: command.traffic,
        spawnDebt: command.traffic === "Off" ? 0 : model.spawnDebt,
      };
    case "reset":
      return initialModel();
    case "clickHall":
    case "addRandomRequest":
      return model;
    case "step": {
      if (model.paused || command.realDt <= 0) return model;
      const dt = command.realDt * model.speed;
      const now = model.now + dt;
      if (model.traffic === "Off") return { ...model, now };
      const { count, debt } = catchUpSpawns(model.spawnDebt + dt, model.traffic);
      return { ...model, now, spawnDebt: debt, autoCount: model.autoCount + count };
    }
  }
}

function applyService(sim: SimulationService, command: SimCommand): void {
  switch (command.kind) {
    case "pause":
      sim.pause();
      break;
    case "resume":
      sim.resume();
      break;
    case "setSpeed":
      sim.setSpeed(command.speed);
      break;
    case "setTraffic":
      sim.setTraffic(command.traffic);
      break;
    case "reset":
      sim.reset();
      break;
    case "clickHall":
      sim.clickHall(command.floor, command.direction);
      break;
    case "addRandomRequest":
      sim.addRandomRequest();
      break;
    case "step":
      sim.step(command.realDt);
      break;
  }
}

describe("simulation-runtime properties", () => {
  it("PBT-03 paused step does not change now or car floors", () => {
    assertProperty(
      "pause freeze",
      fc.property(realDtArb, rngArb, (realDt, r) => {
        const sim = new SimulationService({ rng: () => r });
        sim.clickHall(6, "up");
        sim.pause();
        const now = sim.getNow();
        const floors = sim.getSnapshot().elevators.map((e) => e.floor);
        sim.step(realDt);
        expect(sim.getNow()).toBe(now);
        expect(sim.getSnapshot().elevators.map((e) => e.floor)).toEqual(floors);
      }),
    );
  });

  it("PBT-05 running step advances now by realDt * speed", () => {
    assertProperty(
      "clock oracle",
      fc.property(realDtArb, speedArb, (realDt, speed) => {
        const sim = new SimulationService({ rng: () => 0 });
        sim.setSpeed(speed);
        sim.step(realDt);
        if (realDt <= 0) expect(sim.getNow()).toBe(0);
        else expect(sim.getNow()).toBeCloseTo(realDt * speed, 10);
      }),
    );
  });

  it("PBT-03 traffic Off never auto-spawns", () => {
    assertProperty(
      "traffic off",
      fc.property(realDtArb, speedArb, (realDt, speed) => {
        const sim = new SimulationService({ rng: () => 0 });
        sim.setSpeed(speed);
        sim.setTraffic("Off");
        sim.step(realDt);
        expect(sim.getRequests()).toHaveLength(0);
      }),
    );
  });

  it("PBT-05 Busy/Normal catch-up count matches the interval oracle", () => {
    assertProperty(
      "spawn catch-up oracle",
      fc.property(realDtArb, fc.constantFrom("Normal", "Busy") as fc.Arbitrary<"Normal" | "Busy">, (realDt, preset) => {
        const sim = new SimulationService({ rng: () => 0 });
        sim.setTraffic(preset);
        sim.step(realDt);
        const interval = trafficInterval(preset)!;
        const expected = realDt <= 0 ? 0 : Math.min(Math.floor(realDt / interval), SPAWN_CATCHUP_CAP);
        expect(sim.getRequests()).toHaveLength(expected);
      }),
    );
  });

  it("PBT-03 created destinations are valid for direction", () => {
    assertProperty(
      "destination invariant",
      fc.property(hallPairArb, rngArb, (pair, r) => {
        const sim = new SimulationService({ rng: () => r });
        sim.clickHall(pair.floor, pair.direction);
        const req = sim.getRequests()[0]!;
        expect(validDest(req.request.pickupFloor, req.request.direction, req.request.destinationFloor)).toBe(
          true,
        );
      }),
    );
  });

  it("PBT-03 occupancy is never negative", () => {
    assertProperty(
      "occupancy",
      fc.property(simCommandListArb, rngArb, (commands, r) => {
        const sim = new SimulationService({ rng: () => r });
        for (const command of commands) applyService(sim, command);
        for (const car of sim.getSnapshot().elevators) {
          expect(car.occupancy).toBeGreaterThanOrEqual(0);
        }
      }),
    );
  });

  it("PBT-04 double reset matches a single reset", () => {
    assertProperty(
      "reset idempotent",
      fc.property(simCommandListArb, rngArb, (commands, r) => {
        const sim = new SimulationService({ rng: () => r });
        for (const command of commands) applyService(sim, command);
        sim.reset();
        const once = sim.getSnapshot();
        sim.reset();
        const twice = sim.getSnapshot();
        expect(twice).toEqual(once);
        expect(sim.getNow()).toBe(0);
      }),
    );
  });

  it("PBT-08 event timestamps match HH:MM:SS.mmm", () => {
    assertProperty(
      "event time format",
      fc.property(realDtArb, (realDt) => {
        const sim = new SimulationService({ rng: () => 0 });
        sim.step(realDt);
        sim.clickHall(4, "up");
        const time = sim.getSnapshot().events[0]!.time;
        expect(time).toBe(formatSimTime(sim.getNow()));
        expect(time).toMatch(/^\d{2}:\d{2}:\d{2}\.\d{3}$/);
      }),
    );
  });

  it("PBT-06 command sequences match clock/spawn model", () => {
    assertProperty(
      "stateful clock-spawn model",
      fc.property(simCommandListArb, rngArb, (commands, r) => {
        const sim = new SimulationService({ rng: () => r });
        let model = initialModel();
        let extra = 0;
        for (const command of commands) {
          if (command.kind === "clickHall" || command.kind === "addRandomRequest") extra += 1;
          applyService(sim, command);
          model = applyModel(model, command);
          if (command.kind === "reset") extra = 0;
          expect(sim.getNow()).toBeCloseTo(model.now, 8);
          expect(sim.getSnapshot().status === "Paused").toBe(model.paused);
          expect(sim.getRequests().length).toBe(model.autoCount + extra);
        }
      }),
    );
  });

  it("PBT-03 getSnapshot always has three cars and occupancyMax 8", () => {
    assertProperty(
      "snapshot shape",
      fc.property(simCommandListArb, rngArb, (commands, r) => {
        const sim = new SimulationService({ rng: () => r });
        for (const command of commands) applyService(sim, command);
        const snap = sim.getSnapshot();
        expect(snap.elevators).toHaveLength(3);
        expect(snap.elevators.every((e) => e.occupancyMax === 8)).toBe(true);
      }),
    );
  });
});
