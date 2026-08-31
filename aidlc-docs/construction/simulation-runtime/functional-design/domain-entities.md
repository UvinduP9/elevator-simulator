# Domain Entities — simulation-runtime

**Unit**: U3  
**Answers**: Q1–Q7 all **A** (2026-08-31)

No persistence. No React. Engine types (`Elevator`, `HallRequest`, `Passenger`, `WorldState`, `CostBreakdown`) stay in `src/engine`. Simulation owns time, requests, passengers, metrics, and the log, and maps them to the existing UI `SimulationSnapshot` fields (Q7).

## Enumerations

| Name | Values |
|---|---|
| TrafficPreset | Off, Normal, Busy |
| Speed | 0.5, 1, 2, 5 |
| ClockStatus | Running, Paused |
| EventType | REQUEST, DISPATCH, ELEVATOR, PASSENGER |

Floors `1..10`. Elevator ids `A | B | C`. Algorithm label is the constant `"Cost-Based Collective Control"`.

## Entities

### SimulationClock

| Field | Meaning |
|---|---|
| now | Simulation seconds since reset, `>= 0` |
| speed | 0.5 / 1 / 2 / 5 |
| paused | If true, `step` does not advance `now` |

`simDt = realDt * speed` when running; `simDt = 0` when paused.

### TrafficScheduler

| Field | Meaning |
|---|---|
| preset | Off / Normal / Busy |
| spawnDebt | Accumulated simulation seconds toward the next auto spawn (Q2) |

Off: never auto-spawns. Normal interval **8** s. Busy interval **3** s.

### SimRequest

A `HallRequest` plus fields the engine does not store.

| Field | Meaning |
|---|---|
| request | Engine `HallRequest` (id, pickup, direction, destination, createdAt, assignedElevatorId, status) |
| breakdown | `CostBreakdown` captured at `assign` (never recomputed for that id) |
| pickupAt | Sim time when the passenger boarded; `null` until then |
| dropoffAt | Sim time when the passenger alighted; `null` until then |

**Invariant**: destination is a different valid floor in `direction` (up ⇒ dest > pickup, down ⇒ dest < pickup).

### SimPassenger

Engine `Passenger` currently in a car. One passenger per request. Occupancy is the count of these per car.

### MetricsState

| Field | Meaning |
|---|---|
| completedWaits | Wait samples (`pickupAt - createdAt`) for completed trips |
| completedJourneys | Journey samples (`dropoffAt - createdAt`) |
| completedTrips | Count of alights |
| busySeconds | Per-car seconds where status was not `idle` |
| longestCompletedWait | Max of `completedWaits` (0 if none) |

Snapshot longest wait also considers **currently waiting** assigned requests (Q6).

### SimEvent

| Field | Meaning |
|---|---|
| at | Simulation seconds |
| type | REQUEST / DISPATCH / ELEVATOR / PASSENGER |
| elevatorId | Optional; set for ELEVATOR (and PASSENGER when known) |
| text | Human-readable line for the log |

Snapshot `time` is `at` formatted `HH:MM:SS.mmm` from t = 0 (Q7). Example: `14.2` s → `00:00:14.200`.

### SimulationWorld

Owned by `SimulationService`. Not a React store.

| Field | Meaning |
|---|---|
| clock | SimulationClock |
| traffic | TrafficScheduler |
| elevators | A, B, C (`Elevator` from the engine) |
| requests | All `SimRequest` this session |
| passengers | Currently boarded `Passenger`s |
| metrics | MetricsState |
| events | Append-only `SimEvent[]` |
| selectedRequestId | Evaluation panel target; last assigned id, or `selectRequest` |
| nextRequestSeq | Integer counter for ids `"001"`, `"002"`, … |

`WorldState` passed to the engine is `{ now: clock.now, elevators }`.

## Snapshot mapping (Q7)

`getSnapshot()` returns the UI `SimulationSnapshot` shape (`src/ui/types.ts`). U3 does **not** import React; it may import snapshot **types** only, or duplicate the field names in `src/simulation` and keep them aligned. U4 binds the object.

| Snapshot field | Source |
|---|---|
| algorithm | Constant string |
| status | Running if not paused, else Paused |
| speed / traffic | Clock and scheduler |
| hallCalls | Unique (floor, direction) among requests with status `assigned`, oldest waiting request’s car |
| elevators | View per car: floor, status, occupancy, `occupancyMax: 8`, next stop, stop list, utilization %, from/to |
| requests | Incomplete requests (`assigned` or `boarded`); `waitSeconds` live for waiting, frozen at pickup for boarded; `highlighted` if selected |
| evaluation | Stored breakdown of `selectedRequestId`, or empty rows / `"—"` / selected `A` if none |
| metrics | See business-rules.md |
| events | Log entries with formatted sim timestamps |

## Initial / reset world (Q1)

- Cars A, B, C: idle at floor **1**, empty queues, occupancy 0, `doorTimer` 0, `direction` null
- `now = 0`, speed **1**, traffic **Off**, running (not paused)
- No requests, no passengers, empty metrics, empty log
- `selectedRequestId` null, `nextRequestSeq` 1, `spawnDebt` 0

## Relationships

```
SimulationWorld 1 -- 1 SimulationClock
SimulationWorld 1 -- 1 TrafficScheduler
SimulationWorld 1 -- 3 Elevator
SimulationWorld 1 -- * SimRequest
SimulationWorld 1 -- * SimPassenger
SimRequest 1 -- 0..1 SimPassenger
SimRequest 1 -- 1 CostBreakdown
```

Text alternative: the service owns one clock, one traffic scheduler, three cars, and lists of requests, onboard passengers, metrics, and events. Each request has one stored cost breakdown and at most one passenger.

## Testable Properties (PBT-01)

| Entity / helper | Category | Property |
|---|---|---|
| HallRequest destination | Invariant | Up ⇒ dest in `(pickup+1)..10`; down ⇒ dest in `1..(pickup-1)` |
| SimulationClock | Invariant | Paused `step` leaves `now` unchanged; running `now` increases by `realDt * speed` |
| Occupancy | Invariant | Occupancy ≥ 0 after board/alight |
| Reset | Idempotence | `reset()` twice equals `reset()` once (same world, ignoring RNG stream if unused) |

Generators (PBT-07): floors 1–10, valid hall pairs, speeds `{0.5,1,2,5}`, `realDt ≥ 0`, traffic presets.

### PBT-02

**N/A** — `getSnapshot` is a one-way view. U3 has no parse/format round-trip pair.
