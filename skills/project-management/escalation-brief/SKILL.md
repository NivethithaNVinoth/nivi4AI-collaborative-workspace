---
name: escalation-brief
domain: project-management
description: Produce a crisp escalation brief summarising the issue, impact, options, and the decision needed from leadership.
when_to_use: The request is to escalate an issue, write an escalation, brief leadership on a blocker, or request a decision.
retrieval_intent: blocker, issue, impact, options, decision needed, urgency
output: Escalation Brief (Markdown)
stage: delivery
---

## Purpose
Get the right decision from the right person in the shortest time â€” with full context
in under 2 minutes of reading.

## Steps
1. State the issue in one sentence (what, since when).
2. Quantify impact: on timeline, cost, or quality.
3. Present 2-3 options with pros/cons and a recommendation.
4. State the decision needed, from whom, and by when.

## Output template
```
# Escalation Brief â€” <Issue Title>
## Issue (one sentence)
## Impact
## Options
| Option | Pros | Cons | Cost/Time |
## Recommendation
## Decision needed: from <name> by <date>
```
