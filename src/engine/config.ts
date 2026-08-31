export const COST_WEIGHTS = {
  distance: 1,
  movingTowardPenalty: 2,
  directionPenalty: 3,
  scheduledStop: 0.75,
  reversePenalty: 4,
  waitingAgeCreditPerSecond: 0.12,
} as const;

export const DEFAULT_MOTION = {
  floorsPerSecond: 1,
  doorDwellSeconds: 1.5,
} as const;
