# Code Generation Plan — U3 simulation-runtime

**Stories**: US-L2, US-L4, US-L5, US-L6, US-L7  
**Depends on**: U2 dispatch-engine  
**Location**: `src/simulation/`, `tests/simulation/`  
**UI**: none (dashboard stays on `sampleSnapshot`)  
**NFR / Infra**: skipped (POC)

This plan is the single source of truth for U3 code generation.

---

## Unit context

In-process orchestrator: clock, traffic, hall / + Add request, pause / reset / speed, door board/alight, metrics, event log, UI-ready `getSnapshot()`. Calls U2 `assign` / `tick` / `board` / `alight`. No React. No `requestAnimationFrame`. Injected RNG for tests. PBT for clock, spawn, destination, occupancy, reset, pause (PBT-02 and CI in PBT-08 N/A).

---

## Steps

- [x] **Step 1 — Types and config** (US-L6): `src/simulation/types.ts`, `config.ts`, `rng.ts`, `format.ts`.

- [x] **Step 2 — Clock, traffic, metrics, log** (US-L5, L6): `clock.ts`, `traffic.ts`, `metrics.ts`, `eventLog.ts`.

- [x] **Step 3 — Snapshot mapper** (US-L7, Q7): `snapshot.ts`.

- [x] **Step 4 — SimulationService + barrel** (US-L2, L4–L7): `simulationService.ts`, `index.ts`.

- [x] **Step 5 — Example-based tests** (PBT-10): `tests/simulation/*.example.test.ts` and no-React import check.

- [x] **Step 6 — Generators + PBT** (PBT-01, 03–08, 10): `tests/simulation/generators.ts`, `properties.test.ts`.

- [x] **Step 7 — Run tests**: `npm test` must pass.

- [x] **Step 8 — Summaries**: `aidlc-docs/construction/simulation-runtime/code/generation-summary.md`, `simulation-summary.md`. Mark US-L2, L4–L7 complete in the story map.

- [x] **Step 9 — Skip**: API layer, repository, frontend, migrations, deployment — N/A.

---

## Expected files

```
src/simulation/config.ts
src/simulation/types.ts
src/simulation/rng.ts
src/simulation/format.ts
src/simulation/clock.ts
src/simulation/traffic.ts
src/simulation/metrics.ts
src/simulation/eventLog.ts
src/simulation/snapshot.ts
src/simulation/simulationService.ts
src/simulation/index.ts
tests/simulation/format.example.test.ts
tests/simulation/simulationService.example.test.ts
tests/simulation/noReact.example.test.ts
tests/simulation/generators.ts
tests/simulation/properties.test.ts
```
