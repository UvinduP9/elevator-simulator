# Business Rules — dispatch-engine

**Unit**: U2  
**Answers**: Q1–Q7 all **A**

## Named constants

Module: engine config (not UI sliders).

| Constant | Value | Used for |
|---|---|---|
| `W_DISTANCE` | `1` | Distance factor |
| `W_DIRECTION_MISMATCH` | `2.5` | Direction compatibility when not aligned |
| `W_STOP` | `0.5` | Per scheduled stop floor |
| `W_REVERSE` | `1` | Reverse penalty |
| `WAITING_AGE_RATE` | `0.05` | Credit per second of wait (`AGE_RATE`) |
| `FLOORS_PER_SECOND` | `1` | `tick` travel rate (U3 scales `dt`) |
| `DOOR_DWELL_SECONDS` | `2` | Time doors stay open |

`WAITING_AGE_RATE` is cost units subtracted per second of wait. Example: 20 s wait ⇒ credit `1.0`, equal to one floor of distance.

## Lowest total wins

```
total = distance
      + directionCompatibility
      + scheduledStops
      + reversePenalty
      - waitingAgeCredit
```

Pick the car with the **minimum** `total`. If two or three tie, choose **A**, then **B**, then **C**.

## Factor definitions

Let `pickup` be the request pickup floor. Let `waitSeconds = max(0, now - request.createdAt)`.

### Distance (Q2)

```
distance = abs(car.floor - pickup) * W_DISTANCE
```

`car.floor` may be fractional.

### Direction compatibility (Q5, Q7)

**Ahead**: if candidate direction is up, `pickup > car.floor`; if down, `pickup < car.floor`. Same floor is not ahead.

| Car state | directionCompatibility |
|---|---|
| idle (`direction` is null) | `0` |
| moving or doors-open, `car.direction == request.direction`, and pickup is ahead | `0` |
| otherwise | `W_DIRECTION_MISMATCH` (2.5) |

### Scheduled stops

```
stopCount = size(queue.up) + size(queue.down)
scheduledStops = stopCount * W_STOP
```

Count unique floors already in the queue **before** inserting this request.

### Reverse penalty (Q7)

| Car state | reversePenalty |
|---|---|
| idle | `0` |
| pickup is ahead in `car.direction` | `0` |
| otherwise | `W_REVERSE` (1) |

### Waiting-age credit (Q4)

```
waitingAgeCredit = waitSeconds * WAITING_AGE_RATE
```

Uncapped. Always subtracted. Credit does not depend on which car is scored (same wait for all three rows).

## Assignment lock (Q1)

`assign` runs **once** when the request is created. `assignedElevatorId` is never changed. Later ticks do not steal the request for another car. `evaluate` on an already assigned request still returns the three-car table for the UI; it does not mutate assignment.

## Compatible on-route pickup (Q5)

A pickup may be inserted into the **current** direction list when:

1. The car is not idle
2. `request.direction == car.direction`
3. Pickup is strictly ahead of `car.floor`

The new floor **may be beyond** the current farthest stop (extends the trip). Opposite-direction halls stay in the hall-direction list and are still **assigned** if this car won the cost. If the car must travel the other way to reach that pickup (down call above the car, up call below), `ensureApproachStops` copies only that pickup onto the approach list so `nextStop` can see it. Destinations between the car and the pickup stay on the hall list. Reverse still waits until no current-direction stops remain.

## Reverse gate (US-D3)

`canReverse(queue, direction)` is true only when there are **no remaining stops** in that direction relative to `car.floor`:

- Traveling up: no `up` floor `> car.floor`
- Traveling down: no `down` floor `< car.floor`

The car must not reverse while `canReverse` is false.

`nextStop`:

- Up: smallest `up` floor `> car.floor`, else none
- Down: largest `down` floor `< car.floor`, else none

## Idle assignment (US-D4, Q7)

Idle cars have `direction = null`. Scoring uses absolute distance, zero reverse penalty, zero direction mismatch. After `assign`, if pickup is above the car, set direction up and insert pickup into `up`; if below, down / `down`; if equal, go to doors-open at this floor (pickup is here).

## Stop insertion

- `insertPickup(queue, floor, direction)`: add `floor` to `up` or `down`; no-op if already present
- `insertDestination(queue, floor)`: add `floor` to the list matching travel from current floor toward that destination (up if dest > floor, else down)
- `ensureApproachStops(queue, fromFloor)`: if any `down` floor is above `fromFloor`, also insert the highest of those on `up`; if any `up` floor is below `fromFloor`, also insert the lowest of those on `down`. Called after assign and before giving up on an empty `nextStop`.
- `planStops` after assign: insert pickup (and destination so the car has a complete trip once boarded). Destination may be inserted immediately so the queue shows both floors; boarding does not refuse (US-D6 / D3)

## Motion (Q6)

U2 implements pure `tick(elevator, dt)`, `board`, `alight`. U3 only advances the clock and calls these.

- Moving: `floor` moves toward `nextStop` at `FLOORS_PER_SECOND`. Clamp to `[1, 10]`.
- On arrival: status `doors-open`, `doorTimer = DOOR_DWELL_SECONDS`.
- Doors-open: decrement `doorTimer`. When it hits 0, close doors; run `ensureApproachStops`; if `canReverse` and no `nextStop` in current direction, reverse; else continue. If a queued stop remains but neither direction has an ahead `nextStop`, start toward the approach stop instead of going idle. Idle cars with a leftover queue also start toward that stop.
- `board`: `occupancy += n` (n ≥ 0), never refuse
- `alight`: `occupancy -= n` with `n <= occupancy`

## Testable Properties (PBT-01)

| Rule | Category | Property |
|---|---|---|
| Min-cost assign | Oracle | Winner equals brute-force min of the three totals (tie-break A, B, C) |
| assign vs evaluate | Invariant | `assign(...).elevatorId === evaluate(...).selected` and factor rows equal |
| Reverse gate | Invariant | While remaining stops exist in current direction, `canReverse` is false |
| Waiting-age | Invariant | For fixed cars/request, increasing `now` never decreases `waitingAgeCredit` |
| Insert pickup | Idempotence | `insertPickup(insertPickup(q, f, d), f, d) === insertPickup(q, f, d)` |
| Compatible insert | Easy verification | A same-direction ahead pickup appears in that direction’s list after insert |
| Occupancy | Invariant | `alight` cannot produce occupancy < 0 when n is valid |
| Round-trip serialize | — | **N/A** — U2 has no parse/format pair (PBT-02) |

Stateful PBT (PBT-06): `StopQueue` command sequences (`insertPickup`, `insertDestination`, `nextStop`, `canReverse`) vs a simple model of two sorted unique floor sets.
