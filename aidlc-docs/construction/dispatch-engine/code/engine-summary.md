# U2 Engine summary

Pure TypeScript cost-based collective control. No React imports.

## Public API (`src/engine/index.ts`)

- `evaluate(request, state)` → cost breakdown and selected car
- `assign(request, state)` → `{ elevatorId, breakdown, request, state }` (immutable)
- `score` / `total` / `pickWinner`
- `tick` / `board` / `alight`
- `insertPickup` / `insertDestination` / `ensureApproachStops` / `nextStop` / `canReverse` / `emptyQueue`

## Assignment

1. Score A, B, C with the same formula.
2. Winner is min `total`; ties A then B then C.
3. Assignment is locked on the returned request copy (`assignedElevatorId`, status `assigned`).
4. Winner queue gets pickup and destination, then `ensureApproachStops` so a down call above (or up call below) is also on the approach list. Destinations between the car and that pickup stay on the hall list. Idle same-floor opens doors.

## Cost

`total = distance + directionCompatibility + scheduledStops + reversePenalty - waitingAgeCredit`

Weights: `W_DISTANCE=1`, `W_DIRECTION_MISMATCH=2.5`, `W_STOP=0.5`, `W_REVERSE=1`, `WAITING_AGE_RATE=0.05` (uncapped). Idle cars: reverse and mismatch = 0.

## Motion

`FLOORS_PER_SECOND=1`, `DOOR_DWELL_SECONDS=2`. Reverse only when no remaining stop is strictly ahead. Floor clamped to `[1, 10]`. Boarding is never refused. Doors close only remove a stop when the car is actually on that floor.

## PBT coverage

Oracle min-cost; assign/evaluate agreement; waiting-age monotonic; reverse gate; insertPickup idempotent; StopQueue vs two-set model; floor range; occupancy ≥ 0; assign pickup reachable; ensureApproachStops. Round-trip serialize (PBT-02) N/A. CI seed policy (PBT-08 CI) N/A per NFR-7.
