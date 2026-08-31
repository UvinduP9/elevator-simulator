import type { Speed } from "./types";

export type ClockState = {
  now: number;
  speed: Speed;
  paused: boolean;
};

export function initialClock(): ClockState {
  return { now: 0, speed: 1, paused: false };
}

export function simDt(clock: ClockState, realDt: number): number {
  if (clock.paused || realDt <= 0) return 0;
  return realDt * clock.speed;
}
