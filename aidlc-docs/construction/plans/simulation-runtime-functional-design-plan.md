# Functional Design Plan — U3 simulation-runtime

**Stage**: CONSTRUCTION — Functional Design  
**Unit**: simulation-runtime  
**Stories**: US-L2, US-L4, US-L5, US-L6, US-L7  
**Components**: C-SIM-01 SimulationService, C-SIM-02 SimulationClock, C-SIM-03 TrafficGenerator, C-SIM-04 MetricsCollector, C-SIM-05 EventLogStore  
**Depends on**: U2 dispatch-engine (`assign`, `evaluate`, `tick`, `board`, `alight`)  
**PBT**: Full extension is on. Identify testable properties (PBT-01) even though these stories were marked PBT: no in the story list.  
**UI**: None in this unit. Skip `frontend-components.md`. Do not change React. U4 binds `getSnapshot()`.

**Status**: Answers recorded (all A). Design artifacts generated.

---



## Already decided (will not re-ask)

- 10 floors (1 at bottom), 3 cars A / B / C
- Hall ↑ on 1–9, ↓ on 2–10; destination is a random valid floor in that direction, chosen at creation
- **+ Add request** uses the same create → `assign` path as a hall click
- Assign once at creation; U3 never calls `assign` again for that request
- Traffic Off / Normal / Busy; Off spawns nothing; pause stops both movement and automatic spawn
- Speed 0.5x / 1x / 2x / 5x scales simulation time; pause freezes the clock; reset restores the initial state
- Engine owns motion: U3 calls `tick(elevator, simDt)`, then `board` / `alight` around doors-open
- Occupancy is a count; boarding is never refused; `n / 8` is U4 display only
- Simulation module has no React imports (same isolation rule as the engine)
- U3 does not wire the dashboard; `src/ui` stays on `sampleSnapshot` until U4
- NFR Requirements / NFR Design / Infrastructure Design stay skipped for this POC after Functional Design

---



## Execution steps (after answers)

- [x] Record answers in `audit.md` and resolve any ambiguous replies
- [x] Write `aidlc-docs/construction/simulation-runtime/functional-design/domain-entities.md`
- [x] Write `aidlc-docs/construction/simulation-runtime/functional-design/business-rules.md` (clock, spawn, dest, board/alight, reset, metrics, log)
- [x] Write `aidlc-docs/construction/simulation-runtime/functional-design/business-logic-model.md` (step / clickHall / addRandomRequest / traffic)
- [x] Skip `frontend-components.md` (N/A for this unit)
- [x] Include **Testable Properties** (PBT-01) per component
- [x] Mark PBT-02 N/A unless a serialize/parse pair is in U3
- [x] Present Functional Design Complete (2-option gate). Next stage after approval: skip NFR/Infra, then U3 Code Generation

---



## Clarifying questions

Fill **one letter** (or Other) on each `[Answer]:` line in this file. Tell me when you are done.

## Question 1

What is the **initial / reset** world?

A) All cars idle at floor 1, empty queues, occupancy 0, time 0, no requests, empty metrics and log. Speed 1x, traffic Off, running. (Recommended)

B) Same empty requests/metrics/log, but cars start idle at 1, 5, and 10 so they are spread out

C) Reset restores the U1 sample snapshot pose (A moving at 4.7, B doors-open at 3, C moving at 6.8, plus sample requests)

D) Other (please describe after [Answer]: tag below)

[Answer]:  A

## Question 2

How often should **Normal** and **Busy** traffic spawn while running?

A) Normal: one request every **8** simulation seconds. Busy: one every **3** simulation seconds. If `step` jumps more than one interval, catch up (spawn the missed count). (Recommended)

B) Normal: every **5** s. Busy: every **2** s. Catch up on large `dt` the same way

C) Poisson: Normal mean 8 s, Busy mean 3 s (random inter-arrival, not a fixed interval)

D) Other (please describe after [Answer]: tag below)

[Answer]:  A

## Question 3

How is a **random destination** (and **+ Add request** pickup) chosen?

A) Destination: uniform among valid floors in that direction. **+ Add request**: uniform pickup 1–10, then a valid direction (floor 1 only ↑, floor 10 only ↓, others 50/50), then destination as above. (Recommended)

B) Same as A, but bias destinations toward 1 and 10 (typical office traffic)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4

Who **advances time** in U3?

A) `SimulationService.step(realDt)` only. No `requestAnimationFrame` and no React. Tests call `step`. U4 will drive the browser frame loop later. (Recommended)

B) U3 starts its own `requestAnimationFrame` (or `setInterval`) inside `start()` / `pause()`

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5

When do passengers **alight and board** relative to doors?

A) On the tick when a car **enters** `doors-open`: alight everyone whose destination is this floor, then board everyone assigned to this car waiting here. Occupancy updates immediately. Doors still dwell 2 s. (Recommended)

B) Alight when doors open; board just before doors close

C) Spread board/alight across the 2 s dwell

D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6

How are **performance metrics** defined?

A) Wait = pickup time − createdAt. Journey = dropoff time − createdAt. Averages over completed trips. Longest wait = max wait among current waiting requests and completed waits this session. Utilization per car = fraction of sim time status is not `idle`. (Recommended)

B) Same wait/journey as A, but longest wait is only among **completed** trips (active waits ignored)

C) Journey = dropoff − pickup (in-car time only). Longest wait among active requests only

D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7

What should `getSnapshot()` return in U3, and how should **event timestamps** look?

A) A UI-ready snapshot matching the existing `src/ui` `SimulationSnapshot` fields (so U4 is mostly wiring). Event time is **simulation** elapsed formatted `HH:MM:SS.mmm` from t = 0 (example `00:00:14.200`). (Recommended)

B) Sim-internal state only (world + metrics + log). U4 maps to view models. Event time is sim elapsed as in A

C) UI-ready snapshot as in A, but event time is **wall-clock** local time like the mockup (`10:14:03.281`)

D) Other (please describe after [Answer]: tag below)

[Answer]: A