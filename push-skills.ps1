# push-skills.ps1
# Creates all 20 skills (10 per domain) directly on Desktop and pushes to GitHub
# Run from: C:\Users\ADMIN\Desktop\nivi4ai-collab
# Usage: powershell -ExecutionPolicy Bypass -File push-skills.ps1

$root = "C:\Users\ADMIN\Desktop\nivi4ai-collab"
Set-Location $root

function Write-Skill($path, $content) {
    $dir = Split-Path $path -Parent
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Set-Content -Path $path -Value $content -Encoding UTF8
    Write-Host "  wrote $path" -ForegroundColor Green
}

Write-Host "`n=== Writing Product Management Skills ===" -ForegroundColor Cyan

# ── PM 1: PRD ──
Write-Skill "$root\skills\product-management\prd\SKILL.md" @'
---
name: prd
domain: product-management
description: Build a structured Product Requirements Document connecting problem, users, solution, scope, and success metrics.
when_to_use: The request is to write a PRD, spec a feature/product for engineering, or turn discovery into an engineering-ready document.
retrieval_intent: problem statement, target users, solution scope, success metrics, constraints for the feature
output: Product Requirements Document (Markdown)
stage: requirements
---

## Purpose
Move from scattered notes to a single source of truth that aligns stakeholders and gives
engineering enough context to build the right thing.

## Steps
1. Problem & why now: the customer problem and the business case.
2. Target users / personas and the jobs they are trying to get done.
3. Goals & non-goals: what success looks like; what is explicitly out of scope.
4. Solution overview: the approach, key flows, and major requirements.
5. Success metrics: leading and lagging indicators with targets.
6. Risks, dependencies, and open questions.

## Output template
```
# <Feature/Product> PRD
## 1. Problem & why now
## 2. Target users & jobs-to-be-done
## 3. Goals / Non-goals
## 4. Solution overview
## 5. Requirements (high level)
## 6. Success metrics
## 7. Risks, dependencies, open questions
```
'@

# ── PM 2: Market Research ──
Write-Skill "$root\skills\product-management\market-research\SKILL.md" @'
---
name: market-research
domain: product-management
description: Produce a structured market research brief covering market sizing, competitors, trends, and opportunity for a proposed product or feature.
when_to_use: The request is about understanding the market, competitors, demand, TAM/SAM/SOM, or whether an opportunity is worth pursuing.
retrieval_intent: market size, competitors, trends, customer segments, demand signals
output: Market Research Brief (Markdown)
stage: discovery
---

## Purpose
Give the team a fact-based foundation before committing to building. Prevent building
the right product for the wrong market (or vice versa).

## Steps
1. Define the market segment and geography.
2. Size the opportunity: TAM → SAM → SOM with sources.
3. Map the top 3-5 competitors: positioning, pricing, strengths, weaknesses.
4. Identify key trends driving or threatening the space.
5. Summarise the opportunity and recommended next step.

## Output template
```
# Market Research Brief — <Product/Feature>
## Market definition & segment
## Market sizing (TAM / SAM / SOM)
## Competitor landscape
| Competitor | Positioning | Price | Strengths | Weaknesses |
## Key trends
## Opportunity summary & recommendation
```
'@

# ── PM 3: User Story ──
Write-Skill "$root\skills\product-management\user-story\SKILL.md" @'
---
name: user-story
domain: product-management
description: Convert requirements into development-ready user stories in Mike Cohn format with Gherkin acceptance criteria.
when_to_use: The request is to write user stories, break a PRD/requirement into backlog items, or define acceptance criteria.
retrieval_intent: user personas, features, requirements, acceptance criteria, definition of done
output: User Stories with Acceptance Criteria (Markdown)
stage: requirements
---

## Purpose
Translate product intent into discrete, testable, developer-ready backlog items with
clear acceptance criteria that remove ambiguity.

## Steps
1. Identify the persona(s) from the PRD or context.
2. Break the feature into the smallest independently deliverable slices.
3. Write each as: As a <persona>, I want <capability>, so that <benefit>.
4. Add Gherkin AC: Given / When / Then.
5. Flag dependencies or shared components.

## Output template
```
# User Stories — <Feature>
## Story 1: <title>
**As a** <persona> **I want** <action> **so that** <outcome>
**Acceptance criteria**
- Given ... When ... Then ...
**Estimate:** S/M/L  **Depends on:** —
```
'@

