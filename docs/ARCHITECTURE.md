# Architecture

```
Browser UI (public/)
   │  REST
   ▼
Express server (src/server.mjs)
   │
   ▼
Super Agent  (src/superAgent.mjs)         ← Meta orchestrator
   │  invoke_domain_agent(domain, skill, brief, title)   [tool-calling, LIVE]
   │  keyword router                                     [MOCK]
   ├──────────────► Product Management agent (src/domainAgent.mjs + agents/product-management.md)
   │                     loads skills/product-management/<skill>/SKILL.md
   └──────────────► Project Management agent (src/domainAgent.mjs + agents/project-management.md)
                         loads skills/project-management/<skill>/SKILL.md
   │
   ▼
Workspace (src/workspace.mjs)  → workspaces/<projectId>/<stage-folder>/<artifact>.md (+front-matter)
Store     (src/store.mjs)      → data/db.json (projects, stakeholders, events)
Notify    (src/notify.mjs)     → simulated email to stakeholders (→ MCP mail/Teams in prod)
```

## Request lifecycle (LIVE mode)
1. UI POSTs a message to `/api/projects/:id/invoke`.
2. Super Agent receives the message + project context + skill catalogue.
3. It calls `invoke_domain_agent` (possibly several times) choosing domain + skill.
4. Each call runs the domain agent with the chosen SKILL.md as instructions; output is
   written as a workspace artifact (status: draft) and stakeholders are notified.
5. Super Agent composes a short reply (what was produced, next step).

## Mapping to the KA Platform / Cowork design
- Super Agent ≈ KA Super Agent / Cowork main agent.
- Domain agents ≈ Super Domain Agents / Cowork subagents.
- skills/ ≈ Skills Registry / Cowork SKILL.md skills.
- workspaces/ ≈ the CAW workspace tree (Layer-2 memory made navigable).
- notify ≈ the notification/SLA engine (here, simulated).
- For production scale + audit: deploy the same skills+agents as Cowork **Managed Agents**.
