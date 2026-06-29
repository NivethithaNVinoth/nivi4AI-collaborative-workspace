---
name: jtbd-framework
domain: product-management
description: Apply the Jobs-to-be-Done framework to understand what customers are really trying to accomplish. Produces job statements, desired outcomes, and opportunity scoring to guide product decisions.
when_to_use: Request is to understand customer motivation, why users hire/fire a product, unmet needs, or opportunity gaps beyond surface-level feature requests.
retrieval_intent: jobs to be done, customer motivation, desired outcomes, opportunity scoring, why customers switch, unmet needs, JTBD
output: JTBD Analysis â€” job map, outcome statements, opportunity scores (Markdown)
stage: discovery
---

## Purpose
Move beyond what users say they want to what they are actually trying to accomplish.
Based on Tony Ulwick Outcome-Driven Innovation and Bob Moesta switch interviews.

## Key concepts
- Job statement: [Verb] + [Object] + [Context/Qualifier]
- Desired outcome: [Direction] + [Metric] + [Object] + [Context]
- Opportunity score: Importance + (Importance - Satisfaction). Score > 10 = underserved.

## Steps
1. Define the main job and 2 ancillary jobs.
2. Write 6-10 desired outcome statements.
3. Score each: Importance (1-10) and Satisfaction (1-10).
4. Calculate opportunity scores; highlight top 3 underserved.
5. Identify push/pull/anxiety/habit switch forces.
6. Recommend product bets aligned to top opportunities.

## Output template
```
# JTBD Analysis
## 1. Main Job Statement
## 2. Emotional & Social Jobs
## 3. Desired Outcomes (scored table)
## 4. Top 3 Underserved Outcomes
## 5. Switch Forces
## 6. Product Opportunity Bets
```