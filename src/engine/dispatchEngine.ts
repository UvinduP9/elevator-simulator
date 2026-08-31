import { DOOR_DWELL_SECONDS } from "./config";
import { pickWinner, score } from "./costScorer";
import { insertDestination, insertPickup, ensureApproachStops, planStops as orderStops } from "./stopQueue";
import type {
  Assignment,
  CostBreakdown,
  Elevator,
  Floor,
  HallRequest,
  WorldState,
} from "./types";
import { ELEVATOR_IDS } from "./types";

export function evaluate(request: HallRequest, state: WorldState): CostBreakdown {
  const cars = ELEVATOR_IDS.map((id) => score(request, state.elevators[id], state.now)) as CostBreakdown["cars"];
  return { cars, selected: pickWinner(cars) };
}

function applyAssignment(elevator: Elevator, request: HallRequest): Elevator {
  let queue = insertPickup(elevator.queue, request.pickupFloor, request.direction);
  queue = insertDestination(queue, request.pickupFloor, request.destinationFloor);
  queue = ensureApproachStops(queue, elevator.floor);

  const idle = elevator.status === "idle" || elevator.direction === null;
  if (!idle) {
    return { ...elevator, queue };
  }

  if (request.pickupFloor === elevator.floor) {
    return {
      ...elevator,
      queue,
      status: "doors-open",
      direction: request.direction,
      doorTimer: elevator.doorTimer > 0 ? elevator.doorTimer : DOOR_DWELL_SECONDS,
    };
  }

  const direction = request.pickupFloor > elevator.floor ? "up" : "down";
  return {
    ...elevator,
    queue,
    direction,
    status: direction === "up" ? "moving-up" : "moving-down",
  };
}

export function assign(request: HallRequest, state: WorldState): Assignment {
  const breakdown = evaluate(request, state);
  const elevatorId = breakdown.selected;
  const elevator = applyAssignment(state.elevators[elevatorId], request);
  const nextRequest: HallRequest = {
    ...request,
    assignedElevatorId: elevatorId,
    status: "assigned",
  };
  return {
    elevatorId,
    breakdown,
    request: nextRequest,
    state: {
      ...state,
      elevators: { ...state.elevators, [elevatorId]: elevator },
    },
  };
}

export function planStops(elevator: Elevator, assignedRequests: HallRequest[]): Floor[] {
  void assignedRequests;
  return orderStops(elevator.queue, elevator.floor, elevator.direction);
}
