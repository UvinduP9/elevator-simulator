# Elevator Simulator Project Plan

## Product Goal

Build a browser-based elevator simulator that demonstrates how several elevators
handle many simultaneous passenger requests. The main focus is the scheduling
"brain," supported by a visual UI.

This is an educational simulator, not software for controlling physical elevators.

## Proposed MVP

- 10-floor building
- 3 elevators
- Hall buttons for Up and Down
- Destination selection after passenger pickup
- Multiple simultaneous requests
- Animated elevator movement
- Elevator states: idle, moving, and doors open
- Visible stop queues and assigned requests
- Pause, reset, and generate-random-traffic controls
- Basic metrics:
  - Average wait time
  - Longest wait time
  - Completed trips
  - Elevator utilization

## Scheduling Brain

Each request contains:

- Pickup floor
- Requested direction
- Destination floor
- Creation time
- Assignment status

The dispatcher gives each elevator a cost score based on:

- Distance from the pickup floor
- Whether it is already moving toward the passenger
- Whether the passenger's direction matches its current direction
- Number of scheduled stops
- Cost of reversing direction
- How long the passenger has waited

The lowest-cost elevator receives the request.

An elevator should:

1. Continue serving stops in its current direction.
2. Pick up compatible passengers along its route.
3. Reverse only after completing the current directional queue.
4. Prefer nearby requests when idle.
5. Increase the priority of old requests to prevent starvation.
6. Open its doors, wait briefly, and then continue.

## Suggested Architecture

```text
React UI
   |
Simulation controller
   |-- clock and animation
   |-- passenger/request generation
   `-- metrics
          |
Pure TypeScript dispatch engine
   |-- elevator state machine
   |-- request scoring
   |-- stop queue management
   `-- assignment decisions
```

Keeping the dispatch engine independent from React makes it easy to test and later
compare different algorithms.

## UI Layout

- Left: building visualization with elevator shafts
- Center: floor controls and active requests
- Right: elevator status, queues, and performance metrics
- Bottom: simulation controls and event log

Each elevator should have a distinct color, with doors and movement visibly animated.

## Technology

- React
- TypeScript
- Vite
- Vitest for dispatcher tests
- Regular CSS for the building animation
- No backend or database for the MVP

## Delivery Stages

1. Write the vision and technical-environment documents.
2. Define elevator, request, passenger, and simulation states.
3. Implement and test the dispatcher.
4. Implement the simulation clock and elevator state machine.
5. Build the visual elevator shafts and request controls.
6. Add random traffic and performance metrics.
7. Test congestion, idle elevators, direction changes, and starvation.
8. Polish the UI and document the algorithm.

## Recommended Defaults

- Floors: 10
- Elevators: 3
- Dispatch strategy: cost-based collective-control algorithm

The next planning step is to create the AI-DLC vision and technical-environment
documents from this plan.
