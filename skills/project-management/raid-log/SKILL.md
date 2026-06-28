---
name: raid-log
domain: project-management
description: Create or update a RAID log capturing Risks, Assumptions, Issues, and Dependencies with owners, severity, and mitigations.
when_to_use: The request is about risks, issues, assumptions, dependencies, blockers, or maintaining a RAID log.
retrieval_intent: risks, assumptions, issues, dependencies, blockers, mitigations
output: RAID Log (Markdown)
stage: delivery
---

## Purpose
Surface hidden threats and assumptions before they become crises. A well-maintained
RAID log is a project's early-warning system.

## Steps
1. Capture all Risks with probability, impact, and mitigation.
2. List Assumptions that must hold for the plan to work.
3. Record active Issues with owner and target resolution.
4. Map Dependencies: internal and external, with status.

## Output template
```
# RAID Log â€” <Project Name>
## Risks
| ID | Risk | Probability | Impact | Owner | Mitigation |
## Assumptions
| ID | Assumption | If wrong, impact | Owner |
## Issues
| ID | Issue | Severity | Owner | Resolution date |
## Dependencies
| ID | Dependency | Type | Status | Owner |
```
