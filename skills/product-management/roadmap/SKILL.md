---
name: roadmap
domain: product-management
description: Build an outcome-oriented product roadmap in Now/Next/Later or quarterly format, organised by themes with OKR alignment, dependencies, and stakeholder-ready narrative.
when_to_use: The user needs to create or update a product roadmap, sequence what to build, communicate product direction over time, or present roadmap trade-offs to stakeholders.
argument-hint: "[product area, goals, and initiatives to sequence]"
retrieval_intent: product themes, strategic goals, feature backlog, OKRs, release sequence, roadmap
output: Product Roadmap (Markdown)
stage: deliver
---

# Product Roadmap

A roadmap communicates direction and sequencing without over-committing to dates. It gives stakeholders confidence in the plan without locking engineering into a Gantt chart. The best roadmaps answer "why this, why now" for every item â€” not just "what and when."

## When to Use
- Quarterly planning cycles
- Kickoff of a new product or major initiative
- Stakeholder review or board presentation
- When the current roadmap needs a reset or re-prioritisation
- When communicating what is NOT being built and why

## Roadmap Formats

### Format 1: Now / Next / Later (Recommended for most teams)
Avoids false date precision. Communicates direction without overpromising.
- **Now** (current quarter): committed, staffed, in progress or ready to start
- **Next** (next 1-2 quarters): defined, prioritised, but not yet staffed
- **Later** (6-18 months out): directional, subject to change, not detailed

### Format 2: Quarterly (Q1 / Q2 / Q3 / Q4)
Use when stakeholders or contracts require date-level commitments. Build in buffer â€” 80% capacity maximum per quarter. Mark confidence level per item: High / Medium / Low.

### Format 3: Theme-Based (No dates)
Best for early-stage products or when priorities are highly fluid. Groups items by strategic theme rather than time. Useful for external communication where committing to dates is risky.

## Framework: Building the Roadmap

### Step 1: Start with strategy
Anchor every roadmap item to a strategic goal or OKR:
- What are the company's top 3-5 bets this year?
- What is the product's contribution to each?
- Which items are must-do (committed) vs. want-to-do (aspirational)?

### Step 2: Define themes (not feature lists)
Group work into 3-5 outcome themes. Themes describe the problem being solved or the user outcome being delivered â€” not the features themselves.

Bad: "Add dark mode, fix profile page, improve search"
Good: "Personalisation & accessibility" | "Core workflow reliability"

For each theme:
- **Theme name**: Outcome-oriented phrase
- **Strategic goal it serves**: Which OKR or company priority?
- **Success metric**: How will you know the theme is delivering value?
- **Key initiatives**: 2-5 items that contribute to this theme

### Step 3: Sequence by value and dependency
For each initiative, assess:
- **Value**: RICE or weighted score (from prioritisation skill)
- **Dependencies**: What must be done first?
- **Confidence**: How well-understood is the scope?

Assign to Now/Next/Later or Q1/Q2/Q3/Q4 based on value + readiness + dependency chain.

### Step 4: Add the "why not" narrative
For every item NOT on the roadmap that stakeholders expect:
- Acknowledge it explicitly
- Give the honest reason: capacity, lower priority, dependency, strategic misalignment
- Indicate when it might be revisited

### Step 5: Flag risks and dependencies
| Initiative | Depends on | External dependency | Confidence | Risk |
|-----------|------------|-------------------|------------|------|
| | | | H/M/L | |

## Output Template

```
# Product Roadmap â€” [Product Name]
**Last updated:** [Date]  **Owner:** [Name]

## Vision
[One sentence: what the product will achieve in 12-18 months]

## Strategic themes
[Brief rationale tying themes to company goals]

---

## NOW â€” [Quarter or Month Range]
**Goal:** [What this period achieves]

### Theme: [Theme 1]
- [Initiative A] â€” [1-line rationale] â€” Confidence: High
- [Initiative B] â€” [1-line rationale] â€” Confidence: Medium

### Theme: [Theme 2]
- ...

---

## NEXT â€” [Quarter or Month Range]
[Same structure, less detail]

---

## LATER â€” [6-18 months]
[Directional themes only â€” no initiative-level detail]

---

## Not doing (and why)
| Item | Reason | When revisited |
|------|--------|---------------|

## Risks & dependencies
[Key risks that could shift the roadmap]
```

## Quality Checklist
- [ ] Every item is tied to a strategic goal or OKR
- [ ] Themes are outcome-oriented, not feature-lists
- [ ] Now items are committed and staffed (or nearly so)
- [ ] Later items are clearly marked as directional
- [ ] "Not doing" section exists and is honest
- [ ] Dependencies are surfaced and sequenced correctly
- [ ] A stakeholder who has not been in the planning sessions can understand the roadmap in 5 minutes

## Common Pitfalls
- Roadmap as a feature catalogue with dates â€” use themes and outcomes instead
- Everything in "Now" â€” ruthless sequencing is the point of a roadmap
- Missing "not doing" â€” the best roadmaps are as clear about what's excluded as what's included
- Date precision theatre â€” Q3 is more honest than "July 15" when both are uncertain
- Roadmap written once, never updated â€” treat it as a living document reviewed every 4-6 weeks
