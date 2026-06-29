---
name: flowforge
description: Generate professional draw.io diagrams (.drawio XML) for any visualisation — process flows, swimlane diagrams, journey maps, API touchpoints, architecture views, timeline comparisons, onboarding journeys, and more. Supports 6 colour themes including HSBC Red.
when_to_use: User asks to draw, diagram, map, visualise, flowchart, swimlane, journey map, process flow, architecture, sequence diagram, or any visual representation. Also trigger when domain/skill agents produce content that would benefit from a companion diagram.
retrieval_intent: draw diagram flowchart swimlane process flow journey map architecture sequence mermaid drawio HSBC red
output: draw.io XML artifact (.drawio) ready to open in app.diagrams.net or draw.io desktop
stage: design
---

# FlowForge -- Draw.io Diagram Skill

Generate professional diagrams as draw.io XML files. Supports 13 diagram types and 6 colour themes, including a dedicated HSBC Red theme for HSBC-branded deliverables.

## Supported Diagram Types

| Flag | Layout | Best For |
|------|--------|----------|
| `flow` | Left-to-right linear chain | CI/CD, approval flows |
| `swimlane` | Horizontal lanes per actor | Cross-functional processes, handoffs |
| `compare` | 2-N columns side by side | Options comparison, before/after |
| `layers` | Vertical stacked tiers | Technology stacks, solution layers |
| `loop` | Circular / iterative ring | Agile cycles, feedback loops |
| `tree` | Top-down branching | Org charts, decision trees |
| `hub` | Central node + radiating spokes | Integration hubs, API topology |
| `timeline` | Left-to-right time axis | Roadmaps, project milestones |
| `sequence` | Top-down message arrows | API calls, system interactions |
| `matrix` | Grid rows x columns | Prioritisation, competency maps |
| `funnel` | Narrowing stages top to bottom | Conversion funnels, pipelines |
| `journey` | Swim-lane + emotion curve | Customer journey maps |
| `mindmap` | Central concept + branches | Brainstorms, taxonomy maps |

---

## Colour Themes

6 themes available (specify with `--theme`). Default: **tech-blue**.

| Theme | ID | Best For |
|-------|----|----------|
| Tech Blue | `tech-blue` | Engineering, technical docs |
| HSBC Red | `hsbc-red` | HSBC-branded deliverables, banking |
| Morandi | `morandi` | Strategy, business narratives |
| Mint | `mint` | Consumer product, fintech |
| Terracotta | `terracotta` | Business strategy, operations |
| Indigo | `indigo` | Analytics, data products |

Full palette definitions are in [themes.md](themes.md).

---

## HSBC Red Theme Rules

When `--theme hsbc-red` is used (or the project name/task mentions HSBC):

- **Primary fill:** `#DB0011` (HSBC Corporate Red) -- use for headers, start/end nodes, lane titles
- **Primary text on red:** `#FFFFFF` (white)
- **Process fill:** `#FDECEA` (light red tint) -- use for most process nodes
- **Process stroke:** `#DB0011`
- **Accent fill:** `#F5C6CB` stroke `#C0001A` -- use for 1-2 key decision/highlight nodes
- **Neutral fill:** `#F5F5F5` stroke `#CCCCCC` -- use for external systems, data stores
- **Lane header fill:** `#DB0011`, text `#FFFFFF`, fontStyle=1 (bold)
- **Arrow colour:** `#DB0011`
- **Canvas background:** `none` (transparent/white)
- **Font:** default draw.io (Helvetica/Arial) at 12-13px for body, 14-16px bold for lane headers

**Never** mix red lane headers with blue strokes. Keep the palette consistent -- red + white + neutral grey only.

---

## Swimlane Layout System

Swimlanes are the most common diagram type for cross-functional PM/PjM work. Use this layout for any process that crosses organisational or system boundaries.

### Structure

```
CANVAS
+--------------------------------------------------+
| title_main  (TITLE_H = 32)                       |
+--------------------------------------------------+
| pool container (all lanes)                        |
|  +--------+----------------------------------+   |
|  | LANE 1 |  [ node ] --> [ node ] --> ...   |   |
|  | header |                                  |   |
|  +--------+----------------------------------+   |
|  | LANE 2 |  [ node ] --> [ node ]           |   |
|  | header |                                  |   |
|  +--------+----------------------------------+   |
|  | LANE N |  ...                             |   |
|  +--------+----------------------------------+   |
+--------------------------------------------------+
```

### Coordinate Constants

```
CANVAS_PAD   = 40      // outer margin all sides
TITLE_H      = 32      // space for the diagram title above pool
LANE_H_BASE  = 120     // min height per lane (add 40 per extra node row)
LANE_HDR_W   = 120     // lane label column width
NODE_W       = 150     // default node width
NODE_H       = 50      // default node height
NODE_GAP_H   = 50      // horizontal gap between nodes
NODE_GAP_V   = 30      // vertical gap between rows within a lane
NODE_Y_OFF   = (LANE_H_BASE - NODE_H) / 2  // vertical centre within lane
```

