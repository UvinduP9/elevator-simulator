# Requirements Verification Questions

**UI mockup**: `aidlc-docs/inception/requirements/ui-mockup.jpg`

Please answer **only the remaining questions** (section 2). Inferred answers in section 1 are already filled from the mockup. Change an inferred `[Answer]:` only if it is wrong.

---

## 1. Inferred from the UI mockup (no reply needed unless wrong)

These replace the original Q1, Q3, Q5–Q9, and Q13. Original Q2 (capacity) and Q4 (destination) still need you — they are in section 2.

### Inferred 1 — Building size
Header shows **10 Floors • 3 Elevators**. No control to change floor or elevator count.

[Answer]: A — Fixed at 10 floors and 3 elevators for the MVP

### Inferred 2 — Passenger visualization
No waiting sprites on floors. Hall ↑/↓ calls are color-coded by assigned car (A blue, B orange, C purple). Cars show occupancy (person icon + count when doors are open) and a floor-to-floor label while moving (for example `4 → 5`). Active Requests table lists floor, direction, wait, assignment.

[Answer]: X — Request/hall-call visualization plus occupancy badge in the car; no floor passenger sprites

### Inferred 3 — Traffic sources
Hall ↑/↓ clicks create passengers. Controls include **+ Add request**, a **Traffic** dropdown (shown as Normal), Pause, and Reset.

[Answer]: X — Manual hall calls, Add request, and a Traffic preset dropdown (not a one-shot generate button)

### Inferred 4 — Simulation speed
Speed toggles: **0.5x, 1x, 2x, 5x**. Header also shows Running + current speed.

[Answer]: A — Speed control in the control bar (0.5x / 1x / 2x / 5x)

### Inferred 5 — Algorithm UI
Header dropdown **Cost-Based Collective Control**. Dispatch Evaluation panel shows per-car cost factors and the selected car. Whether a second algorithm ships in MVP is still asked below.

[Answer]: B — Algorithm dropdown in the UI (mockup shows it)

### Inferred 6 — Cost weights
Dispatch Evaluation shows Distance, Direction, Scheduled stops, Reverse penalty, Waiting-age credit, and totals. No weight sliders.

[Answer]: C — Hardcoded named constants in a config module; evaluation panel displays the resulting scores

### Inferred 7 — Layout
Desktop dashboard: header; left shaft visualizer with hall calls; controls under the visualizer; right stack of Active Requests, Dispatch Evaluation, Elevators, Performance; event log at the bottom. Dense monitoring layout, not a mobile layout.

[Answer]: A — Desktop-only, matching the mockup (shafts left, analytics right, controls + log)

### Inferred 8 — Floor labels
Floors numbered **1 through 10**, with 1 at the bottom.

[Answer]: A — Floors 1–10, 1 is the bottom

### Inferred 9 — Metrics
Cards: Average wait, Longest wait, Average journey, Completed trips. Utilization bars per car. Occupancy shown as current / max in the Elevators table.

[Answer]: X — Include Average journey and utilization bars in addition to the plan’s metrics

### Inferred 10 — Event log
Timestamped REQUEST / DISPATCH / ELEVATOR / PASSENGER lines, with an All Events filter.

[Answer]: X — Event log with type filter, as in the mockup

---

## 2. Remaining questions (please answer these)

Fill in the letter after each `[Answer]:`. If none of the options match, choose **X** and describe your preference.

## Question 1
The mockup shows occupancy **2 / 8 passengers**. An earlier draft answer said “no capacity limit.” What should we implement?

A) Capacity is 8. When full, the car does not pick up more passengers (request stays waiting or is reassigned)

B) Capacity is 8 for display only. Cars never refuse boarding

C) No capacity limit, and the Elevators table should not show a max (change the mockup)

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 2
How is a passenger **destination** chosen? The mockup has hall ↑/↓, **+ Add request**, and log lines like `P041 boarded A, destination F9`, but no in-car panel.

A) Hall click creates a direction-only call; destination is assigned automatically when the passenger is created (random valid floor in that direction)

B) Hall click creates the call; after doors open, the user must click a destination floor for that car

C) Hall click is direction-only with an auto destination; **+ Add request** opens a form where the user sets floor, direction, and destination explicitly

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
The header has an **algorithm** dropdown. How many strategies should the MVP actually run?

A) Dropdown visible, but only Cost-Based Collective Control is implemented (other entries disabled or “coming later”)

B) Two working strategies in MVP (cost-based plus a simpler baseline such as nearest-car), switchable from the dropdown

C) Dropdown later; MVP is cost-based only and the header can omit the control until a second algorithm exists

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 4
The **Traffic** dropdown is set to Normal. Which presets should the MVP include?

A) Off / Normal / Busy (three presets; Normal matches typical mixed traffic)

B) Off / Light / Normal / Busy / Rush hour (up and down peaks)

C) A single “generate burst” action instead of a standing traffic preset (closer to the original plan)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
How should **CSS** be organized? The plan specifies regular CSS (not CSS-in-JS).

A) Global CSS files (for example `src/styles/`) with clear section comments

B) CSS Modules colocated with React components, plus a small global stylesheet for reset and layout

C) One global stylesheet only for the whole app

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
Which **package manager** should the scaffold use?

A) npm

B) pnpm

C) yarn

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
What should **this first scaffold increment** contain? (Still not the full simulator.)

A) Vite + React + TypeScript, Vitest, folders (`engine`, `simulation`, `ui`), README, and a **static layout shell that visually matches the mockup** (panels, colors, sample labels; no live animation or dispatcher)

B) Same as A, plus TypeScript domain types and dispatcher interfaces — still no algorithm or animation

C) Tooling only (Vite + React + TS + Vitest + folders + README). No UI shell yet

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8
Should the **security baseline** be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)

B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 9
Should the **resiliency baseline** be applied to this project?

Enabling it applies directional design-time reliability practices. It does not certify production readiness.

A) Yes — apply the resiliency baseline as directional best practices

B) No — skip the resiliency baseline (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 10
Should **property-based testing (PBT)** rules be enforced? The dispatcher is pure TypeScript scoring and state logic.

A) Yes — enforce all PBT rules as blocking constraints

B) Partial — enforce PBT rules only for pure functions and serialization round-trips

C) No — skip all PBT rules

X) Other (please describe after [Answer]: tag below)

[Answer]: A
