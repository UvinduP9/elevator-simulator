# Personas

## P-1 Simulation Operator

**Role**: Person running the desktop elevator dispatch POC in a browser.

**Who**: A student, instructor, or engineer exploring how several cars handle many hall calls. There is no production end user.

**Goals**
- See the building, three cars, and hall calls in one dashboard
- Understand **why** a car was assigned (cost scores, not only the result)
- Drive the sim: hall clicks, add request, traffic presets, speed, pause, reset
- Watch queues, occupancy, wait metrics, and the event log

**Motivations**
- Learn collective-control dispatch without reading the engine first
- Trust that the visualizer matches the scoring rules
- Reset quickly and try another traffic pattern

**Pain points**
- Opaque assignment (“why did B get this call?”)
- Starvation of old calls if aging is missing
- A crowded UI if the shell does not match the mockup

**Context**
- Desktop only, local `npm run dev`
- Educational POC, no login, no backend

**Stories**: All stories in `stories.md` map to this persona.
