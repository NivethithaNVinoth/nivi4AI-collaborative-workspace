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
# User Stories â€” <Feature>
## Story 1: <title>
**As a** <persona> **I want** <action> **so that** <outcome>
**Acceptance criteria**
- Given ... When ... Then ...
**Estimate:** S/M/L  **Depends on:** â€”
```
