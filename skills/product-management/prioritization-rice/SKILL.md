---
name: prioritization-rice
domain: product-management
description: Score and rank a set of initiatives using the RICE framework (Reach, Impact, Confidence, Effort) with a clear recommendation.
when_to_use: The request is about prioritising features/initiatives, deciding what to do first, or trade-offs across a backlog.
retrieval_intent: initiatives, features, effort estimates, business impact, customer reach
output: RICE Prioritization Table with Recommendation (Markdown)
stage: planning
---

## Purpose
Replace gut-feel prioritisation with a defensible, repeatable scoring model that
surfaces the highest-value / lowest-effort work first.

## Steps
1. List all initiatives to be scored.
2. Estimate Reach (users/quarter), Impact (0.25-3), Confidence (%), Effort (person-months).
3. RICE score = (Reach x Impact x Confidence) / Effort.
4. Rank highest to lowest; apply qualitative overlays (strategy, dependencies).
5. Recommend top 3 to fund in next cycle with rationale.

## Output template
```
# RICE Prioritisation â€” <Backlog/Initiative Set>
| Initiative | Reach | Impact | Confidence | Effort | RICE Score |
## Qualitative overlays
## Recommended top 3 and rationale
```
