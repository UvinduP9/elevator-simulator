# Elevator Dispatch Simulator

Browser POC that shows how three elevators handle many hall calls. The scheduling
engine is the focus; the UI is a live desktop dashboard.

The simulator includes a pure TypeScript cost-based dispatcher, directional stop
queues, a simulation clock, automatic traffic, door dwell, passengers, metrics,
and a timestamped event log. There is no backend or persistent storage.

Mockup: `aidlc-docs/inception/requirements/ui-mockup.jpg`

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

```bash
npm test
```

Create passengers with a floor's hall buttons or **+ Add request**. Use the
traffic preset for continuous calls and the speed controls to accelerate the
simulation.

## Layout

- Header: title, algorithm dropdown, Running, speed
- Left: 10-floor shafts A/B/C and hall calls
- Controls: Pause, Reset, + Add request, Traffic, 0.5x–5x
- Right: live Active Requests, Dispatch Evaluation, Elevators, and Performance
- Bottom: Event log

Occupancy is an uncapped passenger count. The dispatch engine stays independent
of React and is covered by example-based and property-based tests.
