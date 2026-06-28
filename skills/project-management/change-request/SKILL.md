---
name: change-request
domain: project-management
description: Document a formal change request with impact analysis on scope, cost, time, and quality for sponsor decision.
when_to_use: The request is about a scope change, change control, a change request, or assessing the impact of a proposed change.
retrieval_intent: proposed change, scope impact, cost impact, time impact, decision needed
output: Change Request (Markdown)
stage: delivery
---

## Purpose
Ensure every change is a conscious decision â€” not scope creep. Force an explicit
trade-off conversation before committing to more work.

## Steps
1. Describe the proposed change and its origin.
2. Analyse impact: scope, cost, timeline, quality, risk.
3. Assess alternatives (including "do nothing").
4. State a clear recommendation.
5. Capture sponsor decision and date.

## Output template
```
# Change Request â€” CR-<NNN>
## Change description
## Origin & requestor
## Impact analysis
| Dimension | Current | With Change | Delta |
| Scope | | | |
| Cost | | | |
| Time | | | |
## Alternatives considered
## Recommendation
## Decision: Approved / Rejected | Sponsor | Date
```
