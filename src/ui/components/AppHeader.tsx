import type { SimulationSnapshot, Speed } from "../types";

type Props = {
  snapshot: SimulationSnapshot;
  onSpeedChange: (speed: Speed) => void;
};

export function AppHeader({ snapshot, onSpeedChange }: Props) {
  return (
    <header className="app-header" data-testid="app-header">
      <div className="header-brand">
        <div className="header-icon" aria-hidden="true">
          <span />
          <span />
        </div>
        <div>
          <h1 className="header-title">Elevator Dispatch Simulator</h1>
          <p className="header-sub">10 Floors · 3 Elevators</p>
        </div>
      </div>
      <label className="header-algorithm">
        Algorithm:
        <select data-testid="app-header-algorithm-select" defaultValue={snapshot.algorithm}>
          <option>Cost-Based Collective Control</option>
        </select>
      </label>
      <div className="header-status">
        <span
          className={snapshot.status === "Running" ? "running-dot" : "paused-dot"}
          data-testid="app-header-status"
        >
          {snapshot.status}
        </span>
        <select
          data-testid="app-header-speed-select"
          value={snapshot.speed}
          onChange={(event) => onSpeedChange(Number(event.target.value) as Speed)}
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={5}>5x</option>
        </select>
      </div>
    </header>
  );
}
