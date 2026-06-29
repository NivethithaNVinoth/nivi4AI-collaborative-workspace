---
name: retrospective
domain: project-management
description: Facilitate and document a sprint or project retrospective with structured format options (Start/Stop/Continue, 4Ls, Sailboat), action items with owners, and previous-action review.
when_to_use: The user needs to run or document a retrospective, capture lessons learned, generate improvement actions, or close out a sprint or project with a structured reflection.
argument-hint: "[sprint number or project name, and any key events or themes from the period]"
retrieval_intent: team feedback, sprint outcomes, process improvements, blockers, successes, lessons learned
output: Retrospective Summary (Markdown)
stage: delivery
---

# Retrospective

A retrospective creates a safe, structured space to learn from experience. The value is not in the discussion â€” it is in the documented actions and the follow-through. Teams that run retros without action items are venting, not improving.

## When to Use
- End of every sprint (agile teams running 2-week cycles)
- End of a project or major milestone
- After a significant incident or outage
- When team health feels off (trust, communication, pace)
- Quarterly, even without a specific trigger, to prevent drift

## Retrospective Formats

### Format 1: Start / Stop / Continue (Default â€” Simple and Direct)
- **Start**: Things the team should begin doing
- **Stop**: Things the team should stop doing
- **Continue**: Things working well that must be preserved

Best for: Teams new to retros, or when you want quick, actionable output.

### Format 2: 4Ls (Nuanced â€” Good for Complex Periods)
- **Liked**: What went well
- **Learned**: What you discovered
- **Lacked**: What was missing or insufficient
- **Longed for**: What you wished you had

Best for: Project retrospectives, or when the team needs to surface both technical and process insights.

### Format 3: Sailboat (Visual â€” Good for Team Alignment)
- **Wind** (helps): What is driving us forward?
- **Anchor** (holds back): What is slowing us down?
- **Rocks** (risks): What dangers are ahead?
- **Sun / Island** (goals): What are we sailing toward?

Best for: Workshop settings, distributed teams, when you need a shared visual metaphor.

### Format 4: Mad / Sad / Glad (Emotion-Focused â€” Good After Difficult Periods)
- **Mad**: What frustrated the team?
- **Sad**: What disappointed or let people down?
- **Glad**: What made the team proud or happy?

Best for: After a difficult sprint, post-incident, or when trust or morale needs attention.

## Framework: Running the Retrospective (5 Steps)

### Step 1: Set Context
- What period does this retrospective cover?
- Who attended?
- Any significant events that need acknowledgement upfront? (outage, launch, team change)
- Ground rules: safe space, no blame, focus on systems not individuals

### Step 2: Gather Input (Individual â†’ Group)
1. Silent individual writing: 5-10 minutes (prevents groupthink)
2. Share and group: collect all inputs, group similar items into themes
3. Dot voting: each team member gets 3-5 votes to prioritise themes
4. Focus discussion on the top 2-3 themes only (avoid shallow coverage of everything)

### Step 3: Discuss Prioritised Themes
For each top theme:
- Root cause: Why did this happen? (Ask "why" 3 times â€” not to blame, to find the system)
- Impact: How did this affect the team, the product, or the customer?
- What would "fixed" look like?

### Step 4: Define Action Items
Every action must have:
- **What**: Specific, observable action (not "communicate better")
- **Who**: Single owner (not "the team")
- **When**: Specific date or sprint

| Action | Owner | Due | Status |
|--------|-------|-----|--------|
| | | | Not started |

Limit to 3-5 actions per retrospective. More than 5 and nothing gets done.

### Step 5: Review Previous Actions
Start of every retro â€” before adding new actions, review last sprint's:
| Previous action | Owner | Status | Notes |
|----------------|-------|--------|-------|
| | | Done / Partial / Not done | |

If items are "not done" for 2+ consecutive retros, either escalate or close and accept.

## Output Template

```
# Retrospective â€” [Sprint N / Project Name] | [Date]
**Participants:** [Names]
**Format:** [Start/Stop/Continue / 4Ls / Sailboat]
**Facilitated by:** [Name]

## Context
[Significant events this period â€” 2-3 sentences]

## What Went Well
- [Theme or item]

## What Did Not Go Well
- [Theme or item]

## What To Change â€” Actions
| Action | Owner | Due |
|--------|-------|-----|
| | | |

## Previous Actions â€” Status Review
| Action | Owner | Status |
|--------|-------|--------|

## Themes for future retros
[Patterns emerging over multiple sprints worth tracking]
```

## Quality Checklist
- [ ] Every participant had a voice (not just the loudest people)
- [ ] Both positives and areas for improvement are documented
- [ ] Action items have single owners and specific due dates
- [ ] Actions are concrete ("Run daily async standup instead of meeting" not "improve communication")
- [ ] Previous actions are reviewed and closed or escalated
- [ ] Output is written up and shared within 24 hours

## Common Pitfalls
- Retro as a complaint session: always close with concrete actions
- "The team" as action owner: one person must be accountable
- Repeating the same retro format every sprint: vary it to surface different insights
- Not reviewing previous actions: undermines credibility and improvement culture
- Skipping retros when busy: the sprints that most need a retro are the ones where the team is too busy to run one
