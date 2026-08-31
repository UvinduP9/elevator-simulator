import fc from "fast-check";
import { createStopQueue } from "../../src/engine";
import type { Direction, Elevator, ElevatorId, HallRequest } from "../../src/engine";

export const floorArb = fc.integer({ min: 1, max: 10 });
export const directionArb: fc.Arbitrary<Direction> = fc.constantFrom("up", "down");
export const elevatorIdArb: fc.Arbitrary<ElevatorId> = fc.constantFrom("A", "B", "C");

export const requestArb: fc.Arbitrary<HallRequest> = fc
  .record({
    id: fc.uuid(),
    pickupFloor: fc.integer({ min: 1, max: 10 }),
    direction: directionArb,
    createdAt: fc.integer({ min: 0, max: 10_000 }),
  })
  .map(({ id, pickupFloor, direction, createdAt }) => {
    const validDirection = pickupFloor === 1 ? "up" : pickupFloor === 10 ? "down" : direction;
    const destinationFloor = validDirection === "up" ? pickupFloor + 1 : pickupFloor - 1;
    return {
      id,
      pickupFloor,
      direction: validDirection,
      destinationFloor,
      createdAt,
      status: "pending",
      assignedElevatorId: null,
    };
  });

export const elevatorArb: fc.Arbitrary<Elevator> = fc
  .record({
    id: elevatorIdArb,
    floor: floorArb,
    direction: fc.option(directionArb, { nil: null }),
    occupancy: fc.integer({ min: 0, max: 100 }),
  })
  .map(({ id, floor, direction, occupancy }) => ({
    id,
    floor,
    direction,
    status: direction === null ? "idle" : "moving",
    stops: createStopQueue(),
    occupancy,
    doorRemainingSeconds: 0,
    targetFloor: null,
    busySeconds: 0,
  }));
