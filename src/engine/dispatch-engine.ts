import { pickWinner, score } from "./cost-scorer";
import { insertPickup, orderedStops } from "./stop-queue";
import type {
  Assignment,
  CostBreakdown,
  Direction,
  Elevator,
  ElevatorId,
  HallRequest,
  WorldState,
} from "./types";

const ELEVATOR_IDS: ElevatorId[] = ["A", "B", "C"];

export function evaluate(request: HallRequest, state: WorldState): CostBreakdown {
  const costs = state.elevators.map((elevator) => score(request, elevator, state.now));
  const byId = new Map(costs.map((cost) => [cost.elevatorId, cost]));
  const missing = ELEVATOR_IDS.find((id) => !byId.has(id));
  if (missing) throw new Error(`World state is missing elevator ${missing}`);
  return Object.fromEntries(ELEVATOR_IDS.map((id) => [id, byId.get(id)!])) as CostBreakdown;
}

export function assign(request: HallRequest, state: WorldState): Assignment {
  const breakdown = evaluate(request, state);
  return { elevatorId: pickWinner(Object.values(breakdown)), breakdown };
}

function approachDirection(elevator: Elevator, pickupFloor: number, fallback: Direction): Direction {
  if (pickupFloor > elevator.floor) return "up";
  if (pickupFloor < elevator.floor) return "down";
  return elevator.direction ?? fallback;
}

export function planStops(elevator: Elevator, assignedRequests: HallRequest[]): number[] {
  let queue = elevator.stops;
  for (const request of assignedRequests) {
    if (request.status === "completed") continue;
    const floor = request.status === "picked-up" ? request.destinationFloor : request.pickupFloor;
    const direction =
      request.status === "picked-up"
        ? request.direction
        : approachDirection(elevator, request.pickupFloor, request.direction);
    queue = insertPickup(queue, floor, direction);
  }
  return orderedStops(queue, elevator.direction);
}
