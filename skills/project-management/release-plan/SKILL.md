---
name: release-plan
domain: project-management
description: Produce a release plan with scope, go/no-go criteria, staged rollout phases, deployment runbook, rollback procedure, and communication plan. Ensures go-live is intentional and reversible.
when_to_use: The user needs to plan a release, deployment, go-live, or launch â€” or needs to define go/no-go criteria, a rollback plan, or a deployment runbook.
argument-hint: "[release name, what is being released, and target go-live date]"
retrieval_intent: release scope, deployment steps, go/no-go criteria, rollback plan, communication, launch readiness
output: Release Plan (Markdown)
stage: deliver
---

# Release Plan

A release plan ensures go-live is an intentional, reversible decision â€” not a moment of collective hope. Clear criteria, clear steps, and a tested rollback procedure are the difference between a controlled release and a crisis.

## When to Use
- Any production deployment beyond a minor bug fix
- Moving from beta to GA
- Releasing infrastructure or data migrations
- Any release that affects paying customers or critical flows
- When "what if something goes wrong" has not been answered

## Release Types

**Type A: Continuous / Incremental Release**
- Small, frequent releases with automated CI/CD
- Go/no-go: automated gates (test pass rate, error rate)
- Rollback: git revert + automated rollout

**Type B: Staged Feature Release**
- New feature behind a feature flag
- Rollout: internal â†’ 1% â†’ 10% â†’ 50% â†’ 100%
- Rollback: disable feature flag

**Type C: Major / Coordinated Release**
- Significant new product, migration, or breaking change
- Requires coordinated comms, training, support readiness
- Rollback: may require data migration rollback â€” plan carefully

## Framework: Release Plan (7 Sections)

### Section 1: Release Overview
| Field | Content |
|-------|---------|
| Release name / version | |
| Target go-live date | |
| Release type | A / B / C |
| Release manager | |
| Go/no-go decision maker | |
| Rollback approver | |

**Release scope** (what is in this release):
- Feature / fix 1: [Brief description]
- Feature / fix 2: [Brief description]

**Out of scope** (explicitly excluded):
- [Item deferred to next release]

### Section 2: Pre-Release Checklist
Complete before go/no-go meeting:
- [ ] All P0 bugs resolved
- [ ] Regression test suite passed (target: >95% pass rate)
- [ ] Performance testing passed (latency < Xms p95)
- [ ] Security review completed and signed off
- [ ] Data migration dry-run completed in staging
- [ ] Support team briefed and FAQ published
- [ ] Sales/CS briefed on new features
- [ ] Monitoring dashboards configured and baseline captured
- [ ] Rollback procedure tested in staging
- [ ] Go-live communication drafted and approved

### Section 3: Go / No-Go Criteria
| Criterion | Owner | Pass threshold | Status |
|-----------|-------|---------------|--------|
| All P0 bugs closed | QA Lead | 0 open P0s | |
| Test pass rate | QA Lead | â‰¥95% | |
| p95 latency in staging | Eng Lead | <Xms | |
| Error rate in staging | Eng Lead | <X% | |
| Security sign-off | Security | Approved | |
| Support readiness | Support Lead | FAQ live, team briefed | |
| Rollback tested | Eng Lead | Tested successfully in staging | |

**Go/no-go meeting**: [Date, time, attendees]
**Decision maker**: [Name]

### Section 4: Deployment Runbook
Step-by-step deployment procedure. Written precisely enough that someone unfamiliar could execute it.

| Step | Action | Owner | Expected duration | Success criterion |
|------|--------|-------|-----------------|------------------|
| 1 | [Enable maintenance mode / notify users] | Ops | 5 min | |
| 2 | [Run database migration scripts] | DBA | 10 min | Migration completes with 0 errors |
| 3 | [Deploy backend v2.x to staging cluster] | Eng | 15 min | Health check green |
| 4 | [Smoke test critical flows in production] | QA | 20 min | All critical paths pass |
| 5 | [Enable feature flag for 1% of users] | PM | 2 min | |
| 6 | [Monitor error rate and latency for 30 min] | Eng | 30 min | Error rate <X%, latency <Xms |
| 7 | [Expand to 10% â†’ 50% â†’ 100% at [intervals]] | PM | 2 hours | Each cohort: metrics stable |

### Section 5: Rollback Procedure
**Rollback trigger conditions** (roll back immediately if):
- Error rate exceeds X%
- p95 latency exceeds Xms
- Data corruption detected
- Critical customer-facing bug found with no workaround

**Rollback steps:**
| Step | Action | Owner | Time |
|------|--------|-------|------|
| 1 | [Disable feature flag / revert deployment] | Eng Lead | 5 min |
| 2 | [Verify previous version is serving traffic] | Eng | 5 min |
| 3 | [Run rollback database migration if needed] | DBA | Xmin |
| 4 | [Notify stakeholders of rollback] | PM | 5 min |
| 5 | [Post-mortem scheduled within 24h] | PM | â€” |

**Rollback decision maker**: [Name] can approve rollback without waiting for a meeting.

### Section 6: Monitoring Plan
What to watch for the first 24-48 hours post-launch:
| Metric | Baseline | Alert threshold | Owner | Monitoring tool |
|--------|---------|----------------|-------|----------------|
| Error rate | X% | >Y% | Eng | |
| p95 latency | Xms | >Yms | Eng | |
| Conversion rate | X% | <Y% | PM | |
| Support tickets | X/day | >Y/day | Support Lead | |

Monitoring schedule: [Who is on-call and for how long post-launch]

### Section 7: Communication Plan
| Audience | Message | Channel | Owner | Timing |
|---------|---------|---------|-------|--------|
| Internal (all staff) | Launch announcement | Slack #general | PM | T=0 |
| Customers (all) | Email announcement | Email | Marketing | T=0 |
| Customers (affected by breaking change) | Migration guide | Email + in-app | PM | T-7 days |
| Support team | FAQ + internal guide | Notion | PM | T-1 day |
| Press / analysts | Embargo brief | Email | Comms | T-7 days (embargo) |

## Quality Checklist
- [ ] Go/no-go criteria are specific and measurable â€” pass/fail, not subjective
- [ ] Rollback procedure is tested in staging before go-live
- [ ] A single named person can approve rollback without committee
- [ ] Support team briefed before go-live (not on the day)
- [ ] Monitoring dashboards set up before deployment, not after
- [ ] Communication plan has owners and timing, not just channels

## Common Pitfalls
- "No rollback needed" â€” always plan for it, even if you don't use it
- Untested rollback: rollback that has never been rehearsed will fail under pressure
- Support team blindsided on launch day â€” causes preventable ticket spikes
- Go/no-go criteria so vague they always pass ("system is stable")
- Monitoring started after go-live â€” baseline should be captured in staging first
