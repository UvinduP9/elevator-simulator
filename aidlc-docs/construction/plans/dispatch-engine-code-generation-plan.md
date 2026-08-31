# Code Generation Plan — U2 dispatch-engine

**Stories**: US-D1–D6  
**Depends on**: none (U1 stub only)  
**Location**: `src/engine/`, `tests/engine/`  
**UI**: none  
**NFR / Infra**: skipped (POC)

This plan is the single source of truth for U2 code generation.

---

## Unit context

Pure TypeScript cost-based collective control. No React. `assign` / `evaluate` share CostScorer. Stop queues and reverse gate in StopQueueManager. Pure `tick` / `board` / `alight` in ElevatorStateMachine. PBT with fast-check (PBT-01–PBT-10 except PBT-02 and CI in PBT-08 which is N/A per NFR-7).

---

## Steps

- [x] **Step 1 — Dependency**: Add `fast-check` as a devDependency.

- [x] **Step 2 — Types and config** (US-D1, D6): `src/engine/types.ts`, `src/engine/config.ts`.

- [x] **Step 3 — StopQueueManager** (US-D2, D3): `src/engine/stopQueue.ts`.

- [x] **Step 4 — CostScorer** (US-D1, D4, D5): `src/engine/costScorer.ts`.

- [x] **Step 5 — ElevatorStateMachine** (US-D3, Q6): `src/engine/stateMachine.ts`.

- [x] **Step 6 — DispatchEngine + barrel** (US-D1, D6): `src/engine/dispatchEngine.ts`, `src/engine/index.ts`.

- [x] **Step 7 — Example-based tests** (PBT-10): `tests/engine/*.example.test.ts` and no-React import check.

- [x] **Step 8 — Generators + PBT** (PBT-01, 03, 04, 05, 06, 07, 08, 10): `tests/engine/generators.ts`, `tests/engine/properties.test.ts`.

- [x] **Step 9 — Run tests**: `npm test` must pass.

- [x] **Step 10 — Summaries**: `aidlc-docs/construction/dispatch-engine/code/generation-summary.md`, `engine-summary.md`. Mark US-D1–D6 complete in the story map.

- [x] **Step 11 — Skip**: API layer, repository, frontend, migrations, deployment — N/A.

---

## Expected files

```
src/engine/types.ts
src/engine/config.ts
src/engine/stopQueue.ts
src/engine/costScorer.ts
src/engine/stateMachine.ts
src/engine/dispatchEngine.ts
src/engine/index.ts
tests/engine/generators.ts
tests/engine/costScorer.example.test.ts
tests/engine/stopQueue.example.test.ts
tests/engine/dispatchEngine.example.test.ts
tests/engine/stateMachine.example.test.ts
tests/engine/noReact.example.test.ts
tests/engine/properties.test.ts
```
