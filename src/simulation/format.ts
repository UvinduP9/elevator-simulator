/** Simulation elapsed time as `HH:MM:SS.mmm` from t = 0. */
export function formatSimTime(seconds: number): string {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const ms = totalMs % 1000;
  const totalSeconds = Math.floor(totalMs / 1000);
  const s = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);
  return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}.${pad(ms, 3)}`;
}

function pad(value: number, width: number): string {
  return String(value).padStart(width, "0");
}

export function arrow(direction: "up" | "down"): string {
  return direction === "up" ? "\u2191\uFE0E" : "\u2193\uFE0E";
}

export const ARROW_TO = "\u2192\uFE0E";
