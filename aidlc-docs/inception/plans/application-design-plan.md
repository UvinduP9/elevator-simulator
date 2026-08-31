# Application Design Plan

**Stage**: INCEPTION — Application Design  
**Status**: Decisions taken from approved requirements, stories, execution plan, and the 1:1 mockup instruction. Artifacts generated in this stage.

**Sources**
- `aidlc-docs/inception/requirements/requirements.md`
- `aidlc-docs/inception/user-stories/stories.md`
- `aidlc-docs/inception/requirements/ui-mockup.jpg` (1:1 visual target)
- User (2026-08-31): start Application Design; match UI 1:1; wait for approval when the phase is done

---

## Design decisions (from this request + prior artifacts)

| Topic | Decision |
|---|---|
| Layers | Three packages: `ui`, `simulation`, `engine`. Engine has no React imports. |
| UI structure | One presentational component per mockup region (header, shafts, controls, four right panels, event log). |
| Service | One orchestrator: SimulationService. UI reads snapshot state; does not score requests. |
| Algorithm dropdown | Present in the header (1:1). Only Cost-Based Collective Control is live. |
| Occupancy | Display `n / 8` (1:1). Engine does not refuse boarding. |
| First increment | Scaffold renders the shell 1:1 with sample data; methods on engine/simulation are unimplemented until later units. |

## Planning questions (answered from the 1:1 instruction and existing architecture)

## Question 1
How should **components** be grouped?

A) Three layers: UI (mockup regions), Simulation, Engine — recommended

B) Two layers: React app and engine only (simulation logic inside UI)

X) Other

[Answer]: A

## Question 2
How strictly should the **UI component tree** follow the screenshot?

A) 1:1 — every mockup region is a named UI component (header, visualizer, controls, four right panels, event log)

B) Coarser — one Dashboard component with nested markup, no panel-level components

X) Other

[Answer]: A

## Question 3
Where does **dispatch scoring** live?

A) Pure engine only; UI Dispatch Evaluation panel displays engine output

B) UI may recompute scores for the table

X) Other

[Answer]: A

---

## Generation steps

- [x] Generate `components.md`
- [x] Generate `component-methods.md`
- [x] Generate `services.md`
- [x] Generate `component-dependency.md`
- [x] Validate design completeness and consistency
- [x] Generate consolidating `application-design.md`
- [x] Record 1:1 mockup override in requirements (algorithm dropdown + occupancy n/8 display)
