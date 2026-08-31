import type { ClockState, Speed } from "./types";

export class SimulationClock {
  private state: ClockState = { now: 0, running: true, speed: 1 };

  start(): ClockState {
    this.state.running = true;
    return this.snapshot();
  }

  pause(): ClockState {
    this.state.running = false;
    return this.snapshot();
  }

  resume(): ClockState {
    return this.start();
  }

  reset(): ClockState {
    this.state = { now: 0, running: true, speed: 1 };
    return this.snapshot();
  }

  setSpeed(speed: Speed): ClockState {
    this.state.speed = speed;
    return this.snapshot();
  }

  tick(realDt: number): { simDt: number; state: ClockState } {
    if (realDt < 0) throw new RangeError("Clock duration cannot be negative");
    const simDt = this.state.running ? realDt * this.state.speed : 0;
    this.state.now += simDt;
    return { simDt, state: this.snapshot() };
  }

  snapshot(): ClockState {
    return { ...this.state };
  }
}
