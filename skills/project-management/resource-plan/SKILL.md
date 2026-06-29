---
name: resource-plan
domain: project-management
description: Build a resource allocation plan mapping roles, capacity, and timeline across workstreams to surface conflicts, gaps, and over-allocations before they impact delivery.
when_to_use: The user needs to plan team capacity, allocate resources to workstreams, identify over-allocations, staff a project, or review resource needs for a delivery plan.
argument-hint: "[project workstreams, team members, and timeline]"
retrieval_intent: team members, roles, capacity, workstreams, availability, timeline, staffing
output: Resource Plan (Markdown)
stage: planning
---

# Resource Plan

A resource plan prevents the most common project failure mode: the right people not being available at the right time. By making capacity and conflicts visible before they bite, teams can negotiate priorities, hire contractors, or re-sequence work â€” not scramble at the last minute.

## When to Use
- Before a project begins: to confirm the team can deliver within the timeline
- When a new workstream is added: to assess impact on existing capacity
- Mid-project: when a key person leaves or goes on leave
- Annual planning: to forecast hiring or contractor needs
- When two projects compete for the same people

## Framework: Resource Plan (5 Steps)

### Step 1: Build the Team Roster
| Name | Role | Seniority | Skills | Current project | Availability from |
|------|------|---------|--------|----------------|-----------------|
| | | Senior/Mid/Junior | [Key skills] | [Project] | [Date] |
| Contractor TBD | [Role needed] | | | | [Date needed] |

Note shared/split resources (people allocated across multiple projects) â€” these are the highest risk for conflicts.

### Step 2: Map Allocation to Workstreams

For each project phase or workstream:

| Workstream | Duration | [Name A] | [Name B] | [Name C] | [External] |
|-----------|---------|---------|---------|---------|----------|
| Discovery | Weeks 1-2 | 50% | 20% | 0% | â€” |
| Design | Weeks 2-4 | 30% | 0% | 100% | â€” |
| Build Phase 1 | Weeks 3-8 | 0% | 100% | 50% | 100% |
| Build Phase 2 | Weeks 6-12 | 0% | 100% | 50% | 100% |
| QA & Testing | Weeks 10-13 | 20% | 50% | 50% | â€” |
| Launch | Week 14 | 50% | 20% | 20% | â€” |

### Step 3: Identify Over-Allocations
Total allocation per person per phase. Flag any week/phase where a person exceeds 100%:

| Name | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Peak allocation |
|------|--------|--------|--------|--------|----------------|
| [Name A] | 50% | 80% | **120%** âš ï¸ | 50% | 120% â€” conflict |

**Resolution options for over-allocations:**
1. Re-sequence: delay one workstream to after the conflict period
2. Reduce scope: cut work to fit available capacity
3. Add resource: contractor or additional team member
4. Negotiate: ask the other project to release the person temporarily

### Step 4: Map External Dependencies & Contractors
For work that requires external resources:

| Resource needed | Type | Volume | When needed | Lead time | Risk if delayed |
|----------------|------|--------|-------------|----------|----------------|
| [Specialist contractor] | External | 3 person-weeks | Weeks 6-9 | 3 weeks to onboard | Delays Phase 2 |
| [Platform team API] | Internal | 2-week integration | Week 8 | 4 weeks for scheduling | Delays launch |

### Step 5: Resource Risk Summary
| Risk | Impact | Mitigation |
|------|--------|-----------|
| [Key person single point of failure] | Medium | Cross-train [Name B]; document knowledge |
| [Contractor not yet sourced] | High | Start procurement immediately; prepare fallback |
| [Person on PTO during critical period] | Low | Reassign to [Name C]; accept reduced pace |

## Output Template

```
# Resource Plan â€” [Project Name]
**Planning horizon:** [Start date] â€“ [End date]
**Total capacity:** [X person-months]
**Budget for external:** [$X]

## Team Roster
[Table]

## Allocation Matrix (by workstream)
[Table]

## Capacity Heatmap
[Over-allocations highlighted]

## External Dependencies & Contractors
[Table]

## Gap Analysis
What capacity we have vs. what we need:
- [Role]: Have X%, need Y% â€” gap: Z%
```

## Quality Checklist
- [ ] Every workstream has an allocation in the matrix
- [ ] No person is allocated >100% in any phase without a resolution plan
- [ ] Single points of failure are identified and have a contingency
- [ ] External contractor lead times are accounted for in the timeline
- [ ] Shared resources (split across projects) have explicit agreements
- [ ] Plan is reviewed with each team member, not just their manager

## Common Pitfalls
- Theoretical 100% utilisation: always assume 70-80% effective utilisation
- Ignoring contractor sourcing lead time: good contractors take 3-6 weeks to onboard
- Shared resources without coordination: if two PMs both plan 100% of the same engineer, someone is wrong
- Static plan: resource availability changes; update monthly or when any assumption changes
