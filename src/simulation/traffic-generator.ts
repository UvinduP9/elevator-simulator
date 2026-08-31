import type { RandomSource } from "./random";
import type { TrafficPreset } from "./types";

const SPAWN_RANGES: Record<Exclude<TrafficPreset, "Off">, readonly [number, number]> = {
  Normal: [6, 10],
  Busy: [2, 4],
};

export class TrafficGenerator {
  private preset: TrafficPreset = "Off";
  private nextSpawnAt = Number.POSITIVE_INFINITY;
  private readonly random: RandomSource;

  constructor(random: RandomSource) {
    this.random = random;
  }

  setPreset(preset: TrafficPreset, now = 0): void {
    this.preset = preset;
    this.scheduleNext(now);
  }

  getPreset(): TrafficPreset {
    return this.preset;
  }

  reset(): void {
    this.preset = "Off";
    this.nextSpawnAt = Number.POSITIVE_INFINITY;
  }

  maybeSpawn(now: number): number {
    if (this.preset === "Off" || now < this.nextSpawnAt) return 0;
    let count = 0;
    while (now >= this.nextSpawnAt) {
      count += 1;
      this.scheduleNext(this.nextSpawnAt);
    }
    return count;
  }

  private scheduleNext(now: number): void {
    if (this.preset === "Off") {
      this.nextSpawnAt = Number.POSITIVE_INFINITY;
      return;
    }
    const [minimum, maximum] = SPAWN_RANGES[this.preset];
    this.nextSpawnAt = now + minimum + this.random() * (maximum - minimum);
  }
}
