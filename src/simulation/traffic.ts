import { SPAWN_CATCHUP_CAP, TRAFFIC_INTERVAL_BUSY, TRAFFIC_INTERVAL_NORMAL } from "./config";
import type { TrafficPreset } from "./types";

export function trafficInterval(preset: TrafficPreset): number | null {
  if (preset === "Off") return null;
  return preset === "Busy" ? TRAFFIC_INTERVAL_BUSY : TRAFFIC_INTERVAL_NORMAL;
}

export function catchUpSpawns(spawnDebt: number, preset: TrafficPreset): { count: number; debt: number } {
  const interval = trafficInterval(preset);
  if (interval === null) return { count: 0, debt: 0 };
  let debt = spawnDebt;
  let count = 0;
  while (debt >= interval && count < SPAWN_CATCHUP_CAP) {
    debt -= interval;
    count += 1;
  }
  return { count, debt };
}
