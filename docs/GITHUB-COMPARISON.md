# How this approach compares to similar GitHub projects

Researched June 2026. The Collaborative Agentic Workspace (CAW) idea — a meta agent
orchestrating domain agents over a shared, multi-stakeholder project workspace with
sign-offs and skills — overlaps with several open-source efforts, but no single one
combines all of it. Summary of the closest projects and what we borrowed.

| Project | What it is | Closest to CAW in… | Gap vs CAW |
|---|---|---|---|
| **sdi2200262/agentic-project-management (APM)** | Planner / Manager / Worker agents; project state in files; "Handoff" to a fresh agent when context fills | Meta→domain delegation; file-based state; memory hand-off | Coordinates AI coding assistants for one builder — not a multi-stakeholder workspace; no email stakeholders, no sign-off ledger |
| **automazeio/ccpm** (8.2k★) | Spec-driven: PRD → Epic → GitHub Issues → parallel agents; "requirements live in files, not heads" | Files-as-source-of-truth philosophy; lifecycle flow | Single-developer dev workflow tied to GitHub Issues; no collaborative project space or roles |
| **openagents-org/openagents** | Unified workspace for human + agent collaboration; pull any agent into a thread; shared files/context | The shared collaborative workspace; human-agent co-presence | General agent networking, not a PM/Product lifecycle with skills and sign-offs |
| **multica-ai/multica** | Managed agents as teammates; assign issues; "Squads" with a leader agent delegating to members | Super-agent-delegates-to-domain-agents; assignment model | Agents-as-coders on a board; no product/project skills, no lifecycle artifacts |
| **open-multi-agent/open-multi-agent** | Goal → task DAG; coordinator decomposes and parallelises | Meta orchestration / decomposition | Pure orchestration library; no workspace, stakeholders, or domain skills |
| **deanpeters/Product-Manager-Skills** (5.4k★) | 54 product-management Claude skills (PRD, user story, roadmap, JTBD…) | The skill layer for the Product agent | Skills only — no orchestration, workspace, or collaboration. (CC BY-NC-SA: non-commercial) |
| **RefoundAI/lenny-skills** | 86 PM skills from Lenny's Podcast | Skill layer | Skills only |

## What we borrowed
- **File-based state + structured hand-off** between agents (APM, ccpm).
- **Shared workspace + human-agent co-presence** (OpenAgents).
- **Leader-agent-delegates-to-members** routing (Multica) — our Meta Agent → domain agents.
- **Skill structure & catalogue** (deanpeters / lenny-skills) — our SKILL.md format and the
  ten bundled skills are original works following these proven patterns.

## What is distinctive about CAW (this repo)
1. A **multi-stakeholder project space** you populate by email, with roles.
2. A **Meta (Super) Agent** routing to **Project Management** and **Product Management**
   domain agents, each with a curated skill set — not a coding-agent swarm.
3. **Lifecycle artifacts with status + notifications** (draft → review → sign-off) written
   into a governed workspace tree — the basis for sign-off gates and SLA routing.
4. Designed to map onto the **KA Platform CAW architecture** and **Claude Cowork**
   primitives (Projects, Skills, subagents, connectors, hooks) for enterprise/BFSI scale.

No surveyed project offers a collaborative, multi-stakeholder, lifecycle workspace with a
meta/domain agent topology and a skills registry together. That combination is the wedge.