### Positioning Formulas

```
pool_x = CANVAS_PAD
pool_y = CANVAS_PAD + TITLE_H
pool_w = CANVAS_PAD + LANE_HDR_W + n_cols*(NODE_W+NODE_GAP_H) - NODE_GAP_H + CANVAS_PAD

lane_y (relative to pool) = lane_index * LANE_H_BASE   // use swimlaneHead=1 parent

node_x (relative to lane) = LANE_HDR_W + col_index*(NODE_W+NODE_GAP_H)
node_y (relative to lane) = NODE_Y_OFF

CANVAS_W = pool_w + 2*CANVAS_PAD
CANVAS_H = TITLE_H + n_lanes*LANE_H_BASE + 2*CANVAS_PAD + 32
```

### mxGraph XML Pattern for Swimlanes

Use the standard mxGraph pool/lane container hierarchy. Nodes are children of their lane cell (parent = lane_id):

```xml
<!-- Pool (outer container) -->
<mxCell id="pool" value="Process Name" style="shape=pool;startSize=0;horizontal=1;childLayout=stackLayout;horizontalStack=0;resizeParent=1;resizeParentMax=0;collapsible=0;marginBottom=0;fillColor=none;strokeColor=#DB0011;strokeWidth=2;fontColor=#DB0011;fontSize=14;fontStyle=1;" parent="1" vertex="1">
    <mxGeometry x="{pool_x}" y="{pool_y}" width="{pool_w}" height="{pool_h}" as="geometry"/>
</mxCell>

<!-- Lane (child of pool) -->
<mxCell id="lane_1" value="Customer" style="swimlane;startSize=120;horizontal=0;fillColor=#DB0011;strokeColor=#DB0011;fontColor=#FFFFFF;fontSize=14;fontStyle=1;swimlaneHead=1;" parent="pool" vertex="1">
    <mxGeometry y="0" width="{pool_w}" height="{LANE_H}" as="geometry"/>
</mxCell>

<!-- Node (child of lane -- coordinates relative to lane interior) -->
<mxCell id="node_1" value="Apply Online" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FDECEA;strokeColor=#DB0011;strokeWidth=1.5;arcSize=10;fontSize=12;fontColor=#1A1A1A;" parent="lane_1" vertex="1">
    <mxGeometry x="{node_x}" y="{NODE_Y_OFF}" width="{NODE_W}" height="{NODE_H}" as="geometry"/>
</mxCell>

<!-- Arrow (child of pool OR parent=1 -- use source/target IDs) -->
<mxCell id="arr_1_2" style="edgeStyle=orthogonalEdgeStyle;endArrow=classic;strokeColor=#DB0011;strokeWidth=1.2;endSize=5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;html=1;" parent="1" source="node_1" target="node_2" edge="1">
    <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

**Key rules:**
- Pool `parent="1"`, lane `parent="pool"`, nodes `parent="lane_id"`
- Arrows always `parent="1"` (global layer) to allow cross-lane routing
- Lane `startSize` = `LANE_HDR_W` (the header label column width)
- Lane `horizontal=0` on a `swimlane` shape makes the header appear on the left
- Always `swimlaneHead=1` to force the header bar layout

---

## Workflow

### Step 1: Identify Requirements
- What process/flow needs diagramming?
- How many actors/systems (lanes)?
- What is the target audience (internal, HSBC client, exec)?
- Set theme: if HSBC context detected, default to `hsbc-red`

### Step 2: ASCII Sketch
Produce a quick lane/node sketch:
```
Lane: Customer     [Apply] --> [Upload Docs] --> [Submit]
Lane: Application  [Validate] --> [Score]
Lane: Risk         [AML Check] --> [Approve/Decline]
Lane: Operations   [Fulfil] --> [Notify]
```

### Step 3: Compute Coordinates
Use the formulas above. Show workings briefly:
```
n_cols = 4, LANE_H = 120, LANE_HDR_W = 120
pool_w = 120 + 40 + 4*150 + 3*50 = 960
CANVAS_W = 960 + 80 = 1040
CANVAS_H = 32 + 4*120 + 80 + 32 = 624
```

### Step 4: Generate XML
- Apply theme from [themes.md](themes.md)
- Use element patterns from [xml-reference.md](xml-reference.md)
- Cross-lane arrows get `parent="1"`, same-lane arrows get `parent="lane_id"`

### Step 5: Quality Checklist
- [ ] All node IDs unique
- [ ] Every arrow has valid `source` and `target`
- [ ] Lane heights accommodate all nodes without overlap
- [ ] HSBC red theme: no blue strokes visible
- [ ] Pool/lane hierarchy correct (pool > lane > node)
- [ ] Canvas W/H match the computed values
- [ ] Title cell present with correct width

---

See [examples.md](examples.md) for full copy-pasteable XML examples.
