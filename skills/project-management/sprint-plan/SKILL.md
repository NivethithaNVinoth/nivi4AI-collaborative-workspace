---
name: sprint-plan
domain: project-management
description: Build a sprint plan from a set of signed-off user stories, with sprint goal, capacity, committed stories, and sequencing rationale.
when_to_use: The request is about sprint planning, organising stories into a sprint, capacity, or what to commit to next.
retrieval_intent: user stories, estimates, team capacity, dependencies, sprint goal
output: Sprint Plan (Markdown)
stage: planning
---

## Purpose
Turn prioritised, signed-off stories into a committed, achievable sprint with a clear goal.

## Steps
1. State the sprint goal (one sentence outcome).
2. Note team capacity and sprint length.
3. Select stories that fit capacity; sequence by dependency.
4. Flag risks and any spillover/contingency.

## Output template
```
# Sprint Plan â€” Sprint <N>
## Sprint goal
## Capacity & dates
## Committed stories
| Story | Estimate | Owner | Depends on |
## Sequencing & risks
```
