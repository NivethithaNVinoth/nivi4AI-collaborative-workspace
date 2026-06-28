---
name: okr-planning
domain: product-management
description: Define a set of Objectives and Key Results for a team or product area, with initiative mapping and confidence scores.
when_to_use: The request is about OKRs, quarterly goals, setting targets, or aligning team direction to company strategy.
retrieval_intent: strategic goals, metrics, team focus areas, quarterly priorities
output: OKR Plan (Markdown)
stage: planning
---

## Purpose
Translate strategy into measurable quarterly commitments that focus the team and
create a shared definition of success.

## Steps
1. Identify 2-4 Objectives (qualitative, inspiring, time-bound).
2. Define 2-4 Key Results per Objective (measurable, binary or 0-100% scalable).
3. Map 1-3 initiatives under each KR.
4. Assign confidence score (1-10) to each KR.
5. Flag dependencies and risks.

## Output template
```
# OKRs â€” <Team/Product> Q<N> <Year>
## Objective 1: <inspiring outcome>
- KR 1.1: <metric from X to Y by date> | Confidence: /10
  - Initiative: ...
## Health metrics (not graded)
## Risks & dependencies
```
