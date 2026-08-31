# Components

Visual target: `aidlc-docs/inception/requirements/ui-mockup.jpg` (1:1).

## Layer map

| Layer | Folder | React? | Role |
|---|---|---|---|
| UI | `src/ui` | Yes | Layout and controls matching the mockup. Renders a `SimulationSnapshot`. No scoring. |
| Simulation | `src/simulation` | No | Clock, traffic, metrics, event log, tick loop. Calls the engine. |
| Engine | `src/engine` | No | Scoring, assignment, stop queues, elevator state machine. |

---

## UI components (1:1 with the mockup)

### C-UI-01 AppShell
- **Purpose**: Page chrome: light-gray canvas, white shadowed panels, desktop grid.
- **Responsibilities**: Place header, visualizer + controls, right-hand panel stack, event log. No business logic.
- **Interface**: Receives `SimulationSnapshot` (live later; sample snapshot in scaffold).

### C-UI-02 AppHeader
- **Purpose**: Top bar 1:1 with the mockup.
- **Responsibilities**:
  - Left: elevator icon, title **Elevator Dispatch Simulator**, subtitle **10 Floors · 3 Elevators**
  - Center: label **Algorithm:** and dropdown **Cost-Based Collective Control** (only live strategy)
  - Right: green **● Running** (or paused equivalent) and a **1x** speed chevron control (mirrors current speed)
- **Interface**: `status`, `speed`, `algorithmId`, `onAlgorithmChange` (no-op for unimplemented strategies)

### C-UI-03 BuildingVisualizer
- **Purpose**: Left main panel: 10-floor grid, hall calls, shafts A/B/C.
- **Responsibilities**: Floor numbers 1–10 with 1 at the bottom. Footer hint: **Click ↑ or ↓ to create a passenger**.
- **Children**: FloorGutter, HallCallColumn, ElevatorShaft × 3.

### C-UI-04 HallCallColumn
- **Purpose**: Up/down arrows per floor.
- **Responsibilities**: ↑ on 1–9, ↓ on 2–10. Active call uses assigned car color and letter chip (A blue, B orange, C purple). Inactive arrows gray.
- **Interface**: `hallCalls[]`, `onHallClick(floor, direction)` (no-op in scaffold).

### C-UI-05 ElevatorShaft
- **Purpose**: One vertical lane A, B, or C with colored header letter.
- **Responsibilities**: Position the car using floor (integer or fractional). Glow in car color.

### C-UI-06 ElevatorCar
- **Purpose**: The moving pod 1:1 with the mockup.
- **Responsibilities**:
  - Moving: direction arrow and **from → to** (e.g. `4 → 5`)
  - Doors open: person icon + occupancy count
  - Colors: A blue, B orange, C purple
- **Interface**: `elevator` view model from snapshot

### C-UI-07 SimulationControlBar
- **Purpose**: Bar under the visualizer.
- **Responsibilities**: Filled **Pause** (blue), **Reset**, **+ Add request**, **Traffic:** dropdown (Off / Normal / Busy), segmented **0.5x 1x 2x 5x** with selected chip blue.
- **Interface**: control callbacks (no-op in scaffold).

### C-UI-08 ActiveRequestsPanel
- **Purpose**: Top-left of the right column.
- **Title**: Active Requests
- **Columns**: Floor, Dir, Wait (seconds, one decimal), Assigned (color letter). Selected row may use a light-blue highlight.

### C-UI-09 DispatchEvaluationPanel
- **Purpose**: Top-right of the right column. The visible “brain”.
- **Title**: Dispatch Evaluation - Request #NNN
- **Rows**: Distance (floors), Direction compatibility, Scheduled stops, Reverse penalty, Waiting-age credit, Total
- **Columns**: Factor, A, B, C
- **Footer**: Selected: Elevator X in that car’s color
- **Interface**: `CostBreakdown` from the engine (sample numbers in scaffold).

### C-UI-10 ElevatorsStatusPanel
- **Purpose**: Full-width table under the two top panels.
- **Columns**: Elevator, Status (`Moving ↑` / `Moving ↓` / `Doors open` / `Idle`), Floor (decimal allowed), Next Stop, Stops (`6 · 8 · 10`), Occupancy **`n / 8`** with person icon, Utilization (mini bar + %).

### C-UI-11 PerformancePanel
- **Purpose**: Bottom of the right column.
- **KPI cards**: Average wait, Longest wait, Average journey, Completed trips
- **Chart**: Horizontal utilization bars A/B/C, 0–100% scale, car colors

### C-UI-12 EventLogPanel
- **Purpose**: Full-width bottom panel.
- **Header**: Event Log + Filter dropdown (All Events / REQUEST / DISPATCH / ELEVATOR / PASSENGER)
- **Rows**: timestamp, colored type pill, description (e.g. `F8 ↓ created`, `Request #018 → Elevator C`)

---

## Simulation components

### C-SIM-01 SimulationService
- **Purpose**: Orchestrator (see `services.md`). Owns the tick loop and the snapshot the UI binds to.

### C-SIM-02 SimulationClock
- **Purpose**: Running / paused, speed 0.5 / 1 / 2 / 5, `dt` scaled by speed.

### C-SIM-03 TrafficGenerator
- **Purpose**: Off / Normal / Busy spawn rates. Off spawns none.

### C-SIM-04 MetricsCollector
- **Purpose**: Average/longest wait, average journey, completed trips, per-car utilization.

### C-SIM-05 EventLogStore
- **Purpose**: Append-only events with type and filter.

---

## Engine components

### C-ENG-01 DispatchEngine
- **Purpose**: Facade: score, assign, return breakdown for the evaluation panel.

### C-ENG-02 CostScorer
- **Purpose**: Named-constant weights; per-car factor totals. Lowest total wins; deterministic tie-break (A, then B, then C).

### C-ENG-03 StopQueueManager
- **Purpose**: Directional stop lists; insert compatible pickups; reverse only when the current-direction queue is empty.

### C-ENG-04 ElevatorStateMachine
- **Purpose**: Idle, moving, doors open; fractional floor; door dwell; occupancy count (no refuse).

---

## Shared types (not a runtime component)

`src/engine/types.ts` (and view-models in `src/ui` if needed): Elevator, HallRequest, Passenger, CostBreakdown, SimulationSnapshot, SimEvent.

Scaffold may use a frozen sample `SimulationSnapshot` without calling the engine.
