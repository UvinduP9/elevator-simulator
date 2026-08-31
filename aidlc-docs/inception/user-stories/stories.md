# User Stories

**Persona**: P-1 Simulation Operator (all stories)  
**Organization**: Epic-based  
**Acceptance criteria**: Bullet checklists  
**Requirements**: `aidlc-docs/inception/requirements/requirements.md`

Stories follow INVEST. The first epic is the only increment for the initial scaffold. Later epics are the product MVP, not the first construction increment.

**PBT**: Stories marked **PBT: yes** must have property identification in Functional Design (PBT-01). They are not the only tests — example-based cases are still required (PBT-10).

---

## Epic E1 — Scaffold

Static dashboard only. No live clock, animation, or dispatcher.

### US-S1: View the static dispatch dashboard

**As a** Simulation Operator  
**I want** to open the app and see a desktop dashboard that matches the mockup  
**So that** I can learn the layout before anything moves

**Requirements**: FR-S1, FR-S2, FR-S3, FR-S4, FR-S5, FR-S6  
**PBT**: no

**Acceptance criteria**
- App installs and runs locally with npm (dev server documented in README)
- Header shows title, “10 Floors · 3 Elevators”, Algorithm dropdown (Cost-Based Collective Control), Running status, and 1x speed
- Left: 10 floors (1 at bottom), hall ↑/↓, three shafts labeled A / B / C in blue / orange / purple
- Sample cars and sample labels are visible; cars do not animate
- Controls visible: Pause, Reset, + Add request, Traffic, speed 0.5x / 1x / 2x / 5x
- Right: Active Requests, Dispatch Evaluation, Elevators, Performance (sample numbers allowed)
- Elevators occupancy is shown as `n / 8` (display only in scaffold)
- Bottom: event log with a type filter control
- Clicking controls does not need to change simulation state
- `npm test` is configured (may have no dispatcher tests yet)

---

## Epic E2 — Dispatch Brain

Pure engine behavior. UI may display results in later stories; the rules live in the engine.

### US-D1: Assign a request to the lowest-cost car

**As a** Simulation Operator  
**I want** each new hall call assigned to the car with the lowest total cost  
**So that** assignment is explainable and consistent

**Requirements**: FR-9  
**PBT**: yes (oracle / invariant: selected car has minimum total; tie-break documented)

**Acceptance criteria**
- Cost includes distance, moving-toward, direction match, scheduled stops, reverse penalty, waiting-age credit
- Weights are named constants, not UI sliders
- Lowest total wins
- If two cars tie, a documented deterministic tie-break is used (e.g. car id A then B then C)

### US-D2: Serve the current direction and pick up along the route

**As a** Simulation Operator  
**I want** a moving car to keep its direction and collect compatible passengers  
**So that** it does not reverse for every new call

**Requirements**: FR-10  
**PBT**: yes (invariant: no reverse while current-direction stops remain)

**Acceptance criteria**
- Stops in the current direction are completed before reverse
- Compatible same-direction pickups on the route are inserted into the stop queue
- Incompatible opposite-direction calls are not served until reverse is allowed

### US-D3: Reverse only after the directional queue is empty

**As a** Simulation Operator  
**I want** a car to reverse only when it has no remaining stops in the current direction  
**So that** direction changes are predictable

**Requirements**: FR-10  
**PBT**: yes (invariant: reverse only if current-direction stop set is empty)

**Acceptance criteria**
- Reverse does not occur while a stop remains in the current direction
- After reverse, the new direction is served with the same rules as US-D2

### US-D4: Idle cars prefer nearby requests

**As a** Simulation Operator  
**I want** an idle car to take a nearby waiting call when it has no current trip  
**So that** idle cars are not left unused

**Requirements**: FR-11  
**PBT**: no (example-based is enough unless a distance preference is formalized as an invariant)

**Acceptance criteria**
- An idle car with no stops can be assigned a waiting request
- Distance to pickup is a first-class cost input (see US-D1)
- Nearby idle assignment is visible in the evaluation scores when that request is scored

### US-D5: Old requests are not starved

**As a** Simulation Operator  
**I want** waiting-age to increase a request’s priority over time  
**So that** a call is not ignored forever while cars stay busy elsewhere

**Requirements**: FR-11  
**PBT**: yes (invariant: waiting-age credit is non-decreasing with wait time)

**Acceptance criteria**
- Waiting-age credit grows with wait time
- A long-waiting request can beat a slightly closer but new request when age is large enough
- Aging uses the same named constants as other cost factors

### US-D6: Engine stays independent of the UI

**As a** Simulation Operator  
**I want** the scoring I see in the dashboard to come from a UI-free engine  
**So that** the “brain” can be tested without the React app

**Requirements**: FR-18  
**PBT**: yes (properties run against the pure engine)

**Acceptance criteria**
- Dispatch module has no React imports
- Example-based Vitest tests cover assignment, direction, reverse, and aging
- Property-based tests (fast-check) cover the PBT-marked stories; seeds log on failure

---

## Epic E3 — Live Simulation

Clock, cars, passengers, and controls.

### US-L1: Watch cars move and change state

**As a** Simulation Operator  
**I want** cars to move between floors and show idle, moving, or doors open  
**So that** the shafts match what the engine is doing

**Requirements**: FR-1, FR-2  
**PBT**: no

**Acceptance criteria**
- Three cars, floors 1–10
- States: idle, moving, doors open
- Position may be fractional while moving (for example 4.7)
- Moving cars show a from → to label
- Distinct colors A blue, B orange, C purple

### US-L2: Create a hall call with an automatic destination

