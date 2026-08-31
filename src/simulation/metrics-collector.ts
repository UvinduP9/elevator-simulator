import type { ElevatorId, HallRequest } from "../engine";
import type { MetricsSnapshot } from "./types";

export class MetricsCollector {
  private waits: number[] = [];
  private journeys: number[] = [];
  private busy: Record<ElevatorId, number> = { A: 0, B: 0, C: 0 };
  private elapsed = 0;

  onRequestCreated(_request: HallRequest, _time: number): void {}

  onPickup(request: HallRequest, time: number): void {
    this.waits.push(Math.max(0, time - request.createdAt));
  }

  onDropoff(request: HallRequest, time: number): void {
    if (request.pickedUpAt !== undefined) {
      this.journeys.push(Math.max(0, time - request.pickedUpAt));
    }
  }

  onTick(dt: number): void {
    this.elapsed += dt;
  }

  onUtilization(id: ElevatorId, isBusy: boolean, dt: number): void {
    if (isBusy) this.busy[id] += dt;
  }

  reset(): void {
    this.waits = [];
    this.journeys = [];
    this.busy = { A: 0, B: 0, C: 0 };
    this.elapsed = 0;
  }

  snapshot(): MetricsSnapshot {
    const average = (values: number[]) =>
      values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
    const utilization = (id: ElevatorId) =>
      this.elapsed === 0 ? 0 : Math.min(100, (this.busy[id] / this.elapsed) * 100);
    return {
      averageWait: average(this.waits),
      longestWait: this.waits.length === 0 ? 0 : Math.max(...this.waits),
      averageJourney: average(this.journeys),
      completedTrips: this.journeys.length,
      utilization: { A: utilization("A"), B: utilization("B"), C: utilization("C") },
    };
  }
}
