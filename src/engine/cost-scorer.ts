import { COST_WEIGHTS } from "./config";
import type { CarCost, Elevator, ElevatorId, HallRequest } from "./types";

function isMovingToward(request: HallRequest, elevator: Elevator): boolean {
  if (elevator.status !== "moving" || elevator.direction === null) return false;
  if (elevator.direction !== request.direction) return false;
  return elevator.direction === "up"
    ? elevator.floor <= request.pickupFloor
    : elevator.floor >= request.pickupFloor;
}

function needsReverse(request: HallRequest, elevator: Elevator): boolean {
  if (elevator.direction === null || elevator.status === "idle") return false;
  if (elevator.direction !== request.direction) return true;
  return elevator.direction === "up"
    ? request.pickupFloor < elevator.floor
    : request.pickupFloor > elevator.floor;
}

export function score(request: HallRequest, elevator: Elevator, now: number): CarCost {
  const distance = Math.abs(elevator.floor - request.pickupFloor);
  const movingTowardPenalty =
    elevator.status === "idle" || isMovingToward(request, elevator) ? 0 : 1;
  const directionPenalty =
    elevator.direction === null || elevator.direction === request.direction ? 0 : 1;
  const scheduledStops = elevator.stops.up.length + elevator.stops.down.length;
  const reversePenalty = needsReverse(request, elevator) ? 1 : 0;
  const waitingAgeCredit = Math.max(0, now - request.createdAt);
  const total =
    distance * COST_WEIGHTS.distance +
    movingTowardPenalty * COST_WEIGHTS.movingTowardPenalty +
    directionPenalty * COST_WEIGHTS.directionPenalty +
    scheduledStops * COST_WEIGHTS.scheduledStop +
    reversePenalty * COST_WEIGHTS.reversePenalty -
    waitingAgeCredit * COST_WEIGHTS.waitingAgeCreditPerSecond;

  return {
    elevatorId: elevator.id,
    distance,
    movingTowardPenalty,
    directionPenalty,
    scheduledStops,
    reversePenalty,
    waitingAgeCredit,
    total,
  };
}

export function pickWinner(costs: CarCost[]): ElevatorId {
  if (costs.length === 0) throw new Error("Cannot select an elevator from an empty cost list");
  return [...costs]
    .sort((left, right) => left.total - right.total || left.elevatorId.localeCompare(right.elevatorId))[0]!
    .elevatorId;
}
