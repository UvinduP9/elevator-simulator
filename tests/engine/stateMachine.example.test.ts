import { describe, expect, it } from "vitest";
import { DOOR_DWELL_SECONDS } from "../../src/engine/config";
import { insertPickup } from "../../src/engine/stopQueue";
import { alight, board, tick } from "../../src/engine/stateMachine";
import { idleCar } from "./fixtures";

describe("ElevatorStateMachine", () => {
  it("moves toward the next stop and opens doors on arrival", () => {
    let car = idleCar("A", 1);
    car = {
      ...car,
      queue: insertPickup(car.queue, 3, "up"),
      direction: "up",
      status: "moving-up",
    };
    car = tick(car, 1);
    expect(car.floor).toBe(2);
    expect(car.status).toBe("moving-up");
    car = tick(car, 1);
    expect(car.floor).toBe(3);
    expect(car.status).toBe("doors-open");
    expect(car.doorTimer).toBe(DOOR_DWELL_SECONDS);
  });

  it("does not reverse while an up stop remains", () => {
    let car = idleCar("A", 5);
    car = {
      ...car,
      queue: insertPickup(insertPickup(car.queue, 8, "up"), 2, "down"),
      direction: "up",
      status: "moving-up",
    };
    car = tick(car, 10);
    expect(car.status).toBe("doors-open");
    expect(car.floor).toBe(8);
    car = tick(car, DOOR_DWELL_SECONDS);
    expect(car.direction).toBe("down");
  });

  it("does not drop an ahead stop when doors close off that floor", () => {
    let car = idleCar("C", 9.5);
    car = {
      ...car,
      status: "doors-open",
      direction: "up",
      queue: insertPickup(car.queue, 10, "up"),
      doorTimer: 0,
    };
    car = tick(car, 1);
    expect(car.direction).toBe("up");
    expect(car.queue.up).toContain(10);
    expect(car.floor).toBeGreaterThanOrEqual(1);
    expect(car.floor).toBeLessThanOrEqual(10);
  });

  it("wakes an idle car stranded with a down stop above it", () => {
    let car = idleCar("A", 1);
    car = { ...car, queue: insertPickup(car.queue, 10, "down") };
    car = tick(car, 1);
    expect(car.status).toBe("moving-up");
    expect(car.direction).toBe("up");
    expect(car.queue.up).toContain(10);
    expect(car.floor).toBe(2);
  });

  it("never refuses boarding (US-D6 / occupancy)", () => {
    const car = idleCar("B", 3);
    const boarded = board(car, [
      { id: "p1", requestId: "1", originFloor: 3, destinationFloor: 8 },
      { id: "p2", requestId: "2", originFloor: 3, destinationFloor: 9 },
    ]);
    expect(boarded.occupancy).toBe(2);
    const after = alight(boarded, [
      { id: "p1", requestId: "1", originFloor: 3, destinationFloor: 8 },
    ]);
    expect(after.occupancy).toBe(1);
  });
});
