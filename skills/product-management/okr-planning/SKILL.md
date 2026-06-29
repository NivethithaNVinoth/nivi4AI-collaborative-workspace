---
name: okr-planning
domain: product-management
description: Define a set of Objectives and Key Results for a team or product area with initiative mapping, confidence scoring, health metrics, and a grading rubric.
when_to_use: The user needs to write OKRs, set quarterly goals, align team direction to company strategy, assess OKR quality, or review and grade existing OKRs.
argument-hint: "[team name, product area, or strategic goals for the quarter]"
retrieval_intent: strategic goals, metrics, team focus areas, quarterly priorities, OKRs
output: OKR Plan (Markdown)
stage: discover
---

# OKR Planning

OKRs (Objectives and Key Results) translate strategy into measurable quarterly commitments that focus the team and create a shared definition of success. Good OKRs are ambitious enough to drive stretch, specific enough to be unambiguous, and few enough to force prioritisation.

## When to Use
- Quarterly planning (set OKRs 2-3 weeks before the quarter begins)
- Annual planning (set annual O, let teams define KRs)
- Mid-quarter check-in (score progress, identify risks)
- End-of-quarter grading and retrospective
- Communicating team priorities to stakeholders

## Framework: OKR Structure

### Objectives
An Objective answers: **"Where do we want to go?"**

Good Objectives are:
- **Qualitative and inspiring**: motivates the team, not just a metric target
- **Time-bound**: achieved within the OKR cycle (quarter or year)
- **Ambitious but achievable**: 70% achievement = success (not 100%)
- **Aligned upward**: directly contributes to a company-level goal
- **Owned**: one person is accountable (can have contributors)

Bad Objective: "Improve onboarding"
Good Objective: "Make every new user reach their first 'aha moment' in under 5 minutes"

### Key Results
A Key Result answers: **"How will we know we got there?"**

Good Key Results are:
- **Measurable and binary or scalar**: pass/fail or 0-100% progress
- **Outcome-focused**: measures impact, not activity ("NPS increases from 32 to 45", not "run 10 NPS surveys")
- **Baseline-anchored**: always includes current state
- **Independently verifiable**: someone else could confirm it was hit

Bad KR: "Improve activation flow"
Good KR: "Increase Day-1 activation rate from 34% to 55% by end of quarter"

### Confidence Score
For each KR, rate confidence that you will achieve it at the start of the quarter:
- **7-10/10**: High confidence â€” too easy? Consider raising the bar
- **4-6/10**: Right zone â€” ambitious but realistic
- **1-3/10**: Very uncertain â€” do you have a plan?

### Initiative Mapping
Under each KR, list the 1-3 initiatives that will drive it:
- Initiatives are the work (what you build or do)
- KRs are the outcomes (what changes as a result)
- If an initiative does not map to a KR, ask why you are doing it

## Output Template

```
# OKRs â€” [Team / Product] | Q[N] [Year]
**Owner:** [PM Name]  **Sponsor:** [VP/Director]

## Objective 1: [Inspiring outcome statement]
*Contributes to: [Company OKR it supports]*

| Key Result | Baseline | Target | Confidence | Owner |
|-----------|---------|--------|------------|-------|
| KR 1.1: [Measurable outcome] | X% | Y% | 6/10 | [Name] |
| KR 1.2: [Measurable outcome] | $X | $Y | 5/10 | [Name] |

**Initiatives under Objective 1:**
- [Initiative A] â†’ drives KR 1.1
- [Initiative B] â†’ drives KR 1.2

---

## Objective 2: ...

---

## Health Metrics (monitored, not graded)
Metrics we must not let regress while pursuing our OKRs:
| Metric | Current | Alert threshold |
|--------|---------|----------------|
| [e.g., p95 latency] | Xms | >Yms |
| [e.g., error rate] | X% | >Y% |

## Dependencies & Risks
| Dependency / Risk | Impact | Mitigation |
|------------------|--------|-----------|

## Grading Rubric
- 1.0: Delivered all KRs fully
- 0.7: Hit most KRs; one missed due to reasonable external factors
- 0.5: Mixed â€” some KRs hit, others not
- 0.3: Largely missed â€” plan or resourcing was wrong
- 0.0: No progress
```

## Quality Checklist
- [ ] 2-4 Objectives per team (more = no focus)
- [ ] 2-4 KRs per Objective (more = too complex)
- [ ] Every KR has a numeric baseline and target
- [ ] Every KR is an outcome, not an activity
- [ ] Confidence scores are honest â€” at least one should be below 6
- [ ] Health metrics exist to prevent tunnel vision on OKRs
- [ ] Every initiative maps to at least one KR (kill orphaned work)
- [ ] Upward alignment: every Objective traces to a company goal

## Common Pitfalls
- KRs as tasks: "Launch feature X" is an output, not an outcome
- Too many OKRs: if everything is a priority, nothing is
- 10/10 confidence on every KR: you've set the bar too low
- No health metrics: OKR optimisation can cause blind spots in things you stopped tracking
- Set and forget: check in monthly and adjust if external conditions change
