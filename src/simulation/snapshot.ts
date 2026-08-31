import { nextStop, planStops } from "../engine";
import type { CostBreakdown, Elevator, ElevatorId } from "../engine/types";
import { ELEVATOR_IDS } from "../engine/types";
import { ALGORITHM_LABEL, OCCUPANCY_DISPLAY_MAX } from "./config";
import { toLogEntries } from "./eventLog";
import { snapshotMetrics, utilizationPct, type MetricsState } from "./metrics";
import type {
  ActiveRequest,
  CostFactorRow,
  DispatchEvaluation,
  ElevatorView,
  HallCall,
  SimEvent,
  SimRequest,
  SimulationSnapshot,
  Speed,
  TrafficPreset,
} from "./types";

export function emptyEvaluation(): DispatchEvaluation {
  return {
    requestId: "—",
    selected: "A",
    rows: factorRows(null),
  };
}

function factorRows(breakdown: CostBreakdown | null): CostFactorRow[] {
  const byId = (id: ElevatorId) => breakdown?.cars.find((c) => c.elevatorId === id);
  const cell = (id: ElevatorId, key: keyof NonNullable<ReturnType<typeof byId>>): number => {
    const row = byId(id);
    if (!row) return 0;
    const value = row[key];
    return typeof value === "number" ? value : 0;
  };
  return [
    {
      factor: "Distance (floors)",
      A: cell("A", "distance"),
      B: cell("B", "distance"),
      C: cell("C", "distance"),
    },
    {
      factor: "Direction compatibility",
      A: cell("A", "directionCompatibility"),
      B: cell("B", "directionCompatibility"),
      C: cell("C", "directionCompatibility"),
    },
    {
      factor: "Scheduled stops",
      A: cell("A", "scheduledStops"),
      B: cell("B", "scheduledStops"),
      C: cell("C", "scheduledStops"),
    },
    {
      factor: "Reverse penalty",
      A: cell("A", "reversePenalty"),
      B: cell("B", "reversePenalty"),
      C: cell("C", "reversePenalty"),
    },
    {
      factor: "Waiting-age credit",
      A: cell("A", "waitingAgeCredit"),
      B: cell("B", "waitingAgeCredit"),
      C: cell("C", "waitingAgeCredit"),
    },
    {
      factor: "Total",
      A: cell("A", "total"),
      B: cell("B", "total"),
      C: cell("C", "total"),
      emphasize: true,
    },
  ];
}

export function evaluationFor(requests: SimRequest[], selectedId: string | null): DispatchEvaluation {
  if (!selectedId) return emptyEvaluation();
  const found = requests.find((r) => r.request.id === selectedId);
  if (!found) return emptyEvaluation();
  return {
    requestId: found.request.id,
    selected: found.breakdown.selected,
    rows: factorRows(found.breakdown),
  };
}

export function hallCallsFrom(requests: SimRequest[]): HallCall[] {
  const waiting = requests.filter((r) => r.request.status === "assigned" && r.request.assignedElevatorId);
  const oldest = new Map<string, SimRequest>();
  for (const r of waiting) {
    const key = `${r.request.pickupFloor}:${r.request.direction}`;
    const prev = oldest.get(key);
    if (!prev || r.request.createdAt < prev.request.createdAt) oldest.set(key, r);
  }
  return [...oldest.values()].map((r) => ({
    floor: r.request.pickupFloor,
    direction: r.request.direction,
    assigned: r.request.assignedElevatorId,
  }));
}

export function activeRequestsFrom(
  requests: SimRequest[],
  now: number,
  selectedId: string | null,
): ActiveRequest[] {
  return requests
    .filter((r) => r.request.status === "assigned" || r.request.status === "boarded")
    .map((r) => ({
      id: r.request.id,
      floor: r.request.pickupFloor,
      direction: r.request.direction,
      waitSeconds: r.pickupAt !== null ? r.pickupAt - r.request.createdAt : now - r.request.createdAt,
      assigned: r.request.assignedElevatorId ?? "A",
      highlighted: r.request.id === selectedId,
    }));
}

export function elevatorView(
  elevator: Elevator,
  now: number,
  busySeconds: number,
  motionFrom: number,
): ElevatorView {
  const idleOrDoors = elevator.status === "idle" || elevator.status === "doors-open";
  const nxt =
    elevator.direction === null ? null : nextStop(elevator.queue, elevator.floor, elevator.direction);
  const rounded = Math.round(elevator.floor);
  return {
    id: elevator.id,
    status: elevator.status,
    floor: elevator.floor,
    fromFloor: idleOrDoors ? rounded : motionFrom,
    toFloor: idleOrDoors ? rounded : (nxt ?? rounded),
    nextStop: nxt,
    stops: planStops(elevator, []),
    occupancy: elevator.occupancy,
    occupancyMax: OCCUPANCY_DISPLAY_MAX as 8,
    utilization: utilizationPct(busySeconds, now),
  };
}

export function buildSnapshot(input: {
  now: number;
  paused: boolean;
  speed: Speed;
  traffic: TrafficPreset;
  elevators: Record<ElevatorId, Elevator>;
  requests: SimRequest[];
  events: SimEvent[];
  metrics: MetricsState;
  selectedRequestId: string | null;
  motionFrom: Record<ElevatorId, number>;
}): SimulationSnapshot {
  const waitingWaits = input.requests
    .filter((r) => r.request.status === "assigned")
    .map((r) => input.now - r.request.createdAt);
  return {
    algorithm: ALGORITHM_LABEL,
    status: input.paused ? "Paused" : "Running",
    speed: input.speed,
    traffic: input.traffic,
    hallCalls: hallCallsFrom(input.requests),
    elevators: ELEVATOR_IDS.map((id) =>
      elevatorView(input.elevators[id]!, input.now, input.metrics.busySeconds[id]!, input.motionFrom[id] ?? 1),
    ),
    requests: activeRequestsFrom(input.requests, input.now, input.selectedRequestId),
    evaluation: evaluationFor(input.requests, input.selectedRequestId),
    metrics: snapshotMetrics(input.metrics, waitingWaits),
    events: toLogEntries(input.events),
  };
}
