# U4 Code generation summary

**Unit**: live-dashboard  
**Stories**: US-L1, US-L3, US-O1, US-O2, US-O3, US-O4, US-O5  
**Functional Design / NFR / Infra**: skipped (wiring only)

## Created

- `src/ui/useSimulation.ts` — `SimulationService` + `requestAnimationFrame` loop (`step(realDt)` capped at 0.1 s)

## Modified

- `src/App.tsx` — live hook instead of `sampleSnapshot`
- `src/ui/types.ts` — re-exports snapshot types from `src/simulation/types.ts`
- `src/ui/components/AppShell.tsx` and control / hall / panel components — callbacks
- `src/styles/layout.css`, `panels.css` — paused status, empty rows, evaluation caption
- `tests/ui/liveDashboard.test.tsx`

## Tests

`npm test` — 54 passed (12 files).

## Browser

Hall ↑ on floor 5 created a request, assigned car A, moved, boarded, and completed at F8. Pause changed the control to Resume. Dashboard remains on `http://localhost:5173/`.
