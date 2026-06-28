---
name: status-report
domain: project-management
description: Produce a concise stakeholder status report covering progress, RAG, milestones, risks, and asks for the period.
when_to_use: The request is for a status update, weekly/period report, progress summary, or stakeholder communication on delivery.
retrieval_intent: progress, milestones, RAG status, risks, blockers, asks
output: Status Report (Markdown)
stage: delivery
---

## Purpose
Give stakeholders a single, honest view of delivery health in 90 seconds â€” no glossing
over problems, no burying the lede.

## Steps
1. Overall RAG (Red/Amber/Green) with one-line rationale.
2. Progress this period: what was completed.
3. Milestone tracker: on track / at risk / delayed.
4. Risks and issues: new, escalated, or closed.
5. Next period plan and asks/decisions needed.

## Output template
```
# Status Report â€” <Project> | <Period>
## Overall RAG: ðŸŸ¢/ðŸŸ¡/ðŸ”´
## Progress this period
## Milestone tracker
| Milestone | Target | Status |
## Risks & issues
## Next period & asks
```
