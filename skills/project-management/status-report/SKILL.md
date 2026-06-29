---
name: status-report
domain: project-management
description: Produce a concise stakeholder status report in BLUF format covering RAG status, period progress, milestone tracker, risks and issues, and next period plan. Adapts for weekly, monthly, or executive audiences.
when_to_use: The user needs to write a status update, weekly or period report, progress summary, project health check, or stakeholder communication on delivery.
argument-hint: "[project name, period covered, and any key updates or issues]"
retrieval_intent: progress, milestones, RAG status, risks, blockers, asks, period update
output: Status Report (Markdown)
stage: delivery
---

# Status Report

A good status report is not a list of activities â€” it is a health check that gives stakeholders the confidence (or the warning) they need in under 90 seconds. Lead with the most important thing. Be honest about problems; stakeholders who find out about issues from others lose trust in the PM.

## When to Use
- Weekly: operational status for the delivery team and immediate stakeholders
- Monthly: executive or steering committee update with trend analysis
- Milestone: at each major milestone to confirm or flag changes
- Exception: any time RAG status changes or a significant risk materialises

## Report Formats

### Format 1: Weekly Team Status (1 page)
For: delivery team, engineering leads, immediate PM stakeholders
Length: Half page to 1 page
Focus: What happened, what is coming, what is blocked

### Format 2: Executive / Steering Committee Status (1 page)
For: sponsors, directors, VPs
Length: 1 page maximum
Focus: RAG, key decisions needed, business impact of any risks

### Format 3: Programme / Portfolio Status (Multi-project)
For: Programme manager, PMO, COO
Length: 1-2 pages
Focus: Cross-project dependencies, budget vs. actuals, aggregate RAG

## Framework: Status Report (6 Sections)

### Section 1: Header & Overall RAG
| Field | Content |
|-------|---------|
| Project | |
| Period | [Week ending / Month / Milestone] |
| PM | |
| Sponsor | |
| **Overall RAG** | ðŸŸ¢ Green / ðŸŸ¡ Amber / ðŸ”´ Red |
| RAG rationale | One sentence explaining the status |

**RAG definitions:**
- ðŸŸ¢ **Green**: On track. No significant risks to scope, schedule, or budget.
- ðŸŸ¡ **Amber**: At risk. One or more issues that, if not addressed, will impact delivery. Recovery plan in place or being developed.
- ðŸ”´ **Red**: Off track. Scope, schedule, or budget is materially impacted. Escalation or sponsor decision required.

### Section 2: BLUF Summary (Bottom Line Up Front)
2-3 sentences. What is the most important thing a stakeholder needs to know right now?
- If Green: "Project is on track for [milestone]. [Key highlight]."
- If Amber: "Project is at risk due to [issue]. Recovery plan: [brief description]."
- If Red: "Project requires sponsor decision on [topic] by [date] to avoid [consequence]."

### Section 3: Progress This Period
What was completed this period?
- Use past tense, outcome-focused language ("Completed UAT for payment module" not "Worked on UAT")
- List 3-6 bullet points maximum
- Highlight anything ahead of schedule

### Section 4: Milestone Tracker
| # | Milestone | Original date | Revised date | Status | Notes |
|---|-----------|--------------|-------------|--------|-------|
| M1 | [Milestone] | | | ðŸŸ¢âœ… Complete | |
| M2 | [Milestone] | | | ðŸŸ¡ At risk | [One-line reason] |
| M3 | [Milestone] | | | ðŸ”µ On track | |
| M4 | [Milestone] | | | â€” Not started | |

### Section 5: Risks & Issues
**New or escalated this period:**
| ID | Type | Description | Severity | Owner | Action | Due |
|----|------|------------|---------|-------|--------|-----|
| R-03 | Risk | [Description] | ðŸ”´ High | | | |
| I-02 | Issue | [Active issue] | ðŸŸ¡ Med | | | |

**Closed this period:** [List any risks/issues resolved]

### Section 6: Next Period Plan & Asks
**Next period priorities (top 3-5):**
1. [What will be done]
2. [What will be done]
3. [What will be done]

**Asks / Decisions required:**
| Ask | From whom | Needed by | If delayed, impact |
|-----|----------|----------|-------------------|
| [Decision or resource needed] | [Name/Role] | [Date] | [Consequence] |

## Quality Checklist
- [ ] RAG is honest â€” Amber or Red when warranted, not perpetually Green
- [ ] BLUF section leads with the most important fact
- [ ] Progress section uses past tense outcomes, not activities
- [ ] Every Amber/Red milestone has a revised date and recovery note
- [ ] Asks section is specific: names, dates, and consequence of inaction
- [ ] Total reading time is under 2 minutes for an executive reader

## Common Pitfalls
- Perpetual Green until suddenly Red â€” Amber exists for a reason; use it early
- Activity reporting ("We had meetings about X") vs. outcome reporting ("X was completed")
- Burying the bad news in section 5 after four sections of good news
- Missing asks â€” stakeholders cannot help if you do not tell them what you need
- Copy-paste from last week â€” always update every section, especially the risks
