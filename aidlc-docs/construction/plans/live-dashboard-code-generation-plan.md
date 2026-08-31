# Code Generation Plan — U4 live-dashboard

**Stories**: US-L1, US-L3, US-O1, US-O2, US-O3, US-O4, US-O5  
**Depends on**: U1 scaffold-ui, U3 simulation-runtime  
**Location**: `src/ui/`, `src/App.tsx`, `tests/ui/`  
**Functional Design**: SKIP (wiring existing components to `SimulationService`)  
**NFR / Infra**: skipped (POC)

This plan is the single source of truth for U4 code generation.

---

## Unit context

Replace the static `sampleSnapshot` with a live `SimulationService` driven by `requestAnimationFrame`. Wire hall clicks, controls, request selection, and event-log filter. Do not change the 1:1 mockup layout. Occupancy stays `n / 8` (display only). Algorithm dropdown stays display-only.

---

## Steps

- [x] **Step 1 — Live hook**: `src/ui/useSimulation.ts` owns the service, rAF `step(realDt)`, and snapshot state.

- [x] **Step 2 — Wire AppShell + controls** (US-L1, L3, L6, O2, O5): callbacks on hall, pause/resume/reset/add request, traffic, speed, select request, event filter.

- [x] **Step 3 — App entry**: `src/App.tsx` uses the hook instead of `sampleSnapshot`.

- [x] **Step 4 — Tests**: hall click, add request, pause, filter, reset. Mock rAF so tests do not recurse.

- [x] **Step 5 — Run tests**: `npm test` must pass.

- [x] **Step 6 — Browser check**: hall click moves a car / shows a request; pause/resume; add request.

- [x] **Step 7 — Summaries**: `aidlc-docs/construction/live-dashboard/code/generation-summary.md`, `frontend-summary.md`. Mark US-L1, L3, O1–O5 complete.

- [x] **Step 8 — Skip**: API, repository, migrations, deployment — N/A.

---

## Expected files (created or modified)

```
src/ui/useSimulation.ts
src/App.tsx
src/ui/components/AppShell.tsx
src/ui/components/AppHeader.tsx
src/ui/components/BuildingVisualizer.tsx
src/ui/components/HallCallColumn.tsx
src/ui/components/SimulationControlBar.tsx
src/ui/components/ActiveRequestsPanel.tsx
src/ui/components/DispatchEvaluationPanel.tsx
src/ui/components/EventLogPanel.tsx
src/ui/components/PerformancePanel.tsx
tests/ui/liveDashboard.test.tsx
```
