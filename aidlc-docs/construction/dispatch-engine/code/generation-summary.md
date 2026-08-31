# U2 Code generation summary

**Unit**: dispatch-engine  
**Stories**: US-D1, US-D2, US-D3, US-D4, US-D5, US-D6  
**UI**: none (dashboard still uses `sampleSnapshot`)

## Created / replaced (workspace root)

- `src/engine/types.ts` — domain types (`Elevator`, `HallRequest`, `WorldState`, costs)
- `src/engine/config.ts` — named weights, `WAITING_AGE_RATE=0.05`, motion constants
- `src/engine/stopQueue.ts` — directional unique floor lists, `canReverse(queue, direction, floor)`
- `src/engine/costScorer.ts` — six-factor score, `pickWinner` (A then B then C)
- `src/engine/stateMachine.ts` — pure `tick` / `board` / `alight`
- `src/engine/dispatchEngine.ts` — `evaluate`, `assign` (copy-on-write), `planStops`
- `src/engine/index.ts` — public barrel (replaces the U1 stub)
- `tests/engine/*.example.test.ts` — example-based cases (PBT-10)
- `tests/engine/generators.ts` — domain generators (floors 1–10, valid hall destinations)
- `tests/engine/properties.test.ts` — fast-check properties; seed logged on failure

## Dependency

- `fast-check` added as a devDependency (already in `package.json`)

## Not in this increment

- Simulation clock, hall clicks, traffic, pause/reset/speed (U3)
- Live dashboard wiring (U4)
- API, repository, migrations, deployment (N/A)

## Tests

`npm test` — 27 passed (7 files), including 10 property tests.
