# nivi4AI — Collaborative Agentic Workspace

A demoable, AI-native collaborative workspace. A **Meta (Super) Agent** orchestrates two
**domain agents** — **Project Management** and **Product Management** — each driven by a
curated set of **skills**. Stakeholders join a project space **by email**, ask the Super
Agent for what they need in plain language, and the right domain agent does the work and
writes artifacts into a shared workspace, notifying stakeholders for review.

This is the runnable core of the KA Platform Collaborative Agentic Workspace (CAW) design,
built to map onto **Claude Cowork** primitives (Projects, Skills, subagents, connectors).

> Runs with **no API key** in MOCK mode (templated artifacts) so it's instantly demoable.
> Add `ANTHROPIC_API_KEY` for **LIVE** mode — real Claude orchestration and generation.

## Features
- **Project spaces** with stakeholders added by **email + role**.
- **Meta Agent → 2 domain agents** (Project Management, Product Management) via tool-calling.
- **10 bundled skills** (5 per domain): market research, PRD, user stories, roadmap, RICE;
  charter, sprint plan, plan-on-a-page, RAID log, status report.
- **Workspace artifacts** written as Markdown with front-matter (status, stage, lineage).
- **Stakeholder notifications** on every new artifact (simulated email → MCP in production).
- **Clean web UI** — chat with the Super Agent, browse artifacts, watch the activity feed.

## Quick start
```bash
npm install
cp .env.example .env        # optional: add ANTHROPIC_API_KEY for LIVE mode
npm start                   # http://localhost:4000
```
Open the URL, create a project, add stakeholders, and ask the Super Agent.
See `docs/DEMO-SCRIPT.md` for a 3-minute walkthrough.

## How it works
- `agents/super-agent.md` — the Meta orchestrator's instructions.
- `agents/{product,project}-management.md` — the domain agents.
- `skills/<domain>/<skill>/SKILL.md` — file-based skills the agents execute.
- `src/superAgent.mjs` — delegation loop (LIVE: Claude tool-calling; MOCK: keyword router).
- `src/domainAgent.mjs` — runs one skill, writes the artifact.
- `workspaces/<projectId>/` — the per-project workspace tree (created at runtime).

See `docs/ARCHITECTURE.md` for the full diagram and the mapping to KA / Cowork.

## Adding more skills
Drop a new folder `skills/<domain>/<name>/SKILL.md` with this front-matter:
```yaml
---
name: my-skill
domain: project-management
description: One line on what it produces.
when_to_use: When the Super Agent should pick this.
output: Artifact name (Markdown)
stage: planning
---
```
…then a body with steps and an output template. It's picked up automatically.

You can also pull skills from public libraries (see `docs/GITHUB-COMPARISON.md` and
`NOTICE.md` for licences):
```bash
node scripts/import-skills.mjs deanpeters/Product-Manager-Skills product-management jobs-to-be-done
```

## How this compares to other GitHub projects
See `docs/GITHUB-COMPARISON.md`. Short version: APM and ccpm nail file-based agent
coordination; OpenAgents nails the shared human-agent workspace; Multica nails agents-as-
teammates; deanpeters/lenny supply the skill layer. None combine a **multi-stakeholder
lifecycle workspace + meta/domain agent topology + skills + sign-off/notification** — which
is what this platform does.

## Licence
MIT (this repository). Bundled skills are original works. Imported skills retain their
source licence — see `NOTICE.md`.
