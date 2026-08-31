import { describe, expect, it } from "vitest";
import { assign, evaluate } from "../../src/engine/dispatchEngine";
import { nextStop } from "../../src/engine/stopQueue";
import { tick } from "../../src/engine/stateMachine";
import { idleCar, hall, worldAt } from "./fixtures";

describe("DispatchEngine", () => {
  it("assigns the lowest-cost car and locks the request (US-D1)", () => {
    const state = worldAt(0, [idleCar("A", 4), idleCar("B", 10), idleCar("C", 9)]);
    const request = hall("018", 5, "up", 8);
    const result = assign(request, state);
    expect(result.elevatorId).toBe("A");
    expect(result.request.assignedElevatorId).toBe("A");
    expect(result.breakdown.selected).toBe("A");
    expect(evaluate(request, state).selected).toBe(result.elevatorId);
  });

  it("does not mutate the input state", () => {
    const state = worldAt(0, [idleCar("A", 1), idleCar("B", 1), idleCar("C", 1)]);
    const request = hall("1", 3, "up", 7);
    assign(request, state);
    expect(state.elevators.A.queue.up).toEqual([]);
    expect(request.assignedElevatorId).toBeNull();
  });

  it("idle car at floor 1 travels up to a down hall at floor 10", () => {
    const state = worldAt(0, [idleCar("A", 1), idleCar("B", 1), idleCar("C", 1)]);
    const result = assign(hall("bug", 10, "down", 4), state);
    const assigned = result.state.elevators.A;
    expect(result.elevatorId).toBe("A");
    expect(assigned.status).toBe("moving-up");
    expect(assigned.queue.up).toContain(10);
    expect(assigned.queue.up).not.toContain(4);
    expect(nextStop(assigned.queue, assigned.floor, "up")).toBe(10);
    const arrived = tick(assigned, 9);
    expect(arrived.floor).toBe(10);
    expect(arrived.status).toBe("doors-open");
  });
});
