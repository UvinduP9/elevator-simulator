export type ElevatorId = "A" | "B" | "C";
export type Direction = "up" | "down";
export type ElevatorStatus = "idle" | "moving-up" | "moving-down" | "doors-open";
export type RequestStatus = "unassigned" | "assigned" | "boarded" | "completed";
export type Floor = number;

export type StopQueue = {
  up: Floor[];
  down: Floor[];
};

export type Elevator = {
  id: ElevatorId;
  floor: number;
  status: ElevatorStatus;
  direction: Direction | null;
  queue: StopQueue;
  occupancy: number;
  doorTimer: number;
};

export type HallRequest = {
  id: string;
  pickupFloor: Floor;
  direction: Direction;
  destinationFloor: Floor;
  createdAt: number;
  assignedElevatorId: ElevatorId | null;
  status: RequestStatus;
};

export type Passenger = {
  id: string;
  requestId: string;
  originFloor: Floor;
  destinationFloor: Floor;
};

export type WorldState = {
  now: number;
  elevators: Record<ElevatorId, Elevator>;
};

export type CarCost = {
  elevatorId: ElevatorId;
  distance: number;
  directionCompatibility: number;
  scheduledStops: number;
  reversePenalty: number;
  waitingAgeCredit: number;
  total: number;
};

export type CostBreakdown = {
  cars: [CarCost, CarCost, CarCost];
  selected: ElevatorId;
};

export type Assignment = {
  elevatorId: ElevatorId;
  breakdown: CostBreakdown;
  request: HallRequest;
  state: WorldState;
};

export const ELEVATOR_IDS: ElevatorId[] = ["A", "B", "C"];
