---
name: competitive-analysis
domain: product-management
description: Produce a structured competitive analysis with a feature matrix, positioning map narrative, whitespace gaps, and strategic recommendations.
when_to_use: Request mentions competitors, competitive landscape, market positioning, benchmark, feature comparison, or who else is in the market.
output: Competitive Analysis Report (Markdown with tables)
stage: discovery
---

## Purpose
Give the team a crisp, decision-grade view of who else plays, how they position, where the gaps are, and what nivi4AI should do about it.

## Steps
1. List 5–8 direct and adjacent competitors with one-line positioning each.
2. Build a feature matrix: rows = competitors, columns = 10–15 key capability dimensions. Use ✓ Full / ~ Partial / ✗ None.
3. Write a positioning narrative: price-vs-quality axes, who clusters together, who owns which segment.
4. Identify 3–5 whitespace gaps — capabilities no current player has or does well.
5. Draw strategic implications: where to attack, where to avoid, and one table-stakes feature that must be matched.
6. End with a recommended differentiation strategy in 2–3 sentences.

## Output template
```
# Competitive Analysis — {Product}

## Overview
Brief narrative of the competitive landscape.

## Competitor Profiles
| # | Player | Product | Segment | Positioning |
|---|--------|---------|---------|-------------|

## Feature Matrix
| Capability | {Comp A} | {Comp B} | {Comp C} | {Comp D} | Us |
|-----------|----------|----------|----------|----------|-----|

Legend: ✓ Full  ~ Partial  ✗ None

## Positioning Map
(Narrative: Price axis low→high, Value axis basic→premium)

## Whitespace Gaps
1. **Gap:** Description — implication for product strategy
2. ...

## Strategic Implications
- Table stakes (must match): ...
- Points of differentiation: ...
- Areas to avoid: ...

## Recommended Differentiation Strategy
```
