import type { SimulationSnapshot } from "../types";

export function AppHeader({ snapshot }: { snapshot: SimulationSnapshot }) {
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
        <span className="running-dot" data-testid="app-header-status">
          {snapshot.status}
        </span>
        <select data-testid="app-header-speed-select" defaultValue={`${snapshot.speed}x`}>
          <option>0.5x</option>
          <option>1x</option>
          <option>2x</option>
          <option>5x</option>
        </select>
      </div>
    </header>
  );
}