**As a** Simulation Operator  
**I want** to click ↑ or ↓ on a floor and get a passenger  
**So that** I can inject calls without an in-car panel

**Requirements**: FR-3  
**PBT**: no

**Acceptance criteria**
- ↑ exists on floors 1–9; ↓ exists on floors 2–10
- Click creates a request: pickup floor, direction, auto destination in that direction, creation time
- Destination is a different valid floor in the requested direction

### US-L3: See many calls and which car is assigned

**As a** Simulation Operator  
**I want** several calls at once, with hall buttons colored by assigned car  
**So that** I can follow load across the building

**Requirements**: FR-4  
**PBT**: no

**Acceptance criteria**
- Multiple outstanding requests are allowed
- Assigned hall buttons use that car’s color and letter
- Unassigned or pending display is distinguishable from assigned

### US-L4: Add one random request from the control bar

**As a** Simulation Operator  
**I want** + Add request to inject one extra call  
**So that** I do not have to click a specific arrow

**Requirements**: FR-5  
**PBT**: no

**Acceptance criteria**
- One click creates one request with random floor, valid direction, auto destination
- Behavior matches a hall-created request (same assignment path)

### US-L5: Run Off / Normal / Busy traffic

**As a** Simulation Operator  
**I want** a traffic preset that keeps generating calls  
**So that** I can demo congestion without clicking every floor

**Requirements**: FR-6  
**PBT**: no

**Acceptance criteria**
- Presets: Off, Normal, Busy
- Off generates no automatic requests
- Normal and Busy generate while the sim is running (Busy more often than Normal)
- Pause stops new automatic generation as well as movement

### US-L6: Pause, reset, and change speed

**As a** Simulation Operator  
**I want** pause, reset, and 0.5x / 1x / 2x / 5x  
**So that** I can inspect a moment or restart a demo

**Requirements**: FR-7, FR-8  
**PBT**: no

**Acceptance criteria**
- Pause freezes the simulation clock
- Resume continues from the frozen state
- Speed multipliers scale simulation time
- Reset restores cars, requests, metrics, and log to the initial state

### US-L7: Doors open, passengers board, occupancy is a count

**As a** Simulation Operator  
**I want** doors to open at a stop, a short dwell, then continue, with occupancy as a count  
**So that** boarding is visible without a capacity cap

**Requirements**: FR-12, D3  
**PBT**: no

**Acceptance criteria**
- At a stop, doors open, dwell, then close and continue
- Occupancy increases on board and decreases on alight
- No maximum occupancy; cars do not refuse boarding
- UI never shows `n / 8`

---

## Epic E4 — Observability

### US-O1: Inspect dispatch evaluation for a request

**As a** Simulation Operator  
**I want** a cost breakdown per car for a request  
**So that** I can see why that car was selected

**Requirements**: FR-13  
**PBT**: no (display of US-D1 results)

**Acceptance criteria**
- Panel shows factor scores and totals for A, B, and C
- Selected car is the lowest total (same as US-D1)
- Panel tracks the latest or selected request (document which in UI copy)

### US-O2: Read the active requests table

**As a** Simulation Operator  
**I want** a table of outstanding calls  
**So that** I can see floor, direction, wait, and assignment

**Requirements**: FR-14  
**PBT**: no

**Acceptance criteria**
- Columns: floor, direction, wait time, assigned car
- Rows update as requests are created, assigned, and completed

### US-O3: Read per-car status and stop queues

**As a** Simulation Operator  
**I want** each car’s status, floor, next stop, stop list, occupancy, and utilization  
**So that** the shafts and the table stay consistent

**Requirements**: FR-15  
**PBT**: no

**Acceptance criteria**
- Status, floor (fractional when moving), next stop, stop queue, occupancy count, utilization
- Stop order matches the engine queue

### US-O4: Read performance metrics

**As a** Simulation Operator  
**I want** wait, journey, trip counts, and utilization bars  
**So that** I can compare how busy the cars are

**Requirements**: FR-16  
**PBT**: no

**Acceptance criteria**
- Cards: average wait, longest wait, average journey, completed trips
- Utilization bars for A, B, and C
- Reset returns metrics to the initial empty/zero state

### US-O5: Filter the event log

**As a** Simulation Operator  
**I want** a timestamped log I can filter by type  
**So that** I can replay what just happened

**Requirements**: FR-17  
**PBT**: no

**Acceptance criteria**
- Event types: REQUEST, DISPATCH, ELEVATOR, PASSENGER
- Filter: All Events plus each type
- Entries include enough detail to identify floor, car, and request or passenger id
- Reset clears the log (or restores the initial empty log)

---

## Story to requirement map

| Story | Requirements |
|---|---|
| US-S1 | FR-S1–FR-S6 |
| US-D1 | FR-9 |
| US-D2 | FR-10 |
| US-D3 | FR-10 |
| US-D4 | FR-11 |
| US-D5 | FR-11 |
| US-D6 | FR-18 |
| US-L1 | FR-1, FR-2 |
| US-L2 | FR-3 |
| US-L3 | FR-4 |
| US-L4 | FR-5 |
| US-L5 | FR-6 |
| US-L6 | FR-7, FR-8 |
| US-L7 | FR-12 |
| US-O1 | FR-13 |
| US-O2 | FR-14 |
| US-O3 | FR-15 |
| US-O4 | FR-16 |
| US-O5 | FR-17 |

FR-11 is split across US-D4 and US-D5 (nearby idle vs aging). FR-10 is split across US-D2 and US-D3 (serve direction vs reverse gate).
