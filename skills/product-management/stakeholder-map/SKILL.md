---
name: stakeholder-map
domain: product-management
description: Produce a stakeholder influence/interest map with RACI assignments, engagement strategies per quadrant, and a communication cadence plan. Prevents late surprises by making alignment proactive.
when_to_use: The user needs to identify stakeholders, manage stakeholder relationships, plan stakeholder communications, build a RACI, or prevent misalignment on a product or project.
argument-hint: "[product, project, or initiative to map stakeholders for]"
retrieval_intent: stakeholders, influence, interest, engagement, RACI, communication plan
output: Stakeholder Map and Engagement Plan (Markdown)
stage: discover
---

# Stakeholder Map & Engagement Plan

Stakeholder management is not about making everyone happy â€” it is about ensuring the right people have the right information at the right time, and that no critical voice is missing from key decisions. A stakeholder map makes alignment proactive rather than reactive.

## When to Use
- Kicking off a new product initiative or project
- When a decision is blocked by unclear ownership
- When surprises keep happening in reviews or approvals
- Before a major launch or milestone
- When onboarding a new stakeholder to an in-flight initiative

## Framework: Stakeholder Mapping (4 Steps)

### Step 1: Identify All Stakeholders
Cast wide â€” it is better to over-include at this stage. Consider:
- **Decision-makers**: Who can approve, veto, or significantly change the plan?
- **Influencers**: Who do decision-makers listen to?
- **Implementers**: Who does the work? (engineering, design, data, ops)
- **Affected parties**: Who is impacted by the outcome? (other teams, customers)
- **External**: Partners, regulators, vendors, key customers

### Step 2: Plot on Influence Ã— Interest Matrix

| | Low Interest | High Interest |
|--|-------------|--------------|
| **High Influence** | Manage Closely | Keep Satisfied |
| **Low Influence** | Monitor | Keep Informed |

Actually â€” the classic 2x2 is:

| Quadrant | Strategy |
|----------|---------|
| **High Influence / High Interest** | Manage Closely: deep involvement, co-creation, frequent sync |
| **High Influence / Low Interest** | Keep Satisfied: executive updates, flag issues early, don't flood with detail |
| **Low Influence / High Interest** | Keep Informed: regular updates, self-serve information, solicit input |
| **Low Influence / Low Interest** | Monitor: minimal contact, update only when directly impacted |

### Step 3: Build the Stakeholder Register

| Name | Role | Influence | Interest | Quadrant | Stance | Primary need |
|------|------|-----------|---------|---------|--------|-------------|
| | | H/M/L | H/M/L | | Supporter/Neutral/Sceptic | |

**Stance categories:**
- **Champion**: Active advocate; leverage them
- **Supporter**: Positive but passive; engage to maintain
- **Neutral**: No strong opinion; inform regularly
- **Sceptic**: Has concerns; address them directly and early
- **Blocker**: Actively opposed; understand why and engage 1:1

### Step 4: Define Engagement Strategy & RACI

**RACI for key decisions:**
| Decision | Responsible | Accountable | Consulted | Informed |
|---------|------------|------------|---------|--------|
| Feature scope | PM | Product VP | Eng Lead, Design | Stakeholders |
| Launch go/no-go | PM + Eng Lead | Product VP | Legal, Support | All |
| Pricing changes | PM | CEO/CPO | Finance, Sales | All |

**Communication cadence:**
| Stakeholder / Group | Format | Frequency | Owner | Channel |
|---------------------|--------|-----------|-------|---------|
| Executive sponsor | 1-page brief | Monthly | PM | Email |
| Engineering | Sprint review | Bi-weekly | PM | In-person |
| Sales | GTM update | Pre-launch + monthly | PM | Slack + meeting |
| Cross-functional | Status update | Weekly | PM | Slack |

**Engagement tactics by quadrant:**
- **Manage Closely**: Weekly 1:1, shared docs, co-own decisions, proactively loop in before surprises
- **Keep Satisfied**: Monthly update, brief format (BLUF), flag risks early, avoid operational detail
- **Keep Informed**: Written updates, self-serve dashboards, include in review meetings
- **Monitor**: Quarterly summary, flag only when they are directly affected

## Output Template
Generate a complete stakeholder map including: stakeholder register table, 2x2 matrix summary, RACI for key decisions, and communication cadence table.

## Quality Checklist
- [ ] External stakeholders are included, not just internal
- [ ] Stances are honest â€” mark sceptics and blockers, not just supporters
- [ ] RACI has exactly one Accountable per decision
- [ ] Every communication format has an owner and frequency
- [ ] High-influence / high-interest stakeholders have a named engagement plan
- [ ] Map is reviewed and updated at major milestones

## Common Pitfalls
- Only including internal stakeholders â€” customers, partners, and regulators matter
- Treating everyone as "manage closely" â€” you will burn out and dilute signal
- RACI with multiple "Accountable" owners â€” exactly one person must own each decision
- One-way communication plan â€” stakeholder management is dialogue, not broadcast
- Mapping once and forgetting â€” stakeholder influence shifts as the project evolves
