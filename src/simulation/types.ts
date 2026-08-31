import type {
  CostBreakdown,
  Elevator,
  HallRequest,
  Passenger,
  WorldState,
} from "../engine";

export type Speed = 0.5 | 1 | 2 | 5;
export type TrafficPreset = "Off" | "Normal" | "Busy";
export type EventType = "REQUEST" | "DISPATCH" | "ELEVATOR" | "PASSENGER";

export type SimEvent = {
  time: number;
  type: EventType;
  text: string;
};

export type MetricsSnapshot = {
  averageWait: number;
  longestWait: number;
  averageJourney: number;
  completedTrips: number;
  utilization: Record<"A" | "B" | "C", number>;
};

export type ClockState = { now: number; running: boolean; speed: Speed };

export type SimulationSnapshot = {
  clock: ClockState;
  traffic: TrafficPreset;
  world: WorldState;
  passengers: Passenger[];
  metrics: MetricsSnapshot;
  events: SimEvent[];
  latestEvaluation: { requestId: string; breakdown: CostBreakdown } | null;
};

export type MutableSimulationState = {
  elevators: Elevator[];
  requests: HallRequest[];
  passengers: Passenger[];
};
