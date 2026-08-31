# Resiliency and Remaining Clarifications

You opted **in** to the resiliency baseline (Question 9 = A). That extension requires these decisions **before** `requirements.md` can be finalized. The model cannot choose them for you.

This product is a **local educational browser app with no backend**. N/A and exempt options are valid. Pick those if you do not want production-style DR, CI/CD, or incident process for the MVP.

Please fill each `[Answer]:` with a letter. Tell me when you are done.

---

## Question 1

What should **+ Add request** do? Hall ↑/↓ already creates a passenger with an automatic destination (your Q2 = A). The mockup still has this button.

A) Create one extra request the same way as a hall click: random floor, matching direction, automatic destination in that direction

B) Open a small form: user picks floor, direction, and destination, then the request is created

C) Omit **+ Add request** from the MVP (hall clicks and Traffic presets are enough)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---



## Question 2

Recovery targets and disaster recovery (RESILIENCY-02). What RTO/RPO and DR posture should we document?

A) RPO/RTO: Hours — Backup & Restore. Redeploy from source and refresh the browser. Suitable for this educational SPA.

B) RPO/RTO: Tens of minutes — Pilot Light

C) RPO/RTO: Minutes — Warm Standby

D) RPO/RTO: Near real-time — Multi-site Active/Active

E) N/A — No production hosting, no persistent data, no DR. Reload/reset is enough. (Recommended for this MVP)

X) Other (please describe after [Answer]: tag below)

[Answer]: E

## Question 3

How should **changes** to this workload be governed? (RESILIENCY-03)

A) Use our existing organizational change management process — name the tool after [Answer]: (e.g. Jira Change)

B) No formal process yet — propose a lightweight change record + approval + rollback note

C) N/A — educational / internal simulator, exempt from formal change management

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 4

What **CI/CD** tooling should this workload use? (RESILIENCY-04)

A) Use our existing CI/CD pipeline — name the tool after [Answer]: (e.g. GitHub Actions)

B) No pipeline yet — propose a CI definition appropriate to Vite + npm (for later, not this scaffold increment)

C) N/A — no CI for the MVP; tests are run locally (`npm test`)

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 5

How should a **failed production deployment** be rolled back? (RESILIENCY-04)

A) Redeploy previous artifact / git version

B) Blue/green swap

C) Canary auto-rollback

D) Database-aware rollback (not applicable unless we add persistence)

E) N/A — no production deployment; revert the git commit locally if needed

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 6

What **deployment style** is acceptable? (RESILIENCY-04)

A) Direct / in-place (static hosting or local `npm run dev`)

B) Rolling

C) Blue/green

D) Canary

E) N/A — no production deployment for the MVP

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 7

**Regional topology** (RESILIENCY-08). This app is a client-side SPA with no backend.

A) Single-region, multi-zone — only if we later host static files on a cloud CDN

B) Multi-region active-passive

C) Multi-region active-active

D) N/A — local/dev only for the MVP; no cloud topology

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 8

How are **incidents** handled? (RESILIENCY-15)

A) Use our existing incident response process — name it after [Answer]:

B) No formal process — propose a lightweight incident / post-mortem process

C) N/A — educational simulator, no production on-call. Browser console + event log are enough

X) Other (please describe after [Answer]: tag below)

[Answer]: C