import { describe, expect, it } from "vitest";
import { SimulationService } from "../../src/simulation/simulationService";

const zeroRng = (): number => 0;

describe("SimulationService", () => {
  it("creates a hall ↑ request with a dest in that direction and assigns a car (US-L2)", () => {
    const sim = new SimulationService({ rng: zeroRng });
    sim.clickHall(3, "up");
    const [req] = sim.getRequests();
    expect(req).toBeDefined();
    expect(req!.request.pickupFloor).toBe(3);
    expect(req!.request.direction).toBe("up");
    expect(req!.request.destinationFloor).toBeGreaterThan(3);
    expect(req!.request.destinationFloor).toBeLessThanOrEqual(10);
    expect(req!.request.assignedElevatorId).not.toBeNull();
    expect(sim.getSnapshot().requests).toHaveLength(1);
  });

  it("ignores invalid ↓ on floor 1 (US-L2)", () => {
    const sim = new SimulationService({ rng: zeroRng });
    sim.clickHall(1, "down");
    expect(sim.getRequests()).toHaveLength(0);
    expect(sim.getSnapshot().events).toHaveLength(0);
  });

  it("+ Add request uses the same assign path as a hall click (US-L4)", () => {
    const sim = new SimulationService({ rng: zeroRng });
    sim.addRandomRequest();
    const [req] = sim.getRequests();
    expect(req!.request.assignedElevatorId).not.toBeNull();
    expect(req!.breakdown.selected).toBe(req!.request.assignedElevatorId);
    expect(sim.getSnapshot().evaluation.selected).toBe(req!.breakdown.selected);
  });

  it("traffic Off adds no auto requests (US-L5)", () => {
    const sim = new SimulationService({ rng: zeroRng });
    sim.setTraffic("Off");
    sim.step(100);
    expect(sim.getRequests()).toHaveLength(0);
  });

  it("Busy catch-up step(9) at 1x spawns three requests (US-L5)", () => {
    const sim = new SimulationService({ rng: zeroRng });
    sim.setTraffic("Busy");
    sim.step(9);
    expect(sim.getRequests()).toHaveLength(3);
  });

  it("pause freezes cars and auto spawn (US-L6)", () => {
    const sim = new SimulationService({ rng: zeroRng });
    sim.clickHall(8, "up");
    const floorBefore = sim.getSnapshot().elevators[0]!.floor;
    sim.pause();
    sim.setTraffic("Busy");
    sim.step(10);
    expect(sim.getNow()).toBe(0);
    expect(sim.getSnapshot().elevators[0]!.floor).toBe(floorBefore);
    expect(sim.getRequests()).toHaveLength(1);
  });

  it("reset returns cars to idle floor 1 and clears the log (US-L6)", () => {
    const sim = new SimulationService({ rng: zeroRng });
    sim.clickHall(5, "up");
    sim.setTraffic("Normal");
    sim.step(2);
    sim.reset();
    const snap = sim.getSnapshot();
    expect(sim.getNow()).toBe(0);
    expect(snap.elevators.every((e) => e.floor === 1 && e.status === "idle")).toBe(true);
    expect(snap.events).toHaveLength(0);
    expect(snap.requests).toHaveLength(0);
    expect(snap.traffic).toBe("Off");
    expect(snap.speed).toBe(1);
    expect(snap.status).toBe("Running");
  });

  it("boards on enter doors-open at pickup then alights at destination (US-L7)", () => {
    const sim = new SimulationService({ rng: zeroRng });
    sim.clickHall(1, "up");
    expect(sim.getSnapshot().elevators[0]!.occupancy).toBe(1);
    expect(sim.getRequests()[0]!.request.status).toBe("boarded");
    sim.step(2);
    sim.step(1);
    const occ = sim.getSnapshot().elevators.reduce((n, e) => n + e.occupancy, 0);
    expect(occ).toBe(0);
    expect(sim.getRequests()[0]!.request.status).toBe("completed");
    expect(sim.getSnapshot().metrics.completedTrips).toBe(1);
  });

  it("fulfills a floor-10 down hall assigned to idle A at floor 1", () => {
    const sim = new SimulationService({ rng: zeroRng });
    sim.clickHall(10, "down");
    expect(sim.getRequests()[0]!.request.assignedElevatorId).toBe("A");
    sim.step(1);
    const moving = sim.getSnapshot().elevators.find((e) => e.id === "A")!;
    expect(moving.status).not.toBe("idle");
    expect(moving.floor).toBeGreaterThan(1);
    sim.step(20);
    const req = sim.getRequests()[0]!;
    expect(req.request.status).not.toBe("assigned");
    expect(req.pickupAt).not.toBeNull();
  });

  it("formats snapshot event time from simulation elapsed (Q7)", () => {
    const sim = new SimulationService({ rng: zeroRng });
    sim.step(14.2);
    sim.clickHall(3, "up");
    const requestEvent = sim.getSnapshot().events.find((e) => e.type === "REQUEST");
    expect(requestEvent?.time).toBe("00:00:14.200");
  });
});