# ── PM 4: Prioritization (RICE) ──
Write-Skill "$root\skills\product-management\prioritization-rice\SKILL.md" @'
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
# RICE Prioritisation — <Backlog/Initiative Set>
| Initiative | Reach | Impact | Confidence | Effort | RICE Score |
## Qualitative overlays
## Recommended top 3 and rationale
```
'@

# ── PM 5: Roadmap ──
Write-Skill "$root\skills\product-management\roadmap\SKILL.md" @'
---
name: roadmap
domain: product-management
description: Produce an outcome-oriented product roadmap organised by now / next / later with themes and success measures.
when_to_use: The request is about sequencing what to build, a roadmap, release themes, or communicating direction over time.
retrieval_intent: product themes, strategic goals, feature backlog, OKRs, release sequence
output: Product Roadmap (Markdown)
stage: planning
---

## Purpose
Communicate direction and sequence without over-committing to dates. Give stakeholders
confidence in the plan without locking engineering into a Gantt chart.

## Steps
1. State the product vision and key strategic bets.
2. Group features into themes (not lists of features).
3. Assign to Now (<3 months), Next (3-6 months), Later (6-18 months).
4. Define the success metric for each theme.
5. Call out key dependencies and risks.

## Output template
```
# Product Roadmap — <Product Name>
## Vision
## Strategic themes
### Now (0-3 months)
### Next (3-6 months)
### Later (6-18 months)
## Dependencies & risks
```
'@

# ── PM 6: Competitive Analysis ──
Write-Skill "$root\skills\product-management\competitive-analysis\SKILL.md" @'
---
name: competitive-analysis
domain: product-management
description: Deliver a side-by-side competitive analysis with feature matrix, positioning map, and strategic gaps to exploit.
when_to_use: The request is to compare our product against competitors, understand differentiation, or identify whitespace opportunities.
retrieval_intent: competitor features, pricing, positioning, differentiation, market gaps
output: Competitive Analysis Report (Markdown)
stage: discovery
---

## Purpose
Expose gaps and opportunities by understanding the competitive landscape deeply —
not just what others build, but how they position and who they target.

## Steps
1. Identify 3-5 direct and 2-3 indirect competitors.
2. Build a feature comparison matrix (must-have vs differentiators).
3. Map positioning: price vs quality, niche vs broad, etc.
4. Identify whitespace: what no competitor does well.
5. Recommend 2-3 strategic moves.

## Output template
```
# Competitive Analysis — <Product/Feature>
## Competitor overview
| Competitor | Target segment | Pricing | Key differentiator |
## Feature matrix
## Positioning map summary
## Whitespace & opportunities
## Strategic recommendations
```
'@

# ── PM 7: OKR Planning ──
Write-Skill "$root\skills\product-management\okr-planning\SKILL.md" @'
---
name: okr-planning
domain: product-management
description: Define a set of Objectives and Key Results for a team or product area, with initiative mapping and confidence scores.
when_to_use: The request is about OKRs, quarterly goals, setting targets, or aligning team direction to company strategy.
retrieval_intent: strategic goals, metrics, team focus areas, quarterly priorities
output: OKR Plan (Markdown)
stage: planning
---

## Purpose
Translate strategy into measurable quarterly commitments that focus the team and
create a shared definition of success.

## Steps
1. Identify 2-4 Objectives (qualitative, inspiring, time-bound).
2. Define 2-4 Key Results per Objective (measurable, binary or 0-100% scalable).
3. Map 1-3 initiatives under each KR.
4. Assign confidence score (1-10) to each KR.
5. Flag dependencies and risks.

## Output template
```
# OKRs — <Team/Product> Q<N> <Year>
## Objective 1: <inspiring outcome>
- KR 1.1: <metric from X to Y by date> | Confidence: /10
  - Initiative: ...
