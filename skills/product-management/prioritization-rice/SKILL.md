---
name: prioritization-rice
domain: product-management
description: Score and rank a backlog of features or initiatives using RICE, ICE, weighted scoring, or Value vs Effort. Produces a prioritized list with rationale and stakeholder-ready summary.
when_to_use: The user needs to prioritise features or initiatives, decide what to build first, run a trade-off discussion, justify de-prioritisation, or prepare a ranked backlog for sprint planning or roadmap review.
argument-hint: "[list of features or initiatives to prioritize]"
retrieval_intent: initiatives, features, effort estimates, business impact, customer reach, backlog
output: Prioritised Backlog with Scoring (Markdown)
stage: deliver
---

# Prioritization

Prioritisation replaces gut-feel debates with a repeatable, defensible ranking. The goal is not a perfect score â€” it is a forcing function for explicit trade-off conversations.

## When to Use
- Quarterly planning: ranking initiatives for the next roadmap cycle
- Sprint planning: deciding which stories to commit to this sprint
- Stakeholder alignment: justifying why something is or is not in scope
- Resource constraints: deciding what to cut when capacity is reduced
- Competing asks: multiple stakeholders want conflicting things

## Frameworks

### Framework 1: RICE
Best for: Growth-focused teams with measurable reach data.

`Score = (Reach Ã— Impact Ã— Confidence) / Effort`

| Factor | How to score |
|--------|-------------|
| **Reach** | Number of users or customers affected per quarter (absolute number) |
| **Impact** | 0.25 minimal / 0.5 low / 1 medium / 2 high / 3 massive |
| **Confidence** | 100% high / 80% medium / 50% low (your certainty in R and I estimates) |
| **Effort** | Person-months of work across all functions |

Higher RICE score = higher priority.

### Framework 2: ICE
Best for: Fast estimation when you don't have reach data.

`Score = Impact Ã— Confidence Ã— Ease`

Each factor scored 1â€“10:
- **Impact**: How much will this move the needle on our north star?
- **Confidence**: How sure are we that impact and effort are correct?
- **Ease**: How easy is implementation? (10 = trivial, 1 = months of work)

### Framework 3: Weighted Scoring
Best for: Strategic initiatives with multiple competing criteria.

Define 4â€“6 criteria with weights summing to 100%:

| Criterion | Weight | Scoring guide |
|-----------|--------|--------------|
| Strategic alignment | 25% | Does this advance a stated company goal? |
| User impact | 25% | How significantly does this improve user experience? |
| Revenue potential | 20% | Direct or indirect revenue impact |
| Technical feasibility | 15% | How complex / risky is implementation? |
| Time sensitivity | 15% | Is there a window of opportunity closing? |

Score each item 1â€“5 on every criterion. Weighted score = Î£(score Ã— weight).

### Framework 4: Value vs. Effort (2Ã—2)
Best for: Quick visual communication to stakeholders.

Plot each item:
- **Quick Wins** (High value, Low effort) â†’ Do first, always
- **Big Bets** (High value, High effort) â†’ Plan carefully, sequence intentionally
- **Fill-ins** (Low value, Low effort) â†’ Do if capacity allows
- **Money Pits** (Low value, High effort) â†’ Deprioritise, explain why

## Workflow

### Step 1: Clarify scope
- What is the list of items? (features, bugs, experiments, initiatives)
- What time horizon? (this sprint, this quarter, this year)
- What constraints exist? (team capacity, hard deadlines, dependencies)
- What is the primary goal? (growth, retention, revenue, quality, debt)

### Step 2: Choose framework
- RICE: you have user reach data and want objective scoring
- ICE: you need fast estimates and don't have reach data
- Weighted scoring: strategic initiatives, multiple competing criteria
- Value vs. Effort: quick alignment workshop, visual output needed

### Step 3: Score every item
For each item:
- Score each dimension with a one-line rationale (numbers alone are meaningless)
- Flag assumptions and state confidence
- Note hard dependencies that constrain ordering regardless of score

### Step 4: Rank and apply overlays
After scoring:
- Sort by composite score
- Apply qualitative overlays: regulatory requirements, strategic mandates, dependencies
- Group into tiers: Must Do â†’ Should Do â†’ Could Do â†’ Won't Do (MoSCoW)

### Step 5: Communicate the output
Stakeholder-ready summary:
- Top 3 priorities with one-sentence rationale each
- What is explicitly NOT being done and why
- Key assumptions that, if wrong, would change the ranking
- Close calls (items where small changes in assumptions flip the rank)

## Output Format
Generate a scored table + ranked summary + what-we-are-not-doing section.

| Initiative | Reach | Impact | Confidence | Effort | RICE | Tier |
|-----------|-------|--------|------------|--------|------|------|

## Quality Checklist
- [ ] Every item is scored, not just the top ones
- [ ] Each score has a one-line rationale
- [ ] Assumptions are stated and visible
- [ ] Dependencies are mapped (don't schedule a blocked item first)
- [ ] A "won't do" list exists and is explained
- [ ] The output is shareable with stakeholders without additional explanation

## Common Pitfalls
- Scoring to confirm a decision already made â€” score before deciding
- Ignoring dependencies â€” a high-RICE item blocked by another item cannot go first
- One framework for everything â€” match the framework to the decision type
- Precise numbers masking vague thinking â€” a score of 2.7 is not more accurate than "medium"
