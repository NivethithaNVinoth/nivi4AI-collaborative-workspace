---
name: change-request
domain: project-management
description: Document a formal change request with impact assessment across scope, schedule, cost, and quality â€” ready for Change Control Board review.
when_to_use: Request is to document a scope change, raise a change request, assess impact of a change, or get sign-off on a project deviation.
retrieval_intent: change request, scope change, change control, CCB, impact assessment, change log, change management
output: Change Request Document with impact assessment (Markdown)
stage: delivery
---

## Purpose
Capture every change to baseline scope/schedule/cost in a structured, auditable document.

## Key concepts
- Baseline: approved scope, schedule, and budget at project start.
- Change types: scope addition/reduction, schedule acceleration, budget increase, technology change.
- Impact assessment: scope (delta deliverables), schedule (delta days), cost (delta budget), quality, resources.

## Steps
1. State the change in one sentence, unambiguously.
2. Describe the reason/trigger.
3. Assess impact across scope, schedule, budget, quality, resources.
4. List dependencies and knock-on changes.
5. Provide 3 options: approve, defer, reject with implications.
6. State recommendation and required decision date.

## Output template
```
# Change Request â€” CR-[NNN]
## Summary
## Reason / Trigger
## Impact Assessment
| Dimension | Baseline | With Change | Delta | Notes |
## Dependencies & Knock-ons
## Options
## Recommendation
## Decision Required By
```