## Health metrics (not graded)
## Risks & dependencies
```
'@

# ── PM 8: Go-to-Market Plan ──
Write-Skill "$root\skills\product-management\go-to-market\SKILL.md" @'
---
name: go-to-market
domain: product-management
description: Build a concise go-to-market plan covering target segment, value proposition, channels, launch phases, and success metrics.
when_to_use: The request is about launching a product/feature, GTM strategy, release communications, or how to reach target customers.
retrieval_intent: launch plan, target customers, messaging, channels, launch phases
output: Go-to-Market Plan (Markdown)
stage: launch
---

## Purpose
Ensure the right customers hear about the right product through the right channels at
launch — and that success is measurable from day one.

## Steps
1. Define target segment and buyer persona.
2. Craft value proposition and key messages (≤3).
3. Select channels: owned, earned, paid.
4. Outline launch phases: soft launch → GA → amplification.
5. Define launch KPIs and measurement plan.

## Output template
```
# Go-to-Market Plan — <Product/Feature>
## Target segment & persona
## Value proposition
## Key messages
## Channel plan
## Launch phases & timeline
## KPIs & measurement
```
'@

# ── PM 9: Discovery Brief ──
Write-Skill "$root\skills\product-management\discovery-brief\SKILL.md" @'
---
name: discovery-brief
domain: product-management
description: Synthesise user research, interviews, and data signals into a discovery brief with validated problem statements and opportunity areas.
when_to_use: The request is to synthesise research, define user problems, summarise discovery findings, or frame an opportunity for stakeholders.
retrieval_intent: user interviews, survey results, analytics, pain points, opportunity areas
output: Discovery Brief (Markdown)
stage: discovery
---

## Purpose
Turn raw research into a clear, shared understanding of the problem space before
the team commits to any solution direction.

## Steps
1. Summarise research inputs (interviews, data, support tickets).
2. Extract key themes and pain points (quote where possible).
3. Define validated problem statements (user + context + need).
4. Map opportunity areas ranked by frequency × severity.
5. Propose 2-3 solution directions to explore.

## Output template
```
# Discovery Brief — <Problem Space>
## Research inputs
## Key themes & pain points
## Validated problem statements
## Opportunity areas (ranked)
## Proposed directions to explore
```
'@

# ── PM 10: Stakeholder Map ──
Write-Skill "$root\skills\product-management\stakeholder-map\SKILL.md" @'
---
name: stakeholder-map
domain: product-management
description: Produce a stakeholder influence/interest map with engagement strategies and communication plans per group.
when_to_use: The request is about identifying stakeholders, managing stakeholder relationships, or planning stakeholder communications.
retrieval_intent: stakeholders, influence, interest, engagement, communication plan
output: Stakeholder Map & Engagement Plan (Markdown)
stage: discovery
---

## Purpose
Ensure no critical voice is missed and that each stakeholder gets the right level of
engagement — preventing late surprises and building alignment proactively.

## Steps
1. List all stakeholders (internal and external).
2. Plot each on an Influence × Interest matrix (High/Low).
3. Define engagement approach per quadrant (manage closely, keep informed, etc.).
4. Draft communication touchpoints and cadence.

## Output template
```
# Stakeholder Map — <Project/Product>
## Stakeholder register
| Name | Role | Influence | Interest | Quadrant |
## Engagement strategies by quadrant
## Communication plan & cadence
```
'@

Write-Host "`n=== Writing Project Management Skills ===" -ForegroundColor Cyan

# ── PjM 1: Project Charter ──
Write-Skill "$root\skills\project-management\project-charter\SKILL.md" @'
---
name: project-charter
domain: project-management
description: Produce a concise project charter establishing objective, scope, stakeholders, success criteria, milestones, and risks.
when_to_use: The request is to kick off / initiate a project, define scope and objectives, or create a charter / mandate.
retrieval_intent: project objective, scope, stakeholders, success criteria, milestones, budget
output: Project Charter (Markdown)
stage: initiation
---

## Purpose
Create the formal mandate for a project — aligning sponsors, setting boundaries, and
giving the team a clear north star from day one.

## Steps
1. State the business case and project objective (one paragraph).
2. Define scope (in and explicitly out of scope).
3. Identify sponsor, PM, key stakeholders.
4. List top 3-5 milestones with indicative dates.
5. Define success criteria and top risks.

## Output template
```
# Project Charter — <Project Name>
## Business case & objective
## Scope: In / Out
## Key stakeholders
## Milestones
| Milestone | Target date |
## Success criteria
## Top risks
```
'@

# ── PjM 2: Sprint Plan ──
Write-Skill "$root\skills\project-management\sprint-plan\SKILL.md" @'
---
name: sprint-plan
domain: project-management
description: Build a sprint plan from a set of signed-off user stories, with sprint goal, capacity, committed stories, and sequencing rationale.
when_to_use: The request is about sprint planning, organising stories into a sprint, capacity, or what to commit to next.
retrieval_intent: user stories, estimates, team capacity, dependencies, sprint goal
output: Sprint Plan (Markdown)
stage: planning
---

## Purpose
Turn prioritised, signed-off stories into a committed, achievable sprint with a clear goal.

## Steps
1. State the sprint goal (one sentence outcome).
2. Note team capacity and sprint length.
3. Select stories that fit capacity; sequence by dependency.
4. Flag risks and any spillover/contingency.

## Output template
```
# Sprint Plan — Sprint <N>
## Sprint goal
## Capacity & dates
## Committed stories
| Story | Estimate | Owner | Depends on |
## Sequencing & risks
```
'@

