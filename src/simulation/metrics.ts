import type { ElevatorId } from "../engine/types";
import type { Metrics } from "./types";

export type MetricsState = {
  completedWaits: number[];
  completedJourneys: number[];
  completedTrips: number;
  busySeconds: Record<ElevatorId, number>;
};

export function initialMetrics(): MetricsState {
  return {
    completedWaits: [],
    completedJourneys: [],
    completedTrips: 0,
    busySeconds: { A: 0, B: 0, C: 0 },
  };
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function snapshotMetrics(
  metrics: MetricsState,
  waitingWaits: number[],
): Metrics {
  const longestCompleted = metrics.completedWaits.length === 0 ? 0 : Math.max(...metrics.completedWaits);
  const longestWaiting = waitingWaits.length === 0 ? 0 : Math.max(...waitingWaits);
  return {
    averageWait: mean(metrics.completedWaits),
    averageJourney: mean(metrics.completedJourneys),
    completedTrips: metrics.completedTrips,
    longestWait: Math.max(longestCompleted, longestWaiting),
  };
}

export function utilizationPct(busySeconds: number, now: number): number {
  if (now <= 0) return 0;
  return (busySeconds / now) * 100;
}

export function addBusy(metrics: MetricsState, id: ElevatorId, dt: number): void {
  metrics.busySeconds[id] += dt;
}

export function recordTrip(metrics: MetricsState, wait: number, journey: number): void {
  metrics.completedWaits.push(wait);
  metrics.completedJourneys.push(journey);
  metrics.completedTrips += 1;
}
