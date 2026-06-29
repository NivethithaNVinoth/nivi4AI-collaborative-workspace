---
name: prd
domain: product-management
description: Generate a complete, engineering-ready Product Requirements Document from a feature idea, problem statement, or discovery brief. Covers problem definition, user stories, functional requirements, success metrics, and launch plan.
when_to_use: The user needs to write a PRD, spec a feature for engineering, turn a discovery into a structured doc, or wants requirements documented before build begins.
argument-hint: "[feature idea, problem statement, or discovery brief]"
retrieval_intent: problem statement, target users, solution scope, success metrics, constraints, requirements
output: Product Requirements Document (Markdown)
stage: deliver
---

# PRD Writer

A PRD is the primary handoff artifact between product and engineering. It answers three questions: what problem are we solving, what are we building, and how will we know it worked. A good PRD enables engineering to build the right thing while staying flexible on implementation details.

## When to Use
- After problem and solution alignment, before engineering work begins
- When speccing features, epics, or full product initiatives
- When multiple teams need to coordinate on a shared deliverable
- When stakeholders need to approve scope before investment
- When you have a feature idea and need to turn it into a structured spec

## Framework: PRD Structure

### 1. Overview
- **Feature name**: Clear, descriptive (not internal codename)
- **Author / Date / Status**: Draft â†’ In Review â†’ Approved
- **One-liner**: What this does in one sentence, for a non-technical reader
- **Links**: Relevant discovery docs, design files, tickets

### 2. Problem Statement
Answer all four:
- **What problem are we solving?** Specific user pain or business need
- **Who has this problem?** Primary user segment, persona
- **How big is this problem?** Estimated reach, frequency, severity (use data where possible)
- **Why now?** Urgency, strategic window, competitive pressure, or tech unlock

### 3. Goals & Non-Goals
**Goals** (3-5, each measurable):
- Connect each goal to a user need or business objective
- Prefer outcome goals ("reduce support tickets by 20%") over output goals ("ship feature X")

**Non-Goals** (explicit):
- List what this will NOT do
- Prevents scope creep and sets realistic expectations
- Include items that were considered and deliberately cut

### 4. User Stories
Write 3-6 stories in Mike Cohn format:
> As a [persona], I want to [action] so that [outcome].

For each story, add Gherkin acceptance criteria:
```
Given [initial context]
When [user action]
Then [expected result]
And [additional result if needed]
```
Apply the INVEST test: Independent, Negotiable, Valuable, Estimable, Small, Testable.

### 5. Functional Requirements

**Must Have (P0)** â€” launch is blocked without these:
| ID | Requirement | Notes |
|----|-------------|-------|
| FR-001 | | |

**Should Have (P1)** â€” important but not blocking:
| ID | Requirement | Notes |
|----|-------------|-------|
| FR-010 | | |

**Nice to Have (P2)** â€” future consideration:
| ID | Requirement | Notes |
|----|-------------|-------|
| FR-020 | | |

**Non-Functional Requirements:**
- Performance: Latency targets (p50 / p95 / p99), throughput
- Security: Auth model, data classification, compliance requirements
- Accessibility: WCAG 2.1 AA minimum, screen reader, keyboard nav
- Reliability: Uptime SLA, error handling, graceful degradation

### 6. UX & Design
- **Primary user flow**: Step-by-step walkthrough of the happy path
- **Key states**: Loading, empty, error, success, edge cases
- **Design references**: Link to Figma / wireframes (or describe if not yet designed)
- **Copy notes**: Any specific tone, labels, or error message guidance

### 7. Technical Considerations
Do NOT design the system â€” surface what engineering needs to know:
- Integration points and external APIs
- Data model changes (new entities, schema changes)
- Migration / backward compatibility requirements
- Performance or scaling constraints
- Security or privacy implications (PII handling, data retention)

### 8. Success Metrics
| Metric | Type | Baseline | Target | Measurement window |
|--------|------|----------|--------|-------------------|
| Primary NSM | Leading | | | 30 days post-launch |
| Secondary | Supporting | | | 90 days |
| Guardrail | Must not regress | | | Throughout |

Measurement plan: How and when metrics will be tracked. Who owns each.

### 9. Launch Plan
- **Rollout strategy**: Feature flag â†’ internal dogfood â†’ limited beta â†’ GA
- **Launch criteria**: Specific conditions that must be true before each phase
- **Rollback plan**: How to revert safely and under what conditions
- **Communication plan**: Who needs to know, when, through what channel

### 10. Open Questions
| Question | Owner | Needed by |
|----------|-------|-----------|
| | | |

## Output Format
Generate clean markdown ready to paste into Notion, Confluence, or Google Docs. Use tables for requirements. Prefer specific and measurable over vague and qualitative. Flag every assumption.

## Quality Checklist
Before finalising:
- [ ] Problem and "why now" are clearly articulated with data
- [ ] Success metrics have baselines and targets, not just directions
- [ ] Scope boundaries are explicit: in / out / future
- [ ] Every P0 requirement is testable â€” someone can verify if it is met
- [ ] Technical considerations are surfaced without over-specifying
- [ ] Dependencies and risks have owners
- [ ] Open questions are tracked, not buried
- [ ] A non-technical stakeholder can read it in under 15 minutes

## Common Pitfalls
- Solutioning in the problem statement â€” keep "what" and "why" separate from "how"
- Requirements that say "the system should be fast" â€” always add a number
- Missing guardrail metrics â€” every optimisation has a counter-metric
- PRD written after engineering has already started â€” use it to align, not record