# ── PjM 3: Status Report ──
Write-Skill "$root\skills\project-management\status-report\SKILL.md" @'
---
name: status-report
domain: project-management
description: Produce a concise stakeholder status report covering progress, RAG, milestones, risks, and asks for the period.
when_to_use: The request is for a status update, weekly/period report, progress summary, or stakeholder communication on delivery.
retrieval_intent: progress, milestones, RAG status, risks, blockers, asks
output: Status Report (Markdown)
stage: delivery
---

## Purpose
Give stakeholders a single, honest view of delivery health in 90 seconds — no glossing
over problems, no burying the lede.

## Steps
1. Overall RAG (Red/Amber/Green) with one-line rationale.
2. Progress this period: what was completed.
3. Milestone tracker: on track / at risk / delayed.
4. Risks and issues: new, escalated, or closed.
5. Next period plan and asks/decisions needed.

## Output template
```
# Status Report — <Project> | <Period>
## Overall RAG: 🟢/🟡/🔴
## Progress this period
## Milestone tracker
| Milestone | Target | Status |
## Risks & issues
## Next period & asks
```
'@

# ── PjM 4: RAID Log ──
Write-Skill "$root\skills\project-management\raid-log\SKILL.md" @'
---
name: raid-log
domain: project-management
description: Create or update a RAID log capturing Risks, Assumptions, Issues, and Dependencies with owners, severity, and mitigations.
when_to_use: The request is about risks, issues, assumptions, dependencies, blockers, or maintaining a RAID log.
retrieval_intent: risks, assumptions, issues, dependencies, blockers, mitigations
output: RAID Log (Markdown)
stage: delivery
---

## Purpose
Surface hidden threats and assumptions before they become crises. A well-maintained
RAID log is a project's early-warning system.

## Steps
1. Capture all Risks with probability, impact, and mitigation.
2. List Assumptions that must hold for the plan to work.
3. Record active Issues with owner and target resolution.
4. Map Dependencies: internal and external, with status.

## Output template
```
# RAID Log — <Project Name>
## Risks
| ID | Risk | Probability | Impact | Owner | Mitigation |
## Assumptions
| ID | Assumption | If wrong, impact | Owner |
## Issues
| ID | Issue | Severity | Owner | Resolution date |
## Dependencies
| ID | Dependency | Type | Status | Owner |
```
'@

# ── PjM 5: Plan on a Page ──
Write-Skill "$root\skills\project-management\plan-on-a-page\SKILL.md" @'
---
name: plan-on-a-page
domain: project-management
description: Produce a one-page delivery plan summarising objective, workstreams, milestones, RAG status, and key risks for leadership.
when_to_use: The request is for a plan-on-a-page, a one-pager for leadership, an executive delivery summary, or a milestone overview.
retrieval_intent: project plan, milestones, workstreams, executive summary, delivery status
output: Plan on a Page (Markdown)
stage: planning
---

## Purpose
Give leadership a single-page view of where the project is going and how — without
needing to read a 40-slide deck.

## Steps
1. One-line objective and deadline.
2. List 3-5 workstreams with brief descriptions.
3. Top 5 milestones with dates and RAG status.
4. Top 3 risks in one line each.
5. Key asks / decisions required.

## Output template
```
# Plan on a Page — <Project>
## Objective & deadline
## Workstreams
## Milestone tracker
| Milestone | Date | RAG |
## Top risks
## Asks & decisions
```
'@

# ── PjM 6: Retrospective ──
Write-Skill "$root\skills\project-management\retrospective\SKILL.md" @'
---
name: retrospective
domain: project-management
description: Facilitate and document a sprint or project retrospective using the What Went Well / What Did Not / What To Change format.
when_to_use: The request is for a retrospective, retro, lessons learned, or end-of-sprint/project reflection.
retrieval_intent: team feedback, sprint outcomes, process improvements, blockers, successes
output: Retrospective Summary (Markdown)
stage: delivery
---

## Purpose
Create a safe, structured space to learn and improve — turning team experience into
concrete actions that make the next sprint better.

## Steps
1. Capture What Went Well (celebrate wins, reinforce good habits).
2. Capture What Did Not (facts, not blame).
3. Define What To Change: 2-3 actionable improvements with owners and dates.
4. Revisit actions from last retro: done / not done.

## Output template
```
# Retrospective — Sprint <N> | <Date>
## What went well
## What did not go well
## What to change (actions)
| Action | Owner | Due |
## Previous actions: status
```
'@

# ── PjM 7: Resource Plan ──
Write-Skill "$root\skills\project-management\resource-plan\SKILL.md" @'
---
name: resource-plan
domain: project-management
description: Build a resource allocation plan mapping roles, capacity, and timeline across workstreams to surface conflicts early.
when_to_use: The request is about resource planning, team allocation, capacity management, or staffing a project.
retrieval_intent: team members, roles, capacity, workstreams, availability, timeline
output: Resource Plan (Markdown)
stage: planning
---

