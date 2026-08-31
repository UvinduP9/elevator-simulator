import type { Speed, TrafficPreset } from "../types";

type Props = {
  traffic: TrafficPreset;
  speed: Speed;
  paused: boolean;
  onPauseToggle: () => void;
  onReset: () => void;
  onAddRequest: () => void;
  onTraffic: (preset: TrafficPreset) => void;
  onSpeed: (speed: Speed) => void;
};

const SPEEDS: Speed[] = [0.5, 1, 2, 5];
const TRAFFIC: TrafficPreset[] = ["Off", "Normal", "Busy"];

export function SimulationControlBar({
  traffic,
  speed,
  paused,
  onPauseToggle,
  onReset,
  onAddRequest,
  onTraffic,
  onSpeed,
}: Props) {
  return (
    <div className="panel control-bar" data-testid="simulation-control-bar">
      <button
        type="button"
        className={`btn${paused ? "" : " btn-pause"}`}
        data-testid="control-pause-button"
        onClick={onPauseToggle}
      >
        {paused ? "Resume" : "Pause"}
      </button>
      <button type="button" className="btn" data-testid="control-reset-button" onClick={onReset}>
        Reset
      </button>
      <button type="button" className="btn" data-testid="control-add-request-button" onClick={onAddRequest}>
        + Add request
      </button>
      <label className="traffic-label">
        Traffic:
        <select
          className="control-select"
          value={traffic}
          data-testid="control-traffic-select"
          onChange={(event) => onTraffic(event.target.value as TrafficPreset)}
        >
          {TRAFFIC.map((preset) => (
            <option key={preset} value={preset}>
              {preset}
            </option>
          ))}
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
            onClick={() => onSpeed(value)}
          >
            {value}x
          </button>
        ))}
      </div>
    </div>
  );
}
