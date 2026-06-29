---
name: project-charter
domain: project-management
description: Produce a concise project charter establishing the mandate, scope, stakeholders, success criteria, governance, milestones, and top risks. The formal kick-off document for any project.
when_to_use: The user needs to initiate a project, create a charter or mandate, define scope and objectives, get sponsor sign-off, or align a new team on what they are building and why.
argument-hint: "[project name, objective, and key stakeholders]"
retrieval_intent: project objective, scope, stakeholders, success criteria, milestones, budget, governance
output: Project Charter (Markdown)
stage: initiation
---

# Project Charter

A project charter is the formal mandate that authorises a project to exist. It aligns sponsors, sets scope boundaries, names accountability, and gives the team a north star from day one. Without a charter, scope creep and stakeholder misalignment are inevitable.

## When to Use
- Before any significant project begins (if in doubt, write the charter anyway)
- When a new sponsor, PM, or team joins an in-flight project
- When scope has drifted and the team needs to reset
- As the reference document for any scope discussion ("is this in the charter?")

## Framework: Project Charter (7 Sections)

### 1. Project Overview
| Field | Content |
|-------|---------|
| Project name | |
| Start date | |
| Target end date | |
| Project Manager | |
| Sponsor | |
| Version / Status | Draft â†’ Approved |

**Problem statement (2-3 sentences):**
What problem does this project solve? Who does it affect? What happens if it is not solved?

**Business case (2-3 sentences):**
Why is this worth investing in? What is the expected business value (cost saving, revenue, risk reduction)?

### 2. Objectives
Write 3-5 SMART objectives:
- **S**pecific: clear and unambiguous
- **M**easurable: includes a metric or KPI
- **A**chievable: realistic with available resources
- **R**elevant: tied to business goals
- **T**ime-bound: has a deadline

Example: "Reduce onboarding time from 14 days to 5 days by end of Q3, measured by median time-to-first-value."

### 3. Scope

**In Scope:**
List what the project will deliver. Be explicit â€” this defines the boundaries.

**Out of Scope:**
List what is explicitly excluded. This is as important as in-scope. Common examples:
- "Migration of legacy data from systems older than 5 years"
- "Mobile app version (phase 2)"
- "Integration with third-party tools not listed above"

**Assumptions:**
Conditions assumed to be true for the plan to hold. If any assumption is wrong, re-assess scope and timeline.

**Constraints:**
Fixed limits that cannot change: budget cap, regulatory deadline, key personnel availability, technology choices.

### 4. Stakeholders & Governance

**Stakeholder Register:**
| Name | Role | Responsibility | Engagement level |
|------|------|---------------|-----------------|
| [Sponsor] | Executive sponsor | Final decisions, funding | Monthly review |
| [PM] | Project Manager | Day-to-day delivery | Daily |
| [Tech Lead] | Engineering lead | Technical decisions | Daily |
| [User rep] | Business owner | Requirements, UAT | Weekly |

**Decision rights:**
| Decision type | Who decides | Who is consulted | Who is informed |
|--------------|------------|-----------------|----------------|
| Scope changes | Sponsor + PM | Tech Lead | All stakeholders |
| Budget changes | Sponsor | Finance | PM |
| Timeline changes | PM | Sponsor, Tech Lead | All |

**Governance cadence:**
- Steering committee: [frequency and format]
- Project team standup: [frequency]
- Milestone reviews: [at each milestone]

### 5. Milestones
| # | Milestone | Target date | Success criterion |
|---|-----------|------------|-----------------|
| M1 | Kick-off complete | | All stakeholders aligned, charter signed |
| M2 | Discovery complete | | Problem defined, solution approach agreed |
| M3 | Build complete | | All P0 requirements implemented |
| M4 | UAT sign-off | | Business owner accepts in staging |
| M5 | Launch / Go-live | | Live in production, success metrics baselined |
| M6 | Project close | | All deliverables accepted, lessons captured |

### 6. Budget & Resources
| Resource | Type | Allocation | Cost |
|---------|------|-----------|------|
| [PM Name] | Internal | 100% for X weeks | |
| [Engineer] | Internal | 50% for X weeks | |
| [Contractor] | External | TBD | $X |
| Infrastructure / tooling | | | $X |
| **Total estimated cost** | | | **$X** |

Contingency: [X%] reserve for risks materialising.

### 7. Top Risks
| # | Risk | Probability | Impact | Mitigation |
|---|------|------------|--------|-----------|
| R1 | [Key risk] | H/M/L | H/M/L | [Action to reduce probability or impact] |
| R2 | | | | |
| R3 | | | | |

**Charter sign-off:**
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Sponsor | | | |
| Project Manager | | | |

## Quality Checklist
- [ ] Business case is explicit â€” why now, what is the ROI or risk of not doing this?
- [ ] Out-of-scope section is as detailed as in-scope
- [ ] Every objective is SMART with a measurable target
- [ ] Exactly one accountable owner per key decision
- [ ] Assumptions and constraints are separate (assumptions could be wrong; constraints cannot change)
- [ ] Top 3-5 risks have mitigations, not just labels
- [ ] Charter has been reviewed and signed by the sponsor before work begins

## Common Pitfalls
- Scope defined only by what is IN â€” "out of scope" is equally important
- Milestones as activities ("Complete design") vs. outcomes ("Design approved by sponsor")
- Missing constraints â€” budget and regulatory limits discovered mid-project derail plans
- Charter never signed â€” a charter with no sign-off is just a document; sign-off creates accountability
