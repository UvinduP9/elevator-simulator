# U3 Code generation summary

**Unit**: simulation-runtime  
**Stories**: US-L2, US-L4, US-L5, US-L6, US-L7  
**UI**: none (dashboard still uses `sampleSnapshot`)

## Created / replaced (workspace root)

- `src/simulation/config.ts` — spawn intervals, catch-up cap, occupancy display max
- `src/simulation/types.ts` — sim records and UI-ready snapshot fields
- `src/simulation/rng.ts`, `format.ts`, `clock.ts`, `traffic.ts`, `metrics.ts`, `eventLog.ts`
- `src/simulation/snapshot.ts` — `getSnapshot` mapping
- `src/simulation/simulationService.ts` — orchestrator (`step`, hall, add request, pause/reset/speed, traffic)
- `src/simulation/index.ts` — public barrel (replaces the U1 stub)
- `tests/simulation/*.example.test.ts`, `generators.ts`, `properties.test.ts`

## Not in this increment

- React wiring, rAF loop, live shafts (U4)
- API, repository, migrations, deployment (N/A)

## Tests

`npm test` — 49 passed (11 files), including U2 engine tests.
