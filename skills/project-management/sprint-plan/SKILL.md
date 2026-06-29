---
name: sprint-plan
domain: project-management
description: Build a complete sprint plan from a set of user stories â€” including sprint goal, capacity calculation, story selection rationale, sequencing, and risk flags.
when_to_use: The user needs to plan a sprint, commit stories, calculate team capacity, set a sprint goal, or prepare for a sprint planning ceremony.
argument-hint: "[backlog of stories, team size, and sprint length]"
retrieval_intent: user stories, estimates, team capacity, dependencies, sprint goal, velocity
output: Sprint Plan (Markdown)
stage: planning
---

# Sprint Plan

A sprint plan converts a prioritised backlog into a committed, achievable sprint with a clear goal. The output of planning is not just a list of stories â€” it is a shared contract between product and engineering about what will be delivered and why.

## When to Use
- Before every sprint begins (2-4 week cycles)
- When team capacity changes (new member, PTO, incidents)
- When the backlog needs to be re-sequenced due to changed priorities
- When an unplanned item needs to be inserted mid-sprint (impact assessment)

## Framework: Sprint Planning (5 Steps)

### Step 1: Set the Sprint Goal
One sentence. Describes the user or business outcome â€” not a list of features.

Formula: "By end of sprint, [user type] can [do something they could not before], which [business value]."

Example: "By end of sprint, new users can complete onboarding without contacting support, reducing day-1 drop-off."

A strong sprint goal:
- Is testable: you can say at the end of the sprint whether it was achieved
- Is meaningful: not "continue working on X"
- Provides focus: helps the team make daily trade-off decisions

### Step 2: Calculate Team Capacity

**Capacity formula:**
```
Available person-days =
  (team members) Ã— (sprint days) Ã— (focus factor)
  minus planned PTO, holidays, ceremonies, on-call
```

**Focus factor:** Typically 0.6-0.7 (accounts for meetings, reviews, unplanned interruptions)

| Team member | Role | Available days | Notes |
|------------|------|---------------|-------|
| [Name] | FE | X days | 2 days PTO |
| [Name] | BE | X days | |
| [Name] | QA | X days | |
| **Total** | | **X days** | |

**Historical velocity:** Average story points / person-days delivered over last 3 sprints:
`Velocity = Avg completed points Ã· Available days`

Use historical velocity, not optimistic estimates, to set the capacity ceiling.

### Step 3: Select Stories

Pull from the top of the prioritised backlog. For each candidate story:
- [ ] Is it fully defined? (acceptance criteria written, design approved)
- [ ] Are dependencies met? (blocked stories cannot be pulled)
- [ ] Does it contribute to the sprint goal?
- [ ] Does the estimate fit within remaining capacity?

**Committed stories:**
| Story | Points | Owner | Depends on | Goal contribution |
|-------|--------|-------|------------|------------------|
| | | | | Direct / Indirect / Stretch |

**Stretch goals** (pull if capacity remains):
| Story | Points | Owner | Condition |
|-------|--------|-------|-----------|
| | | | Only if committed stories complete early |

### Step 4: Sequence and Assign

Sequence within the sprint by dependency and risk:
- Dependencies first: unblock other stories early
- High-risk stories early: surface integration or technical unknowns in days 1-3, not day 9
- QA work: allow 20% of the sprint for testing; do not back-load it

Daily sequencing guide:
- Days 1-2: Start all stories, unblock dependencies
- Days 3-6: Core build; daily progress check against goal
- Days 7-8: QA, bug fixes, acceptance
- Day 9-10: Buffer, sign-off, sprint prep

### Step 5: Flag Risks and Blockers
| Risk / Blocker | Impact | Mitigation | Owner |
|---------------|--------|-----------|-------|
| [External API dependency] | Could block Story X | Spike on day 1; flag if not resolved by day 3 | [Name] |
| [Design not finalised] | Blocks Story Y | PM to confirm design by EOD day 1 | PM |

## Output Template

```
# Sprint Plan â€” Sprint [N] | [Start date] â€“ [End date]

## Sprint Goal
[One sentence]

## Capacity
| Member | Available days |
Total: X days | Historical velocity: Y pts/day | Capacity: ~Z points

## Committed Stories
| # | Story | Points | Owner | Depends on |

## Stretch Stories
| # | Story | Points | Condition |

## Sequencing
[Day-by-day or phase-by-phase plan]

## Risks & Blockers
| Risk | Mitigation | Owner |

## Definition of Done
[Team's DoD â€” consistent across sprints]
```

## Quality Checklist
- [ ] Sprint goal is a single sentence describing a user or business outcome
- [ ] Capacity is based on actual availability, not theoretical full-time
- [ ] Historical velocity is used, not optimistic estimation
- [ ] Every committed story has acceptance criteria written before the sprint starts
- [ ] Dependencies are identified and sequenced correctly
- [ ] High-risk items are front-loaded in the sprint
- [ ] Stretch stories are clearly labelled as optional
- [ ] QA time is allocated within the sprint, not after

## Common Pitfalls
- No sprint goal: without it, every task feels equally important and nothing gets cut when things slip
- 100% capacity utilisation: always leave 10-20% buffer for unplanned work
- Back-loading QA: bugs found on day 9 of a 10-day sprint cannot be fixed in time
- Pulling unrefined stories: stories without acceptance criteria generate rework and missed scope
- Changing the sprint mid-sprint without impact assessment: creates unpredictability and technical debt
