import * as fc from "fast-check";
import { emptyQueue } from "../../src/engine/stopQueue";
import type {
  Direction,
  Elevator,
  ElevatorId,
  ElevatorStatus,
  HallRequest,
  Passenger,
  StopQueue,
  WorldState,
} from "../../src/engine/types";
import { ELEVATOR_IDS } from "../../src/engine/types";

export const floorArb: fc.Arbitrary<number> = fc.integer({ min: 1, max: 10 });

export const fractionalFloorArb: fc.Arbitrary<number> = fc.double({
  min: 1,
  max: 10,
  noNaN: true,
});

export const elevatorIdArb: fc.Arbitrary<ElevatorId> = fc.constantFrom(...ELEVATOR_IDS);

export const directionArb: fc.Arbitrary<Direction> = fc.constantFrom("up", "down");

export const dtArb: fc.Arbitrary<number> = fc.double({ min: 0, max: 8, noNaN: true });

export const waitArb: fc.Arbitrary<number> = fc.double({ min: 0, max: 120, noNaN: true });

const uniqueFloorsArb = fc.uniqueArray(floorArb, { maxLength: 6 });

export const stopQueueArb: fc.Arbitrary<StopQueue> = fc
  .tuple(uniqueFloorsArb, uniqueFloorsArb)
  .map(([up, down]) => ({
    up: [...up].sort((a, b) => a - b),
    down: [...down].sort((a, b) => b - a),
  }));

export const hallRequestArb: fc.Arbitrary<HallRequest> = directionArb.chain((direction) => {
  const pickupArb = direction === "up" ? fc.integer({ min: 1, max: 9 }) : fc.integer({ min: 2, max: 10 });
  return pickupArb.chain((pickupFloor) => {
    const destArb =
      direction === "up"
        ? fc.integer({ min: pickupFloor + 1, max: 10 })
        : fc.integer({ min: 1, max: pickupFloor - 1 });
    return fc
      .record({
        destinationFloor: destArb,
        createdAt: waitArb,
        id: fc.uuid(),
      })
      .map(({ destinationFloor, createdAt, id }) => ({
        id,
        pickupFloor,
        direction,
        destinationFloor,
        createdAt,
        assignedElevatorId: null,
        status: "unassigned" as const,
      }));
  });
});

const idleArb: fc.Arbitrary<Pick<Elevator, "status" | "direction">> = fc.constant({
  status: "idle" as const,
  direction: null,
});

const motionArb: fc.Arbitrary<Pick<Elevator, "status" | "direction">> = fc.constantFrom(
  { status: "moving-up" as const, direction: "up" as const },
  { status: "moving-down" as const, direction: "down" as const },
  { status: "doors-open" as const, direction: "up" as const },
  { status: "doors-open" as const, direction: "down" as const },
);

export function elevatorArb(id: ElevatorId): fc.Arbitrary<Elevator> {
  return fc
    .record({
      floor: fractionalFloorArb,
      motion: fc.oneof(idleArb, motionArb),
      queue: stopQueueArb,
      occupancy: fc.integer({ min: 0, max: 20 }),
      doorTimer: fc.double({ min: 0, max: 4, noNaN: true }),
    })
    .map(({ floor, motion, queue, occupancy, doorTimer }) => {
      const atFloor = motion.status === "doors-open" ? Math.round(floor) : floor;
      return {
        id,
        floor: atFloor,
        status: motion.status as ElevatorStatus,
        direction: motion.direction,
        queue,
        occupancy,
        doorTimer,
      };
    });
}

export const worldStateArb: fc.Arbitrary<WorldState> = fc
  .record({
    now: waitArb,
    A: elevatorArb("A"),
    B: elevatorArb("B"),
    C: elevatorArb("C"),
  })
  .map(({ now, A, B, C }) => ({
    now,
    elevators: { A, B, C },
  }));

export const passengerCountArb: fc.Arbitrary<Passenger[]> = fc.integer({ min: 0, max: 6 }).map((n) =>
  Array.from({ length: n }, (_, i) => ({
    id: `p${i}`,
    requestId: `r${i}`,
    originFloor: 1,
    destinationFloor: 10,
  })),
);

export const emptyQueueValue = emptyQueue;

type QueueCommand =
  | { kind: "insertPickup"; floor: number; direction: Direction }
  | { kind: "insertDestination"; fromFloor: number; destFloor: number }
  | { kind: "removeStop"; floor: number };

export type { QueueCommand };

export const queueCommandArb: fc.Arbitrary<QueueCommand> = fc.oneof(
  fc.record({
    kind: fc.constant("insertPickup" as const),
    floor: floorArb,
    direction: directionArb,
  }),
  fc.record({
    kind: fc.constant("insertDestination" as const),
    fromFloor: floorArb,
    destFloor: floorArb,
  }),
  fc.record({
    kind: fc.constant("removeStop" as const),
    floor: floorArb,
  }),
);

export const queueCommandListArb: fc.Arbitrary<QueueCommand[]> = fc.array(queueCommandArb, {
  minLength: 0,
  maxLength: 12,
});
