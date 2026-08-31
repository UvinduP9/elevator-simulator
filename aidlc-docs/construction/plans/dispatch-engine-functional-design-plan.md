# Functional Design Plan — U2 dispatch-engine

**Stage**: CONSTRUCTION — Functional Design  
**Unit**: dispatch-engine  
**Stories**: US-D1, US-D2, US-D3, US-D4, US-D5, US-D6  
**Components**: C-ENG-01 DispatchEngine, C-ENG-02 CostScorer, C-ENG-03 StopQueueManager, C-ENG-04 ElevatorStateMachine  
**PBT**: Full (PBT-01 property identification in the design artifacts after answers)  
**UI**: None (pure TypeScript; no frontend-components.md)

**Status**: Answers recorded (all A). Design artifacts generated.

---

## Already decided (will not re-ask)

- 10 floors (1 at bottom), 3 cars A / B / C
- Cost-based collective control only; lowest total wins; tie-break A then B then C
- Factors: distance, moving-toward / direction match, scheduled stops, reverse penalty, waiting-age credit
- Weights are named constants (not UI sliders)
- `assign` and `evaluate` must produce the same scores
- Serve current direction; compatible on-route pickups; reverse only when that direction’s queue is empty
- Idle cars prefer nearby requests; aging prevents starvation
- Engine has no React imports; Vitest + fast-check
- Occupancy has no refuse cap (boarding rules are used by U3; U2 must not refuse)
- Destination is already on the request when the engine sees it (U3 creates the passenger)

---



## Execution steps (after answers)

- [x] Record answers in `audit.md` and resolve any ambiguous replies
- [x] Write `aidlc-docs/construction/dispatch-engine/functional-design/domain-entities.md`
- [x] Write `aidlc-docs/construction/dispatch-engine/functional-design/business-rules.md` (cost formula, queue, reverse gate)
- [x] Write `aidlc-docs/construction/dispatch-engine/functional-design/business-logic-model.md` (assign / evaluate / planStops flow)
- [x] Skip `frontend-components.md` (N/A for this unit)
- [x] Include **Testable Properties** (PBT-01) per component: oracle for min-cost assign, reverse-gate invariant, waiting-age monotonicity, assign/evaluate agreement, no-React engine
- [x] Mark PBT-02 round-trip N/A unless a serialize/parse pair is in U2
- [x] Present Functional Design Complete (2-option gate)

---



## Clarifying questions

Fill **one letter** (or Other) on each `[Answer]:` line.

## Question 1

When is a hall request locked to a car?

A) Assign once when the request is created. Never reassign (Recommended)

B) Re-score outstanding pickups every simulation tick; a request may switch cars

C) Re-score only when a car becomes idle

D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2

How is the **distance** cost computed?

A) Absolute difference `|carFloor - pickupFloor|`, allowing fractional car floors (Recommended)

B) Path length: floors remaining in the current direction, then any reverse needed to reach the pickup

C) Integer floors only (`round` or `trunc` the car position first)

D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3

How should named cost **weights** be chosen for the educational POC?

A) Document constants aligned with the mockup table: distance weight 1, direction-mismatch 2.5, per scheduled stop 0.5, reverse penalty 1.0, waiting-age as a subtracted credit (Recommended)

B) All additive factors use weight 1.0; waiting-age is subtracted with a documented rate

C) I will list exact numbers after [Answer]:

D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4

How does **waiting-age credit** work? (Lower total still wins, so credit must reduce cost.)

A) `credit = waitSeconds * AGE_RATE`, uncapped, subtracted from the car’s total (Recommended)

B) Same as A, but capped at a maximum credit

C) Zero until a threshold wait, then a flat credit

D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5

What is a **compatible on-route pickup** (US-D2)?

A) Same hall direction as the car’s current direction, and pickup is strictly ahead of the car in that direction (may extend the last stop) (Recommended)

B) Same hall direction, and pickup lies between the car and the current farthest stop only (do not extend the trip)

C) Any pickup on the way, even if the hall direction is opposite

D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6

What belongs in **U2** vs **U3** for `ElevatorStateMachine` (`tick`, `board`, `alight`)?

A) U2 implements pure `tick` / `board` / `alight` plus queues and scoring. U3 only owns the clock and calls these functions (Recommended; matches unit-of-work C-ENG-04 on both units)

B) U2 implements scoring and stop queues only. Motion `tick` / doors / occupancy wait for U3

C) U2 implements discrete commands (`arrive`, `openDoors`, `closeDoors`, `reverse`) without `dt`; U3 integrates motion over time

D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7

How is an **idle** car scored (no current trip, US-D4)?

A) No current direction: reverse penalty 0, direction-mismatch 0, distance is absolute to pickup (Recommended)

B) Keep the last travel direction for reverse/direction penalties until the next assignment

C) Other (please describe after [Answer]: tag below)

[Answer]: A