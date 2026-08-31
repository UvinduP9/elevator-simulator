# Code Generation Plan — U1 scaffold-ui

**This plan is the single source of truth for U1 Code Generation.**  
Do not generate application code until this plan is explicitly approved.

**Workspace root**: `/Users/uvindup/Documents/AI_DLC_Training/elevator-simulator`  
**Story**: US-S1  
**Visual target**: `aidlc-docs/inception/requirements/ui-mockup.jpg` (1:1)  
**Skipped for this unit**: Functional Design, NFR Requirements, NFR Design, Infrastructure Design

## Unit context

- **Dependencies**: none
- **Contracts**: render a frozen `sampleSnapshot` (fixture). No Dispatcher, no clock.
- **Database**: none
- **Service**: SimulationService is a stub later; U1 does not implement it

## N/A layers (do not generate)

- Business logic / API / repository / database migrations / cloud deployment: **N/A** for U1

---

## Steps

### Step 1 — Project structure
- [x] Create Vite + React + TypeScript app at workspace root using **npm**
- [x] Files/config: `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `.gitignore`
- [x] Dependencies: `react`, `react-dom`; dev: `typescript`, `vite`, `@vitejs/plugin-react`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`
- [x] Scripts: `dev`, `build`, `preview`, `test` (Vitest)
- [x] Folders: `src/ui/`, `src/ui/components/`, `src/styles/`, `src/engine/`, `src/simulation/`, `tests/ui/`

### Step 2 — Stub barrels
- [x] `src/engine/index.ts` — empty exports comment: U2 owns this module
- [x] `src/simulation/index.ts` — empty exports comment: U3 owns this module
- [x] Do **not** put scoring or tick logic in these files

### Step 3 — Sample snapshot fixture
- [x] `src/ui/sampleSnapshot.ts` — frozen data matching the mockup *kinds* of content:
  - Elevator A moving 4→5 (fractional floor ~4.7), blue
  - Elevator B doors open at 3, occupancy 2
  - Elevator C moving 7→6 (~6.8), purple
  - Hall calls: F9 down assigned B, F6 up assigned A (and similar chips as mockup)
  - Active requests, evaluation for Request #018 (A 2.7 selected, B/C 10.7), metrics 7.4 / 21.8 / 18.1 / 42, utilization 68/54/72
  - Event log lines as in the mockup
- [x] Occupancy display uses `/ 8`
- [x] Types for the fixture may live in `src/ui/types.ts` for U1 only (U2 may replace with engine types later)

### Step 4 — Global CSS (1:1)
- [x] `src/styles/tokens.css` — A blue, B orange, C purple; page background light gray; white panels; shadows; Pause filled blue
- [x] `src/styles/layout.css` — header, main (visualizer + right stack), control bar, event log; desktop min-width ~1200px
- [x] `src/styles/visualizer.css` — 10-floor grid, hall arrows, shafts, cars, glow
- [x] `src/styles/panels.css` — tables, KPI cards, utilization bars, event pills
- [x] Regular CSS only (no CSS-in-JS, no CSS modules)

### Step 5 — Frontend components (US-S1)
Each interactive control gets a stable `data-testid` (`{component}-{role}`).

- [x] `src/main.tsx`, `src/App.tsx` — mount AppShell with sampleSnapshot
- [x] `src/ui/components/AppShell.tsx`
- [x] `src/ui/components/AppHeader.tsx` — title, subtitle, algorithm select (Cost-Based Collective Control), Running, 1x
- [x] `src/ui/components/BuildingVisualizer.tsx` — floors 1–10 (1 at bottom), hint text
- [x] `src/ui/components/HallCallColumn.tsx` — ↑ 1–9, ↓ 2–10; colored assignment chips
- [x] `src/ui/components/ElevatorShaft.tsx`, `ElevatorCar.tsx`
- [x] `src/ui/components/SimulationControlBar.tsx` — Pause, Reset, + Add request, Traffic, 0.5x/1x/2x/5x
- [x] `src/ui/components/ActiveRequestsPanel.tsx`
- [x] `src/ui/components/DispatchEvaluationPanel.tsx`
- [x] `src/ui/components/ElevatorsStatusPanel.tsx` — occupancy `n / 8`
- [x] `src/ui/components/PerformancePanel.tsx`
- [x] `src/ui/components/EventLogPanel.tsx`
- [x] Controls may be non-functional (no state changes) except visual selected speed 1x and filter showing All Events

### Step 6 — Frontend test
- [x] `tests/ui/AppShell.test.tsx` — render App; assert title “Elevator Dispatch Simulator” and 10 floor labels
- [x] Vitest config (jsdom) in `vite.config.ts` or `vitest.config.ts`

### Step 7 — Frontend summary (docs only)
- [x] `aidlc-docs/construction/scaffold-ui/code/frontend-summary.md` — list of UI files and 1:1 notes

### Step 8 — README
- [x] Workspace `README.md`: product one-liner, `npm install`, `npm run dev`, `npm test`, pointer to mockup and that this increment is a static shell

### Step 9 — Construction code notes
- [x] `aidlc-docs/construction/scaffold-ui/code/generation-summary.md` — files created, US-S1 coverage, no dispatcher

### Step 10 — Verify
- [x] `npm install` and `npm test` succeed
- [x] Confirm no application code under `aidlc-docs/`
- [x] Confirm engine/simulation barrels have no algorithm
