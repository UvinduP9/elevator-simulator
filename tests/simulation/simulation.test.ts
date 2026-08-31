import { createSeededRandom, SimulationClock, SimulationService, TrafficGenerator } from "../../src/simulation";

describe("simulation runtime", () => {
  it("scales time and freezes while paused", () => {
    const clock = new SimulationClock();
    clock.setSpeed(2);
    expect(clock.tick(1).simDt).toBe(2);
    clock.pause();
    expect(clock.tick(5).simDt).toBe(0);
    expect(clock.snapshot().now).toBe(2);
  });

  it("creates valid hall requests with deterministic destinations", () => {
    const service = new SimulationService(() => 0);
    const request = service.clickHall(4, "up");
    expect(request.destinationFloor).toBe(5);
    expect(request.assignedElevatorId).not.toBeNull();
    expect(service.getSnapshot().events.map((event) => event.type)).toEqual(["REQUEST", "DISPATCH"]);
  });

  it("boards, opens doors, and completes a passenger journey", () => {
    const service = new SimulationService(() => 0);
    service.clickHall(1, "up");
    service.tick(0.1);
    expect(service.getSnapshot().world.elevators[0]?.occupancy).toBe(1);
    service.tick(2);
    service.tick(1);
    const snapshot = service.getSnapshot();
    expect(snapshot.world.requests[0]?.status).toBe("completed");
    expect(snapshot.world.elevators[0]?.occupancy).toBe(0);
    expect(snapshot.metrics.completedTrips).toBe(1);
  });

  it("reset restores the initial runtime state", () => {
    const service = new SimulationService(() => 0.4);
    service.addRandomRequest();
    service.setSpeed(5);
    service.tick(1);
    service.reset();
    const snapshot = service.getSnapshot();
    expect(snapshot.clock).toEqual({ now: 0, running: true, speed: 1 });
    expect(snapshot.world.requests).toEqual([]);
    expect(snapshot.events).toEqual([]);
    expect(snapshot.world.elevators.map((elevator) => elevator.floor)).toEqual([1, 5, 10]);
  });

  it("generates busy traffic more frequently than normal traffic", () => {
    const normal = new TrafficGenerator(createSeededRandom(42));
    const busy = new TrafficGenerator(createSeededRandom(42));
    normal.setPreset("Normal", 0);
    busy.setPreset("Busy", 0);
    expect(busy.maybeSpawn(5)).toBeGreaterThan(normal.maybeSpawn(5));
  });
});
