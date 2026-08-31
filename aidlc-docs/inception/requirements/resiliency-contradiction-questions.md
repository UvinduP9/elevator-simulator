# Resiliency Contradiction Clarification

I detected a contradiction between your POC statement and three letter answers.

You indicated **this is only a POC**, and you chose:

- Q2 = E — no production hosting, no DR
- Q3 = C — exempt from change management
- Q4 = C — no CI for the MVP
- Q8 = C — no production on-call

Those are consistent with a local educational proof of concept.

You also chose:

- Q5 = C — **Canary auto-rollback** (production rollback mechanism)
- Q6 = C — **Blue/green deployment** (production cutover)
- Q7 = C — **Multi-region active-active** (highest-cost topology)

Those three **C** options are production-grade. They conflict with a POC that has no hosting, no CI, and no DR.

Please pick one resolution below.

---

## Question 1
How should Q5, Q6, and Q7 be recorded?

A) Treat all three as N/A for this POC: no production rollback, no blue/green, no cloud topology. Local `npm run dev` and git revert are enough. (Matches “this is only a POC”)

B) Keep the letter answers: canary rollback, blue/green deploys, and multi-region active-active. This implies production hosting later, which is outside the stated POC scope.

C) Mix: keep some production choices — describe which after [Answer]:

X) Other (please describe after [Answer]: tag below)

[Answer]: A
