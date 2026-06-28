---
name: resource-plan
domain: project-management
description: Build a resource allocation plan mapping roles, capacity, and timeline across workstreams to surface conflicts early.
when_to_use: The request is about resource planning, team allocation, capacity management, or staffing a project.
retrieval_intent: team members, roles, capacity, workstreams, availability, timeline
output: Resource Plan (Markdown)
stage: planning
---

## Purpose
Prevent the #1 project failure mode â€” the right people not being available at the right
time â€” by making capacity and conflicts visible before they bite.

## Steps
1. List all roles and named resources.
2. Map each resource to workstreams and % allocation per phase.
3. Identify over-allocations (>100% in any period).
4. Flag external dependencies (contractors, other teams).
5. Propose mitigation for any gaps.

## Output template
```
# Resource Plan â€” <Project>
## Team roster
| Name | Role | Allocation % | Phase |
## Capacity heatmap (by month/sprint)
## Over-allocations & conflicts
## External dependencies
## Gap mitigation
```
