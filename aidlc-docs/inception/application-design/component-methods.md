# Component Methods

Signatures are TypeScript-oriented. **Business rules** (scoring formulas, dwell times, spawn rates) belong in Functional Design for the engine/simulation units. Scaffold implements UI method **props** only, with sample data.

Legend: `Floor = 1..10`, `ElevatorId = "A" | "B" | "C"`, `Direction = "up" | "down"`, `Speed = 0.5 | 1 | 2 | 5`.

---

## C-ENG-01 DispatchEngine

| Method | In | Out | Purpose |
|---|---|---|---|
| `assign(request, state)` | `HallRequest`, `WorldState` | `Assignment` `{ elevatorId, breakdown }` | Assign the request to the lowest-cost car |
| `evaluate(request, state)` | `HallRequest`, `WorldState` | `CostBreakdown` | Same scores the UI table shows; must match `assign` |
| `planStops(elevator, assignedRequests)` | `Elevator`, `HallRequest[]` | `Floor[]` | Ordered stops for that car |

## C-ENG-02 CostScorer

| Method | In | Out | Purpose |
|---|---|---|---|
| `score(request, elevator, now)` | `HallRequest`, `Elevator`, `Time` | `CarCost` | Factors: distance, direction, scheduled stops, reverse penalty, waiting-age |
| `total(carCost)` | `CarCost` | `number` | Weighted sum using named constants |
| `pickWinner(costs)` | `CarCost[]` | `ElevatorId` | Min total; tie-break A then B then C |

## C-ENG-03 StopQueueManager

| Method | In | Out | Purpose |
|---|---|---|---|
| `insertPickup(queue, floor, direction)` | `StopQueue`, `Floor`, `Direction` | `StopQueue` | Insert a compatible pickup |
| `insertDestination(queue, floor)` | `StopQueue`, `Floor` | `StopQueue` | Add destination after boarding |
| `nextStop(queue, currentFloor, direction)` | `StopQueue`, `Floor`, `Direction` | `Floor \| null` | Next stop in current direction |
| `canReverse(queue, direction)` | `StopQueue`, `Direction` | `boolean` | True only if that direction’s remaining stops are empty |

## C-ENG-04 ElevatorStateMachine

| Method | In | Out | Purpose |
|---|---|---|---|
| `tick(elevator, dt, commands)` | `Elevator`, `seconds`, `MotionCommand` | `Elevator` | Advance position / doors |
| `board(elevator, passengers)` | `Elevator`, `Passenger[]` | `Elevator` | Occupancy += n; no capacity refuse |
| `alight(elevator, passengers)` | `Elevator`, `Passenger[]` | `Elevator` | Occupancy -= n |

---

## C-SIM-02 SimulationClock

| Method | In | Out | Purpose |
|---|---|---|---|
| `start()` / `pause()` / `resume()` | — | `ClockState` | Running vs paused |
| `reset()` | — | `ClockState` | Back to t=0 |
| `setSpeed(speed)` | `Speed` | `ClockState` | 0.5x–5x |
| `tick(realDt)` | `seconds` | `{ simDt }` | `simDt = realDt * speed` if running |

## C-SIM-03 TrafficGenerator

| Method | In | Out | Purpose |
|---|---|---|---|
| `setPreset(preset)` | `Off \| Normal \| Busy` | — | Spawn policy |
| `maybeSpawn(now, state)` | `Time`, `WorldState` | `HallRequest[]` | Zero or more new requests |

## C-SIM-04 MetricsCollector

| Method | In | Out | Purpose |
|---|---|---|---|
| `onRequestCreated(req, t)` | `HallRequest`, `Time` | — | Start wait clock |
| `onPickup(req, t)` | `HallRequest`, `Time` | — | Wait sample |
| `onDropoff(req, t)` | `HallRequest`, `Time` | — | Journey sample + completed trips |
| `onUtilization(id, busy, dt)` | `ElevatorId`, `boolean`, `dt` | — | Utilization bars |
| `snapshot()` | — | `Metrics` | Values for PerformancePanel |

## C-SIM-05 EventLogStore

| Method | In | Out | Purpose |
|---|---|---|---|
| `append(event)` | `SimEvent` | — | Append REQUEST / DISPATCH / ELEVATOR / PASSENGER |
| `filter(type)` | `EventType \| "all"` | `SimEvent[]` | Filter dropdown |
| `clear()` | — | — | Reset |

## C-SIM-01 SimulationService

| Method | In | Out | Purpose |
|---|---|---|---|
| `getSnapshot()` | — | `SimulationSnapshot` | Full UI bind |
| `clickHall(floor, direction)` | `Floor`, `Direction` | — | Create request + assign |
| `addRandomRequest()` | — | — | Same as one random hall call |
| `setTraffic(preset)` | preset | — | |
| `setSpeed(speed)` | `Speed` | — | Sync header 1x and control bar |
| `pause()` / `resume()` / `reset()` | — | — | |
| `selectRequest(id)` | `RequestId` | — | Evaluation panel target |

---

## UI (props / callbacks)

UI components do not compute costs. They call SimulationService (later) or render a static snapshot (scaffold).

| Component | Key inputs | Callbacks (live unit; no-op in scaffold) |
|---|---|---|
| AppHeader | `status`, `speed`, `algorithmId` | `onSpeedChange`, `onAlgorithmChange` |
| HallCallColumn | `hallCalls` | `onHallClick` |
| SimulationControlBar | `traffic`, `speed`, `paused` | `onPause`, `onReset`, `onAddRequest`, `onTraffic`, `onSpeed` |
| ActiveRequestsPanel | `requests`, `selectedId` | `onSelectRequest` |
| DispatchEvaluationPanel | `requestId`, `CostBreakdown` | — |
| ElevatorsStatusPanel | `elevators[]` | — occupancy formatted `occupancy + " / 8"` |
| PerformancePanel | `Metrics` | — |
| EventLogPanel | `events`, `filter` | `onFilterChange` |

---

## PBT targets (Functional Design later)

Methods on CostScorer, StopQueueManager (`canReverse`), DispatchEngine `assign`/`evaluate` agreement, waiting-age monotonicity (US-D1, D2, D3, D5, D6).
