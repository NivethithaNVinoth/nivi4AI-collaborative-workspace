---
name: raid-log
domain: project-management
description: Create or update a RAID log capturing Risks, Assumptions, Issues, and Dependencies with probability/impact scoring, owners, mitigations, and resolution tracking.
when_to_use: The user needs to create or update a RAID log, capture project risks, track active issues, log dependencies, or record assumptions that could affect project delivery.
argument-hint: "[project name and any known risks, issues, or dependencies to log]"
retrieval_intent: risks, assumptions, issues, dependencies, blockers, mitigations, RAID log
output: RAID Log (Markdown)
stage: delivery
---

# RAID Log

A RAID log is a project's early-warning system. Well-maintained, it surfaces threats before they become crises. Risks are things that might happen; Issues are things that have happened. Both need owners and action plans â€” not just labels.

## When to Use
- Project kick-off: establish the initial RAID log from the charter and discovery
- Weekly: update during or after team standup
- Milestone review: formally review and re-score all open items
- Escalation: use to provide structured context when raising an issue
- Project close: retain as lessons-learned input

## The Four Registers

### R â€” Risks
Things that might happen and would negatively affect delivery.

For each risk:
- **Description**: Clear, specific statement of what could go wrong
- **Probability**: High (>60%) / Medium (30-60%) / Low (<30%)
- **Impact**: High (derails milestone or budget) / Medium (requires replanning) / Low (minor disruption)
- **Score**: Probability Ã— Impact = Risk Score (HH=Critical, HM/MH=High, MM=Medium, else=Low)
- **Mitigation**: Action to reduce probability or impact (not just "monitor")
- **Contingency**: What to do if the risk materialises despite mitigation
- **Owner**: One person accountable for monitoring and mitigation
- **Status**: Open / Mitigated / Transferred / Accepted / Closed

### A â€” Assumptions
Conditions assumed to be true. If an assumption is wrong, the plan changes.

For each assumption:
- **Description**: What are we assuming?
- **Impact if wrong**: What would change if this assumption turns out to be false?
- **Validation method**: How and when will we confirm this assumption?
- **Owner**: Who is responsible for monitoring this assumption?
- **Status**: Unvalidated / Validated / Invalidated

### I â€” Issues
Things that have already gone wrong or are currently blocking progress.

For each issue:
- **Description**: What has happened?
- **Impact**: What is the current effect on scope, schedule, or budget?
- **Severity**: Critical (blocks delivery) / High (impacts milestone) / Medium (workaround exists) / Low
- **Resolution action**: Specific steps being taken to resolve
- **Owner**: One person accountable for resolution
- **Target resolution date**: Specific date
- **Status**: Open / In Progress / Escalated / Closed

### D â€” Dependencies
Work that depends on an external team, system, or event.

For each dependency:
- **Description**: What are we waiting for?
- **Type**: Internal (another team) / External (vendor/partner) / Technical (system/infrastructure)
- **Provider**: Who is responsible for delivering it?
- **Required by**: Date needed for the project to stay on track
- **Status**: Not started / In progress / At risk / Delivered / Overdue
- **Contingency**: What happens if this dependency is not delivered on time?

## Output Template

```
# RAID Log â€” [Project Name]
**Last updated:** [Date]  **PM:** [Name]

## Summary
| Register | Total open | Critical/High | Closed this period |
|----------|-----------|--------------|-------------------|
| Risks | | | |
| Assumptions | | | |
| Issues | | | |
| Dependencies | | | |

---

## Risks
| ID | Description | Prob | Impact | Score | Mitigation | Owner | Status |
|----|------------|------|--------|-------|-----------|-------|--------|
| R-001 | | H/M/L | H/M/L | | | | Open |

## Assumptions
| ID | Assumption | Impact if wrong | Validated by / when | Owner | Status |
|----|-----------|----------------|---------------------|-------|--------|
| A-001 | | | | | Unvalidated |

## Issues
| ID | Description | Severity | Impact | Resolution action | Owner | Due | Status |
|----|------------|---------|--------|-----------------|-------|-----|--------|
| I-001 | | Crit/H/M/L | | | | | Open |

## Dependencies
| ID | Description | Type | Provider | Required by | Status | Contingency |
|----|------------|------|---------|------------|--------|------------|
| D-001 | | Int/Ext/Tech | | | On track | |
```

## Quality Checklist
- [ ] Every risk has a specific mitigation (not "monitor")
- [ ] Every issue has an owner and a target resolution date
- [ ] Critical/High items are reviewed at least weekly
- [ ] Dependencies have contingency plans â€” do not assume they will all be delivered on time
- [ ] Closed items are retained for lessons learned (don't delete them)
- [ ] Assumptions section exists and is actively maintained â€” most projects neglect this

## Common Pitfalls
- RAID log as a dumping ground: every item must have an owner and a due date
- Risks without mitigations: "Document the risk" is not a mitigation
- Confusing risks and issues: risks are future; issues are now
- Missing dependencies: cross-team dependencies are the most common source of delays
- Never closing items: a RAID log with 80 open items is useless; close and archive regularly
