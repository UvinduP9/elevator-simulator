import type { CostBreakdown, Elevator, ElevatorId, HallRequest, Passenger } from "../engine/types";

export type TrafficPreset = "Off" | "Normal" | "Busy";
export type Speed = 0.5 | 1 | 2 | 5;
export type EventType = "REQUEST" | "DISPATCH" | "ELEVATOR" | "PASSENGER";
export type Direction = "up" | "down";
export type ElevatorStatus = "idle" | "moving-up" | "moving-down" | "doors-open";

export type SimRequest = {
  request: HallRequest;
  breakdown: CostBreakdown;
  pickupAt: number | null;
  dropoffAt: number | null;
};

export type SimPassenger = Passenger & { elevatorId: ElevatorId };

export type SimEvent = {
  at: number;
  type: EventType;
  elevatorId?: ElevatorId;
  text: string;
};

export type HallCall = {
  floor: number;
  direction: Direction;
  assigned: ElevatorId | null;
};

export type ElevatorView = {
  id: ElevatorId;
  status: ElevatorStatus;
  floor: number;
  fromFloor: number;
  toFloor: number;
  nextStop: number | null;
  stops: number[];
  occupancy: number;
  occupancyMax: 8;
  utilization: number;
};

export type ActiveRequest = {
  id: string;
  floor: number;
  direction: Direction;
  waitSeconds: number;
  assigned: ElevatorId;
  highlighted?: boolean;
};

export type CostFactorRow = {
  factor: string;
  A: number | string;
  B: number | string;
  C: number | string;
  emphasize?: boolean;
};

export type DispatchEvaluation = {
  requestId: string;
  rows: CostFactorRow[];
  selected: ElevatorId;
};

export type Metrics = {
  averageWait: number;
  longestWait: number;
  averageJourney: number;
  completedTrips: number;
};

export type LogEntry = {
  time: string;
  type: EventType;
  elevatorId?: ElevatorId;
  text: string;
};

export type SimulationSnapshot = {
  algorithm: string;
  status: "Running" | "Paused";
  speed: Speed;
  traffic: TrafficPreset;
  hallCalls: HallCall[];
  elevators: ElevatorView[];
  requests: ActiveRequest[];
  evaluation: DispatchEvaluation;
  metrics: Metrics;
  events: LogEntry[];
};

export type SimulationOptions = {
  rng?: () => number;
};

export type Elevators = Record<ElevatorId, Elevator>;
