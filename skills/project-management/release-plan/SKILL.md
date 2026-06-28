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
Ensure go-live is an intentional, reversible event â€” not a moment of collective hope.
Clear criteria, clear steps, clear rollback.

## Steps
1. Define release scope (what is and is not in this release).
2. Set go/no-go criteria (must be met before release).
3. Outline deployment phases and timing.
4. Define rollback triggers and procedure.
5. Draft communication plan (internal + customer).

## Output template
```
# Release Plan â€” <Release Name/Version>
## Release scope
## Go / No-go criteria
| Criterion | Owner | Status |
## Deployment phases & runbook
## Rollback triggers & procedure
## Communication plan
```
