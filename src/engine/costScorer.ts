import {
  WAITING_AGE_RATE,
  W_DIRECTION_MISMATCH,
  W_DISTANCE,
  W_REVERSE,
  W_STOP,
} from "./config";
import { stopCount } from "./stopQueue";
import type { CarCost, Direction, Elevator, ElevatorId, HallRequest } from "./types";
import { ELEVATOR_IDS } from "./types";

export function isAhead(floor: number, pickup: number, direction: Direction): boolean {
  return direction === "up" ? pickup > floor : pickup < floor;
}

export function waitSeconds(request: HallRequest, now: number): number {
  return Math.max(0, now - request.createdAt);
}

export function score(request: HallRequest, elevator: Elevator, now: number): CarCost {
  const pickup = request.pickupFloor;
  const distance = Math.abs(elevator.floor - pickup) * W_DISTANCE;
  const idle = elevator.direction === null || elevator.status === "idle";
  const ahead =
    elevator.direction !== null && isAhead(elevator.floor, pickup, elevator.direction);
  const aligned =
    !idle && elevator.direction === request.direction && ahead;

  const directionCompatibility = idle || aligned ? 0 : W_DIRECTION_MISMATCH;
  const scheduledStops = stopCount(elevator.queue) * W_STOP;
  const reversePenalty = idle || ahead ? 0 : W_REVERSE;
  const waitingAgeCredit = waitSeconds(request, now) * WAITING_AGE_RATE;
  const total =
    distance + directionCompatibility + scheduledStops + reversePenalty - waitingAgeCredit;

  return {
    elevatorId: elevator.id,
    distance,
    directionCompatibility,
    scheduledStops,
    reversePenalty,
    waitingAgeCredit,
    total,
  };
}

export function total(carCost: CarCost): number {
  return (
    carCost.distance +
    carCost.directionCompatibility +
    carCost.scheduledStops +
    carCost.reversePenalty -
    carCost.waitingAgeCredit
  );
}

export function pickWinner(costs: CarCost[]): ElevatorId {
  const byId = new Map(costs.map((c) => [c.elevatorId, c]));
  let best: ElevatorId = "A";
  let bestTotal = byId.get("A")?.total ?? Number.POSITIVE_INFINITY;
  for (const id of ELEVATOR_IDS) {
    const row = byId.get(id);
    if (!row) continue;
    if (row.total < bestTotal) {
      best = id;
      bestTotal = row.total;
    }
  }
  return best;
}
