# Domain Entities — dispatch-engine

**Unit**: U2  
**Answers**: Q1–Q7 all **A** (2026-08-31)

No persistence. All values are in-memory. Floors are `1..10`. Elevator ids are `"A" | "B" | "C"`.

## Enumerations

| Name | Values |
|---|---|
| ElevatorId | A, B, C |
| Direction | up, down |
| ElevatorStatus | idle, moving-up, moving-down, doors-open |
| RequestStatus | unassigned, assigned, boarded, completed |

## Entities

### HallRequest

Created by the simulation (U3) before `assign`. The engine never invents a destination.

| Field | Meaning |
|---|---|
| id | Opaque string (e.g. `"018"`) |
| pickupFloor | 1..10 |
| direction | Hall direction at pickup |
| destinationFloor | Different valid floor in `direction` |
| createdAt | Simulation time in seconds |
| assignedElevatorId | Set once by `assign`; never changed (Q1) |
| status | Lifecycle |

**Invariant**: If `direction` is up, `destinationFloor > pickupFloor`. If down, `destinationFloor < pickupFloor`.

### Passenger

Onboard or waiting to board. Occupancy is a count of boarded passengers. No capacity refuse.

| Field | Meaning |
|---|---|
| id | Opaque string |
| requestId | Owning hall request |
| originFloor | Pickup |
| destinationFloor | Alight floor |

### StopQueue

Two directional bags of floors. Duplicates are ignored (insert is idempotent per floor).

| Field | Meaning |
|---|---|
| up | Floors to visit while traveling up, sorted ascending |
| down | Floors to visit while traveling down, sorted descending |

### Elevator

| Field | Meaning |
|---|---|
| id | A / B / C |
| floor | Real number in `[1, 10]`; fractional while moving |
| status | idle / moving-up / moving-down / doors-open |
| direction | `up` / `down` while moving or doors-open serving a direction; **null when idle** (Q7) |
| queue | StopQueue |
| occupancy | Integer >= 0 |
| doorTimer | Seconds remaining in doors-open; 0 otherwise |

### WorldState

Input to `assign` / `evaluate`. Snapshot of the three cars plus the request being scored and `now` (simulation seconds). Outstanding **other** requests are visible so scheduled-stop counts include work already committed. Assigned requests are never moved to another car (Q1).

### CarCost

Per-car factor row (same labels as the Dispatch Evaluation panel).

| Field | Role |
|---|---|
| elevatorId | A / B / C |
| distance | `|car.floor - pickupFloor| * W_DISTANCE` |
| directionCompatibility | 0 or `W_DIRECTION_MISMATCH` |
| scheduledStops | `stopCount * W_STOP` |
| reversePenalty | 0 or `W_REVERSE` |
| waitingAgeCredit | `waitSeconds * WAITING_AGE_RATE` (non-negative) |
| total | sum of penalties minus credit |

### CostBreakdown

`CarCost` for A, B, and C plus `selected: ElevatorId` (min total; ties A then B then C).

### Assignment

`{ elevatorId, breakdown }` returned by `assign`. `breakdown.selected` equals `elevatorId`.

### Motion (tick)

`tick(elevator, dt)` is a **pure** function. `dt` is already scaled by U3 speed. Named motion constants live in the engine config (see business-rules.md).

## Relationships

```
HallRequest 1 -- 0..1 Elevator   (assignedElevatorId, set once)
HallRequest 1 -- 0..* Passenger
Elevator    1 -- 1 StopQueue
WorldState  1 -- 3 Elevator
```

Text alternative: each request is assigned to at most one elevator and never reassigned. Each elevator has one stop queue. World state always contains cars A, B, and C.

## Testable Properties (PBT-01)

| Entity / helper | Category | Property |
|---|---|---|
| HallRequest | Invariant | Direction and destination stay consistent (up ⇒ dest > pickup) |
| StopQueue insert | Idempotence | Inserting the same floor twice does not change the queue |
| CarCost.waitingAgeCredit | Invariant | Credit is non-decreasing as `waitSeconds` increases |
| Occupancy | Invariant | After `alight`, occupancy is never negative if alight count ≤ occupancy |

Generators (PBT-07, for code generation): constrained floors `1..10`, elevator ids, directions, fractional floors in range, wait times ≥ 0.
