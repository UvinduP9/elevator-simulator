import type { Speed, TrafficPreset } from "../types";

type Props = {
  traffic: TrafficPreset;
  speed: Speed;
};

const SPEEDS: Speed[] = [0.5, 1, 2, 5];

export function SimulationControlBar({ traffic, speed }: Props) {
  return (
    <div className="panel control-bar" data-testid="simulation-control-bar">
      <button type="button" className="btn btn-pause" data-testid="control-pause-button">
        Pause
      </button>
      <button type="button" className="btn" data-testid="control-reset-button">
        Reset
      </button>
      <button type="button" className="btn" data-testid="control-add-request-button">
        + Add request
      </button>
      <label className="traffic-label">
        Traffic:
        <select className="control-select" defaultValue={traffic} data-testid="control-traffic-select">
          <option>Off</option>
          <option>Normal</option>
          <option>Busy</option>
        </select>
      </label>
      <div className="speed-group">
        <span className="speed-label">Speed:</span>
        {SPEEDS.map((value) => (
          <button
            key={value}
            type="button"
            className={`speed-chip${speed === value ? " selected" : ""}`}
            data-testid={`control-speed-${value}`}
          >
            {value}x
          </button>
        ))}
      </div>
    </div>
  );
}
