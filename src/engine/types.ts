export const MIN_FLOOR = 1;
export const MAX_FLOOR = 10;

export type ElevatorId = "A" | "B" | "C";
export type Direction = "up" | "down";
export type ElevatorStatus = "idle" | "moving" | "doors-open";
export type RequestStatus = "pending" | "assigned" | "picked-up" | "completed";

export type StopQueue = { up: number[]; down: number[] };

export type Elevator = {
  id: ElevatorId;
  floor: number;
  direction: Direction | null;
  status: ElevatorStatus;
  stops: StopQueue;
  occupancy: number;
  doorRemainingSeconds: number;
  targetFloor: number | null;
  busySeconds: number;
};

export type HallRequest = {
  id: string;
  pickupFloor: number;
  direction: Direction;
  destinationFloor: number;
  createdAt: number;
  status: RequestStatus;
  assignedElevatorId: ElevatorId | null;
  pickedUpAt?: number;
  completedAt?: number;
};

export type Passenger = {
  id: string;
  requestId: string;
  elevatorId: ElevatorId;
  destinationFloor: number;
};

export type WorldState = { now: number; elevators: Elevator[]; requests: HallRequest[] };

export type CarCost = {
  elevatorId: ElevatorId;
  distance: number;
  movingTowardPenalty: number;
  directionPenalty: number;
  scheduledStops: number;
  reversePenalty: number;
  waitingAgeCredit: number;
  total: number;
};

export type CostBreakdown = Record<ElevatorId, CarCost>;
export type Assignment = { elevatorId: ElevatorId; breakdown: CostBreakdown };
export type MotionCommand = {
  targetFloor: number | null;
  doorDwellSeconds?: number;
  floorsPerSecond?: number;
};

export function opposite(direction: Direction): Direction {
  return direction === "up" ? "down" : "up";
}

export function createStopQueue(): StopQueue {
  return { up: [], down: [] };
}

export function isFloor(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_FLOOR && value <= MAX_FLOOR;
}
