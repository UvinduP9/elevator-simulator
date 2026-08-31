# Unit of Work Plan

**Stage**: INCEPTION — Units Generation  
**Status**: Answers taken from the approved execution plan and application design. Generation executed after Application Design “Approve & Continue” (same 4-unit split already in `execution-plan.md`).

---

## Decided decomposition

| Unit | Name | Stories | Construction notes |
|---|---|---|---|
| U1 | scaffold-ui | US-S1 | First increment. Skip Functional Design. 1:1 static shell. |
| U2 | dispatch-engine | US-D1–D6 | Functional Design + PBT. No React. |
| U3 | simulation-runtime | US-L2, US-L4, US-L5, US-L6, US-L7 | Clock, traffic, hall/add request, pause/reset/speed, doors/occupancy. Depends on U2. |
| U4 | live-dashboard | US-L1, US-L3, US-O1–O5 | Bind UI to SimulationService; live shafts, assignment chips, observability. Depends on U1 + U3. |

**Deployment**: One SPA (not microservices). Units are **modules** in a monolith.

**Code organization** (greenfield multi-unit monolith):

```
/  (workspace root)
  package.json, vite.config.ts, index.html, README.md   # owned by U1
  src/ui/                                               # U1 then U4
  src/engine/                                           # U2
  src/simulation/                                      # U3
  src/styles/                                           # U1 (global CSS)
  tests/ui/, tests/engine/, tests/simulation/
```

---

## Questions (answered from approved execution plan + application design)

## Question 1 — Story grouping
A) Four sequential modules matching scaffold / engine / simulation / live UI (execution plan)

B) One unit for the whole SPA

C) Two units: UI vs engine+simulation

[Answer]: A

## Question 2 — Dependencies
A) In-process only: UI → SimulationService → Engine. No HTTP. Sequential construction U1 then U2 then U3 then U4.

B) Parallel UI and engine from day one

[Answer]: A

## Question 3 — Team alignment
A) Single POC developer; one owner for all units

B) Split owners per unit

[Answer]: A

## Question 4 — Technical / deploy
A) One browser app, one npm package, local `npm run dev` only

B) Separate packages / deployables per unit

[Answer]: A

## Question 5 — Domain boundaries
A) Engine = scoring and queues. Simulation = time and passengers. UI = 1:1 mockup view of snapshot.

B) Mix scoring into the React tree

[Answer]: A

## Question 6 — Code organization
A) Monolith folders `src/ui`, `src/engine`, `src/simulation` (code-generation.md greenfield multi-unit monolith)

B) One `src/` with no unit folders

[Answer]: A

---

## Generation steps

- [x] Generate `aidlc-docs/inception/application-design/unit-of-work.md`
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-dependency.md`
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-story-map.md`
- [x] Document code organization in unit-of-work.md
- [x] Validate unit boundaries and dependencies
- [x] Ensure all stories are assigned to units
