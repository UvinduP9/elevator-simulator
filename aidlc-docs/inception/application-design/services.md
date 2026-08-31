# Services

This POC is a **single browser app**. There is one orchestration service. The dispatch engine is a **library**, not a deployable service.

## S-01 SimulationService

**Location**: `src/simulation/simulation-service.ts`

**Responsibilities**
- Own `WorldState` (elevators, requests, passengers, clock)
- On each tick: advance clock → maybe spawn traffic → tick elevator state machines → update metrics and event log
- On hall click / add request: create `HallRequest` (auto destination) → `DispatchEngine.assign` → persist assignment → append DISPATCH event
- Expose `getSnapshot()` for the React tree
- `reset()` restores the initial snapshot (empty or documented demo sample)

**Orchestration**

```
User click or timer
        |
        v
SimulationService
   |-- SimulationClock (dt, pause, speed)
   |-- TrafficGenerator (Off / Normal / Busy)
   |-- DispatchEngine.assign / evaluate
   |-- ElevatorStateMachine.tick
   |-- MetricsCollector
   `-- EventLogStore
        |
        v
SimulationSnapshot --> AppShell
```

**Does not**
- Import React
- Own CSS or layout
- Host HTTP

**UI contract**: React calls service methods from control callbacks. In the **scaffold increment**, AppShell is fed a **static sample snapshot** that looks like the mockup; SimulationService may be a stub that returns that snapshot.

## No other services

No API gateway, no persistence service, no auth. Metrics and logs are in-memory only (NFR-3).
