import {
  assign,
  canReverse,
  createStopQueue,
  insertPickup,
  nextDirection,
  score,
} from "../../src/engine";
import type { Elevator, HallRequest } from "../../src/engine";

function elevator(id: "A" | "B" | "C", floor: number): Elevator {
  return {
    id,
    floor,
    direction: null,
    status: "idle",
    stops: createStopQueue(),
    occupancy: 0,
    doorRemainingSeconds: 0,
    targetFloor: null,
    busySeconds: 0,
  };
}

function request(overrides: Partial<HallRequest> = {}): HallRequest {
  return {
    id: "001",
    pickupFloor: 3,
    direction: "up",
    destinationFloor: 8,
    createdAt: 0,
    status: "pending",
    assignedElevatorId: null,
    ...overrides,
  };
}

describe("dispatch engine examples", () => {
  it("assigns a call to the nearest idle elevator", () => {
    const result = assign(request(), {
      now: 0,
      elevators: [elevator("A", 1), elevator("B", 8), elevator("C", 10)],
      requests: [],
    });
    expect(result.elevatorId).toBe("A");
    expect(result.breakdown.A.total).toBeLessThan(result.breakdown.B.total);
  });

  it("breaks exact ties by elevator id", () => {
    const result = assign(request({ pickupFloor: 5 }), {
      now: 0,
      elevators: [elevator("C", 5), elevator("B", 5), elevator("A", 5)],
      requests: [],
    });
    expect(result.elevatorId).toBe("A");
  });

  it("does not reverse while current-direction stops remain", () => {
    let queue = createStopQueue();
    queue = insertPickup(queue, 6, "up");
    queue = insertPickup(queue, 2, "down");
    expect(canReverse(queue, "up")).toBe(false);
    expect(nextDirection(queue, "up")).toBe("up");
  });

  it("increases age credit and lowers cost for an older request", () => {
    const car = elevator("A", 8);
    const call = request({ createdAt: 10 });
    const fresh = score(call, car, 10);
    const old = score(call, car, 110);
    expect(old.waitingAgeCredit).toBeGreaterThan(fresh.waitingAgeCredit);
    expect(old.total).toBeLessThan(fresh.total);
  });
});
