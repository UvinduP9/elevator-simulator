import type { Elevator, ElevatorId, HallRequest, WorldState } from "../../src/engine/types";
import { emptyQueue } from "../../src/engine/stopQueue";

export function idleCar(id: ElevatorId, floor: number): Elevator {
  return {
    id,
    floor,
    status: "idle",
    direction: null,
    queue: emptyQueue(),
    occupancy: 0,
    doorTimer: 0,
  };
}

export function worldAt(now: number, cars: [Elevator, Elevator, Elevator]): WorldState {
  return {
    now,
    elevators: { A: cars[0], B: cars[1], C: cars[2] },
  };
}

export function hall(
  id: string,
  pickupFloor: number,
  direction: "up" | "down",
  destinationFloor: number,
  createdAt = 0,
): HallRequest {
  return {
    id,
    pickupFloor,
    direction,
    destinationFloor,
    createdAt,
    assignedElevatorId: null,
    status: "unassigned",
  };
}
