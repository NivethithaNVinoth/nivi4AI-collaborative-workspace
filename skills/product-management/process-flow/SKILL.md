---
name: process-flow
domain: product-management
description: Generate Mermaid-based customer journey maps and system process flows covering end-to-end user and data paths.
when_to_use: Request mentions flows, journeys, process diagrams, onboarding flow, transaction flow, state machine, swim lanes, or sequence diagrams.
output: Process Flow Diagrams (Markdown with Mermaid code blocks)
stage: requirements
---

## Purpose
Visualise the as-is or to-be flows so that engineering, design, and business all share one mental model.

## Steps
1. Identify 3–5 key flows for the product (e.g. onboarding, core transaction, error/exception, rewards redemption, offboarding).
2. For each flow, write a short narrative (2–3 sentences).
3. Produce a Mermaid diagram — use `flowchart TD` for step flows, `sequenceDiagram` for system interactions, `stateDiagram-v2` for state machines.
4. Annotate decision points (diamonds), system handoffs (dashed arrows), and failure paths (red-ish labels).
5. List key business rules inline as notes on the diagram.

## Mermaid diagram rules
- Each node label must be wrapped in double-quotes if it contains spaces or special characters.
- Keep diagrams to ≤ 20 nodes; split into two diagrams if larger.
- Use `subgraph` to separate swim lanes (Customer / System / Bank / Regulator).

## Output template
```
# Process Flows — {Product}

## Flow 1: Customer Onboarding
Narrative: ...

[mermaid]
flowchart TD
  A["Discover Card"] --> B["Check Eligibility"]
  B -->|Eligible| C["Submit Application"]
  B -->|Ineligible| Z["Show Alternatives"]
  C --> D["KYC Verification"]
  D -->|Pass| E["Credit Assessment"]
  E -->|Approved| F["Issue Virtual Card"]
  E -->|Rejected| G["Rejection Notice + 30-day wait"]
[/mermaid]

## Flow 2: Core Transaction
...
```
