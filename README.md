# Elevator Dispatch Simulator

Browser POC that shows how three elevators handle many hall calls. The scheduling engine is the focus; the UI is a desktop dashboard.

This increment is a **static 1:1 shell** of the mockup. Controls are visible but do not run a simulation yet. There is no dispatcher.

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

## Layout

- Header: title, algorithm dropdown, Running, speed
- Left: 10-floor shafts A/B/C and hall calls
- Controls: Pause, Reset, + Add request, Traffic, 0.5x–5x
- Right: Active Requests, Dispatch Evaluation, Elevators (`n / 8`), Performance
- Bottom: Event log

Later units add the TypeScript dispatch engine, simulation clock, and live wiring.
