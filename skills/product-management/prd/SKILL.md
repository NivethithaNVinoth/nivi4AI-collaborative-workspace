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
