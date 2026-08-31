# U3 Simulation summary

In-process orchestrator. No React. No `requestAnimationFrame`. U4 will call `step(realDt)` from the browser frame loop.

## Public API (`src/simulation/index.ts`)

- `new SimulationService({ rng? })`
- `step(realDt)`, `getSnapshot()`, `clickHall`, `addRandomRequest`
- `setTraffic`, `setSpeed`, `pause`, `resume`, `reset`, `selectRequest`

## Clock and traffic

- Running: `now += realDt * speed`
- Paused: no time, no tick, no auto spawn; manual hall / add request still allowed
- Off: no auto spawn. Normal every 8 s, Busy every 3 s, catch-up capped at 20 per step
- Reset: cars idle at floor 1, speed 1x, traffic Off, empty requests / metrics / log

## Requests and doors

- Hall ↑ 1–9 / ↓ 2–10; invalid pair is a no-op
- Destination uniform in that direction; + Add request uses the same `assign` path
- Assign once. On enter `doors-open`: alight then board. Occupancy is a count; never refused
- Event times are sim elapsed `HH:MM:SS.mmm`

## PBT coverage

Clock oracle and pause freeze; Off spawn; catch-up vs interval; destination validity; occupancy ≥ 0; double reset; snapshot shape; stateful clock/spawn model. PBT-02 N/A. CI seed policy N/A (NFR-7).
