---
name: change-request
domain: project-management
description: Document a formal change request with impact analysis on scope, cost, and timeline, options assessment, recommendation, and sponsor decision record.
when_to_use: The user needs to raise or document a scope change, change request, change control, impact of a proposed change, or get sponsor decision on a change to the project baseline.
argument-hint: "[description of the proposed change and why it is being requested]"
retrieval_intent: proposed change, scope impact, cost impact, time impact, decision needed, change control
output: Change Request (Markdown)
stage: delivery
---

# Change Request

Every change to a project baseline â€” scope, schedule, or budget â€” must be a conscious decision with known trade-offs. A change request prevents scope creep by making the cost of every addition visible and requiring explicit approval. It also protects the PM: every agreed change is documented.

## When to Use
- A stakeholder requests additional scope not in the original charter
- An external event forces a change to schedule or budget
- A technical discovery means the original approach is no longer viable
- Before agreeing to any verbal commitment to add or change scope

## Change Request Lifecycle
1. **Raise**: PM or stakeholder identifies a change
2. **Impact assess**: PM analyses scope/cost/time impact
3. **Review**: Change Control Board (CCB) or sponsor reviews
4. **Decision**: Approve / Reject / Defer
5. **Implement**: If approved, update baseline documents
6. **Close**: Record decision in RAID log and CR register

## Framework: Change Request Document

### Section 1: Change Request Header
| Field | Content |
|-------|---------|
| CR ID | CR-[NNN] |
| Project | |
| Date raised | |
| Raised by | |
| Priority | Critical / High / Medium / Low |
| Category | Scope / Schedule / Budget / Technical / Regulatory |

### Section 2: Change Description
**What is being proposed?** (2-3 sentences, specific and factual)

**Origin**: Why is this change being requested? (stakeholder request, regulatory change, technical discovery, market change)

**What is the status quo?** What is currently in the approved baseline?

### Section 3: Impact Analysis
This is the most important section. Be specific â€” vague impacts are not useful.

**Scope impact:**
- What is added, removed, or changed?
- Which requirements or user stories are affected?
- Are there downstream dependencies?

**Schedule impact:**
| | Current baseline | With this change | Delta |
|-|-----------------|-----------------|-------|
| Phase X end | [Date] | [Date] | +X weeks |
| Overall delivery | [Date] | [Date] | +X weeks |

**Budget impact:**
| | Current baseline | With this change | Delta |
|-|-----------------|-----------------|-------|
| Phase X cost | $X | $X | +$X |
| Total project cost | $X | $X | +$X |

**Quality / Risk impact:**
What risks does this change introduce? Does it improve or worsen quality?

**Do-nothing impact:**
What happens if this change is NOT made? (Sometimes doing nothing is the right answer.)

### Section 4: Options
Present 2-3 options. Include a "do nothing" option where relevant.

| | Option A: [Name] | Option B: [Name] | Option C: Do nothing |
|-|-----------------|-----------------|---------------------|
| Description | | | |
| Schedule impact | | | |
| Cost impact | | | |
| Risk level | H/M/L | H/M/L | H/M/L |
| Pros | | | |
| Cons | | | |

### Section 5: Recommendation
**Recommended option:** [A / B / C] â€” and why.

State the PM's position clearly. Do not list options without a recommendation.

### Section 6: Decision Record
| Field | Content |
|-------|---------|
| Decision | Approved / Rejected / Deferred |
| Decision maker | [Name and role] |
| Date | |
| Conditions | [Any conditions attached to approval] |
| Baseline updated | Yes / No |
| Notes | |

## Quality Checklist
- [ ] Impact analysis is specific â€” numbers, not "significant impact"
- [ ] All three dimensions assessed: scope, cost, AND schedule
- [ ] "Do nothing" option is included and its impact is honest
- [ ] Recommendation is explicit â€” PM should not leave the decision without a point of view
- [ ] Decision record is completed and filed before any work begins on the change
- [ ] Baseline documents (charter, plan) are updated after approval

## Common Pitfalls
- Verbal change approvals: if it is not written down and signed, it did not happen
- Impact analysis only covers scope: cost and schedule impacts are equally important
- No recommendation: presenting options without a point of view pushes the decision to someone with less context
- Raising CRs after the work has started: changes need approval before implementation
