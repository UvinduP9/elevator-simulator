import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import { assign, evaluate } from "../../src/engine/dispatchEngine";
import { pickWinner, score, total } from "../../src/engine/costScorer";
import { MAX_FLOOR, MIN_FLOOR } from "../../src/engine/config";
import {
  canReverse,
  emptyQueue,
  insertDestination,
  insertPickup,
  ensureApproachStops,
  nextStop,
  removeStop,
  stopCount,
} from "../../src/engine/stopQueue";
import { alight, board, tick } from "../../src/engine/stateMachine";
import type { CarCost, Direction, ElevatorId, StopQueue } from "../../src/engine/types";
import { ELEVATOR_IDS } from "../../src/engine/types";
import {
  directionArb,
  dtArb,
  elevatorArb,
  floorArb,
  hallRequestArb,
  passengerCountArb,
  queueCommandListArb,
  stopQueueArb,
  waitArb,
  worldStateArb,
  type QueueCommand,
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

function oracleWinner(cars: CarCost[]): ElevatorId {
  let best: ElevatorId = "A";
  let bestTotal = Number.POSITIVE_INFINITY;
  for (const id of ELEVATOR_IDS) {
    const row = cars.find((c) => c.elevatorId === id);
    if (!row) continue;
    if (row.total < bestTotal) {
      best = id;
      bestTotal = row.total;
    }
  }
  return best;
}

function modelNextStop(queue: { up: Set<number>; down: Set<number> }, floor: number, direction: Direction): number | null {
  if (direction === "up") {
    const ahead = [...queue.up].filter((f) => f > floor).sort((a, b) => a - b);
    return ahead[0] ?? null;
  }
  const ahead = [...queue.down].filter((f) => f < floor).sort((a, b) => b - a);
  return ahead[0] ?? null;
}

function applyModel(
  model: { up: Set<number>; down: Set<number> },
  command: QueueCommand,
): { up: Set<number>; down: Set<number> } {
  const up = new Set(model.up);
  const down = new Set(model.down);
  switch (command.kind) {
    case "insertPickup":
      if (command.direction === "up") up.add(command.floor);
      else down.add(command.floor);
      break;
    case "insertDestination":
      if (command.destFloor === command.fromFloor) break;
      if (command.destFloor > command.fromFloor) up.add(command.destFloor);
      else down.add(command.destFloor);
      break;
    case "removeStop":
      up.delete(command.floor);
      down.delete(command.floor);
      break;
  }
  return { up, down };
}

function applyQueue(queue: StopQueue, command: QueueCommand): StopQueue {
  switch (command.kind) {
    case "insertPickup":
      return insertPickup(queue, command.floor, command.direction);
    case "insertDestination":
      return insertDestination(queue, command.fromFloor, command.destFloor);
    case "removeStop":
      return removeStop(queue, command.floor);
  }
}

function sortedEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

describe("dispatch-engine properties", () => {
  it("PBT-05 oracle: evaluate selects the min-total car with A-B-C tie-break", () => {
    assertProperty(
      "min-cost oracle",
      fc.property(hallRequestArb, worldStateArb, (request, state) => {
        const breakdown = evaluate(request, state);
        const recomputed = breakdown.cars.map((row) => ({ ...row, total: total(row) }));
        expect(oracleWinner(recomputed)).toBe(breakdown.selected);
        expect(pickWinner(breakdown.cars)).toBe(breakdown.selected);
      }),
    );
  });

  it("PBT-03 assign and evaluate agree on winner and six factor columns", () => {
    assertProperty(
      "assign/evaluate agreement",
      fc.property(hallRequestArb, worldStateArb, (request, state) => {
        const before = evaluate(request, state);
        const result = assign(request, state);
        expect(result.elevatorId).toBe(before.selected);
        expect(result.breakdown.selected).toBe(before.selected);
        expect(result.breakdown.cars).toEqual(before.cars);
        expect(result.request.assignedElevatorId).toBe(result.elevatorId);
        expect(result.request.status).toBe("assigned");
      }),
    );
  });

  it("PBT-03 waiting-age credit is monotonic in wait time", () => {
    assertProperty(
      "waiting-age monotonic",
      fc.property(hallRequestArb, elevatorArb("A"), waitArb, waitArb, (request, car, t0, extra) => {
        const early = score(request, car, request.createdAt + t0);
        const later = score(request, car, request.createdAt + t0 + extra);
        expect(later.waitingAgeCredit).toBeGreaterThanOrEqual(early.waitingAgeCredit);
      }),
    );
  });

  it("PBT-03 idle cars have zero reverse and direction mismatch", () => {
    assertProperty(
      "idle penalties",
      fc.property(hallRequestArb, floorArb, waitArb, (request, floor, now) => {
        const car = {
          id: "A" as const,
          floor,
          status: "idle" as const,
          direction: null,
          queue: emptyQueue(),
          occupancy: 0,
          doorTimer: 0,
        };
        const row = score(request, car, now);
        expect(row.reversePenalty).toBe(0);
        expect(row.directionCompatibility).toBe(0);
      }),
    );
  });

  it("PBT-04 insertPickup is idempotent", () => {
    assertProperty(
      "insertPickup idempotent",
      fc.property(stopQueueArb, floorArb, directionArb, (queue, floor, direction) => {
        const once = insertPickup(queue, floor, direction);
        const twice = insertPickup(once, floor, direction);
        expect(twice).toEqual(once);
      }),
    );
  });

  it("PBT-03 canReverse is false while a stop remains strictly ahead", () => {
    assertProperty(
      "reverse-gate vs remaining stops",
      fc.property(stopQueueArb, floorArb, directionArb, (queue, floor, direction) => {
        const remaining =
          direction === "up" ? queue.up.some((f) => f > floor) : queue.down.some((f) => f < floor);
        expect(canReverse(queue, direction, floor)).toBe(!remaining);
        const nxt = nextStop(queue, floor, direction);
        if (nxt !== null) {
          if (direction === "up") expect(nxt).toBeGreaterThan(floor);
          else expect(nxt).toBeLessThan(floor);
        }
      }),
    );
  });

  it("PBT-06 StopQueue command sequences match a two-set model", () => {
    assertProperty(
      "stop-queue vs two-set model",
      fc.property(queueCommandListArb, floorArb, directionArb, (commands, probeFloor, probeDir) => {
        let queue = emptyQueue();
        let model = { up: new Set<number>(), down: new Set<number>() };
        for (const command of commands) {
          queue = applyQueue(queue, command);
          model = applyModel(model, command);
          const modelUp = [...model.up].sort((a, b) => a - b);
          const modelDown = [...model.down].sort((a, b) => b - a);
          expect(sortedEqual(queue.up, modelUp)).toBe(true);
          expect(sortedEqual(queue.down, modelDown)).toBe(true);
          expect(stopCount(queue)).toBe(model.up.size + model.down.size);
          expect(nextStop(queue, probeFloor, probeDir)).toBe(modelNextStop(model, probeFloor, probeDir));
          expect(canReverse(queue, probeDir, probeFloor)).toBe(
            modelNextStop(model, probeFloor, probeDir) === null,
          );
        }
      }),
    );
  });

  it("PBT-03 tick keeps floor in [1, 10]", () => {
    assertProperty(
      "floor range",
      fc.property(elevatorArb("A"), dtArb, (car, dt) => {
        const next = tick(car, dt);
        expect(next.floor).toBeGreaterThanOrEqual(MIN_FLOOR);
        expect(next.floor).toBeLessThanOrEqual(MAX_FLOOR);
      }),
    );
  });

  it("PBT-03 occupancy stays >= 0 after valid board/alight", () => {
    assertProperty(
      "occupancy non-negative",
      fc.property(elevatorArb("B"), passengerCountArb, passengerCountArb, (car, boarding, leaving) => {
        const afterBoard = board(car, boarding);
        expect(afterBoard.occupancy).toBe(car.occupancy + boarding.length);
        const afterAlight = alight(afterBoard, leaving.slice(0, afterBoard.occupancy));
        expect(afterAlight.occupancy).toBeGreaterThanOrEqual(0);
      }),
    );
  });

  it("PBT-03 tick does not reverse while canReverse is false", () => {
    assertProperty(
      "tick reverse gate",
      fc.property(elevatorArb("C"), dtArb, (car, dt) => {
        if (!car.direction || canReverse(car.queue, car.direction, car.floor)) return;
        const next = tick(car, dt);
        expect(next.direction).toBe(car.direction);
      }),
    );
  });

  it("PBT-03 assign leaves a nextStop toward a pickup that is not at the car", () => {
    assertProperty(
      "assign pickup reachable",
      fc.property(hallRequestArb, worldStateArb, (request, state) => {
        const result = assign(request, state);
        const before = state.elevators[result.elevatorId];
        const car = result.state.elevators[result.elevatorId];
        const atPickup =
          Math.abs(car.floor - request.pickupFloor) <= 1e-6;
        const upN = nextStop(car.queue, car.floor, "up");
        const downN = nextStop(car.queue, car.floor, "down");
        if (!atPickup) {
          expect(upN !== null || downN !== null).toBe(true);
        }
        if ((before.status === "idle" || before.direction === null) && !atPickup) {
          expect(car.status === "moving-up" || car.status === "moving-down").toBe(true);
          expect(car.direction).not.toBeNull();
          expect(nextStop(car.queue, car.floor, car.direction!)).not.toBeNull();
        }
      }),
    );
  });

  it("PBT-03 ensureApproachStops puts the farthest stranded down stop on up (and lowest stranded up stop on down)", () => {
    assertProperty(
      "ensureApproachStops",
      fc.property(stopQueueArb, floorArb, (queue, floor) => {
        const next = ensureApproachStops(queue, floor);
        const downAbove = queue.down.filter((f) => f > floor);
        if (downAbove.length > 0) expect(next.up).toContain(Math.max(...downAbove));
        const upBelow = queue.up.filter((f) => f < floor);
        if (upBelow.length > 0) expect(next.down).toContain(Math.min(...upBelow));
      }),
    );
  });
});
