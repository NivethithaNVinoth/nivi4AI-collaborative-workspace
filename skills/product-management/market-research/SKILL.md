---
name: market-research
domain: product-management
description: Produce a structured market research brief covering market sizing (TAM/SAM/SOM), competitor landscape, customer segments, trends, and opportunity assessment for a product or feature area.
when_to_use: The user needs to understand a market, size an opportunity, map competitors, identify demand signals, or decide whether an opportunity is worth pursuing before committing to build.
argument-hint: "[product idea, market, or feature area to research]"
retrieval_intent: market size, competitors, trends, customer segments, demand signals, TAM SAM SOM
output: Market Research Brief (Markdown)
stage: discover
---

# Market Research

Market research answers the question every exec asks before investing: "Is this worth building, for whom, and can we win?" It prevents building the right product for the wrong market â€” or the wrong product for the right market.

## When to Use
- Before committing to a new product or major feature bet
- When entering a new market segment or geography
- When a competitor moves and you need to re-evaluate positioning
- When fundraising or presenting to leadership requires market validation
- When you need to decide between two opportunity areas

## Framework: Market Research Brief (6 Steps)

### Step 1: Market Definition
Clearly bound what you are and are not researching:
- **Market name**: Be specific ("AI-native project management tools" not "project management")
- **Customer segment**: Who is the primary buyer / user?
- **Geography**: Global / regional / country-specific?
- **Time horizon**: Current state + 3-5 year projection

### Step 2: Market Sizing

Use the top-down AND bottom-up approach â€” they should converge:

**Top-Down (TAM â†’ SAM â†’ SOM):**
| Level | Definition | Size | Source |
|-------|-----------|------|--------|
| TAM (Total Addressable Market) | Everyone who could benefit | $X B | Gartner / IDC / public reports |
| SAM (Serviceable Addressable Market) | Segment you can realistically serve | $X B | Filtered by geography, segment, price point |
| SOM (Serviceable Obtainable Market) | Realistic 3-year capture | $X M | Based on go-to-market capacity |

**Bottom-Up Sanity Check:**
`SOM = Target customers Ã— Average contract value Ã— Expected win rate`

### Step 3: Competitor Landscape

Map 3-5 direct competitors and 2-3 indirect alternatives:

| Competitor | Target segment | Pricing model | Key differentiator | Weakness |
|-----------|---------------|--------------|-------------------|---------|
| | | | | |

**Porter's Five Forces quick scan:**
- Threat of new entrants: High / Medium / Low â€” why?
- Bargaining power of buyers: High / Medium / Low â€” why?
- Bargaining power of suppliers: High / Medium / Low â€” why?
- Threat of substitutes: High / Medium / Low â€” why?
- Competitive rivalry: High / Medium / Low â€” why?

### Step 4: Customer Segments

Identify and rank 2-4 target segments:

| Segment | Size | Pain intensity | Willingness to pay | Reachability |
|---------|------|---------------|-------------------|-------------|
| | | H/M/L | H/M/L | H/M/L |

For the primary segment, go deeper:
- **Jobs to be done**: What are they hiring a product to do?
- **Current solutions**: What are they using today (including spreadsheets/workarounds)?
- **Switching triggers**: What would make them change?

### Step 5: Trends & Tailwinds
Identify 3-5 macro trends driving or threatening the space:
- Technology shifts (AI, API economy, mobile-first, etc.)
- Regulatory changes affecting the market
- Behavioural shifts in how customers work
- Economic conditions affecting budget and buying

For each trend: direction (tailwind / headwind), strength (strong / moderate / weak), and time horizon.

### Step 6: Opportunity Assessment

Score the opportunity on four dimensions (1-5 each):
| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Market size (large and growing) | /5 | |
| Pain intensity (acute, frequent) | /5 | |
| Competitive whitespace (gaps exist) | /5 | |
| Strategic fit (aligns with our strengths) | /5 | |
| **Total** | /20 | â‰¥14 = strong opportunity |

## Output Format
Generate a complete brief with all six sections. Use tables throughout. Cite sources inline. End with a 3-sentence executive summary: what the market is, what the opportunity size is, and whether you recommend pursuing it.

## Quality Checklist
- [ ] TAM/SAM/SOM uses two methods (top-down + bottom-up) that roughly agree
- [ ] All market size figures have cited sources with year
- [ ] Competitor table covers both direct and indirect alternatives
- [ ] At least one customer segment is validated with real evidence (not assumption)
- [ ] Trends section separates tailwinds from headwinds
- [ ] Opportunity recommendation is explicit and defensible

## Common Pitfalls
- TAM theatre: citing huge TAMs that have no connection to your realistic segment
- Missing indirect competitors: users always have an alternative, even if it is a spreadsheet
- Trend laundry list: list only trends that directly change your opportunity
- No recommendation: research without a point of view is just data
