---
name: discovery-brief
domain: product-management
description: Synthesise user interviews, surveys, support tickets, and analytics into a structured discovery brief with validated problem statements, ranked opportunity areas, and recommended solution directions.
when_to_use: The user needs to synthesise user research, define the problem space, summarise discovery findings, identify opportunity areas, or frame insights for stakeholders before solution design begins.
argument-hint: "[paste interview notes, survey data, support tickets, or describe the research you have]"
retrieval_intent: user interviews, survey results, analytics, pain points, opportunity areas, discovery
output: Discovery Brief (Markdown)
stage: discover
---

# Discovery Brief

Discovery synthesises raw evidence into a shared understanding of the problem space. It answers: "What problem are we actually solving, for whom, and how urgent is it?" A discovery brief prevents the team from jumping to solutions before the problem is fully understood.

## When to Use
- After user interviews, surveys, or usability tests â€” before solution design
- When the team disagrees on what problem to solve
- When a product area is not performing and you need to understand why
- Before starting a new initiative to validate the opportunity
- When qualitative research needs to be communicated to stakeholders

## Supported Research Inputs
- User interviews (raw notes, transcripts)
- Surveys (open-ended responses, rating data)
- Support tickets and NPS verbatims
- App store reviews
- Session recordings / usability test notes
- Analytics and funnel data
- Sales calls / win-loss interviews

## Framework: Discovery Synthesis (5 Steps)

### Step 1: Organise Raw Data
Before synthesising, describe what you have:
- **Sources**: What types of research?
- **Sample size**: How many participants / data points?
- **Segments represented**: Which user types, company sizes, use cases?
- **Timeframe**: When was this data collected?
- **Notable gaps**: Who is missing from the sample?

### Step 2: Code and Theme
Extract observations from raw data. Group into themes:

| Theme | Frequency | Sentiment | Representative quote |
|-------|-----------|-----------|---------------------|
| [Theme name] | X of Y participants | Negative/Mixed/Positive | "..." |

Categorise themes:
- **Pain Points**: What is broken, frustrating, or missing?
- **Unmet Needs**: What users want but cannot get today?
- **Workarounds**: What hacks or manual processes do they use? (gold mine for unmet needs)
- **Bright Spots**: What is already working well? (do not break these)
- **Surprises**: Unexpected findings that challenge assumptions

### Step 3: Prioritise Insights
Score each insight:

| Insight | Prevalence (1-5) | Severity (1-5) | Actionability (1-5) | Priority Score |
|---------|-----------------|---------------|--------------------|----|
| | | | | Prevalence Ã— Severity Ã— Actionability |

- **Prevalence**: How many users mentioned it? (1=rare, 5=universal)
- **Severity**: How painful? (1=minor annoyance, 5=deal-breaker, causes churn)
- **Actionability**: Can we address it? (1=out of our control, 5=clear path forward)

### Step 4: Write Validated Problem Statements
Use the Jobs-to-be-Done (JTBD) format for each top insight:

> When [context/situation], [user type] wants to [motivation/goal] but [obstacle/struggle], which makes them feel [emotional state].

Or the classic problem statement format:
> [User type] needs a way to [job to be done] because [current solution is failing them in this way].

Distinguish between validated problems (multiple data points, high severity) and hypotheses (single data point, anecdotal).

### Step 5: Define Opportunity Areas and Solution Directions

**Opportunity areas** (ranked by priority score):
Each opportunity should be specific enough to generate solution ideas, not so specific that it pre-selects the solution.

Too narrow: "Users need a button to export to CSV on the dashboard"
Right level: "Users struggle to share insights from the platform with non-users"
Too broad: "Users want better data"

For each top opportunity, propose 2-3 solution directions to explore â€” not final solutions, but directions worth investigating:
- Direction A: [Approach and hypothesis]
- Direction B: [Alternative approach]
- Direction C: [Adjacent / out-of-the-box approach]

## Output Format

Generate a complete discovery brief with:
1. Research summary (what was studied, by whom, when)
2. Themed findings table with quotes
3. Prioritised insight matrix
4. Validated problem statements (top 3)
5. Ranked opportunity areas
6. Proposed solution directions
7. Confidence and limitations statement

## Quality Checklist
- [ ] Raw data sources are clearly described with sample size
- [ ] Every theme has at least one supporting quote
- [ ] Findings are separated from interpretations ("users said X" vs "this means Y")
- [ ] Problem statements are user-centred, not solution-forward
- [ ] Opportunity areas are specific enough to generate different solutions
- [ ] Sample gaps and biases are noted (if you only spoke to power users, say so)
- [ ] Confidence level is stated (how certain are these findings?)

## Tips for Better Synthesis
- Look for contradictions â€” users who say opposite things often reveal a segmentation opportunity
- Pay attention to workarounds â€” what people hack together reveals unmet needs better than what they ask for
- Note what users DO vs. what they SAY â€” behavioural evidence outweighs stated preferences
- Triangulate: if the same theme appears in interviews, surveys, AND support tickets, it is high confidence
