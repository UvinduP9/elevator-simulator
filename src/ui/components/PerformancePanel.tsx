import type { ElevatorView, Metrics } from "../types";

type Props = {
  metrics: Metrics;
  elevators: ElevatorView[];
};

export function PerformancePanel({ metrics, elevators }: Props) {
  return (
    <section className="panel" data-testid="performance-panel">
      <div className="panel-head">Performance</div>
      <div className="kpi-row">
        <div className="kpi">
          <span className="kpi-label">Average wait</span>
          <span className="kpi-value">{metrics.averageWait.toFixed(1)} s</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Longest wait</span>
          <span className="kpi-value">{metrics.longestWait.toFixed(1)} s</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Average journey</span>
          <span className="kpi-value">{metrics.averageJourney.toFixed(1)} s</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Completed trips</span>
          <span className="kpi-value">{metrics.completedTrips}</span>
        </div>
      </div>
      <div className="util-chart">
        {elevators.map((car) => (
          <div className="util-row" key={car.id}>
            <span className={`color-${car.id}`}>{car.id}</span>
            <div className="util-bar">
              <div className={`util-fill bg-${car.id}`} style={{ width: `${car.utilization}%` }} />
            </div>
            <span>{car.utilization.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}
