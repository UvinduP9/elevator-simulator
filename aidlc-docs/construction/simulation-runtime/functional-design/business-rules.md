# Business Rules — simulation-runtime

**Unit**: U3  
**Answers**: Q1–Q7 all **A**

U3 does not rescore or reassign. It creates requests, calls engine `assign` / `tick` / `board` / `alight`, and records metrics and events.

## Named constants

| Constant | Value | Used for |
|---|---|---|
| `TRAFFIC_INTERVAL_NORMAL` | `8` | Auto spawn period, simulation seconds (Q2) |
| `TRAFFIC_INTERVAL_BUSY` | `3` | Auto spawn period, simulation seconds (Q2) |
| `SPAWN_CATCHUP_CAP` | `20` | Max auto spawns in one `step` (POC freeze guard) |
| `OCCUPANCY_DISPLAY_MAX` | `8` | Snapshot `occupancyMax` only; boarding is never refused |
| `ALGORITHM_LABEL` | `Cost-Based Collective Control` | Snapshot algorithm field |

Door dwell and floors-per-second remain engine config (`DOOR_DWELL_SECONDS = 2`, `FLOORS_PER_SECOND = 1`). U3 scales motion by passing `simDt` into `tick`.

## Clock (Q4, US-L6)

- Only `SimulationService.step(realDt)` advances time. No `requestAnimationFrame` and no React in U3.
- If paused: `now` unchanged, cars not ticked, traffic does not spawn, metrics busy-time does not accumulate.
- If running: `simDt = realDt * speed`; `now := now + simDt`.
- `realDt <= 0` is a no-op.
- Speed may change while paused or running; it applies on the next running `step`.
- Manual `clickHall` and `addRandomRequest` are allowed while paused (they use current `now`). Auto traffic is not.

## Reset (Q1, US-L6)

`reset()` restores the initial world in domain-entities.md. It does not keep previous speed, traffic, or pause flag.

## Request creation (US-L2, US-L4)

Shared path: build `HallRequest` → `assign(request, world)` → persist returned request + elevators + breakdown → append REQUEST and DISPATCH events → set `selectedRequestId` to the new id.

### Hall click

- ↑ allowed on floors 1–9; ↓ on 2–10. Invalid pair (↑ on 10, ↓ on 1) is a no-op (no event).
- Destination: uniform among valid floors in that direction (Q3).
- `createdAt = now`. Id = next zero-padded three-digit string (`001`, …).

### + Add request (Q3)

1. Pickup uniform in `1..10`.
2. Direction: floor 1 → up; floor 10 → down; otherwise up or down with equal probability.
3. Destination uniform among valid floors in that direction.
4. Same assign path as a hall click.

### Traffic (Q2, US-L5)

| Preset | Interval |
|---|---|
| Off | No auto spawn; `spawnDebt` stays 0 |
| Normal | 8 s |
| Busy | 3 s |

While running and not Off: `spawnDebt += simDt`. While `spawnDebt >= interval` and spawns this step `< SPAWN_CATCHUP_CAP`: create one random request (same as + Add request), `spawnDebt -= interval`. Leftover debt is kept. Switching to Off clears debt. Switching between Normal and Busy keeps debt (next interval uses the new preset).

Pause stops this loop because `step` does not add debt while paused.

## Assign lock

U3 calls `assign` **once** per new request. It never calls `assign` again for that id. `evaluate` may be used only if tests need agreement; the evaluation panel shows the **stored** breakdown from assign time.

## Doors: alight then board (Q5, US-L7)

Detect **enter `doors-open`**: previous status was not `doors-open` and new status is `doors-open`. This includes:

- `tick` arriving at a stop
- `assign` opening doors on an idle car already at the pickup floor

On enter, at `stopFloor = round(car.floor)` (car is on that integer):

1. **Alight**: passengers in that car with `destinationFloor == stopFloor`. Call `alight`. Set request `completed`, `dropoffAt = now`. Record wait (already stored at pickup) and journey (`now - createdAt`). Append PASSENGER events. Occupancy updates immediately.
2. **Board**: requests assigned to that car with status `assigned` and `pickupFloor == stopFloor`. Call `board` with those passengers. Set status `boarded`, `pickupAt = now`. Append PASSENGER events. Occupancy updates immediately. No capacity check.

If a new request is assigned to a car **already** `doors-open` at that pickup floor, treat it as a board on that dwell (same rules), without a second alight pass.

Doors still stay open for the remaining `doorTimer` from the engine.

## Metrics (Q6, FR-16)

Let waiting requests be those with status `assigned` (not yet boarded).

| Snapshot field | Formula |
|---|---|
| averageWait | Mean of `(pickupAt - createdAt)` over **completed** trips; `0` if none |
| averageJourney | Mean of `(dropoffAt - createdAt)` over **completed** trips; `0` if none |
| completedTrips | Number of alights this session |
| longestWait | Max of: current `(now - createdAt)` for waiting requests, and all completed waits this session; `0` if none |
| utilization | Per car: `busySeconds[id] / now * 100`, or `0` when `now == 0`. Busy means status is not `idle` during a running `step` (accumulate `simDt`) |

Utilization is stored as 0–100 on `ElevatorView`.

## Event log (FR-17)

Append-only. Types:

| Type | When | Example text |
|---|---|---|
| REQUEST | Request created | `F8 ↓ created` |
| DISPATCH | After assign | `Request #018 → Elevator C` |
| ELEVATOR | Car status changes | `Doors opened at F6` |
| PASSENGER | Board or alight | `P041 boarded A, destination F9` |

Timestamp on the snapshot is simulation elapsed `HH:MM:SS.mmm` (Q7), not wall clock. `filter` is a read of the in-memory list (U4 dropdown). `clear` happens as part of `reset`.

## Snapshot extras

- `fromFloor` / `toFloor`: idle or doors-open → both `round(floor)`. Moving → `fromFloor` is the last integer floor crossed or started from; `toFloor` is `nextStop` (or current floor if none).
- `nextStop` / `stops`: engine `nextStop` / `planStops`.
- `occupancyMax`: always 8.

## Errors and edges

| Case | Behavior |
|---|---|
| Invalid hall direction | No-op |
| `step` while paused | No motion, no spawn, `now` unchanged |
| Huge `realDt` | Catch up spawns, capped at 20 |
| Alight count vs occupancy | Engine clamps; U3 only alights passengers actually onboard |
| No requests yet | Evaluation placeholder: requestId `"—"`, zeros, selected `A` |
| Duplicate hall clicks | Each click is a new request |

## Testable Properties (PBT-01)

| Rule | Category | Property |
|---|---|---|
| Clock | Invariant | Paused ⇒ `now` and car floors unchanged after `step` |
| Clock | Oracle | Running ⇒ `Δnow = realDt * speed` |
| Traffic Off | Invariant | Auto spawn count stays 0 |
| Catch-up | Oracle | For fixed interval I and running time T, spawn count is `min(floor(T/I), cap)` from a clean debt of 0 (Off ignored) |
| Destination | Invariant | Every created request has a valid dest for its direction |
| Occupancy | Invariant | ≥ 0 after door cycles |
| Reset | Idempotence | Second `reset` matches first |
| Pause vs traffic | Invariant | While paused, request count does not grow unless hall / add-request is invoked |

Stateful PBT (PBT-06): random command sequences (`step`, `pause`/`resume`, `setSpeed`, `setTraffic`, `clickHall`, `addRandomRequest`, `reset`) against a model of `now`, paused flag, and auto-spawn count.

Round-trip serialize: **N/A** (PBT-02).