## Purpose
Prevent the #1 project failure mode — the right people not being available at the right
time — by making capacity and conflicts visible before they bite.

## Steps
1. List all roles and named resources.
2. Map each resource to workstreams and % allocation per phase.
3. Identify over-allocations (>100% in any period).
4. Flag external dependencies (contractors, other teams).
5. Propose mitigation for any gaps.

## Output template
```
# Resource Plan — <Project>
## Team roster
| Name | Role | Allocation % | Phase |
## Capacity heatmap (by month/sprint)
## Over-allocations & conflicts
## External dependencies
## Gap mitigation
```
'@

# ── PjM 8: Change Request ──
Write-Skill "$root\skills\project-management\change-request\SKILL.md" @'
---
name: change-request
domain: project-management
description: Document a formal change request with impact analysis on scope, cost, time, and quality for sponsor decision.
when_to_use: The request is about a scope change, change control, a change request, or assessing the impact of a proposed change.
retrieval_intent: proposed change, scope impact, cost impact, time impact, decision needed
output: Change Request (Markdown)
stage: delivery
---

## Purpose
Ensure every change is a conscious decision — not scope creep. Force an explicit
trade-off conversation before committing to more work.

## Steps
1. Describe the proposed change and its origin.
2. Analyse impact: scope, cost, timeline, quality, risk.
3. Assess alternatives (including "do nothing").
4. State a clear recommendation.
5. Capture sponsor decision and date.

## Output template
```
# Change Request — CR-<NNN>
## Change description
## Origin & requestor
## Impact analysis
| Dimension | Current | With Change | Delta |
| Scope | | | |
| Cost | | | |
| Time | | | |
## Alternatives considered
## Recommendation
## Decision: Approved / Rejected | Sponsor | Date
```
'@

# ── PjM 9: Release Plan ──
Write-Skill "$root\skills\project-management\release-plan\SKILL.md" @'
---
name: release-plan
domain: project-management
description: Produce a release plan covering scope, go/no-go criteria, rollout phases, rollback procedure, and communication plan.
when_to_use: The request is about planning a release, deployment, launch readiness, go-live, or rollback strategy.
retrieval_intent: release scope, deployment steps, go/no-go criteria, rollback plan, communication
output: Release Plan (Markdown)
stage: launch
---

## Purpose
Ensure go-live is an intentional, reversible event — not a moment of collective hope.
Clear criteria, clear steps, clear rollback.

## Steps
1. Define release scope (what is and is not in this release).
2. Set go/no-go criteria (must be met before release).
3. Outline deployment phases and timing.
4. Define rollback triggers and procedure.
5. Draft communication plan (internal + customer).

## Output template
```
# Release Plan — <Release Name/Version>
## Release scope
## Go / No-go criteria
| Criterion | Owner | Status |
## Deployment phases & runbook
## Rollback triggers & procedure
## Communication plan
```
'@

# ── PjM 10: Escalation Brief ──
Write-Skill "$root\skills\project-management\escalation-brief\SKILL.md" @'
---
name: escalation-brief
domain: project-management
description: Produce a crisp escalation brief summarising the issue, impact, options, and the decision needed from leadership.
when_to_use: The request is to escalate an issue, write an escalation, brief leadership on a blocker, or request a decision.
retrieval_intent: blocker, issue, impact, options, decision needed, urgency
output: Escalation Brief (Markdown)
stage: delivery
---

## Purpose
Get the right decision from the right person in the shortest time — with full context
in under 2 minutes of reading.

## Steps
1. State the issue in one sentence (what, since when).
2. Quantify impact: on timeline, cost, or quality.
3. Present 2-3 options with pros/cons and a recommendation.
4. State the decision needed, from whom, and by when.

## Output template
```
# Escalation Brief — <Issue Title>
## Issue (one sentence)
## Impact
## Options
| Option | Pros | Cons | Cost/Time |
## Recommendation
## Decision needed: from <name> by <date>
```
'@

Write-Host "`n=== Committing and pushing to GitHub ===" -ForegroundColor Cyan

git add skills/
git status --short
git commit -m "feat: add 20 skills (10 product-management + 10 project-management)"
git push origin main

Write-Host "`n=== DONE ===" -ForegroundColor Green
Write-Host "Skills live at: https://github.com/NivethithaNVinoth/nivi4AI-collaborative-workspace/tree/main/skills" -ForegroundColor Green
