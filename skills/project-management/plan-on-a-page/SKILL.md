---
name: plan-on-a-page
domain: project-management
description: Produce a one-page delivery plan for leadership summarising objective, workstreams, milestones, RAG status, budget, top risks, and key asks. Readable in under 3 minutes.
when_to_use: The user needs a plan-on-a-page, a one-pager for leadership, an executive delivery summary, a milestone overview, or a concise project brief for a steering committee.
argument-hint: "[project name, objective, workstreams, and key milestones]"
retrieval_intent: project plan, milestones, workstreams, executive summary, delivery status, leadership brief
output: Plan on a Page (Markdown)
stage: planning
---

# Plan on a Page

A plan on a page gives leadership everything they need to understand a project in under 3 minutes. It replaces 40-slide decks for steering committee reviews. The discipline of fitting everything on one page forces prioritisation â€” only the most important things survive.

## When to Use
- Steering committee or board presentation
- New sponsor or executive onboarding mid-project
- Programme review across multiple projects
- Project kick-off communication to senior stakeholders
- Monthly executive status (combined with RAG status)

## What Goes On One Page
1. **Objective & deadline** â€” why this project exists and when it ends
2. **Workstreams** â€” the 3-5 parallel tracks of work
3. **Milestone tracker** â€” top 5-8 milestones with dates and RAG
4. **Budget summary** â€” approved, spent, remaining, forecast
5. **Top risks** â€” 3 risks only, in one line each
6. **Key asks** â€” what leadership needs to decide or provide

## Framework: Building the Plan on a Page

### Step 1: Objective Statement
One sentence: [Project name] will [deliver what] by [when] to [achieve what business outcome].

Must contain:
- What is being delivered (not activities, the outcome)
- When (specific date or quarter)
- Why it matters (business case in one clause)

### Step 2: Workstreams
List 3-5 workstreams (parallel tracks of activity):
- Name each workstream clearly: "Product build", "Data migration", "Change management", "Testing & QA", "Launch readiness"
- One-line description: what does this workstream own?
- Lead: who is accountable?
- RAG status: current health of this workstream

| Workstream | Description | Lead | RAG |
|-----------|------------|------|-----|
| | | | ðŸŸ¢ðŸŸ¡ðŸ”´ |

### Step 3: Milestone Tracker
Top 5-8 milestones (not every task â€” only decision points and delivery gates):

| # | Milestone | Target date | Revised date | RAG | Notes |
|---|-----------|------------|-------------|-----|-------|
| M1 | Kick-off | | | âœ… | |
| M2 | Design approved | | | ðŸŸ¢ | |
| M3 | Build complete | | | ðŸŸ¡ | 1 week risk |
| M4 | UAT signed off | | | â€” | Not started |
| M5 | Go-live | | | â€” | |

### Step 4: Budget Summary
| Item | Approved | Spent to date | Remaining | Forecast at completion | Variance |
|------|---------|--------------|-----------|----------------------|---------|
| People | $X | $X | $X | $X | +/- $X |
| Technology | $X | $X | $X | $X | |
| External | $X | $X | $X | $X | |
| **Total** | **$X** | **$X** | **$X** | **$X** | **%** |

### Step 5: Top 3 Risks (One line each)
Format: [Risk description] â€” [Mitigation in progress] â€” [Owner]

Example: "Third-party API integration may slip 2 weeks â€” spike in progress, contingency: build adapter layer â€” [Name]"

Only 3. If you list more, nothing is a priority.

### Step 6: Asks & Decisions Required
| Ask | From | Needed by | If not received |
|-----|------|----------|----------------|
| [Budget approval for Phase 2] | Sponsor | [Date] | [Phase 2 cannot start] |
| [Decision on data retention policy] | Legal | [Date] | [Launch blocked] |

## Output Template
Generate clean, table-heavy markdown that can be pasted into a slide, email, or PDF. No paragraphs â€” every section is scannable in 30 seconds.

## Quality Checklist
- [ ] Total reading time is under 3 minutes
- [ ] Objective contains what, when, and why
- [ ] Milestone tracker has RAG status for every milestone
- [ ] Budget section shows variance vs. approved
- [ ] Only 3 risks (force yourself to cut to the top 3)
- [ ] Asks have names, dates, and consequences
- [ ] No jargon or acronyms that a new reader would not know

## Common Pitfalls
- Two-page "plan on a page" â€” if it does not fit on one page, cut ruthlessly
- Activity-level milestones â€” leadership needs decision gates, not task completions
- Missing budget variance â€” executives always want to know if you are over or under budget
- Vague risks â€” "resource risk" is not a risk; "senior engineer departing in week 3" is
