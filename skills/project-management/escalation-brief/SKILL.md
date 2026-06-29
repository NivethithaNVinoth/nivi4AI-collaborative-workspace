---
name: escalation-brief
domain: project-management
description: Produce a crisp escalation brief in BLUF format summarising the issue, business impact, options, recommendation, and the specific decision needed from leadership â€” readable in under 2 minutes.
when_to_use: The user needs to escalate an issue, brief leadership on a blocker, request a decision, communicate a risk that has materialised, or write an executive escalation document.
argument-hint: "[issue description, business impact, and decision needed]"
retrieval_intent: blocker, issue, impact, options, decision needed, urgency, escalation
output: Escalation Brief (Markdown)
stage: delivery
---

# Escalation Brief

An escalation brief gets the right decision from the right person in the shortest time. The discipline is BLUF â€” Bottom Line Up Front. The most important thing goes in sentence one, not at the end after three paragraphs of context. Executives who read escalations backwards (conclusion first) should get the same answer.

## When to Use
- A blocker has materialised that requires a decision above the PM's authority
- Budget needs to be exceeded or reallocated
- A risk has escalated from Amber to Red
- A dependency has not been delivered and the project will miss a milestone without intervention
- A stakeholder conflict needs resolution by a senior leader
- Anytime "I need you to decide something" is the honest message

## The BLUF Principle
**B**ottom **L**ine **U**p **F**ront.

Structure: Decision needed â†’ Context â†’ Evidence â†’ Options â†’ Recommendation.
Never: Background â†’ Problem â†’ Analysis â†’ Conclusion â†’ Oh by the way, we need a decision.

The busy executive reads the first two sentences. Write for that reader.

## Escalation Brief Formats

### Format 1: One-Paragraph Escalation (Slack / Email)
For: Low-formality, fast decisions, known stakeholders
Length: 3-5 sentences

> [DECISION NEEDED BY DATE]: [One sentence on what is needed].
> [Issue]: [What happened and when].
> [Impact]: [Business consequence if unresolved â€” specific numbers].
> [Options]: [Option A] or [Option B].
> [Recommendation]: We recommend [Option] because [one reason].

### Format 2: Structured Brief (Meeting or Formal Document)
For: Steering committee, cross-functional, complex situation
Length: 1 page maximum

## Framework: Structured Escalation Brief

### Section 1: Header
| Field | Content |
|-------|---------|
| Escalation ID | ESC-[NNN] |
| Date | |
| Raised by | [PM Name] |
| Escalating to | [Role / Name] |
| Decision needed by | [Specific date â€” and why that date matters] |
| Priority | Critical / High / Medium |

### Section 2: Bottom Line (2 sentences)
Sentence 1: What decision or action is needed?
Sentence 2: What happens if this is not resolved by [date]?

Example: "We need approval to engage an emergency contractor at $X/week to recover the 3-week schedule slip caused by [dependency failure]. Without this approval by [date], the Q3 launch date cannot be met and [revenue/customer impact]."

### Section 3: Situation (Facts Only â€” 3-4 sentences)
- What happened? (facts, dates, specific)
- When did it occur or when was it discovered?
- Who is affected?
- What has been done so far?

### Section 4: Business Impact
Be specific. Vague impacts are not escalation-worthy.

| Impact dimension | Specific impact |
|-----------------|----------------|
| Schedule | Launch delayed from [date] to [date] â€” [X weeks slip] |
| Revenue | [$X] in committed contracts at risk if launch misses [date] |
| Customer | [X customers] in beta will be notified of delay |
| Reputation / Brand | [Specific risk, e.g., public commitment made at event on date] |
| Cost | Emergency mitigation will cost [$X] vs. [$Y] impact of delay |

### Section 5: Options
Limit to 3. Every option must have an honest trade-off.

| | Option A | Option B | Option C (Do nothing) |
|-|---------|---------|----------------------|
| Description | | | |
| Cost | $X | $X | $0 |
| Schedule impact | Recovers X weeks | Recovers Y weeks | Slips Z weeks |
| Quality / Risk | | | |
| Pros | | | |
| Cons | | | |

### Section 6: Recommendation
**Recommended option:** [A / B / C]
**Rationale:** [2-3 sentences â€” be direct, not hedged]
**What the PM team can action without approval:** [What you are already doing]
**What requires the escalatee's authority:** [The specific decision]

### Section 7: Decision Record
| Field | Content |
|-------|---------|
| Decision | |
| Decision maker | |
| Date | |
| Conditions / notes | |

## Quality Checklist
- [ ] First two sentences contain the decision needed and the consequence of delay
- [ ] Business impact uses specific numbers, not "significant" or "material"
- [ ] All three options have honest trade-offs (no straw man options)
- [ ] Recommendation is explicit â€” PM should have a point of view
- [ ] Decision needed by date is stated with a reason (why that date, not an earlier one)
- [ ] Total reading time is under 2 minutes

## Common Pitfalls
- Burying the ask: escalation brief that builds to a request buried in paragraph 4 â€” executives stop reading
- Vague impact: "significant business risk" is not an escalation; "$200k revenue at risk" is
- No recommendation: presenting options without a view puts unfair burden on the escalatee
- Escalating too late: if you have been sitting on an Amber risk for 3 weeks, escalating at Red looks like poor PM
- Escalating everything: if every decision goes to the escalation level, leadership loses trust in the PM
