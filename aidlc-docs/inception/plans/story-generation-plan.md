# Story Generation Plan

**Stage**: INCEPTION — User Stories (Part 2 Generation)  
**Status**: Generation complete. Awaiting explicit approval of stories and personas.

Requirements source: `aidlc-docs/inception/requirements/requirements.md`  
UI mockup: `aidlc-docs/inception/requirements/ui-mockup.jpg`

---

## Decided approach

| Topic | Choice |
|---|---|
| Personas | One: Simulation Operator |
| Organization | Epic-based: Scaffold, Dispatch Brain, Live Simulation, Observability |
| Scaffold story | Yes — first story is the static mockup shell |
| Acceptance criteria | Short bullet checklists (not Given/When/Then) |

No contradictions or ambiguous answers. Chat answers: 1=A, 2=A, 3=A, 4=B.

---

## Planning questions (answered)

## Question 1
Which **personas** should we create?

A) One persona: Simulation Operator (student or instructor driving the desktop POC)

B) Two personas: Learner (wants to understand why a car was chosen) and Instructor (sets up a demo with traffic and speed)

C) Three personas: Learner, Instructor, and Engine Developer (cares about tests and a React-free engine)

X) Other (please describe)

[Answer]: A

## Question 2
How should stories be **organized**?

A) Epic-based (recommended): Epics for Scaffold, Dispatch Brain, Live Simulation, Observability; small stories under each

B) Feature-based: one story per capability (hall calls, scoring, animation, traffic, metrics, log) with no epic grouping

C) User journey-based: a few end-to-end flows (place a call, run busy traffic, inspect starvation)

X) Other (please describe)

[Answer]: A

## Question 3
Should the **static scaffold** be its own user-facing story (sample UI, controls not live)?

A) Yes — first story is “see the dashboard shell matching the mockup” (no live behavior)

B) No — skip a scaffold story; only write stories for live MVP behavior

X) Other (please describe)

[Answer]: A

## Question 4
What **acceptance criteria** format?

A) Given / When / Then (testable, works well with dispatcher rules)

B) Short bullet checklists (faster to write, slightly less precise)

X) Other (please describe)

[Answer]: B

---

## Generation steps (execute only after this plan is approved)

- [x] Create `aidlc-docs/inception/user-stories/personas.md` using the chosen persona set
- [x] Create `aidlc-docs/inception/user-stories/stories.md` using the chosen organization
- [x] Include a scaffold story if Question 3 = A
- [x] Cover FR-S1–FR-S6 and FR-1–FR-18; map story IDs to requirement IDs
- [x] Write acceptance criteria in the chosen format
- [x] Apply INVEST: Independent, Negotiable, Valuable, Estimable, Small, Testable
- [x] Map each story to at least one persona
- [x] Note PBT-relevant stories (dispatcher scoring, assignment, directional queues, starvation) for later Functional Design (PBT-01)
- [x] Do not include sprint dates, estimates in hours, or implementation tasks
