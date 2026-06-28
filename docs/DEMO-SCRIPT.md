# 3-minute demo script

1. **Open** http://localhost:4000. Note the mode pill (MOCK or LIVE) and the skill registry
   in the sidebar — 5 Product + 5 Project skills.
2. **New project** → "Mobile Onboarding Revamp".
3. **Add stakeholders** by email: a Product Owner and a Business Analyst. Point out roles.
4. **Ask the Super Agent**: *"Run market research for a mobile onboarding feature, then draft
   a PRD and user stories."* Watch it route to the **Product** agent and write artifacts.
5. **Ask again**: *"Now build a sprint plan and a plan on a page."* It routes to the
   **Project** agent. Show the artifacts list filling up (PROD vs PM tags).
6. **Open an artifact** — show the front-matter (status: draft) and structured content.
7. **Activity panel** — show that each artifact **notified the stakeholders** for review.
8. Talking point: *one workspace, two domain agents under one meta agent, skills doing the
   work, stakeholders looped in — the CAW design, runnable.*

Switch to **LIVE**: put `ANTHROPIC_API_KEY` in `.env`, restart, and the same prompts now
produce full Claude-generated artifacts and multi-step routing.
