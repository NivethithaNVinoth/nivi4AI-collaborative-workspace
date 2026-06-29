---
name: user-story
domain: product-management
description: Convert requirements, PRD sections, or feature ideas into development-ready user stories with Gherkin acceptance criteria, effort estimates, and dependency mapping. Applies the INVEST test and Definition of Done.
when_to_use: The user needs to write user stories, break a PRD or requirement into backlog items, define acceptance criteria, prepare stories for sprint planning, or groom a backlog.
argument-hint: "[feature, PRD section, or requirements to break into stories]"
retrieval_intent: user personas, features, requirements, acceptance criteria, definition of done, backlog
output: User Stories with Acceptance Criteria (Markdown)
stage: deliver
---

# User Story Writer

User stories translate product intent into discrete, testable, developer-ready backlog items. Good stories are independently deliverable, clearly scoped, and verifiable â€” removing ambiguity before a single line of code is written.

## When to Use
- Breaking a PRD or feature spec into sprint-ready items
- Grooming a backlog before sprint planning
- Creating acceptance criteria that QA and engineering can test against
- When "what does done look like?" is unclear
- When a feature is too large and needs to be sliced

## Framework: Story Writing (5 Steps)

### Step 1: Identify Personas
From the PRD or context, name 1-3 personas relevant to this feature. For each:
- **Who they are**: Role, context, technical level
- **Primary job to be done**: What outcome are they seeking?
- **Current workaround**: How do they handle this today?

### Step 2: Slice into Stories
Apply vertical slicing â€” each story delivers end-to-end user value, not a technical layer.

**Slicing techniques:**
- By workflow step (search â†’ select â†’ checkout vs. one big "shopping" story)
- By user type (admin flow vs. end-user flow)
- By data variation (simple case â†’ edge case â†’ error case)
- By device/platform (web first â†’ mobile parity)
- CRUD: Create / Read / Update / Delete as separate stories

**Anti-patterns to avoid:**
- "Backend API for X" â€” not a user story, move to technical task
- "UI for everything on page Y" â€” too large, slice it
- "Integrate with Z" â€” frame from the user's perspective

### Step 3: Write Stories in Mike Cohn Format
> As a **[persona]**, I want to **[action/capability]** so that **[outcome/benefit]**.

Checklist for each story:
- [ ] **I** â€” Independent: can be built and delivered without another story
- [ ] **N** â€” Negotiable: the how is flexible, the outcome is fixed
- [ ] **V** â€” Valuable: delivers something the user or business cares about
- [ ] **E** â€” Estimable: small and clear enough for engineering to size
- [ ] **S** â€” Small: completable in one sprint (ideally 1-3 days)
- [ ] **T** â€” Testable: has clear pass/fail acceptance criteria

### Step 4: Write Gherkin Acceptance Criteria
For each story, write 2-4 scenarios covering happy path, edge cases, and error states:

```
Scenario: [Descriptive scenario name]
  Given [initial context / precondition]
  When  [user action or system event]
  Then  [expected outcome â€” specific, observable]
  And   [additional assertion if needed]

Scenario: [Error / edge case]
  Given [context where the error can occur]
  When  [triggering action]
  Then  [error is handled gracefully â€” specific message or behaviour]
```

### Step 5: Map Dependencies & Estimate
For each story:

| Story | Points | Depends on | Blocks |
|-------|--------|------------|--------|
| | S/M/L or 1/2/3/5/8 | Story ID or external | Story ID |

**Estimation guidance:**
- S / 1-2 pts: 1 dev, 1 day, well-understood
- M / 3-5 pts: 1-2 devs, 2-3 days, some unknowns
- L / 8 pts: needs splitting, too large for one sprint
- If uncertain: spike story first (timebox investigation, â‰¤1 day)

## Output Format
Generate each story as a self-contained block:

```
## Story: [Short title]
**As a** [persona] **I want** [action] **so that** [outcome]

**Acceptance Criteria**
Scenario: [Happy path]
  Given ...  When ...  Then ...

Scenario: [Error case]
  Given ...  When ...  Then ...

**Estimate:** S / M / L
**Depends on:** [story or system]
**Notes / Open questions:** [any unresolved items]
```

## Definition of Done (Default)
A story is done when:
- [ ] Code reviewed and merged to main
- [ ] All acceptance criteria pass in staging
- [ ] Unit tests written and passing
- [ ] No P0/P1 bugs introduced
- [ ] Product manager has accepted in staging
- [ ] Analytics events firing correctly (if applicable)

## Common Pitfalls
- Writing stories from the system's perspective ("The system shall...") â€” always from the user
- Acceptance criteria that say "works correctly" â€” write observable, specific outcomes
- One mega-story per feature â€” slice ruthlessly; small stories flow faster
- Forgetting error and empty states â€” they are as important as the happy path
