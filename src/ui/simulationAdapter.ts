import { orderedStops, pickWinner } from "../engine";
import type { CarCost, Elevator, ElevatorId } from "../engine";
import type { SimulationSnapshot as RuntimeSnapshot } from "../simulation";
import type {
  CostFactorRow,
  DispatchEvaluation,
  ElevatorStatus,
  ElevatorView,
  LogEntry,
  SimulationSnapshot,
} from "./types";

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function statusOf(elevator: Elevator): ElevatorStatus {
  if (elevator.status === "doors-open") return "doors-open";
  if (elevator.status === "moving") {
    return elevator.direction === "down" ? "moving-down" : "moving-up";
  }
  return "idle";
}

function elevatorView(elevator: Elevator, utilization: number): ElevatorView {
  const movingUp = elevator.direction === "up";
  const fromFloor = Number.isInteger(elevator.floor)
    ? elevator.floor
    : movingUp
      ? Math.floor(elevator.floor)
      : Math.ceil(elevator.floor);
  const toFloor = Number.isInteger(elevator.floor)
    ? elevator.targetFloor ?? elevator.floor
    : movingUp
      ? Math.ceil(elevator.floor)
      : Math.floor(elevator.floor);
  const stops = orderedStops(elevator.stops, elevator.direction);
  return {
    id: elevator.id,
    status: statusOf(elevator),
    floor: round(elevator.floor),
    fromFloor,
    toFloor,
    nextStop: elevator.targetFloor ?? stops[0] ?? null,
    stops,
    occupancy: elevator.occupancy,
    utilization: Math.round(utilization),
  };
}

function factorRow(
  factor: string,
  breakdown: Record<ElevatorId, CarCost>,
  read: (cost: CarCost) => number,
  emphasize = false,
): CostFactorRow {
  return {
    factor,
    A: round(read(breakdown.A)),
    B: round(read(breakdown.B)),
    C: round(read(breakdown.C)),
    emphasize,
  };
}

function evaluationOf(snapshot: RuntimeSnapshot): DispatchEvaluation | null {
  const evaluation = snapshot.latestEvaluation;
  if (!evaluation) return null;
  const breakdown = evaluation.breakdown;
  return {
    requestId: evaluation.requestId,
    selected: pickWinner(Object.values(breakdown)),
    rows: [
      factorRow("Distance (floors)", breakdown, (cost) => cost.distance),
      factorRow("Moving-toward penalty", breakdown, (cost) => cost.movingTowardPenalty),
      factorRow("Direction compatibility", breakdown, (cost) => cost.directionPenalty),
      factorRow("Scheduled stops", breakdown, (cost) => cost.scheduledStops),
      factorRow("Reverse penalty", breakdown, (cost) => cost.reversePenalty),
      factorRow("Waiting-age credit", breakdown, (cost) => cost.waitingAgeCredit),
      factorRow("Total", breakdown, (cost) => cost.total, true),
    ],
  };
}

function formatTime(seconds: number): string {
  const milliseconds = Math.floor((seconds % 1) * 1000);
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `00:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

function logEntry(event: RuntimeSnapshot["events"][number]): LogEntry {
  const elevatorId = event.text.match(/Elevator ([ABC])/)?.[1] as ElevatorId | undefined;
  return {
    time: formatTime(event.time),
    type: event.type,
    ...(elevatorId ? { elevatorId } : {}),
    text: event.text,
  };
}

export function toUiSnapshot(snapshot: RuntimeSnapshot): SimulationSnapshot {
  const activeRequests = snapshot.world.requests.filter(
    (request) => request.status === "assigned" || request.status === "pending",
  );
  return {
    algorithm: "Cost-Based Collective Control",
    status: snapshot.clock.running ? "Running" : "Paused",
    speed: snapshot.clock.speed,
    traffic: snapshot.traffic,
    hallCalls: activeRequests.map((request) => ({
      floor: request.pickupFloor,
      direction: request.direction,
      assigned: request.assignedElevatorId,
    })),
    elevators: snapshot.world.elevators.map((elevator) =>
      elevatorView(elevator, snapshot.metrics.utilization[elevator.id]),
    ),
    requests: activeRequests
      .filter((request) => request.assignedElevatorId !== null)
      .map((request) => ({
        id: request.id,
        floor: request.pickupFloor,
        direction: request.direction,
        waitSeconds: round(snapshot.clock.now - request.createdAt),
        assigned: request.assignedElevatorId!,
        highlighted: request.id === snapshot.latestEvaluation?.requestId,
      })),
    evaluation: evaluationOf(snapshot),
    metrics: {
      averageWait: round(snapshot.metrics.averageWait),
      longestWait: round(snapshot.metrics.longestWait),
      averageJourney: round(snapshot.metrics.averageJourney),
      completedTrips: snapshot.metrics.completedTrips,
    },
    events: snapshot.events.map(logEntry),
  };
}
