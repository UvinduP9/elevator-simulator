import * as fc from "fast-check";
import type { Direction } from "../../src/engine/types";
import type { Speed, TrafficPreset } from "../../src/simulation/types";

export const floorArb = fc.integer({ min: 1, max: 10 });
export const directionArb: fc.Arbitrary<Direction> = fc.constantFrom("up", "down");
export const speedArb: fc.Arbitrary<Speed> = fc.constantFrom(0.5, 1, 2, 5);
export const trafficArb: fc.Arbitrary<TrafficPreset> = fc.constantFrom("Off", "Normal", "Busy");
export const realDtArb = fc.double({ min: 0, max: 12, noNaN: true });
export const rngArb = fc.double({ min: 0, max: 1 - Number.EPSILON, noNaN: true });

export const hallPairArb: fc.Arbitrary<{ floor: number; direction: Direction }> = fc.oneof(
  fc.record({ floor: fc.integer({ min: 1, max: 9 }), direction: fc.constant("up" as const) }),
  fc.record({ floor: fc.integer({ min: 2, max: 10 }), direction: fc.constant("down" as const) }),
);

type SimCommand =
  | { kind: "step"; realDt: number }
  | { kind: "pause" }
  | { kind: "resume" }
  | { kind: "setSpeed"; speed: Speed }
  | { kind: "setTraffic"; traffic: TrafficPreset }
  | { kind: "clickHall"; floor: number; direction: Direction }
  | { kind: "addRandomRequest" }
  | { kind: "reset" };

export type { SimCommand };

export const simCommandArb: fc.Arbitrary<SimCommand> = fc.oneof(
  fc.record({ kind: fc.constant("step" as const), realDt: realDtArb }),
  fc.constant({ kind: "pause" as const }),
  fc.constant({ kind: "resume" as const }),
  fc.record({ kind: fc.constant("setSpeed" as const), speed: speedArb }),
  fc.record({ kind: fc.constant("setTraffic" as const), traffic: trafficArb }),
  hallPairArb.map((p) => ({ kind: "clickHall" as const, ...p })),
  fc.constant({ kind: "addRandomRequest" as const }),
  fc.constant({ kind: "reset" as const }),
);

export const simCommandListArb = fc.array(simCommandArb, { minLength: 0, maxLength: 15 });
