# Units of Work

**Architecture**: Single SPA (monolith). Each unit is a **module**, not a separately deployable service.

**Construction order**: U1 (this increment) → pause → U2 → U3 → U4.

---

## U1 scaffold-ui

- **Type**: Module (app host + UI shell)
- **Responsibility**: Vite + React + TypeScript + Vitest + npm; global CSS; 1:1 static dashboard matching `ui-mockup.jpg`; sample snapshot; README
- **Stories**: US-S1
- **Components**: C-UI-01–C-UI-12, `src/styles/`, workspace root tooling
- **Functional Design**: SKIP
- **PBT**: no
- **Code**:
  - `package.json`, `vite.config.ts`, `index.html`, `README.md`
  - `src/ui/**`, `src/styles/**`, `src/main.tsx`
  - `tests/ui/` (optional smoke)
  - Stub folders `src/engine/`, `src/simulation/` with empty barrels so later units have a home
- **Done when**: `npm run dev` shows the mockup shell; controls need not work; `npm test` runs

## U2 dispatch-engine

- **Type**: Module (library)
- **Responsibility**: Cost-based collective control: score, assign, stop queues, reverse gate, idle preference, aging. Pure TypeScript.
- **Stories**: US-D1, US-D2, US-D3, US-D4, US-D5, US-D6
- **Components**: C-ENG-01–C-ENG-04
- **Functional Design**: EXECUTE (PBT-01 on D1, D2, D3, D5, D6)
- **Code**: `src/engine/**`, `tests/engine/**` (Vitest + fast-check)
- **Depends on**: none (U1 stubs only)

## U3 simulation-runtime

- **Type**: Module
- **Responsibility**: Clock, pause/reset/speed, traffic presets, hall/add-request creation (auto destination), door dwell, occupancy count (display `/8`, no refuse), tick loop calling the engine
- **Stories**: US-L2, US-L4, US-L5, US-L6, US-L7
- **Components**: C-SIM-01–C-SIM-05, C-ENG-04 (tick used here)
- **Functional Design**: EXECUTE (timing and spawn rules)
- **Code**: `src/simulation/**`, `tests/simulation/**`
- **Depends on**: U2

## U4 live-dashboard

- **Type**: Module (UI wiring)
- **Responsibility**: Bind AppShell to `SimulationService.getSnapshot()`; animate cars; live hall chips; evaluation/requests/elevators/performance/log from real state
- **Stories**: US-L1, US-L3, US-O1, US-O2, US-O3, US-O4, US-O5
- **Components**: C-UI-* (replace sample snapshot with live data)
- **Functional Design**: SKIP or light (wiring only)
- **Code**: updates under `src/ui/**`, `tests/ui/**`
- **Depends on**: U1, U3

---

## Code organization strategy (greenfield monolith)

Per `code-generation.md`: `src/{unit-name}/` and `tests/{unit-name}/`.

Shared types for the snapshot live in `src/engine/types.ts` (or `src/engine` public exports) so UI and simulation share one model without UI importing simulation internals.

Application code stays at workspace root. Never in `aidlc-docs/`.
