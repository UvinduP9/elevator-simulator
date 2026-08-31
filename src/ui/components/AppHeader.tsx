import type { SimulationSnapshot, Speed } from "../types";

const SPEED_OPTIONS: Speed[] = [0.5, 1, 2, 5];

type Props = {
  snapshot: SimulationSnapshot;
  onSpeed: (speed: Speed) => void;
};

export function AppHeader({ snapshot, onSpeed }: Props) {
  const paused = snapshot.status === "Paused";
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
        <select data-testid="app-header-algorithm-select" value={snapshot.algorithm} disabled>
          <option>Cost-Based Collective Control</option>
        </select>
      </label>
      <div className="header-status">
        <span
          className={`running-dot${paused ? " is-paused" : ""}`}
          data-testid="app-header-status"
        >
          {snapshot.status}
        </span>
        <select
          data-testid="app-header-speed-select"
          value={`${snapshot.speed}x`}
          onChange={(event) => {
            const raw = event.target.value.replace("x", "");
            const speed = Number(raw) as Speed;
            if (SPEED_OPTIONS.includes(speed)) onSpeed(speed);
          }}
        >
          <option>0.5x</option>
          <option>1x</option>
          <option>2x</option>
          <option>5x</option>
        </select>
      </div>
    </header>
  );
}
