---
name: drawio-swimlane
domain: product-management
description: Generate a draw.io XML swimlane (cross-functional flowchart) showing who does what across departments, roles, or systems. Outputs ready-to-import mxGraph XML.
when_to_use: Request involves a swimlane diagram, cross-functional process, BPMN flow, responsibility flow, or "who does what" across teams or systems.
retrieval_intent: swimlane, cross-functional flowchart, process owner, department flow, BPMN, pool, lane, responsibility matrix
output: draw.io XML (mxGraph) swimlane diagram â€” copy into diagrams.net to open
stage: discovery
---

## Purpose
Produce a correct, import-ready draw.io swimlane diagram showing a multi-department or multi-role process.
Uses pool/lane/container hierarchy with container-relative child coordinates (the #1 correctness rule).

## Critical rules (from OpenAEC draw.io skill package)
1. Every pool and lane has `container=1`.
2. Child shapes use container-relative coordinates, not absolute page coordinates.
3. Child `parent` attribute = their containing lane ID.
4. Cross-lane edge `parent` = the pool (common ancestor).
5. `collapsible=0` on all lanes.

## Steps
1. Identify actors/roles (2-5 lanes).
2. Map process steps left-to-right; assign each step to a lane.
3. Identify decision points (diamonds) and cross-lane handoffs.
4. Generate mxGraph XML with correct container hierarchy.
5. Output XML in a drawio-xml code block plus a step-by-step description.

## Common pitfalls
- Using absolute coordinates for children.
- Forgetting `container=1`.
- Setting cross-lane edge parent to a lane instead of the pool.