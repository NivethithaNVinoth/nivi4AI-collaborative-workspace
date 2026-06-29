// domainAgent.mjs -- Domain Agent with premium MOCK artifacts (industry-benchmark quality)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSkill } from './skills.mjs';
import { createMessage, isLive, MODEL } from './anthropic.mjs';
import { recentArtifactContext } from './workspace.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
function agentPrompt(domain) {
  const f = path.join(__dirname, '..', 'agents', `${domain}.md`);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : `You are the ${domain} domain agent.`;
}

export async function runDomainAgent({ projectId, domain, skillName, taskBrief, project }) {
  const skill = getSkill(domain, skillName);
  if (!skill) throw new Error(`Unknown skill ${domain}/${skillName}`);
  const context = recentArtifactContext(projectId);
  const stage = skill.stage || 'discovery';
  if (!isLive()) return { content: buildMockContent(skill, taskBrief, project, context), stage, skill };

  const system = [
    agentPrompt(domain), '',
    '## Active skill -- follow these instructions precisely', skill.body, '',
    '## Output contract',
    `Produce a single, complete, well-structured Markdown artifact: ${skill.output}.`,
    'Use markdown tables, headers, code blocks, and lists. No preamble or chatter.',
  ].join('\n');

  const user = [
    `Project: ${project?.name || projectId}`,
    project?.description ? `Project description: ${project.description}` : '',
    context ? `\nExisting workspace artifacts:\n${context}` : '',
    `\nTask: ${taskBrief}`,
  ].filter(Boolean).join('\n');

  const resp = await createMessage({ model: MODEL, max_tokens: 4096, system, messages: [{ role: 'user', content: user }] });
  const content = resp.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
  return { content, stage, skill };
}

// -----------------------------------------------------------------
// CONTEXT EXTRACTION
// -----------------------------------------------------------------
function extractContext(brief, project) {
  const text = ((brief || '') + ' ' + (project?.name || '') + ' ' + (project?.description || '')).trim();
  const projectName = project?.name || '';
  const quoted = text.match(/["']([A-Za-z0-9 ]{3,40})["']/)?.[1];
  const capMatch = text.match(/\b([A-Z][A-Za-z]+(?:Flex|Pay|Go|Pro|Plus|One|Now|AI|Card|App|Suite|Hub|Platform)?(?:\s+(?:Credit Card|Debit Card|Card|App|Platform|Suite|Hub|Pro))?)/)?.[1];
  const product = projectName || quoted || capMatch || 'Product';
  const market = text.match(/\b(India|UK|US|USA|APAC|Europe|Southeast Asia|Middle East|global)\b/i)?.[1] || 'India';
  const inr = /india/i.test(market);
  const gbp = /uk/i.test(market);
  const currencySymbol = inr ? 'Rs.' : gbp ? 'GBP ' : 'USD ';
  const segment = text.match(/\b(sports?|fitness|travel|premium|lifestyle|retail|SME|fintech|health|gaming|student|youth|millennial)\b/i)?.[1] || 'consumer';
  const brand = text.match(/\b(HSBC|SBI|HDFC|Axis|ICICI|Kotak|Amex|Visa|Mastercard|Apple|Google|Amazon|Meta|Uber|Grab|Paytm|Razorpay)\b/)?.[1] || '';
  const isCreditCard = /credit card|debit card|card/i.test(text);
  return { product, market, currencySymbol, segment, brand, brief: text, projectName, isCreditCard, inr, gbp };
}

// -----------------------------------------------------------------
// MOCK DISPATCH
// -----------------------------------------------------------------
function buildMockContent(skill, taskBrief, project, context) {
  const ctx = extractContext(taskBrief, project);
  const builders = {
    'market-research':      mockMarketResearch,
    'prd':                  mockPRD,
    'user-story':           mockUserStories,
    'process-flow':         mockProcessFlow,
    'html-ui-screens':      mockHtmlUiScreens,
    'html-deck':            mockHtmlDeck,
    'competitive-analysis': mockCompetitiveAnalysis,
    'discovery-brief':      mockDiscoveryBrief,
    'prioritization-rice':  mockPrioritization,
    'roadmap':              mockRoadmap,
    'project-charter':      mockProjectCharter,
    'sprint-plan':          mockSprintPlan,
    'status-report':        mockStatusReport,
    'raid-log':             mockRAIDLog,
    'plan-on-a-page':       mockPlanOnAPage,
    'drawio-swimlane':      mockDrawioSwimlane,
    'jtbd-framework':       mockJTBD,
    'business-case':        mockBusinessCase,
    'okr-framework':        mockOKR,
    'executive-summary':    mockExecSummary,
    'change-request':       mockChangeRequest,
    'escalation-brief':     mockEscalationBrief,
    'stakeholder-map':      mockStakeholderMap,
    'flowforge':            mockFlowForge,
  };
  const fn = builders[skill.name];
  return fn ? fn(ctx, skill) : defaultMock(ctx, skill);
}

function hdr(domain, skill, stage) {
  return `> **Domain:** ${domain} | **Skill:** ${skill} | **Stage:** ${stage}\n> *MOCK mode -- set ANTHROPIC_API_KEY for live Claude generation.*`;
}


// =================================================================
// COMPETITIVE ANALYSIS -- Full SWOT per competitor + Porter's 5 Forces + Feature Matrix
// =================================================================
function mockCompetitiveAnalysis(ctx) {
  const { product, market, currencySymbol, segment, inr, gbp } = ctx;
  const fee = inr ? `Rs.1,499` : gbp ? `GBP 99` : `USD 99`;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# Competitive Analysis -- ${product}

${hdr('Product Management','competitive-analysis','Discovery')}

---

## Executive Snapshot

| Insight | Detail |
|---------|--------|
| **Category gap** | No incumbent owns the ${segment} lifestyle card position -- whitespace confirmed |
| **Closest rival** | Kotak League -- ${segment}-adjacent but weak digital experience, tiny distribution |
| **Biggest incumbent threat** | HDFC Millennia -- largest base; could add a ${segment} tier in 12-18 months |
| **Recommended position** | Mid-premium fee (${fee} pa), high ${segment}-specificity -- currently unoccupied |
| **Table stakes to match** | Annual fee waiver on spend threshold, Apple/Google Pay tokenisation |
| **Differentiation to own** | 5x ${segment} rewards + co-brand exclusivity + < 10-min digital onboarding |

---

## 1. Competitive Landscape

| # | Competitor | Segment Owned | Annual Fee | Distribution | Digital Rating |
|---|-----------|--------------|-----------|-------------|---------------|
| 1 | HDFC Millennia | Millennial / Online | ${inr?'Rs.1,000':gbp?'GBP 95':'USD 95'} | Very High (branch + digital) | High |
| 2 | Axis Vistara Signature | Travel / Premium | ${inr?'Rs.3,000':gbp?'GBP 120':'USD 120'} | High | High |
| 3 | ICICI Coral | Mass Affluent / Entertainment | ${inr?'Rs.500':gbp?'GBP 45':'USD 45'} | High | Medium |
| 4 | SBI SimplyCLICK | Digital-first / Online | ${inr?'Rs.499':gbp?'GBP 35':'USD 35'} | Very High | Medium |
| 5 | Kotak League | Sports fans (niche) | ${inr?'Rs.2,500':gbp?'GBP 100':'USD 100'} | Low | Low |
| 6 | Amex Platinum Travel | Ultra-premium Travel | ${inr?'Rs.5,000':gbp?'GBP 200':'USD 200'} | Low | Very High |
| **7** | **${product}** | **${seg} Lifestyle** | **${fee}** | **Digital-first** | **Very High (target)** |

---

## 2. Competitor SWOT Profiles

### Competitor 1: HDFC Millennia (Primary Threat)

| **Strengths** | **Weaknesses** |
|:-------------|:--------------|
| Largest digital card base in ${market} | Rewards skew to Amazon/Flipkart, not ${segment} |
| Strong brand trust and branch network | No ${segment}-specific category bonus |
| Sophisticated ML-based credit scoring | App rated 3.6/5 -- below fintech standards |
| High merchant acceptance (Visa/MC) | Fee waiver requires high annual spend threshold |
| **Opportunities** | **Threats** |
| Could add ${segment} co-brand with minimal engineering effort | Losing ${segment} cardholders to purpose-built rivals |
| UPI credit line expansion now underway | Fintech challengers (OneCard, Slice) eroding share |

**Strategic implication:** HDFC is the most dangerous if it moves into ${segment}. Lock co-brand exclusivity before they do.

---

### Competitor 2: Axis Vistara Signature (Premium Rival)

| **Strengths** | **Weaknesses** |
|:-------------|:--------------|
| Dominant travel rewards; strong Air India co-brand | High annual fee (${inr?'Rs.3,000':gbp?'GBP 120':'USD 120'}) deters switchers |
| Best-in-class lounge access network | Zero ${segment} category benefit |
| Attractive sign-on bonus miles | Dependent on Vistara/Air India merger stability |
| **Opportunities** | **Threats** |
| Could pivot to sports-travel hybrid (IPL travel packages) | Air India brand uncertainty post-merger |
| Co-brand with sports leagues | HDFC and Amex fighting for same premium travel wallet |

**Strategic implication:** Low threat to ${segment} position. May respond with a hybrid travel+${segment} product in Year 2.

---

### Competitor 3: Kotak League (Closest ${seg} Competitor)

| **Strengths** | **Weaknesses** |
|:-------------|:--------------|
| Only card with explicit sports event access | Weak digital onboarding (6+ day physical card TAT) |
| Niche brand recognition among cricket fans | Limited co-brand depth (2-3 partners) |
| Low competitive response risk (small cardholder base) | No fitness or ${segment} gear category rewards |
| **Opportunities** | **Threats** |
| Digital upgrade could unlock rapid growth | ${product} entering with superior digital UX and deeper rewards |
| Expand to IPL / fantasy sports audience | Better-funded rivals can replicate quickly |

**Strategic implication:** Kotak is the benchmark to beat on ${segment} specificity, but the bar is low. Win on digital experience and depth.

---

### Competitor 4: SBI SimplyCLICK (Volume Threat)

| **Strengths** | **Weaknesses** |
|:-------------|:--------------|
| Largest cardholder base in ${market}; high brand trust | Generic rewards -- no lifestyle focus |
| Very low annual fee (${inr?'Rs.499':gbp?'GBP 35':'USD 35'}) lowers switching friction | Poor app design (2.8/5 rating) |
| Strong ${inr?'UPI':'Open Banking'} integration | No ${segment} or lifestyle merchant partnerships |
| **Opportunities** | **Threats** |
| Price anchor -- their low fee forces us to justify ${fee} premium | Mass-market positioning means they could add a ${segment} tier at low cost |
| **Strategic implication:** Not a ${segment} rival. Reinforces our premium positioning.

---

## 3. Feature Comparison Matrix

| Capability | HDFC Millennia | Axis Vistara | ICICI Coral | SBI SimplyCLICK | Kotak League | **${product}** |
|-----------|:--------------:|:------------:|:-----------:|:---------------:|:------------:|:--------------:|
| **${seg} category 5x rewards** | No | No | No | No | Partial | **Yes** |
| **Fitness subscription discount** | No | No | No | No | No | **Yes** |
| **Sports event access / tickets** | No | No | Partial | No | Yes | **Yes** |
| **Sports gear brand partners** | No | No | No | No | Partial | **Yes (10+ at launch)** |
| **Digital onboarding < 10 min** | Partial | No | Partial | Yes | No | **Yes** |
| **Virtual card on approval** | Partial | No | Partial | Yes | No | **Yes** |
| **Lifestyle spend dashboard** | No | No | No | Partial | No | **Yes** |
| **${inr?'UPI':'Open Banking'} credit line** | Partial | No | No | Partial | No | **Yes** |
| Lounge access | No | Yes | No | No | No | Partial |
| Travel rewards | Partial | Yes | No | No | No | Partial |
| Dining rewards | Yes | Partial | Yes | No | No | **Yes** |
| Annual fee waiver (spend-linked) | Yes | Partial | Yes | Yes | No | **Yes** |
| Apple / Google Pay | Yes | Yes | Partial | Partial | No | **Yes** |

*Yes = Full | Partial = Limited | No = Not offered*

---

## 4. Positioning Map

**Axes: Annual Fee (low to high) vs. ${seg} Lifestyle Specificity (generic to purpose-built)**

\`\`\`
HIGH ${seg}      | [${product}]           [Kotak League]
SPECIFICITY   |  target: mid-fee,        (niche, low UX)
              |  high specificity
              |
              |  - - - - - WHITESPACE - - - - - - - -
              |
LOW ${seg}       | [SBI][ICICI]        [HDFC][Axis][Amex]
SPECIFICITY   |  low fee / generic    high fee / travel-generic
              +----------------------------------------------
                 LOW FEE                          HIGH FEE
\`\`\`

**Key finding:** The mid-premium / high-${segment}-specificity quadrant is entirely unoccupied. ${product} targets it directly.

---

## 5. Porter's Five Forces Assessment

| Force | Rating | Key Factors |
|-------|--------|------------|
| Threat of new entrants | Medium | High capital to issue cards, but fintech co-issuers reduce bar significantly |
| Supplier bargaining power | Medium | Visa/MC have leverage on scheme fees; AA/VKYC providers are commoditising |
| Buyer bargaining power | High | Consumers hold 3+ cards; low switching cost; churn risk is real |
| Threat of substitutes | Medium | BNPL (Razorpay, ZestMoney), loyalty apps (Nike+, Adidas) could substitute |
| Competitive rivalry | High | HDFC, Axis, Amex battle for the same mass-affluent digital wallet |
| **Overall attractiveness** | **Medium-High** | Niche focus reduces direct rivalry; first-mover window is 12-18 months |

---

## 6. Whitespace Gaps & Opportunities

| # | Gap | Why Incumbents Haven't Filled It | ${product} Move |
|---|-----|----------------------------------|----------------|
| 1 | ${seg} 5x rewards architecture | Requires MCC-level rewards config + co-brand deals | Build purpose-specific rewards engine from day 1 |
| 2 | Co-brand partner ecosystem (exclusivity) | Operationally complex; large banks deprioritise niches | BD-first: lock exclusivity before launch |
| 3 | Lifestyle spend intelligence dashboard | Legacy core banking cannot easily categorise in real-time | API-first architecture; real-time categorisation |
| 4 | Virtual card in < 10 min via AA | AA adoption took time; most banks still integrating | Digital-native stack; no legacy constraints |
| 5 | ${inr?'UPI':'Open Banking'} credit line in ${segment} context | Mandate is recent; incumbents slow to activate | First-mover positioning in ${segment} digital payments |

---

## 7. Competitive Response Scenarios

| Scenario | Probability | Timeframe | Recommended Response |
|----------|------------|-----------|---------------------|
| HDFC adds ${segment} rewards tier | High | 12-18 months | Deepen partner exclusivity; build loyalty-lock through ecosystem |
| Kotak upgrades League card digitally | Medium | 6-12 months | Accelerate co-brand depth to 15+ partners pre-response |
| New fintech launches ${segment} card | Medium | 18-24 months | Own "the ${segment} card" brand; invest in community/content |
| Co-brand partner launches own card | Low | 24-36 months | Build platform model; offer co-issuance, not just co-brand |

---

## 8. Strategic Recommendations

| Priority | Action | Rationale |
|----------|--------|-----------|
| **P0 - Critical** | Secure 3-5 co-brand exclusivity deals pre-launch | Locks category; competitors cannot replicate quickly |
| **P0 - Critical** | Build digital onboarding to < 10-min AA path | Whitespace vs. all incumbents; key UX moat |
| **P1 - Important** | Match HDFC annual fee waiver on minimum spend | Table stakes; non-negotiable for HDFC switchers |
| **P1 - Important** | Build ${segment} spend dashboard as owned feature | High engagement, low cost; builds retention moat |
| **P2 - Nice** | Add partial lounge access as entry to premium tier | Keeps door open to Amex/Axis premium switchers |
| **P3 - Defer** | International currency card | Not v1; adds complexity without ${segment} benefit |

**Bottom line:** ${product} owns the "${seg} lifestyle card" category. The gap is real, the timing is right, and the incumbent response window is 12-18 months. Move first, move fast, lock exclusivity.
`;}


// =================================================================
// MARKET RESEARCH -- TAM/SAM/SOM + Porter's 5 + Primary Research Plan
// =================================================================
function mockMarketResearch(ctx) {
  const { product, market, currencySymbol, segment, brand, inr, gbp } = ctx;
  const bs = brand ? brand + ' ' : '';
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# Market Research Brief -- ${product}

${hdr('Product Management','market-research','Discovery')}

---

## Key Insights

> 1. **Market gap confirmed**: No incumbent has a purpose-built ${segment} lifestyle card -- first-mover window is 12-18 months.
> 2. **SAM = ${inr?'Rs.38,000 Cr':gbp?'GBP 42 Bn':'USD 28 Bn'}** -- large enough to justify investment at < 10% penetration.
> 3. **Primary growth driver**: ${inr?'UPI credit-line mandate (2024) + 20% YoY fitness market growth':gbp?'Open Banking + 18% pa lifestyle spend growth':'BNPL regulation + 15% pa lifestyle spend growth'}.
> 4. **Biggest risk**: Co-brand partner dependency -- without exclusivity, reward value proposition erodes to parity.

---

## 1. Opportunity & Target Segment

**Core unmet need:** ${seg}-active consumers lack a card that rewards their primary lifestyle spend. Incumbents skew toward travel or generic cashback.

| Attribute | Primary Persona |
|-----------|----------------|
| Age | 25-38 |
| Income | ${inr?'Rs.12-30 LPA':gbp?'GBP 45k-90k':'USD 60k-120k'} |
| Location | Metro / Tier-1 city |
| Behaviour | Gym membership, ${segment} gear online, event tickets, fitness apps |
| Current cards | 1-2 general rewards cards earning 1-2% on all spend |
| Core frustration | No card rewards their primary lifestyle; they adapt to the card |

---

## 2. Market Sizing

### Top-Down TAM / SAM / SOM

| Layer | Definition | Estimated Size | Method |
|-------|-----------|---------------|--------|
| **TAM** | Total ${market} credit card outstanding balances | ${inr?'Rs.2.4L Cr':gbp?'GBP 210 Bn':'USD 1.1 Tn'} | Central bank data |
| **SAM** | Premium and lifestyle segment cardholders | ${inr?'Rs.38,000 Cr':gbp?'GBP 42 Bn':'USD 165 Bn'} | ~16% of TAM |
| **SOM** | Achievable in 36 months | ${inr?'Rs.2,800 Cr':gbp?'GBP 3.2 Bn':'USD 12 Bn'} | ~7% SAM penetration |

### Bottom-Up Validation

| Input | Value |
|-------|-------|
| Addressable ${segment} cardholders in ${market} | ${inr?'6.2 million':gbp?'2.1 million':'3.4 million'} |
| Avg annual card spend (lifestyle segment) | ${inr?'Rs.1.8 LPA':gbp?'GBP 8,400':'USD 9,200'} |
| Revenue per card (interchange + annual fee) | ${inr?'Rs.2,200 pa':gbp?'GBP 310 pa':'USD 340 pa'} |
| **10% penetration annual revenue** | **${inr?'Rs.1,364 Cr':gbp?'GBP 651 M':'USD 1.16 Bn'}** |

---

## 3. Competitive Landscape

| Player | Product | Annual Fee | Core Strength | ${seg} Gap |
|--------|---------|-----------|--------------|----------|
| HDFC Bank | Millennia | ${inr?'Rs.1,000':gbp?'GBP 95':'USD 95'} | 5% on e-commerce | No ${segment} rewards |
| Axis Bank | Vistara Signature | ${inr?'Rs.3,000':gbp?'GBP 120':'USD 120'} | Air miles, lounge | Travel-heavy |
| ICICI Bank | Coral Card | ${inr?'Rs.500':gbp?'GBP 45':'USD 45'} | Entertainment | Limited lifestyle |
| SBI Card | SimplyCLICK | ${inr?'Rs.499':gbp?'GBP 35':'USD 35'} | Online shopping | No ${segment} focus |
| Kotak | League | ${inr?'Rs.2,500':gbp?'GBP 100':'USD 100'} | Sports event access | Niche, low UX |
| **${product}** | **Target** | **${inr?'Rs.1,499':gbp?'GBP 99':'USD 99'}** | **${seg} ecosystem** | **First mover** |

---

## 4. Market Trends

| # | Trend | Tailwind / Headwind | Implication |
|---|-------|--------------------|--------------| 
| 1 | ${inr?'UPI credit-line integration (RBI mandate 2024)':'Open Banking / PSD2 expansion'} | Tailwind | New digital issuance channel -- virtual card in < 10 min |
| 2 | ${seg} economy growth ${inr?'(Rs.9,000 Cr fitness market, +20% YoY)':gbp?'(+18% pa lifestyle spend)':'(+15% pa lifestyle spend)'} | Tailwind | Growing addressable base; first-mover window open |
| 3 | Rewards fatigue with generic cashback | Tailwind | Niche, experiential rewards command higher perceived value |
| 4 | Incumbents increasing digital marketing spend | Headwind | Customer acquisition cost rising |
| 5 | Regulatory scrutiny on interchange fees | Headwind | Revenue model cannot be 100% interchange-dependent |
| 6 | Co-brand partnerships becoming competitive | Tailwind | Gym chains and gear brands actively seeking exclusive card partners |

---

## 5. Porter's Five Forces

| Force | Intensity | Key Factors |
|-------|-----------|------------|
| Threat of new entrants | Medium | High capital requirement; but fintech co-issuers lower the bar |
| Supplier power | Medium | Card networks (Visa/MC) have leverage; AA/VKYC commoditising |
| Buyer power | High | Consumers hold 3+ cards; very low switching cost |
| Substitutes | Medium | BNPL, loyalty apps (Nike+, Adidas) could substitute |
| Competitive rivalry | High | HDFC, Axis, Amex all fight for mass-affluent wallet |
| **Overall attractiveness** | **Medium-High** | Niche focus reduces direct rivalry; first-mover window exists |

---

## 6. Primary Research Plan

| # | Method | Sample | Focus | Timeline |
|---|--------|--------|-------|----------|
| 1 | In-depth interviews (IDI) | 15 ${segment} personas | JTBD, switch moments, unmet needs | Weeks 1-4 |
| 2 | Online quantitative survey | 500 ${segment} consumers | WTP, feature ranking, NPS prediction | Weeks 3-5 |
| 3 | Expert interviews | 6 industry insiders | Co-brand dynamics, regulatory landscape | Weeks 2-4 |
| 4 | Competitive mystery shopping | All 5 competitors | Onboarding UX, rewards UX, app quality | Week 2 |
| 5 | A/B landing page test | 2,000 visitors | WTP at ${inr?'Rs.999 vs Rs.1,499':gbp?'GBP 79 vs GBP 99':'USD 79 vs USD 99'} annual fee | Week 5 |

---

## 7. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Co-brand partner does not commit | Medium | High | Pre-LOI before card design finalized; 2 backups per category |
| Activation rate below 60% | Medium | High | Trigger-based onboarding nudges; welcome offer for first spend |
| Incumbent copies the concept | High | Medium | File for IP on rewards engine; partner exclusivity clauses |
| Regulatory change to interchange | Low | High | Annual fee + partner fee revenue not solely interchange-dependent |

---

## 8. Recommended Next Steps

| # | Action | Owner | By |
|---|--------|-------|-----|
| 1 | Commission 15 IDIs with ${segment} personas | Research Lead | Week 4 |
| 2 | Secure LOIs from 3 anchor co-brand partners | BD Lead | Week 6 |
| 3 | Run competitive mystery shop on all 5 rivals | PM | Week 2 |
| 4 | A/B landing page test for annual fee WTP | Growth PM | Week 5 |
| 5 | Credit risk model for ${segment} income profile | Risk Lead | Week 8 |
`;}


// =================================================================
// DISCOVERY BRIEF -- HMW + Hypothesis Register + Assumption Map
// =================================================================
function mockDiscoveryBrief(ctx) {
  const { product, market, segment, currencySymbol, inr, gbp } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# Discovery Brief -- ${product}

${hdr('Product Management','discovery-brief','Discovery')}

---

## Key Insights

> 1. **Problem confirmed**: ${seg} consumers juggle 2-3 cards to cover what one purpose-built card could do.
> 2. **Core hypothesis**: Consumers switch to a purpose-built ${segment} card if it offers >= 4x rewards on primary spend.
> 3. **Biggest assumption risk**: Annual fee acceptance -- WTP test required Week 5.
> 4. **Discovery sprint**: 6 weeks, 5 methods, 5 testable hypotheses.

---

## 1. Problem Statement

> **As a** ${segment}-active urban professional in ${market},
> **I am frustrated by** having to juggle multiple cards to cover lifestyle spend -- none optimised for ${segment} categories.
> **The impact is** I earn suboptimal rewards, manage multiple accounts, and feel undervalued as a high-spending ${segment} consumer.

---

## 2. How Might We (HMW) Questions

| # | HMW Question | Insight Source | Priority |
|---|-------------|----------------|---------|
| 1 | HMW make a ${segment}-active consumer feel their card truly understands their lifestyle? | Persona synthesis | P0 |
| 2 | HMW reduce onboarding from 7 days to under 10 minutes? | Competitor benchmarking | P0 |
| 3 | HMW create a rewards experience that feels like a ${seg} lifestyle upgrade? | User interview signals | P0 |
| 4 | HMW build a co-brand ecosystem that creates genuine exclusivity? | BD exploration | P1 |
| 5 | HMW make ${segment} category rewards visible enough to drive daily card preference? | Behavioural economics | P1 |

---

## 3. Hypothesis Register

| ID | Hypothesis | Test Method | Success Signal | Status |
|----|-----------|------------|----------------|--------|
| H-01 | ${seg} consumers will pay ${inr?'Rs.1,499':gbp?'GBP 99':'USD 99'} annual fee for 5x category rewards | A/B landing page test | >12% intent-to-apply rate | To test |
| H-02 | AA-based onboarding achieves < 10 min median TAT | Technical spike + UX prototype | Median TAT < 10 min | To test |
| H-03 | Lifestyle spend dashboard increases card-of-choice rate | A/B test in beta | +15% primary card spend share | To test |
| H-04 | Co-brand gym discount drives 2x activation | Email/SMS test with waitlist | Activation >= 65% with gym offer | To test |
| H-05 | ${segment} consumers will refer the card at NPS >= 50 | Beta cohort NPS survey | NPS >= 50 in Month 3 | To test |

---

## 4. Assumption Mapping

*Criticality = how bad if wrong | Evidence = how much we know*

| Assumption | Criticality | Evidence | Test Priority |
|-----------|------------|---------|--------------|
| Target segment willing to pay annual fee | High | Weak -- no direct test | P0 |
| AA income verification sufficient for credit decisioning | High | Medium -- industry signals | P0 |
| Gym/gear brands agree to exclusive co-brand | High | Weak -- 2 informal conversations | P0 |
| ${inr?'Visa/MC':'Card network'} scheme approval within 10 weeks | High | Medium -- confirmed via RM | P1 |
| Virtual card solves urgent need vs. physical card | Medium | Strong -- interview signals | P2 |
| Dashboard increases spend share | Medium | Weak -- hypothesis only | P2 |

---

## 5. Discovery Sprint Plan

| Week | Activities | Deliverable |
|------|-----------|------------|
| Week 1 | Desk research, competitive benchmarking, internal stakeholder interviews | Landscape map, assumption list |
| Week 2 | 5x customer IDIs, competitive mystery shop | Interview debrief, top 10 insights |
| Week 3 | 5x customer IDIs, 3x expert interviews, survey design | Validated persona, survey live |
| Week 4 | Survey analysis, HMW synthesis, prototype 2 key concepts | Hypothesis register, concept prototype |
| Week 5 | A/B landing page test (H-01), concept testing sessions | Fee WTP data, concept preference scores |
| Week 6 | Synthesis, opportunity mapping, prioritisation workshop | Discovery Brief final, recommendation |

---

## 6. Success Criteria for Discovery Phase

| Criterion | Pass Signal |
|-----------|------------|
| >= 3 of 5 hypotheses testable within 6 weeks | Research plan approved by steering |
| H-01 (WTP) result available before product design begins | A/B test live by Week 5 |
| >= 2 co-brand partner LOIs secured | BD track running in parallel |
| Credit risk team aligned on AA income proxy | Risk pre-read scheduled Week 4 |
`;}


// =================================================================
// PRD -- MoSCoW + Acceptance Criteria + NFRs + Success Metrics
// =================================================================
function mockPRD(ctx) {
  const { product, market, currencySymbol, segment, brand, inr, gbp } = ctx;
  const bs = brand ? brand + ' ' : '';
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# Product Requirements Document -- ${product}

${hdr('Product Management','prd','Requirements')}

---

## Key Insights

> 1. **Scope:** v1.0 digital-first ${segment} lifestyle card -- application to virtual card in < 10 min.
> 2. **Critical path:** AA integration + VKYC are on the critical path; spike in Week 1.
> 3. **Success gate:** 65% activation rate (first spend in 30 days) and NPS >= 45 by Month 6.
> 4. **Out of scope for v1:** EMI conversion, international currency, business card.

---

## 1. Problem & Why Now

| | |
|-|-|
| **Problem** | ${seg}-active consumers earn suboptimal rewards on primary lifestyle spend. No card is built for them. |
| **Why now** | ${inr?'UPI credit-line mandate (RBI 2024), 20% YoY fitness market growth, co-brand partner demand.':'Open Banking expansion, 18% pa lifestyle spend growth, co-brand partner demand.'} |
| **Business case** | ${inr?'200k':'80k'} active cards x ${inr?'Rs.1.8 LPA':'GBP 8,400'} avg spend = ${inr?'Rs.3,600 Cr':'GBP 672M'} portfolio in 3 years. Est. NIM + interchange: ${inr?'Rs.360 Cr':'GBP 67M'} pa at maturity. |

---

## 2. Target Users & JTBD

| # | When... | I want to... | So I can... |
|---|---------|-------------|------------|
| JTBD-01 | I buy ${segment} gear online | Earn 5x points automatically | Redeem for my next purchase |
| JTBD-02 | I pay my gym membership | Get a recurring cashback or discount | Reduce my monthly fitness cost |
| JTBD-03 | I book event tickets | Receive priority access or cashback | Feel rewarded for my loyalty |
| JTBD-04 | I check my monthly spend | See it categorised by lifestyle | Understand my real fitness cost |
| JTBD-05 | I apply for a card | Get approved and use it within 10 minutes | Avoid the 5-7 day physical card wait |

---

## 3. Requirements (MoSCoW)

### Must Have (P0)

| ID | Requirement | Acceptance Criteria |
|----|------------|-------------------|
| FR-01 | Digital application via AA income verification | Application to decision in < 10 min for straight-through cases |
| FR-02 | Video KYC (VKYC) integration | VKYC initiated in-app; completion rate >= 80% |
| FR-03 | Virtual card on approval | Card number + CVV available in-app within 60 seconds of approval |
| FR-04 | 5x rewards on ${segment} merchant categories | Points posted within 24h; correct MCC codes tagged |
| FR-05 | In-app card controls (freeze, PIN change, spend limits) | All controls update in real-time (< 5 seconds) |
| FR-06 | EMV chip + contactless physical card | Delivered within 5 business days; Apple/Google Pay enabled |

### Should Have (P1)

| ID | Requirement | Acceptance Criteria |
|----|------------|-------------------|
| FR-07 | Spend dashboard with lifestyle category breakdown | Categorised spend visible within 1h; 7/30/90-day views |
| FR-08 | Points redemption catalog | >= 50 redemption options at launch |
| FR-09 | Partner offer discovery (geo + category-based) | >= 10 live partner offers at launch; push notification |
| FR-10 | ${inr?'UPI':'Open Banking'} credit line linkage | Transactions earn base 1x points |

### Could Have (P2 / v2)

| ID | Requirement | Notes |
|----|------------|-------|
| FR-11 | EMI conversion | Adds complexity; defer to v2 |
| FR-12 | International currency toggle | v2 consideration |
| FR-13 | Disposable virtual account numbers | Security enhancement for v2 |

### Won't Have (v1)
Business card, branch-based application, crypto rewards, loan products.

---

## 4. Non-Functional Requirements

| ID | Requirement | Target |
|----|------------|--------|
| NFR-01 | API response time | P95 < 2 seconds |
| NFR-02 | System uptime | >= 99.9% (max 8.7h downtime/year) |
| NFR-03 | Data encryption | AES-256 at rest; TLS 1.3 in transit |
| NFR-04 | PCI-DSS compliance | Level 1 certification before launch |
| NFR-05 | Regulatory compliance | ${inr?'RBI card guidelines, AA framework, VKYC norms':'FCA regulations, Open Banking standards, GDPR'} |
| NFR-06 | Mobile OS support | iOS 15+ and Android 11+ |
| NFR-07 | Accessibility | WCAG 2.1 AA |

---

## 5. Success Metrics

| Metric | Month 6 Target | Month 18 Target |
|--------|---------------|-----------------|
| Cards issued | 25,000 | 150,000 |
| Activation rate (first spend in 30d) | >= 65% | >= 70% |
| Monthly active cardholder rate | >= 55% | >= 60% |
| Avg monthly spend per active card | ${inr?'Rs.14,000':'GBP 700'} | ${inr?'Rs.18,000':'GBP 900'} |
| ${seg} category spend share | >= 30% | >= 35% |
| Rewards redemption rate | >= 40% | >= 55% |
| Net Promoter Score | >= 45 | >= 55 |
| Onboarding median TAT (AA path) | < 10 min | < 8 min |

---

## 6. Dependencies & Risks

| # | Risk / Dependency | Owner | Mitigation |
|---|-----------------|-------|-----------|
| 1 | Card network scheme approval (10 weeks) | Compliance | Submit docs Week 2; weekly status check |
| 2 | AA / VKYC vendor contract | Engineering | RFP Week 1; SLA on integration support |
| 3 | Co-brand partner API integrations | BD / Engineering | LOI before design freeze; API mock Week 6 |
| 4 | Credit bureau API | Risk | Contract in parallel with product build |
| 5 | PCI-DSS audit timeline | InfoSec | Engage QSA auditor in Month 2 |
`;}


// =================================================================
// USER STORIES -- Gherkin + Story Map + DoD
// =================================================================
function mockUserStories(ctx) {
  const { product, market, segment, inr, gbp } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# User Stories -- ${product}

${hdr('Product Management','user-story','Requirements')}

---

## Key Insights

> 1. **Epics covered:** Onboarding, Rewards Accrual, Spend Dashboard, Partner Offers, Card Controls.
> 2. **Story mapping sequence:** Onboarding -> First Spend -> Rewards -> Discover Offers -> Manage Card.
> 3. **Sprint 1 priority:** US-01 through US-05 (critical onboarding path).
> 4. **Definition of Done** is at end of this document.

---

## Story Map

| Backbone Activity | Onboarding | First Spend | Earn Rewards | Discover Offers | Manage Card |
|------------------|:----------:|:-----------:|:------------:|:---------------:|:-----------:|
| Walking skeleton | Apply + VKYC | Virtual card | 5x ${segment} | Browse offers | Freeze card |
| **Sprint 1** | US-01 to US-05 | US-06 | US-07 | -- | US-11 |
| **Sprint 2** | -- | -- | US-08, US-09 | US-10 | US-12, US-13 |
| **Sprint 3** | -- | -- | US-10 | US-11 | US-14, US-15 |

---

## Epic 1: Digital Onboarding

### US-01 -- Application Start
**As a** new applicant  
**I want to** start a card application using only my mobile number and PAN  
**So that** I can apply without visiting a branch or uploading documents upfront

**Acceptance Criteria:**
\`\`\`gherkin
Given I am on the ${product} app landing screen
When I enter my mobile number and tap "Check Eligibility"
Then I receive an OTP to my mobile number within 30 seconds
  And the OTP verification step loads within 2 seconds

Given I enter the correct OTP
When I submit it
Then I proceed to the PAN entry screen with my session persisted for 30 minutes

Given I enter an invalid OTP 3 times
When I submit the third invalid attempt
Then my session is locked for 15 minutes with a clear countdown
\`\`\`
**Story Points:** 3 | **Priority:** P0 | **Sprint:** 1

---

### US-02 -- AA-based Income Verification
**As a** card applicant  
**I want to** share my bank statement via Account Aggregator in one tap  
**So that** my income is verified instantly without uploading PDFs

**Acceptance Criteria:**
\`\`\`gherkin
Given I have reached the income verification step
When I tap "Share via Account Aggregator"
Then I see my AA-linked bank accounts within 3 seconds
  And I can select one or more accounts to share

Given I select my account and confirm consent
When I grant consent
Then the system receives account data within 60 seconds
  And my application moves to the decisioning step automatically

Given the AA fetch fails or times out
Then I am offered an alternative (manual upload or callback)
  And no data is retained from the failed fetch
\`\`\`
**Story Points:** 8 | **Priority:** P0 | **Sprint:** 1

---

### US-03 -- Instant Credit Decision
**As a** card applicant  
**I want to** receive an instant credit decision after income sharing  
**So that** I know immediately if I am approved and what my limit is

| Scenario | Expected Outcome |
|---------|----------------|
| Straight-through approval | Decision in < 30 seconds; limit displayed |
| Referred (manual review) | "Pending" message + 2-business-day SLA |
| Declined | Compliant reason shown; alternate products offered |
| System error | Graceful error; application state saved; retry option |

**Story Points:** 5 | **Priority:** P0 | **Sprint:** 1

---

### US-04 -- Video KYC Completion
**As an** approved applicant  
**I want to** complete Video KYC in < 5 minutes within the app  
**So that** my card is activated without visiting a branch

**Acceptance Criteria:**
\`\`\`gherkin
Given I have been approved and reached the KYC step
When I tap "Start Video KYC"
Then a VKYC session is initiated with an agent within 3 minutes queue time

Given my VKYC session begins
When the agent verifies my identity
Then I confirm PAN, address, and sign the application agreement on screen
  And the session is recorded per regulatory guidelines

Given my VKYC passes
Then my virtual card is issued within 60 seconds
  And I receive a push notification with my card details
\`\`\`
**Story Points:** 5 | **Priority:** P0 | **Sprint:** 1

---

### US-05 -- Virtual Card Issuance
**As a** newly approved cardholder  
**I want to** receive my virtual card number instantly after VKYC  
**So that** I can use it online before the physical card arrives

| Criterion | Acceptance Criteria |
|-----------|-------------------|
| Display | Card number, expiry, CVV shown within 60 seconds of VKYC pass |
| Security | Details masked by default; tap-to-reveal with biometric auth |
| Wallet | Card added to Apple Pay / Google Pay with one tap |
| CVV rotation | CVV auto-rotates every 24 hours |

**Story Points:** 5 | **Priority:** P0 | **Sprint:** 1

---

## Epic 2: Rewards Accrual

### US-06 -- 5x Rewards on ${seg} Categories
**As an** active cardholder  
**I want to** automatically earn 5x points on ${segment} purchases  
**So that** I am rewarded without manually tracking categories

**Acceptance Criteria:**
\`\`\`gherkin
Given I have a ${product} card
When I make a purchase at a qualifying ${segment} MCC-code merchant
Then 5x points are applied to that transaction
  And points are posted to my account within 24 hours
  And the transaction is tagged as "${seg}" in my spend dashboard

Given I make a purchase at a non-qualifying merchant
Then 1x base points are applied
  And the category is correctly shown in my dashboard

Given I check my points balance
Then I see points earned per transaction with expiry date
  And I can filter by category or date range
\`\`\`
**Story Points:** 8 | **Priority:** P0 | **Sprint:** 1

---

## Epic 3: Card Controls

### US-07 -- Freeze / Unfreeze Card
**As a** cardholder  
**I want to** instantly freeze my card if lost or compromised  
**So that** I prevent unauthorised transactions

| Criterion | Acceptance Criteria |
|-----------|-------------------|
| Access | Freeze toggle visible on home screen -- one tap |
| Speed | Freeze effective within 5 seconds |
| Visual | Frozen state shown clearly in-app |
| Unfreeze | Requires biometric re-authentication |
| Audit | All freeze/unfreeze events logged with timestamp |

**Story Points:** 3 | **Priority:** P0 | **Sprint:** 1

---

## Definition of Done (All Stories)

| Criterion | Standard |
|-----------|---------|
| Code review | Peer-reviewed and approved by >= 1 senior engineer |
| Unit tests | >= 80% code coverage on new code |
| Integration tests | All AC scenarios covered with automated tests |
| Accessibility | WCAG 2.1 AA -- automated + manual check |
| Security review | No new HIGH or CRITICAL vulnerabilities (OWASP Top 10) |
| UX sign-off | Product designer has reviewed and approved the implementation |
| PO acceptance | Product Owner has accepted against all AC |
| API docs | Updated if applicable |
| Monitoring | User journey tracked in analytics; alerting configured |
`;}


// =================================================================
// JTBD -- Ulwick ODI Opportunity Scoring + Switch Forces
// =================================================================
function mockJTBD(ctx) {
  const { product, market, segment, inr, gbp } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# Jobs-to-be-Done Analysis -- ${product}

${hdr('Product Management','jtbd-framework','Discovery')}

> *Framework: Tony Ulwick Outcome-Driven Innovation (ODI) + Bob Moesta Switch Interview method*

---

## Key Insights

> 1. **Main job**: "Help me pursue my ${segment} lifestyle without financial compromise."
> 2. **Top 3 underserved outcomes** (score > 10): hassle-free rewards on ${segment} spend, instant card access, spend visibility.
> 3. **Primary switch trigger**: Frustration that existing card doesn't reward ${segment} categories.
> 4. **Biggest anxiety**: "Will this card actually be worth switching for?"

---

## 1. Job Statements

| Type | Job Statement |
|------|--------------|
| **Main functional job** | Help me maximise the value I get from my ${segment} lifestyle spending |
| **Ancillary job 1** | Help me track and understand where my money goes across ${segment} categories |
| **Ancillary job 2** | Help me access ${segment} experiences (events, gear, gym) at a meaningful discount |
| **Emotional job** | Make me feel recognised and rewarded for the lifestyle choices I prioritise |
| **Social job** | Signal to others that I take my ${segment} identity seriously |

---

## 2. Desired Outcome Statements

> **Formula:** Minimise / Maximise + metric + object of control + context
> **Opportunity Score = Importance + max(0, Importance - Satisfaction)**  
> *Score > 10 = Underserved (opportunity) | Score < 5 = Overserved (don't invest)*

| # | Outcome Statement | Importance (1-10) | Satisfaction (1-10) | **Opp Score** | Priority |
|---|------------------|:-----------------:|:-------------------:|:-------------:|:--------:|
| O-01 | Minimise the time it takes to earn rewards on ${segment} purchases | 9 | 3 | **15** | Underserved |
| O-02 | Minimise the effort required to apply and receive a card | 8 | 3 | **13** | Underserved |
| O-03 | Maximise visibility of my ${segment} spend across all categories | 8 | 2 | **14** | Underserved |
| O-04 | Minimise the number of cards needed to cover my lifestyle spend | 9 | 4 | **14** | Underserved |
| O-05 | Maximise the value of rewards redeemed for ${segment} products/experiences | 9 | 3 | **15** | Underserved |
| O-06 | Minimise the likelihood of missing out on ${segment} partner offers | 7 | 3 | **11** | Underserved |
| O-07 | Minimise the complexity of understanding my rewards balance | 7 | 4 | **10** | Borderline |
| O-08 | Maximise confidence that my card is secure from unauthorised use | 9 | 6 | **12** | Underserved |
| O-09 | Minimise the annual cost of holding a ${segment} card | 7 | 5 | **9** | Satisfied |
| O-10 | Maximise the prestige associated with using my card | 5 | 5 | **5** | Overserved |

---

## 3. Top 3 Underserved Outcomes (Score > 12)

| Rank | Outcome | Score | Product Bet |
|------|---------|-------|------------|
| 1 | 5x rewards earned automatically on ${segment} spend (O-01, O-05) | **15** | Purpose-built MCC-level rewards architecture |
| 2 | Single card covering all lifestyle categories (O-04) | **14** | 10+ co-brand partner ecosystem at launch |
| 3 | Real-time spend visibility by ${segment} category (O-03) | **14** | Native lifestyle spend dashboard |

---

## 4. Switch Interview Findings (Moesta JTBD)

### The Four Forces of Progress

| Force | Finding |
|-------|---------|
| **Push** (frustration with current card) | "My HDFC card gives me 1% on everything. I spend Rs.8,000/month on gym and gear and earn almost nothing." |
| **Pull** (attraction to new solution) | "I heard about a card that gives 5x on sports gear and includes event access. That's exactly what I need." |
| **Anxiety** (fear of switching) | "I worry the reward tiers are complicated, or there's a hidden catch with the annual fee." |
| **Habit** (inertia) | "I've had my HDFC card for 6 years. My salary is credited there. It's a pain to switch." |

### Switch Timeline (from 15 IDIs)

| Moment | Signal | Frequency |
|--------|--------|----------|
| First thought | "I wish my card gave more rewards on sports" | 13/15 respondents |
| Passive looking | Googled "${segment} credit card ${market}" | 10/15 respondents |
| Active looking | Asked friends / Reddit for recommendations | 8/15 respondents |
| First use | Would trial for gym/gear spend first before switching primary | 12/15 respondents |

---

## 5. Product Opportunity Bets

| Bet | Addresses | Confidence | Sprint |
|-----|-----------|-----------|--------|
| 5x rewards on ${segment} MCC codes (automatic) | O-01, O-05 | High | Sprint 1 |
| Co-brand ecosystem: gym + gear + events (10+ partners) | O-04, O-06 | Medium | Sprint 2-3 |
| Real-time ${segment} spend dashboard | O-03, O-07 | High | Sprint 2 |
| < 10 min AA onboarding to virtual card | O-02 | High | Sprint 1 |
| In-app card security controls (freeze, limits) | O-08 | High | Sprint 1 |
| Annual fee waiver on Rs.${inr?'80,000':gbp?'4,000':'5,000'} annual spend | O-09 | High | Sprint 1 |
`;}


// =================================================================
// PRIORITIZATION RICE -- Full scoring with calculation + tiers
// =================================================================
function mockPrioritization(ctx) {
  const { product, segment } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# Prioritization (RICE Framework) -- ${product}

${hdr('Product Management','prioritization-rice','Strategy')}

> *Framework: RICE = (Reach x Impact x Confidence) / Effort*
> *Reach: users/quarter | Impact: 0.25 / 0.5 / 1 / 2 / 3 | Confidence: % | Effort: person-weeks*

---

## Key Insights

> 1. **Top priority (score 1,800):** 5x rewards engine -- highest reach + maximum impact on activation.
> 2. **Quick win (score 900):** In-app card controls -- low effort, high confidence.
> 3. **Defer:** International currency card -- low reach, high effort.
> 4. **Controversial item:** Lounge access -- high impact but low confidence in differentiation; deprioritised.

---

## RICE Scoring Table

| ID | Feature / Initiative | Reach (Q) | Impact | Confidence | Effort (wks) | **RICE Score** | Tier |
|----|---------------------|:---------:|:------:|:----------:|:------------:|:--------------:|:----:|
| F-01 | 5x rewards on ${segment} MCC categories | 15,000 | 3 | 80% | 20 | **1,800** | Now |
| F-02 | < 10-min AA onboarding to virtual card | 15,000 | 3 | 75% | 24 | **1,406** | Now |
| F-03 | ${seg} spend dashboard (real-time category) | 12,000 | 2 | 85% | 16 | **1,275** | Now |
| F-04 | Co-brand partner offer discovery (10+ partners) | 10,000 | 2 | 70% | 20 | **700** | Now |
| F-05 | In-app card controls (freeze, limits, PIN) | 15,000 | 2 | 95% | 8 | **3,563** | Now |
| F-06 | Points redemption catalog (50+ options) | 8,000 | 2 | 75% | 14 | **857** | Next |
| F-07 | UPI credit line linkage | 6,000 | 2 | 65% | 18 | **433** | Next |
| F-08 | Push notifications for ${segment} partner offers | 12,000 | 1 | 80% | 6 | **1,600** | Next |
| F-09 | Spend analytics with month-over-month trends | 8,000 | 1 | 70% | 10 | **560** | Next |
| F-10 | EMI conversion on large purchases | 5,000 | 1 | 60% | 16 | **188** | Later |
| F-11 | Lounge access (partial) | 3,000 | 2 | 50% | 20 | **150** | Later |
| F-12 | International currency toggle | 2,000 | 1 | 60% | 22 | **55** | Defer |
| F-13 | Business / SME card variant | 1,500 | 2 | 40% | 30 | **40** | Defer |

> **RICE Score formula:** (Reach x Impact x Confidence%) / Effort

---

## Priority Tiers

### Tier 1 -- Now (Launch v1.0)
Features that are essential for product-market fit and activation. Cannot launch without them.

| Feature | RICE | Rationale |
|---------|------|-----------|
| In-app card controls | 3,563 | Table stakes; safety + compliance |
| 5x rewards on ${segment} MCCs | 1,800 | Core value proposition |
| Push notifications for partner offers | 1,600 | Low effort, drives engagement |
| < 10-min AA onboarding | 1,406 | Whitespace vs. incumbents |
| ${seg} spend dashboard | 1,275 | Retention driver; low-cost differentiator |

### Tier 2 -- Next (1-3 months post-launch)
Features that deepen engagement and improve retention.

| Feature | RICE | Rationale |
|---------|------|-----------|
| Points redemption catalog | 857 | Required for rewards loop to close |
| Co-brand partner offers | 700 | Deepens ecosystem value |
| UPI credit line | 433 | Regulatory compliance + new segment |
| Spend analytics trends | 560 | Drives habit formation |

### Tier 3 -- Later / Defer
| Feature | Decision | Reason |
|---------|---------|--------|
| EMI conversion | Later | Operational complexity; low score |
| Lounge access | Later | Low confidence in differentiation ROI |
| International currency | Defer | Low reach; high build cost |
| Business card | Defer | Different customer segment entirely |

---

## Trade-off Analysis

| Comparison | Recommendation |
|-----------|---------------|
| F-01 (5x rewards) vs. F-07 (UPI linkage) | F-01 first -- 4x higher score; core value prop |
| F-03 (dashboard) vs. F-09 (analytics) | Both Now -- F-03 is 2x score; F-09 can follow in 2 sprints |
| F-11 (lounge) vs. F-08 (push notifs) | Push notifs -- 10x higher RICE; lounge has low confidence |
`;}


// =================================================================
// ROADMAP -- Now / Next / Later with themes + rationale
// =================================================================
function mockRoadmap(ctx) {
  const { product, market, segment, inr, gbp } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# Product Roadmap -- ${product}

${hdr('Product Management','roadmap','Strategy')}

> *Format: Now / Next / Later (theme-based) | Horizon: 12 months*
> *Priority method: RICE scoring | Review cadence: Monthly*

---

## Key Insights

> 1. **Theme 1 -- Own the ${seg} Category** is the foundation; everything else depends on it landing.
> 2. **Theme 2 -- Frictionless Digital Experience** is the moat; incumbents cannot replicate quickly.
> 3. **Theme 3 -- Partner Ecosystem** drives long-term retention; BD track must run in parallel.
> 4. **Go/No-go gate** at end of Now horizon: 65% activation rate and 3 signed co-brand partners.

---

## Strategic Themes

| Theme | Horizon | North Star Metric | Owner |
|-------|---------|------------------|-------|
| 1. Own the ${seg} Category | Now + Next | ${segment} category spend share >= 35% | PM |
| 2. Frictionless Digital Experience | Now | Onboarding TAT < 10 min; NPS >= 45 | Design Lead |
| 3. Partner Ecosystem Depth | Next + Later | >= 15 active co-brand partners | BD Lead |
| 4. Spend Intelligence | Next | Dashboard MAU >= 70% of active cardholders | PM |
| 5. Governance & Scale | Later | Chargeback rate < 0.1%; uptime >= 99.9% | Engineering Lead |

---

## NOW (Months 1-4): Foundation

*Goal: Launch with a complete, differentiated v1.0 and hit 25,000 cards issued.*

| Epic | Features | Success Metric | RICE |
|------|---------|----------------|------|
| **Core Rewards Engine** | 5x on ${segment} MCC codes; 1x base; annual fee waiver on spend | ${seg} spend share >= 30% in M4 | 1,800 |
| **Digital Onboarding** | AA income verification; VKYC; virtual card in < 10 min | Median onboarding TAT < 10 min | 1,406 |
| **Card Basics** | EMV physical card; Apple/Google Pay; in-app controls | Activation rate >= 65% by M4 | 3,563 |
| **Launch Partner Offers** | 5+ co-brand partners live at launch; push notifications | >= 5 partners at launch | 700 |
| **${seg} Spend Dashboard** | Real-time category breakdown; 7/30/90-day views | Dashboard MAU >= 55% | 1,275 |

**Dependencies:** Visa/MC scheme approval (Week 14), AA vendor contract (Week 6), VKYC vendor (Week 8), PCI-DSS audit (Month 3)

---

## NEXT (Months 5-8): Deepen

*Goal: Drive habit formation, deepen partner ecosystem, close rewards loop.*

| Epic | Features | Success Metric | RICE |
|------|---------|----------------|------|
| **Rewards Redemption** | 50+ redemption options; ${segment} vouchers; statement credit | Redemption rate >= 40% | 857 |
| **Partner Ecosystem v2** | 10+ active partners; geo-targeted offers; exclusive discounts | Partner MAU >= 30% of cardholders | 700 |
| **Spend Intelligence** | Month-over-month trends; ${segment} budget tracker; savings calculator | Feature MAU >= 60% | 560 |
| **${inr?'UPI':'Open Banking'} Credit Line** | ${inr?'UPI credit line via RBI mandate':'Open Banking credit linkage'}; 1x points on ${inr?'UPI':'digital'} spend | ${inr?'UPI':'Digital'} spend share >= 15% | 433 |
| **Referral Programme** | In-app referral; Rs.500 referral credit; leaderboard | 20% of new cards from referral by M8 | -- |

---

## LATER (Months 9-12): Scale

*Goal: Unlock new segments, deepen data moat, prepare v2.0.*

| Epic | Features | Target |
|------|---------|--------|
| **Advanced Analytics** | AI-powered spend insights; goal tracking; savings nudges | Retention +5pp |
| **Partner Platform** | Self-serve partner onboarding; offer management API | 25+ partners |
| **Premium Tier** | Lounge access add-on; concierge service; higher rewards ceiling | ARPU +20% |
| **Business Card (v2)** | SME ${segment} card; GST invoice integration; expense dashboard | New segment revenue |
| **International** | Multi-currency; travel rewards; DCC protection | Expand addressable base |

---

## Roadmap Visual (Gantt Summary)

\`\`\`
Month:    1    2    3    4    5    6    7    8    9   10   11   12
          |----NOW----|----NOW----|--NEXT-|----NEXT---|---LATER---|
Theme 1:  [====5x Rewards=====] [=Redemption=] [=Advanced=]
Theme 2:  [====Onboarding===]   [=UPI=]         [=Intl=]
Theme 3:  [=Partners v1=]       [=Partners v2=] [=Platform=]
Theme 4:  [=Dashboard=]         [=Intelligence=][=AI Insights=]
Theme 5:               [=PCI-DSS=] [=Scale Ops=] [=Gov=]
\`\`\`

---

## Go / No-Go Gates

| Gate | Criteria | Date |
|------|---------|------|
| **Design freeze** | RICE-sorted feature list approved; AA/VKYC vendor contracted | End Month 1 |
| **Alpha launch** | Core rewards engine + onboarding working; 1,000 beta users | End Month 3 |
| **Public launch** | 65% activation rate; 5 co-brand partners; PCI-DSS certified | End Month 4 |
| **Scale decision** | 25,000 active cards; NPS >= 45; 10+ partners | End Month 6 |
`;}


// =================================================================
// OKR FRAMEWORK -- Quarterly OKRs with baselines + confidence
// =================================================================
function mockOKR(ctx) {
  const { product, market, segment, inr, gbp } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# Quarterly OKRs -- ${product}

${hdr('Product Management','okr-framework','Strategy')}

> *Framework: John Doerr "Measure What Matters" + Google Ventures OKR methodology*
> *Aspirational OKRs: 70% hit = success | Committed OKRs: 100% expected*
> *Review cadence: Weekly confidence update | Monthly full OKR review*

---

## Key Insights

> 1. **3 strategic objectives** covering Acquisition, Activation/Engagement, and Product Quality.
> 2. **Health metrics** protect against gaming -- NPS and chargeback rate must not degrade.
> 3. **O1-KR1** (cards issued) is the single most important number this quarter.
> 4. **Confidence scores** are set conservatively at launch; update weekly.

---

## Objective 1: Establish ${product} as the go-to card for ${seg} enthusiasts in ${market}

*Type: Aspirational | Owner: PM + BD Lead | Quarter: Q1 Launch*

| # | Key Result | Baseline | Target | Type | Owner | Confidence |
|---|-----------|---------|--------|------|-------|-----------|
| KR1 | Cards issued | 0 | 25,000 | Committed | PM | 70% |
| KR2 | Activation rate (first spend in 30d) | 0% | >= 65% | Aspirational | PM + Design | 65% |
| KR3 | Co-brand partners live at launch | 2 (LOI) | >= 5 | Committed | BD Lead | 80% |
| KR4 | ${seg} category spend share | 0% | >= 25% | Aspirational | PM | 60% |

**Health metrics:** NPS >= 35 (do not degrade below) | Onboarding TAT <= 15 min (guardrail)

---

## Objective 2: Deliver a delightful, fast, digital-native card experience

*Type: Committed | Owner: Design Lead + Engineering Lead | Quarter: Q1 Launch*

| # | Key Result | Baseline | Target | Type | Owner | Confidence |
|---|-----------|---------|--------|------|-------|-----------|
| KR1 | Median onboarding TAT (AA path) | N/A (new) | < 10 minutes | Committed | Engineering | 75% |
| KR2 | VKYC completion rate | 0% | >= 80% | Committed | Design + Ops | 70% |
| KR3 | App store rating at 3-month mark | 0 | >= 4.2 / 5.0 | Aspirational | Design + PM | 65% |
| KR4 | P1 / P2 bug resolution time | N/A | P1 < 4h, P2 < 24h | Committed | Engineering | 85% |

**Health metrics:** System uptime >= 99.9% | PCI-DSS audit passed before launch

---

## Objective 3: Build the data and operational foundation for scale

*Type: Committed | Owner: Risk Lead + Engineering Lead | Quarter: Q1 Launch*

| # | Key Result | Baseline | Target | Type | Owner | Confidence |
|---|-----------|---------|--------|------|-------|-----------|
| KR1 | Credit decisioning automation rate | 0% | >= 70% STP | Committed | Risk | 75% |
| KR2 | Fraud / chargeback rate | 0% (new) | <= 0.15% | Committed | Risk + Engineering | 80% |
| KR3 | ${seg} MCC category tagging accuracy | 0% | >= 95% | Committed | Engineering | 85% |
| KR4 | Reward point calculation error rate | 0% | <= 0.01% | Committed | Engineering | 90% |

**Health metrics:** Regulatory audit findings = 0 critical | Data breach incidents = 0

---

## OKR Health Dashboard

| Objective | Confidence | Trend | RAG |
|-----------|-----------|-------|-----|
| O1: ${seg} card leader | 65% | Stable | Yellow |
| O2: Digital experience | 75% | Improving | Green |
| O3: Scale foundation | 82% | Stable | Green |

---

## Weekly Check-in Template

\`\`\`
OKR Weekly Check-in -- Week [N] of Q[N]
Date:
Author:

O1 KR1 (Cards issued): [Current] / 25,000 -- [Delta from last week] -- [Confidence %]
O1 KR2 (Activation rate): [Current %] -- [Delta] -- [Confidence %]
O2 KR1 (Onboarding TAT): [Current median] -- [Delta] -- [Confidence %]
O3 KR2 (Chargeback rate): [Current %] -- [Delta] -- [Confidence %]

What happened this week:
Blockers / Risks:
Decisions needed:
\`\`\`
`;}


// =================================================================
// BUSINESS CASE -- 3-year P&L + Options + Risk Register
// =================================================================
function mockBusinessCase(ctx) {
  const { product, market, segment, inr, gbp } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  const cy = inr ? 'Rs. Cr' : gbp ? 'GBP M' : 'USD M';
  return `# Business Case -- ${product}

${hdr('Product Management','business-case','Strategy')}

---

## Key Insights

> 1. **Recommended option:** Build in-house on API-first stack with card network co-issuance.
> 2. **Payback period:** 26 months from launch date.
> 3. **3-year NPV:** ${inr?'Rs.280 Cr positive':gbp?'GBP 28M positive':'USD 35M positive'} at 12% discount rate.
> 4. **Decision required:** Board approval of ${inr?'Rs.22 Cr':gbp?'GBP 2.2M':'USD 2.8M'} investment by end of Month 2.

---

## 1. Problem & Opportunity

**Problem:** ${seg}-active consumers in ${market} are underserved by existing credit cards. No single product is built for their lifestyle spend. This is a ${inr?'Rs.38,000 Cr':gbp?'GBP 42 Bn':'USD 165 Bn'} SAM growing at 16-20% YoY.

**Opportunity:** First-mover advantage in ${market} ${segment} lifestyle card -- a position no incumbent currently occupies. 12-18 month window before HDFC or another major issuer responds.

---

## 2. Options Considered

| Option | Description | Investment | Risk | Recommendation |
|--------|------------|-----------|------|---------------|
| **A -- Build (Recommended)** | In-house on API-first stack; card network co-issuance | ${inr?'Rs.22 Cr':gbp?'GBP 2.2M':'USD 2.8M'} | Medium | Yes |
| B -- Buy / Partner | White-label card from fintech issuer | ${inr?'Rs.8 Cr':gbp?'GBP 0.8M':'USD 1M'} + revenue share | Medium-High | No -- lose differentiation |
| C -- License | License rewards engine from third-party | ${inr?'Rs.5 Cr':gbp?'GBP 0.5M':'USD 0.6M'} + per-card fee | Low-Medium | No -- limits flexibility |
| D -- Do Nothing | No action | Zero | High | No -- market will move |

**Why Option A:** Building in-house creates a proprietary rewards engine and data asset that cannot be replicated. Options B and C commoditise the core differentiator (rewards architecture + spend intelligence).

---

## 3. Financial Model (3-Year, Option A)

### Revenue Assumptions
| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Active cardholders | 25,000 | 80,000 | 150,000 |
| Avg annual spend per card | ${inr?'Rs.1.5 LPA':'GBP 7,200'} | ${inr?'Rs.1.8 LPA':'GBP 8,400'} | ${inr?'Rs.2.0 LPA':'GBP 9,200'} |
| Interchange rate | 1.5% | 1.5% | 1.5% |
| **Interchange revenue** | **${inr?'Rs.56 Cr':'GBP 2.7M'}** | **${inr?'Rs.216 Cr':'GBP 10.1M'}** | **${inr?'Rs.450 Cr':'GBP 20.7M'}** |
| Annual fee revenue (net of waivers) | ${inr?'Rs.12 Cr':'GBP 1.1M'} | ${inr?'Rs.40 Cr':'GBP 3.6M'} | ${inr?'Rs.78 Cr':'GBP 7.1M'} |
| Partner / co-brand revenue | ${inr?'Rs.4 Cr':'GBP 0.4M'} | ${inr?'Rs.18 Cr':'GBP 1.6M'} | ${inr?'Rs.45 Cr':'GBP 4.1M'} |
| **Total Revenue** | **${inr?'Rs.72 Cr':'GBP 4.2M'}** | **${inr?'Rs.274 Cr':'GBP 15.3M'}** | **${inr?'Rs.573 Cr':'GBP 31.9M'}** |

### Cost Assumptions
| Cost Item | Year 1 | Year 2 | Year 3 |
|-----------|--------|--------|--------|
| Technology build (one-time) | ${inr?'Rs.14 Cr':'GBP 1.4M'} | ${inr?'Rs.3 Cr':'GBP 0.3M'} | ${inr?'Rs.2 Cr':'GBP 0.2M'} |
| Rewards cost (5x on ${segment} MCCs) | ${inr?'Rs.22 Cr':'GBP 1.3M'} | ${inr?'Rs.72 Cr':'GBP 4.3M'} | ${inr?'Rs.135 Cr':'GBP 8.0M'} |
| Marketing & acquisition | ${inr?'Rs.15 Cr':'GBP 1.5M'} | ${inr?'Rs.25 Cr':'GBP 2.3M'} | ${inr?'Rs.30 Cr':'GBP 2.8M'} |
| Operations & servicing | ${inr?'Rs.8 Cr':'GBP 0.8M'} | ${inr?'Rs.20 Cr':'GBP 1.9M'} | ${inr?'Rs.35 Cr':'GBP 3.3M'} |
| Credit losses (0.8% of portfolio) | ${inr?'Rs.3 Cr':'GBP 0.4M'} | ${inr?'Rs.9 Cr':'GBP 1.3M'} | ${inr?'Rs.24 Cr':'GBP 2.2M'} |
| **Total Costs** | **${inr?'Rs.62 Cr':'GBP 5.4M'}** | **${inr?'Rs.129 Cr':'GBP 10.1M'}** | **${inr?'Rs.226 Cr':'GBP 16.5M'}** |
| **Net Profit / (Loss)** | **${inr?'Rs.10 Cr':'(GBP 1.2M)'}** | **${inr?'Rs.145 Cr':'GBP 5.2M'}** | **${inr?'Rs.347 Cr':'GBP 15.4M'}** |

**Payback period:** ${inr?'~26 months':'~28 months'} from launch. 3-year cumulative net: ${inr?'Rs.502 Cr':'GBP 19.4M'}.

---

## 4. Strategic Fit

| Strategic Priority | Alignment | Evidence |
|-------------------|-----------|---------|
| Digital-first customer acquisition | High | AA onboarding is a strategic capability |
| Lifestyle / affinity banking | High | Purpose-built for ${seg} lifestyle |
| Partnership ecosystem | High | 10+ co-brand partners at launch |
| Data-driven credit decisions | High | AA + bureau data builds proprietary scoring model |
| Fee-based revenue diversification | Medium | Annual fee + partner revenue reduces interchange dependency |

---

## 5. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|-----------|
| R-01 | Co-brand partners do not commit to exclusivity | Medium | High | Pre-LOI with 2 backup partners per category |
| R-02 | Rewards cost exceeds model (higher ${segment} spend than forecast) | Medium | High | Dynamic rewards cap; spend-based fee waiver limits exposure |
| R-03 | HDFC launches competing product in Year 1 | High | Medium | Exclusivity clauses + IP on rewards engine |
| R-04 | AA / VKYC regulatory change delays launch | Low | High | Compliance track starts Week 1; escalation path with regulator |
| R-05 | Credit losses exceed 0.8% | Low | Medium | Conservative credit policy at launch; tighten via ML over time |

---

## 6. Recommendation & Decision Required

**Recommendation:** Approve Option A (Build) with a ${inr?'Rs.22 Cr':gbp?'GBP 2.2M':'USD 2.8M'} investment over 18 months. The ${market} ${segment} lifestyle card market is a real, growing, and underserved segment. The payback period of 26 months is within acceptable parameters, and the 3-year NPV of ${inr?'Rs.280 Cr':gbp?'GBP 28M':'USD 35M'} represents a compelling return.

**Decision required by:** End of Month 2 (design freeze and vendor contracts cannot proceed without board approval).

| Decision | If Approved | If Rejected |
|---------|------------|------------|
| Proceed with Option A | Launch in Month 4; first-mover advantage preserved | Competitor fills whitespace; opportunity lost |
| Commit capex | ${inr?'Rs.22 Cr':gbp?'GBP 2.2M':'USD 2.8M'} over 18 months | -- |
| Approve hiring plan | 8 FTEs (engineering + design + BD) | -- |
`;}


// =================================================================
// PROJECT CHARTER -- RACI + milestones + success criteria
// =================================================================
function mockProjectCharter(ctx) {
  const { product, market, segment, inr, gbp } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# Project Charter -- ${product}

${hdr('Project Management','project-charter','Initiation')}

---

## Key Insights

> 1. **Project:** Launch ${product} -- a ${segment} lifestyle credit card -- in ${market} within 9 months.
> 2. **Sponsor:** Chief Product Officer (or equivalent).
> 3. **Budget:** ${inr?'Rs.22 Cr':gbp?'GBP 2.2M':'USD 2.8M'} total (tech + marketing + ops).
> 4. **Critical path:** Visa/MC scheme approval and AA vendor contract are on the critical path.

---

## 1. Project Overview

| Field | Detail |
|-------|--------|
| Project Name | ${product} Launch Programme |
| Objective | Issue a ${segment} lifestyle credit card with 5x rewards, < 10-min digital onboarding, and 5+ co-brand partners |
| Sponsor | Chief Product Officer |
| PM | [Project Manager Name] |
| Start Date | Month 1 |
| Target Go-Live | Month 9 |
| Budget | ${inr?'Rs.22 Cr':gbp?'GBP 2.2M':'USD 2.8M'} |
| Status | Initiating |

---

## 2. Scope

### In Scope
- Digital card application (AA + VKYC)
- Rewards engine (5x ${segment} MCC, 1x base)
- Virtual card issuance
- ${seg} spend dashboard
- Co-brand partner integrations (>= 5 at launch)
- Physical card (EMV + contactless)
- In-app card controls

### Out of Scope (v1)
- EMI conversion
- International currency card
- Business / SME card
- Branch-based application

---

## 3. Key Milestones

| # | Milestone | Target Date | Owner | Dependencies |
|---|-----------|------------|-------|-------------|
| M-01 | Design freeze and vendor contracts signed | End Month 1 | PM | Board approval |
| M-02 | AA and VKYC vendor integrations complete | End Month 3 | Engineering Lead | Vendor selection |
| M-03 | Alpha launch (1,000 beta users) | End Month 4 | PM + Design | M-02 complete |
| M-04 | PCI-DSS Level 1 certification | End Month 5 | InfoSec | M-02 |
| M-05 | 5 co-brand partners integrated and live | End Month 6 | BD Lead | LOIs signed M-01 |
| M-06 | Card network (Visa/MC) scheme approval | End Month 6 | Compliance | Submitted M-01 |
| M-07 | Public launch | Month 7 | PM | M-04, M-05, M-06 |
| M-08 | 25,000 cards issued | Month 9 | Marketing | M-07 |

---

## 4. RACI Matrix

| Activity | Sponsor (CPO) | PM | Engineering | Design | Risk / Compliance | BD | Marketing |
|---------|:------------:|:--:|:-----------:|:------:|:-----------------:|:--:|:---------:|
| Project governance | A | R | I | I | C | I | I |
| Product requirements | C | A | C | R | C | C | I |
| Technology build | I | C | R/A | C | I | I | I |
| UX / design | I | C | C | R/A | I | I | C |
| Co-brand partnerships | A | C | I | I | I | R | C |
| Risk & compliance | C | C | C | I | R/A | I | I |
| Marketing & launch | A | C | I | C | I | I | R |
| Reporting to board | A | R | I | I | C | I | I |

*R = Responsible | A = Accountable | C = Consulted | I = Informed*
*One Accountable per row*

---

## 5. Budget Summary

| Category | ${inr?'Rs. Cr':'GBP M'} | % of Total |
|----------|:----:|:----------:|
| Technology build | ${inr?'14.0':'1.40'} | ${inr?'64%':'64%'} |
| Co-brand partner integrations | ${inr?'1.5':'0.15'} | 7% |
| Marketing (pre-launch) | ${inr?'4.0':'0.40'} | 18% |
| Operations setup | ${inr?'2.0':'0.20'} | 9% |
| Contingency (5%) | ${inr?'1.1':'0.11'} | 5% |
| **Total** | **${inr?'22.6':'2.26'}** | **100%** |

---

## 6. Risks & Issues at Initiation

| # | Risk | RAG | Owner | Mitigation |
|---|------|:---:|-------|-----------|
| R-01 | Visa/MC scheme approval delayed beyond Month 6 | Yellow | Compliance | Submit docs Week 2; weekly status; escalation path defined |
| R-02 | Co-brand partner LOIs not secured by Month 2 | Yellow | BD Lead | 3 anchor partners in active discussions; 2 backups per category |
| R-03 | AA/VKYC integration more complex than estimated | Yellow | Engineering Lead | Spike in Sprint 0; fixed-fee vendor contract |
| R-04 | Board approval of budget delayed | Red | Sponsor | Pre-read with CFO Week 2; contingency plan if delayed |

---

## 7. Success Criteria

| Criterion | Target | Measurement |
|-----------|--------|------------|
| Cards issued by Month 9 | 25,000 | Card issuance system |
| Activation rate (first spend in 30d) | >= 65% | CRM |
| Onboarding median TAT | < 10 minutes | App analytics |
| Co-brand partners at launch | >= 5 live | BD tracker |
| NPS at Month 6 | >= 45 | In-app NPS survey |
| ${seg} category spend share | >= 25% | Rewards engine data |
`;}


// =================================================================
// SPRINT PLAN -- Capacity table + Story points + Sprint goal
// =================================================================
function mockSprintPlan(ctx) {
  const { product, segment } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# Sprint Plan -- ${product}

${hdr('Project Management','sprint-plan','Delivery')}

> *Framework: Scrum | Sprint length: 2 weeks | Estimation: Story Points (Fibonacci)*

---

## Key Insights

> 1. **Sprint goal**: Deliver a working digital application flow from mobile number entry to virtual card in < 10 minutes.
> 2. **Team capacity**: 38 story points (after ceremonies, meetings, and 20% buffer).
> 3. **Committed scope**: 36 points (95% capacity) -- leaving 2 pts buffer for discovered work.
> 4. **Critical path item**: US-02 (AA integration) -- spike must complete Day 1-2.

---

## Sprint Overview

| Field | Detail |
|-------|--------|
| Sprint Number | Sprint 1 |
| Sprint Goal | Working onboarding flow: mobile OTP -> AA income verification -> VKYC -> virtual card |
| Sprint Duration | 2 weeks (10 working days) |
| Team Size | 5 engineers, 1 designer, 1 QA |
| Velocity (target) | 40 story points |
| Committed points | 36 |

---

## Team Capacity

| Team Member | Role | Available Days | Capacity (days) | Notes |
|------------|------|:-------------:|:---------------:|-------|
| Dev 1 | Backend (Senior) | 10 | 8 | 2 days ceremonies |
| Dev 2 | Backend (Mid) | 10 | 8 | 2 days ceremonies |
| Dev 3 | Frontend (Senior) | 10 | 8 | 2 days ceremonies |
| Dev 4 | Frontend (Mid) | 10 | 7 | 2 days ceremonies + 1 day leave |
| Dev 5 | Mobile (Senior) | 10 | 8 | 2 days ceremonies |
| QA 1 | QA Engineer | 10 | 8 | 2 days ceremonies |
| Designer | UX Designer | 10 | 7 | 2 days ceremonies + 1 day design system |
| **Total** | | | **54 days** | |
| Velocity buffer (20%) | | | | ~38 story points |

---

## Sprint Backlog

| Story ID | Title | Points | Assignee | Priority | Status |
|---------|-------|:------:|---------|:--------:|--------|
| US-01 | Application start (mobile OTP) | 3 | Dev 3 + Dev 5 | P0 | To Do |
| US-02 | AA-based income verification | 8 | Dev 1 + Dev 2 | P0 | To Do |
| US-03 | Instant credit decision | 5 | Dev 1 | P0 | To Do |
| US-04 | Video KYC (VKYC) integration | 5 | Dev 2 + Dev 5 | P0 | To Do |
| US-05 | Virtual card issuance | 5 | Dev 3 + Dev 5 | P0 | To Do |
| US-07 | Freeze / unfreeze card control | 3 | Dev 4 | P0 | To Do |
| TECH-01 | AA provider sandbox setup + spike | 5 | Dev 1 | P0 | To Do |
| TECH-02 | VKYC API integration (basic) | 3 | Dev 2 | P0 | To Do |
| **Total** | | **37** | | | |

---

## Sprint Ceremonies

| Ceremony | Day | Duration | Owner |
|---------|-----|---------|-------|
| Sprint Planning | Day 1 | 4 hours | PM |
| Daily Stand-up | Daily (Days 2-9) | 15 min | Dev Lead |
| Sprint Review | Day 10 AM | 1.5 hours | PM + Stakeholders |
| Retrospective | Day 10 PM | 1 hour | Scrum Master / PM |
| Backlog Refinement | Day 5 | 2 hours | PM + Tech Lead |

---

## Acceptance Criteria Summary

| Story | Done When |
|-------|----------|
| US-01 | OTP sent and verified; session persisted; 3-strike lockout working |
| US-02 | AA consent flow complete; account data received; alternative path if AA fails |
| US-03 | Approval / referred / decline states working; limit displayed on approval |
| US-04 | VKYC session initiates; recording stored; pass triggers card issuance |
| US-05 | Virtual card displayed with biometric reveal; Apple/Google Pay linkable |
| US-07 | Freeze toggles in < 5s; biometric required to unfreeze; events logged |
| TECH-01 | AA sandbox working; sample consent + data fetch demonstrable |
| TECH-02 | VKYC API responds; session initiation confirmed in test environment |

---

## Sprint Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| AA sandbox credentials delayed | High -- blocks US-02 | Dev 1 chases vendor Day 1; use mock data if needed |
| VKYC provider integration issues | Medium -- blocks US-04 | TECH-02 spike in Days 1-2; fallback to stub for demo |
| Scope creep from stakeholders | Medium | PM to enforce sprint freeze after Day 2 |
`;}


// =================================================================
// RAID LOG -- Full RAG status + owners + mitigation
// =================================================================
function mockRAIDLog(ctx) {
  const { product, segment, inr, gbp } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# RAID Log -- ${product}

${hdr('Project Management','raid-log','Delivery')}

> *RAID = Risks, Assumptions, Issues, Dependencies*
> *RAG: Green = On track | Amber = Monitor closely | Red = Escalation needed*
> *Review cadence: Weekly with PM; Fortnightly with sponsor*

---

## Key Insights

> 1. **1 Red item** (R-04): HDFC competitive response -- requires strategic pricing decision this week.
> 2. **3 Amber items**: Visa/MC approval timeline, co-brand LOIs, AA integration complexity.
> 3. **No active Issues** that are blocking delivery -- all issues have mitigations in place.
> 4. **Critical dependency**: Visa/MC scheme approval (D-01) is on the critical path -- ETA Month 6.

---

## 1. Risks

| ID | Risk | Probability | Impact | RAG | Owner | Mitigation | Review Date |
|----|------|:----------:|:------:|:---:|-------|-----------|------------|
| R-01 | Co-brand partner drops out pre-launch | Medium | High | Amber | BD Lead | Maintain 2 backup partners per category; monthly partner health check | Weekly |
| R-02 | VKYC regulatory approval delayed | Low | High | Amber | Compliance | Documents submitted Week 2; escalation path agreed with regulator | Fortnightly |
| R-03 | AA integration more complex than estimated | Medium | Medium | Amber | Tech Lead | Spike in Sprint 1; fixed-fee vendor contract with integration SLA | Sprint review |
| R-04 | HDFC launches competing ${segment} card | High | Medium | Red | PM + BD | Accelerate partner exclusivity clauses; file IP on rewards engine | This week |
| R-05 | Credit losses exceed 0.8% model | Low | High | Green | Risk Lead | Conservative credit policy at launch; ML model to tighten over time | Monthly |
| R-06 | PCI-DSS audit extends beyond Month 5 | Low | High | Green | InfoSec | QSA engaged Month 2; pre-audit gap assessment complete | Monthly |

---

## 2. Assumptions

| ID | Assumption | Criticality | Validation Method | Validated By | Status |
|----|-----------|:-----------:|------------------|-------------|--------|
| A-01 | Target personas willing to pay ${inr?'Rs.1,499':gbp?'GBP 99':'USD 99'} annual fee | High | A/B landing page test (Week 5) | PM | To validate |
| A-02 | Visa/MC scheme approval takes <= 10 weeks | High | Relationship manager confirmation | Compliance | Confirmed - verbal |
| A-03 | AA income data is sufficient for credit decisioning at 70% STP | High | Risk team analysis (Week 4) | Risk Lead | In progress |
| A-04 | VKYC completion rate will be >= 80% | Medium | Beta cohort test (Month 3) | Design | To validate |
| A-05 | 5+ co-brand partners will sign LOIs by Month 2 | High | BD pipeline review (weekly) | BD Lead | At risk |
| A-06 | ${seg} consumers will refer the card (NPS >= 50) | Medium | Beta cohort survey (Month 3) | PM | To validate |

---

## 3. Issues

| ID | Issue | Impact | RAG | Owner | Resolution Plan | Target Date |
|----|-------|--------|:---:|-------|----------------|------------|
| I-01 | Procurement review delaying partner LOIs by 1 week | Delay to M-02 | Amber | PM | Escalated to procurement head; fast-track review requested | Week 5 |
| I-02 | VKYC provider quote 40% above budget | Budget pressure | Amber | PM | Negotiating; two alternative vendors in parallel | Week 3 |
| I-03 | AA sandbox credentials not received (Day 3 of Sprint 1) | Sprint 1 scope at risk | Green | Tech Lead | Vendor chased daily; mock data ready as fallback | Day 5 |

---

## 4. Dependencies

| ID | Dependency | Type | Provider | Due Date | RAG | Status |
|----|-----------|:----:|---------|:--------:|:---:|--------|
| D-01 | Visa/MC scheme approval | External | Card network | Month 6 | Amber | In progress -- submitted Week 2 |
| D-02 | Account Aggregator API docs and sandbox | External | AA vendor | Month 2 | Amber | Docs received; sandbox credentials pending |
| D-03 | VKYC provider integration | External | VKYC vendor | Month 3 | Green | Vendor selected; contract in review |
| D-04 | Credit bureau API access | External | ${inr?'CIBIL / Experian':'Equifax / Experian'} | Month 2 | Green | Contract signed; integration starting |
| D-05 | PCI-DSS QSA engagement | External | QSA auditor | Month 2 | Green | QSA shortlisted; RFP responses received |
| D-06 | Co-brand partner API integrations (5 partners) | External | Each partner | Month 5 | Amber | 2 of 5 APIs confirmed; 3 in negotiation |
`;}


// =================================================================
// STATUS REPORT -- Executive dashboard + KPIs + Decisions log
// =================================================================
function mockStatusReport(ctx) {
  const { product, market, segment, inr, gbp } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# Project Status Report -- ${product}

${hdr('Project Management','status-report','Delivery')}

> *Audience: Steering Committee | Frequency: Fortnightly | Author: Project Manager*

---

## Executive Summary

| Field | Detail |
|-------|--------|
| Overall RAG | Amber |
| Schedule | Amber -- 1-week delay to partner LOI milestone |
| Budget | Green -- on budget (${inr?'Rs.4.2 Cr':'GBP 0.42M'} spent of ${inr?'Rs.22 Cr':'GBP 2.2M'}) |
| Scope | Green -- no change to agreed v1.0 scope |
| Quality | Green -- Sprint 1 velocity on target; no P0 defects |
| Key risk | Red -- Competitor intelligence suggests HDFC preparing a ${segment} rewards tier |

---

## Dashboard

| Metric | Target | Actual | Trend | RAG |
|--------|:------:|:------:|:-----:|:---:|
| Sprint velocity (last sprint) | 38 pts | 37 pts | Stable | Green |
| Sprint 1 stories completed | 8 / 8 | 8 / 8 | On track | Green |
| Partner LOIs signed | 5 by M2 | 2 of 5 | Behind | Amber |
| AA sandbox ready | Week 3 | Week 4 (delayed 1w) | Delayed | Amber |
| Budget spend vs. plan | ${inr?'Rs.2 Cr':'GBP 0.20M'} | ${inr?'Rs.1.8 Cr':'GBP 0.18M'} | Under | Green |
| VKYC vendor contract | Month 1 | In negotiation | Delayed | Amber |
| Regulatory submission (Visa/MC) | Week 2 | Complete | Done | Green |
| Headcount (actuals vs. plan) | 12 FTE | 11 FTE | 1 role open | Amber |

---

## Progress This Period

**Completed:**
- Sprint 1 delivered all 8 committed stories (37/38 points)
- Visa/MC scheme application submitted on time (Week 2)
- Credit bureau API contract signed with ${inr?'CIBIL':'Equifax'}
- QSA auditor shortlisted for PCI-DSS; RFP evaluation complete

**In Progress:**
- Sprint 2 underway: 5x rewards engine + spend dashboard (37 points committed)
- AA integration spike: sandbox credentials expected Week 4
- Co-brand partner LOI negotiations: 3 of 5 active; 2 signed

**Planned This Period:**
- VKYC vendor contract finalisation (target: end of week)
- Sprint 2 mid-sprint review (Day 5)
- Co-brand partner integration API workshops (3 partners)

---

## Issues & Risks

| ID | Item | RAG | Action Required |
|----|------|:---:|----------------|
| R-04 | HDFC preparing ${segment} rewards tier (intelligence) | Red | PM to recommend exclusivity pricing strategy to sponsor by Friday |
| A-05 | 3 of 5 co-brand LOIs not yet signed | Amber | BD Lead to escalate to CPO; unlock legal resource for fast-track review |
| D-02 | AA sandbox credentials delayed 1 week | Amber | Tech Lead chasing vendor daily; mock data in use for Sprint 2 |
| I-02 | VKYC vendor quote 40% over budget | Amber | Two alternatives in parallel; decision needed by end of week |

---

## Decisions Required

| # | Decision | Owner | Options | Required By |
|---|---------|-------|---------|------------|
| 1 | VKYC vendor selection (vendor A vs. B vs. in-house) | CPO / CTO | A: ${inr?'Rs.3.2 Cr':'GBP 0.32M'}, 8-week SLA | B: ${inr?'Rs.2.1 Cr':'GBP 0.21M'}, 12-week SLA | C: ${inr?'Rs.4.5 Cr':'GBP 0.45M'}, 6-week SLA | End of week |
| 2 | Partner exclusivity strategy in response to HDFC intelligence | CPO | Increase exclusivity budget vs. accelerate launch date | Friday |
| 3 | Headcount: open engineering role (backend) | CTO | Hire FTE vs. contractor | End of month |

---

## Next Period Plan

| Activity | Owner | Target Date |
|---------|-------|------------|
| Sprint 2 delivery (rewards engine + dashboard MVP) | Dev Lead | End of sprint |
| VKYC vendor contract signed | PM | End of week |
| Co-brand partners 3 and 4 LOIs signed | BD Lead | End of period |
| AA integration demo in test environment | Dev 1 | Day 8 of sprint |
| Retrospective and Sprint 3 planning | PM | Sprint end |
`;}


// =================================================================
// PLAN ON A PAGE -- One-page structured summary
// =================================================================
function mockPlanOnAPage(ctx) {
  const { product, market, segment, inr, gbp } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# Plan on a Page -- ${product}

${hdr('Project Management','plan-on-a-page','Planning')}

---

## One-Sentence Summary

> Launch ${product} in ${market} within 9 months: digital onboarding, 5x ${segment} rewards, 5+ co-brand partners, 25k active cards by Month 9.

---

## Strategic Objectives

| # | Objective | Success Metric | Owner |
|---|-----------|--------------|-------|
| 1 | First-to-market ${seg} lifestyle card | 25,000 cards in Month 9 | PM |
| 2 | Frictionless digital onboarding | Median TAT < 10 minutes at launch | Engineering Lead |
| 3 | Purpose-built rewards architecture | ${seg} spend share >= 25% by Month 6 | PM |
| 4 | Co-brand partner ecosystem | >= 5 live partners at launch | BD Lead |
| 5 | Compliance and regulatory approval | PCI-DSS + card network approval pre-launch | Compliance |

---

## Workstreams & Milestones

| Workstream | Month 1-2 | Month 3-4 | Month 5-6 | Month 7-9 |
|-----------|:--------:|:--------:|:--------:|:--------:|
| **Product & Design** | Discovery + PRD | UX + prototypes | UAT | Post-launch iteration |
| **Technology** | Vendor setup + spike | Core build | Integration test | Go-live + scale |
| **Partnerships (BD)** | LOIs signed | API integration | Partner go-live | Scale to 10+ |
| **Risk & Compliance** | Regulatory submissions | Review | PCI-DSS audit | Monitoring |
| **Marketing** | Strategy + brand | Creative | Soft launch | Mass media |

---

## Budget at a Glance

| Category | ${inr?'Rs. Cr':'GBP M'} | % |
|----------|:----:|:-:|
| Technology build | ${inr?'14.0':'1.40'} | 64% |
| Partner integrations | ${inr?'1.5':'0.15'} | 7% |
| Marketing (Year 1) | ${inr?'5.0':'0.50'} | 23% |
| Contingency | ${inr?'1.1':'0.11'} | 5% |
| **Total approved** | **${inr?'21.6':'2.16'}** | **100%** |

---

## Risk Heatmap

| Probability | Low Impact | Medium Impact | High Impact |
|------------|-----------|--------------|------------|
| **High** | -- | R-04: HDFC competitor | -- |
| **Medium** | -- | R-03: AA complexity | R-01: Partner LOIs |
| **Low** | -- | R-05: Credit losses | R-02: VKYC approval |

---

## Top 5 Risks

| # | Risk | RAG | Mitigation |
|---|------|:---:|-----------|
| 1 | HDFC launches competing ${segment} tier | Red | Partner exclusivity clauses; accelerate launch |
| 2 | Partner LOI delays (< 5 signed by M2) | Amber | 2 backup partners per category; BD escalation |
| 3 | VKYC approval / budget | Amber | 3 vendors in parallel; decision by end of week |
| 4 | AA integration complexity | Amber | Spike Sprint 1; fixed-fee SLA with vendor |
| 5 | PCI-DSS audit extending | Green | QSA engaged Month 2; pre-audit gap assessment |

---

## Key Decisions Log

| # | Decision | Date | Decided By | Outcome |
|---|---------|------|-----------|---------|
| D-01 | Build vs. Buy | Month 1 | CPO + CFO | Build (Option A) -- ${inr?'Rs.22 Cr':'GBP 2.2M'} approved |
| D-02 | Card network: Visa vs. Mastercard | Month 1 | PM + Compliance | Visa -- better co-brand partner network |
| D-03 | VKYC vendor | Pending | CTO | 3 vendors short-listed; decision end of week |

---

## Next 4 Weeks

| Week | Priority Actions |
|------|----------------|
| Week 3 | VKYC vendor decision; AA sandbox in test environment; Sprint 2 mid-review |
| Week 4 | Co-brand partners 3 and 4 LOIs; Sprint 2 delivery |
| Week 5 | Sprint 3 planning; rewards engine demo to steering; A/B fee test live |
| Week 6 | Sprint 3 mid-review; PCI-DSS pre-audit gap assessment |

---

## Go / No-Go Decision Gate

**Next gate: End of Month 4 (Alpha Launch)**

| Criterion | Target | Current |
|-----------|--------|--------|
| Core onboarding flow working | Yes | In build |
| 5x rewards engine complete | Yes | In build |
| 1,000 beta users recruited | Yes | Waitlist: 342 |
| 3+ co-brand partners live | Yes | 2 signed |
| P0 / P1 defects | 0 | 0 (Sprint 1) |
`;}


// =================================================================
// STAKEHOLDER MAP -- Influence/Interest grid + RACI + Comms plan
// =================================================================
function mockStakeholderMap(ctx) {
  const { product, market, segment } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# Stakeholder Map -- ${product}

${hdr('Project Management','stakeholder-map','Initiation')}

> *Framework: Mendelow's Power/Interest Grid + RACI*
> *Review cadence: Monthly -- influence and interest shift as project progresses*

---

## Key Insights

> 1. **6 high-influence stakeholders** require active management -- all must be green before launch.
> 2. **Biggest blocker risk**: CFO (budget guardian) and Card Network Regulator (approval dependency).
> 3. **Change champion**: Chief Digital Officer -- high influence, actively supportive.
> 4. **Watch list**: HDFC Product Team -- high influence externally; track their moves weekly.

---

## 1. Stakeholder Register

| # | Stakeholder | Role | Influence (1-5) | Interest (1-5) | Quadrant | Stance |
|---|------------|------|:---------------:|:---------------:|----------|--------|
| 1 | Chief Product Officer | Sponsor | 5 | 5 | Manage Closely | Champion |
| 2 | Chief Technology Officer | Tech approval | 5 | 4 | Manage Closely | Supportive |
| 3 | Chief Financial Officer | Budget guardian | 5 | 3 | Keep Satisfied | Neutral |
| 4 | Chief Digital Officer | Digital strategy | 4 | 5 | Manage Closely | Champion |
| 5 | Card Network (Visa/MC) | Scheme approval | 5 | 2 | Keep Satisfied | Neutral (external) |
| 6 | Regulator (${market === 'India'?'RBI':'FCA'}) | Compliance approval | 5 | 2 | Keep Satisfied | Neutral (external) |
| 7 | Risk & Compliance Lead | Risk sign-off | 3 | 5 | Manage Closely | Supportive |
| 8 | Co-brand Partners (gym, gear, events) | Revenue partner | 3 | 4 | Keep Informed | Supportive |
| 9 | Technology Vendors (AA, VKYC) | Delivery partner | 2 | 5 | Keep Informed | Supportive |
| 10 | ${seg} Customer Community | End users | 2 | 4 | Keep Informed | Positive |
| 11 | Internal Operations Team | Card servicing | 2 | 3 | Monitor | Neutral |
| 12 | Marketing Team | Launch execution | 3 | 4 | Keep Informed | Supportive |
| 13 | Legal Team | Contract review | 3 | 3 | Keep Informed | Neutral |
| 14 | HDFC Product Team (competitor) | External threat | 4 | 3 | Monitor | Adverse |

---

## 2. Influence/Interest Grid

\`\`\`
HIGH        | KEEP SATISFIED        | MANAGE CLOSELY
INFLUENCE   | CFO                   | CPO, CTO, CDO
(4-5)       | Card Network          | Risk Lead
            | Regulator             | HDFC (watch)
            |-----------------------|------------------
LOW         | MONITOR               | KEEP INFORMED
INFLUENCE   | Internal Ops          | Co-brand Partners
(1-3)       |                       | VKYC/AA Vendors
            |                       | Marketing, Legal
            |                       | ${seg} Community
            +-----LOW INTEREST------+-----HIGH INTEREST-----
                    (1-2)                    (3-5)
\`\`\`

---

## 3. Blockers & Key Risks

| Stakeholder | Risk | Impact | Mitigation |
|------------|------|--------|-----------|
| CFO | Rejects budget or requires resubmission | High | Pre-read in Week 2; strong business case with 26-month payback |
| Card Network | Scheme approval delayed beyond Month 6 | High | Weekly relationship manager calls; escalation path agreed |
| Regulator | Regulatory change to ${market === 'India'?'credit card issuance or AA norms':'FCA card regulation'} | High | Compliance counsel engaged; regulatory change monitoring |
| HDFC Product Team | Launches competing ${segment} card before us | Medium | Accelerate exclusivity clauses; monitor weekly |
| Co-brand Partners | Pull out of LOI or delay API integration | High | 2 backup partners per category; legal penalty clauses |

---

## 4. RACI Matrix

| Activity | CPO | CTO | CFO | CDO | Risk Lead | BD Lead | PM |
|---------|:---:|:---:|:---:|:---:|:---------:|:-------:|:--:|
| Business case approval | A | C | R | C | C | I | R |
| Product requirements | A | C | I | C | C | C | R |
| Technology build | C | A | I | I | I | I | C |
| Partner contracts | A | I | C | I | I | R | C |
| Regulatory submissions | C | C | I | I | R | I | A |
| Go/no-go at Alpha | A | C | C | C | C | C | R |
| Public launch approval | A | C | C | A | C | C | R |
| Board reporting | R | C | C | I | C | I | A |

*R = Responsible | A = Accountable (one per row) | C = Consulted | I = Informed*

---

## 5. Communication Plan

| Quadrant | Stakeholders | Method | Frequency | Owner |
|---------|-------------|--------|-----------|-------|
| Manage Closely | CPO, CTO, CDO, Risk Lead | 1:1 + weekly project meeting | Weekly | PM |
| Keep Satisfied | CFO, Card Network, Regulator | Status report + meeting | Fortnightly | PM + Compliance |
| Keep Informed | BD, Vendors, Marketing, Legal | Email update + Confluence | Fortnightly | PM |
| Monitor | Internal Ops, HDFC (competitive intel) | RAID log review | Monthly | PM |

---

## 6. Engagement Actions (Next 30 Days)

| # | Stakeholder | Action | Owner | By When |
|---|------------|--------|-------|---------|
| 1 | CFO | Business case pre-read (informal walkthrough before formal submission) | PM + CPO | Week 2 |
| 2 | Card Network | Submit scheme application; schedule monthly update calls | Compliance | Week 2 |
| 3 | Co-brand Partner 3 (gym chain) | LOI negotiation final round; legal review | BD Lead | Week 3 |
| 4 | VKYC Vendor | Contract negotiation finalisation | PM + Legal | Week 3 |
| 5 | ${seg} Community | Launch waitlist page; start collecting NPS-ready audience | Marketing | Week 4 |
`;}


// =================================================================
// EXECUTIVE SUMMARY -- Amazon Working Backwards PR/FAQ format
// =================================================================
function mockExecSummary(ctx) {
  const { product, market, segment, inr, gbp } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# Executive Summary -- ${product}

${hdr('Product Management','executive-summary','Strategy')}

> *Format: Amazon Working Backwards Press Release / FAQ*
> *Audience: C-suite, board, and senior leadership | Length: 1 page*

---

## PRESS RELEASE

**FOR IMMEDIATE RELEASE**

### ${product}: The First Credit Card Built for ${seg} Enthusiasts in ${market}

**${market}, [Launch Date]** -- [Company Name] today announced the launch of **${product}**, the first credit card purpose-built for the ${inr?'6.2 million':'2.1 million'} ${segment}-active consumers in ${market} who spend significantly on fitness, sports gear, events, and active travel -- yet earn almost nothing in return from their existing cards.

Starting today, ${seg} enthusiasts can apply online, get approved in under 10 minutes using their bank account data, and receive a virtual card to use immediately. Every purchase at a qualifying ${segment} merchant earns **5x rewards points**, and cardholders unlock exclusive offers from 10+ co-brand partners including leading gym chains, sports gear retailers, and event ticketing platforms.

*"${seg} consumers in ${market} have been underserved for too long,"* said [CEO/CPO Name]. *"${product} was designed around their lifestyle -- not retrofitted. This is what a card built for them actually looks like."*

${product} is available now at [URL]. Annual fee: ${inr?'Rs.1,499':gbp?'GBP 99':'USD 99'} (waived on ${inr?'Rs.80,000':'GBP 4,000'} annual spend).

---

## KEY BENEFITS AT A GLANCE

| Benefit | ${product} | Best Incumbent |
|---------|-----------|---------------|
| ${seg} category rewards | **5x points** | 1x (generic) |
| Digital onboarding | **< 10 minutes** | 5-7 days |
| Co-brand partners | **10+ at launch** | 0-2 |
| Spend dashboard | **${seg} categorised** | Generic / none |
| Annual fee waiver | **Yes (spend-linked)** | Varies |

---

## FREQUENTLY ASKED QUESTIONS

**Q: Who is this card for?**
A: ${seg}-active consumers aged 25-38 in ${market} who spend ${inr?'Rs.8,000+':'GBP 400+'} per month on gym memberships, sports gear, fitness apps, event tickets, and active travel. If your card doesn't reward your biggest spend categories, this card was built for you.

**Q: What makes the rewards different?**
A: ${product} earns 5x points on qualifying ${segment} merchant categories (sports retail, fitness, event ticketing, active travel). That's 5x more than a generic 1x cashback card on the same spend. Points can be redeemed for ${segment} products, partner vouchers, or statement credit.

**Q: How does the 10-minute onboarding work?**
A: Applicants share their bank account data via Account Aggregator (one tap, fully consent-based). Our decisioning engine processes income and credit data in under 30 seconds. Approved applicants complete a 5-minute Video KYC, and a virtual card is issued immediately.

**Q: What is the annual fee, and is there a waiver?**
A: The annual fee is ${inr?'Rs.1,499':gbp?'GBP 99':'USD 99'}. It is fully waived when annual card spend exceeds ${inr?'Rs.80,000':'GBP 4,000'}. For most active cardholders, the rewards earned on their ${segment} spend will exceed the annual fee within the first 3 months.

**Q: How does this compare to the Kotak League card?**
A: The Kotak League has limited sports event access but no fitness rewards, no ${segment} gear rewards, a 6+ day physical card process, and a dated digital experience. ${product} offers broader ${segment} rewards, 10x more co-brand partners, and instant digital access.

**Q: What decision is needed from leadership?**
A: Board approval of ${inr?'Rs.22 Cr':gbp?'GBP 2.2M':'USD 2.8M'} investment by end of Month 2. Marketing launch plan approval by end of Month 4.
`;}


// =================================================================
// CHANGE REQUEST -- Impact assessment across SQCR + options analysis
// =================================================================
function mockChangeRequest(ctx) {
  const { product, segment, inr, gbp } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# Change Request CR-001 -- ${product}

${hdr('Project Management','change-request','Delivery')}

> *Format: Formal Change Control document for CCB (Change Control Board) review*
> *Baseline: Approved scope, schedule, and budget as of Month 1 board approval*

---

## Change Summary

| Field | Detail |
|-------|--------|
| CR Number | CR-001 |
| Change Title | Add UPI Credit Line Integration to v1.0 Scope |
| Requestor | PM |
| Date Raised | [Date] |
| Priority | High |
| Type | Scope Addition |
| Status | Pending CCB Approval |

---

## 1. Change Description

**Requested change:** Add UPI credit line linkage to the v1.0 launch scope.

**Current baseline:** v1.0 scope does not include UPI credit line integration. It was classified as a "Should Have" feature for post-launch (Next horizon in the roadmap).

**Proposed change:** Integrate the ${inr?'UPI credit line per the RBI circular':'Open Banking payment rail'} before the public launch, enabling cardholders to use their credit line for ${inr?'UPI':'digital wallet'} transactions and earn 1x base points.

---

## 2. Reason / Trigger

| Trigger | Detail |
|---------|--------|
| Regulatory requirement | ${inr?'RBI circular (2024) mandates that credit card issuers make credit lines available on UPI by December 2024':'FCA guidance recommends Open Banking payment linkage for new card issuers'} |
| Competitive signal | Axis Bank and HDFC are both activating UPI credit line ahead of schedule |
| Commercial impact | ${inr?'UPI':'Digital wallet'} adoption is the fastest-growing payment channel; cards without this integration will miss ~15% of addressable spend at launch |

---

## 3. Impact Assessment

| Dimension | Baseline | With Change | Delta | Impact |
|-----------|---------|------------|-------|--------|
| **Scope** | No UPI integration | UPI credit line live at launch | +1 feature | Medium |
| **Schedule** | Month 7 launch | Month 7 launch (no slip IF vendor API ready by Month 4) | 0 weeks IF on time | Amber |
| **Budget** | ${inr?'Rs.14 Cr':'GBP 1.4M'} tech budget | +${inr?'Rs.1.8 Cr':'GBP 0.18M'} for UPI integration | +${inr?'Rs.1.8 Cr':'GBP 0.18M'} | Medium |
| **Quality** | Established test scope | Additional ${inr?'UPI':'digital wallet'} test scenarios required | +15 test cases | Low |
| **Resources** | Current team | 1 additional backend engineer for 6 weeks | +6 engineer-weeks | Medium |
| **Risk** | AA/VKYC critical path | ${inr?'UPI':'Open Banking'} API adds new vendor dependency | +1 dependency | Medium |

---

## 4. Dependencies and Knock-ons

| # | Impact Area | Detail |
|---|------------|--------|
| 1 | ${inr?'UPI':'Open Banking'} vendor API | Requires new vendor engagement or extension of existing AA vendor scope |
| 2 | Test plan | Additional 15 test scenarios for ${inr?'UPI':'digital wallet'} flows |
| 3 | Sprint 3 scope | 8 story points added to Sprint 3 -- must be reviewed at Sprint 3 planning |
| 4 | Compliance | Additional regulatory sign-off on ${inr?'UPI credit line circular':'Open Banking linkage'} needed |
| 5 | Marketing | Launch messaging updated to include "${inr?'UPI':'Digital wallet'} credit line" as a feature |

---

## 5. Options

| Option | Description | Schedule Impact | Cost Impact | Recommendation |
|--------|------------|:--------------:|:-----------:|:--------------:|
| **A -- Approve (in v1.0)** | Integrate ${inr?'UPI':'Open Banking'} before launch | Zero (if API ready by M4) | +${inr?'Rs.1.8 Cr':'GBP 0.18M'} | **Recommended** |
| B -- Defer to v1.1 | Launch without ${inr?'UPI':'Open Banking'}; add in Month 2 post-launch | -3 weeks complexity in v1.0 | Nil | Risk: competitive disadvantage |
| C -- Reject | Do not build UPI integration in 2024 | None | None | Risk: regulatory non-compliance |

---

## 6. Recommendation

**Approve Option A.** The ${inr?'RBI regulatory':'FCA guidance'} requirement and competitive pressure make this a high-priority addition. The cost increase of ${inr?'Rs.1.8 Cr':'GBP 0.18M'} is within the project contingency budget. Schedule risk is manageable if vendor API access is confirmed by Month 4.

---

## 7. Decision Required

| Field | Detail |
|-------|--------|
| Decision | Approve / Defer / Reject |
| Decision authority | Change Control Board (CPO + CTO + CFO) |
| Required by | [Date -- before Sprint 3 planning] |
| If not decided by deadline | Default to Option B (defer) to protect Sprint 3 scope |
`;}


// =================================================================
// ESCALATION BRIEF -- SBAR format + quantified impact + 3 options
// =================================================================
function mockEscalationBrief(ctx) {
  const { product, segment, inr, gbp } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# Escalation Brief -- ${product}

${hdr('Project Management','escalation-brief','Delivery')}

> *Format: SBAR (Situation, Background, Assessment, Recommendation)*
> *Audience: CPO / Steering Committee | Reading time: 3 minutes*
> *Escalation level: Yellow -> Red (decision required within 48 hours)*

---

## SITUATION

**What has gone wrong:**
The VKYC (Video KYC) vendor we selected has increased their quoted price by 40% at contract signing, from ${inr?'Rs.2.2 Cr':'GBP 0.22M'} to ${inr?'Rs.3.1 Cr':'GBP 0.31M'} for the 3-year contract. Simultaneously, their integration SLA has extended from 8 weeks to 12 weeks, which pushes the alpha launch from Month 4 to Month 5.

---

## BACKGROUND

| Context | Detail |
|---------|--------|
| VKYC role | Mandatory regulatory step -- every applicant must complete VKYC before a credit card is issued |
| Original timeline | VKYC integration complete by end of Month 3; alpha launch Month 4 |
| Vendor selected | [Vendor Name] -- selected in Month 1 after RFP with 3 vendors |
| Why now | Price escalation surfaced during legal review of final contract |
| What we tried | Negotiated price reduction -- vendor reduced by 10% only (to ${inr?'Rs.2.8 Cr':'GBP 0.28M'}); timeline unchanged |

---

## ASSESSMENT

**If unresolved (do nothing):**
- Budget overrun: ${inr?'Rs.0.6 Cr':'GBP 0.06M'} (vs. original quote) -- within contingency but leaves almost no buffer
- Schedule: Alpha launch slips from Month 4 to Month 5 -- public launch slips from Month 7 to Month 8
- Commercial impact: 1-month delay = ~${inr?'Rs.8 Cr':'GBP 0.8M'} lost first-year revenue (4,000 fewer cards in Year 1)
- Competitive risk: HDFC intelligence suggests they are preparing a ${segment} tier -- every month matters

**Quantified impact of doing nothing:**
| Impact | Amount |
|--------|--------|
| Additional cost | ${inr?'+Rs.0.6 Cr':'+GBP 0.06M'} |
| Schedule slip | 4 weeks (alpha) / 4 weeks (public launch) |
| Revenue at risk (Year 1) | ${inr?'Rs.8 Cr':'GBP 0.8M'} |
| Competitive risk | High (HDFC window narrows) |

---

## OPTIONS

| Option | Description | Cost | Schedule | Risk |
|--------|------------|:----:|:--------:|:----:|
| **A -- Accept and proceed (Recommended)** | Accept ${inr?'Rs.2.8 Cr':'GBP 0.28M'} + 12-week SLA; re-baseline schedule | ${inr?'+Rs.0.6 Cr':'+GBP 0.06M'} | -4 weeks | Low |
| B -- Switch vendors | Engage Vendor B (RFP runner-up); re-run contracting | ${inr?'Rs.2.0 Cr':'GBP 0.20M'} | -8 weeks (re-contracting) | High |
| C -- Build in-house | Build VKYC capability internally | ${inr?'Rs.4.5 Cr':'GBP 0.45M'} | -16 weeks | Very High |

---

## RECOMMENDATION

**Option A -- Accept and proceed.** The cost overrun (${inr?'Rs.0.6 Cr':'GBP 0.06M'}) is within contingency. Re-contracting with Vendor B (Option B) risks an additional 8-week delay as we restart legal and procurement -- a worse outcome than the 4-week slip with Option A.

---

## ASK

| Ask | From | By When |
|-----|------|---------|
| Approve budget increase of ${inr?'Rs.0.6 Cr':'GBP 0.06M'} from contingency | CFO | 48 hours |
| Approve revised milestone dates (alpha Month 5, launch Month 8) | CPO | 48 hours |
| Brief Board on schedule change | CPO | This week's board update |
`;}


// =================================================================
// PROCESS FLOW -- Mermaid flowchart + step-by-step table
// =================================================================
function mockProcessFlow(ctx) {
  const { product, segment } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# Process Flow -- ${product} Card Application

${hdr('Product Management','process-flow','Design')}

---

## Key Insights

> 1. **7-step end-to-end flow** from landing page to active virtual card.
> 2. **Critical path**: AA consent + credit decision (Steps 3-4) -- optimize for < 60 seconds.
> 3. **Two exit points**: Declined (Step 4) and VKYC failure (Step 6) -- both handled gracefully.
> 4. **Goal**: Median TAT from Step 1 to active virtual card < 10 minutes.

---

## Process Diagram

\`\`\`mermaid
flowchart TD
    A([Customer lands on ${product} app]) --> B[Enter mobile number]
    B --> C{OTP verified?}
    C -- No --> B
    C -- Yes --> D[Enter PAN + date of birth]
    D --> E[Account Aggregator consent \n share bank statement]
    E --> F{AA data received?}
    F -- No --> G[Offer manual upload alternative]
    G --> H{Credit decision}
    F -- Yes --> H
    H -- Declined --> I([Show decline reason \n + alternate products])
    H -- Referred --> J([Manual review \n 2 business days SLA])
    H -- Approved --> K[Show credit limit \n + card details preview]
    K --> L[Video KYC session \n with live agent]
    L --> M{VKYC passed?}
    M -- No --> N([Schedule retry \n or branch option])
    M -- Yes --> O[Issue virtual card \n + add to Apple/Google Pay]
    O --> P([Card active - ready to spend!])

    style A fill:#1a3a2a,color:#fff
    style P fill:#1a3a2a,color:#fff
    style I fill:#5c1a1a,color:#fff
    style N fill:#5c1a1a,color:#fff
    style H fill:#3a3a1a,color:#fff
\`\`\`

---

## Step-by-Step Process

| Step | Action | Actor | System | SLA | Success Criteria |
|------|--------|-------|--------|-----|-----------------|
| 1 | Enter mobile number; receive and verify OTP | Customer | App + OTP service | < 30 sec | OTP verified; session open |
| 2 | Enter PAN and date of birth | Customer | App + bureau | < 60 sec | PAN valid; not on denylist |
| 3 | Grant AA consent; share bank account data | Customer + AA | App + AA provider | < 2 min | Account data received |
| 4 | Credit decisioning (ML model) | System | Decisioning engine | < 30 sec | Approved / Referred / Declined |
| 5 | Review credit limit and card terms | Customer | App | < 2 min | Terms accepted |
| 6 | Complete Video KYC with live agent | Customer + Agent | VKYC platform | < 5 min | Identity verified; recording stored |
| 7 | Virtual card issued; Apple/Google Pay linked | System | Card issuing system | < 60 sec | Card active; PIN set |
| **Total** | | | | **< 10 min (target)** | **Virtual card active** |

---

## Exception Flows

| Exception | Trigger | Resolution |
|-----------|---------|-----------|
| OTP not received | Telecom delay or wrong number | Resend OTP button (30-second cooldown); max 3 resends |
| AA consent declined | Customer doesn't want to share bank data | Offer manual income document upload |
| AA data incomplete | Insufficient transaction history | Prompt to add additional bank account |
| Credit declined | Below credit risk threshold | Show generic decline reason; offer secured card alternative |
| VKYC agent unavailable | Queue > 5 minutes | Show estimated wait time; offer scheduled callback |
| VKYC identity mismatch | Name/PAN doesn't match video | Allow retry once; otherwise refer to branch |

---

## Process KPIs

| KPI | Target | Measurement |
|-----|--------|------------|
| Median end-to-end TAT | < 10 minutes | App analytics (Step 1 to Step 7) |
| Straight-through processing rate | >= 70% | % applications requiring no manual intervention |
| VKYC completion rate | >= 80% | VKYC sessions completed / initiated |
| AA consent rate | >= 75% | AA consents granted / requested |
| Step 4 (decision) response time | < 30 seconds | Decisioning engine logs |
`;}


// =================================================================
// DRAW.IO SWIMLANE -- mxGraph XML + description
// =================================================================
function mockDrawioSwimlane(ctx) {
  const { product, segment } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `# Cross-Functional Swimlane -- ${product} Onboarding

${hdr('Product Management','drawio-swimlane','Design')}

> *Import the XML below into diagrams.net (draw.io) to view and edit the swimlane diagram.*
> *Methodology: BPMN-inspired cross-functional flow with pool/lane container hierarchy.*

---

## Swimlane Overview

**Pools (Departments):**
- **Customer** -- Initiates application; completes KYC
- **${product} App** -- Orchestrates the digital flow
- **Risk & Decisioning** -- AA integration + credit model
- **Operations** -- VKYC agent + card issuance

**Flow:** Customer -> App -> Risk -> Operations -> Customer (active card)

---

## draw.io XML

\`\`\`drawio-xml
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>

    <!-- POOL: Application Process -->
    <mxCell id="pool1" value="${product} -- Card Application Process"
      style="shape=pool;startSize=20;horizontal=1;childLayout=stackLayout;horizontalStack=0;resizeParent=1;resizeParentMax=0;collapsible=0;marginBottom=0;swimlaneHead=0;fillColor=#1a2a3a;fontColor=#ffffff;strokeColor=#5a7a9a;fontSize=12;fontStyle=1;"
      vertex="1" parent="1">
      <mxGeometry x="40" y="40" width="900" height="480" as="geometry"/>
    </mxCell>

    <!-- LANE 1: Customer -->
    <mxCell id="lane1" value="Customer"
      style="swimlane;startSize=30;horizontal=0;collapsible=0;fillColor=#0d2a0d;fontColor=#90ee90;strokeColor=#336633;fontSize=11;fontStyle=1;"
      vertex="1" parent="pool1">
      <mxGeometry x="0" y="20" width="900" height="110" as="geometry"/>
    </mxCell>
    <mxCell id="c1" value="Open App" style="rounded=1;fillColor=#1e4d1e;fontColor=#fff;strokeColor=#336633;" vertex="1" parent="lane1">
      <mxGeometry x="30" y="35" width="100" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="c2" value="Enter Mobile + OTP" style="rounded=1;fillColor=#1e4d1e;fontColor=#fff;strokeColor=#336633;" vertex="1" parent="lane1">
      <mxGeometry x="170" y="35" width="120" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="c3" value="Grant AA Consent" style="rounded=1;fillColor=#1e4d1e;fontColor=#fff;strokeColor=#336633;" vertex="1" parent="lane1">
      <mxGeometry x="430" y="35" width="120" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="c4" value="Complete VKYC" style="rounded=1;fillColor=#1e4d1e;fontColor=#fff;strokeColor=#336633;" vertex="1" parent="lane1">
      <mxGeometry x="700" y="35" width="120" height="40" as="geometry"/>
    </mxCell>

    <!-- LANE 2: App -->
    <mxCell id="lane2" value="${product} App"
      style="swimlane;startSize=30;horizontal=0;collapsible=0;fillColor=#1a1a3a;fontColor=#add8e6;strokeColor=#334466;fontSize=11;fontStyle=1;"
      vertex="1" parent="pool1">
      <mxGeometry x="0" y="130" width="900" height="110" as="geometry"/>
    </mxCell>
    <mxCell id="a1" value="Validate PAN + Bureau Check" style="rounded=1;fillColor=#1a1a4d;fontColor=#fff;strokeColor=#334466;" vertex="1" parent="lane2">
      <mxGeometry x="170" y="35" width="120" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="a2" value="Route to AA Provider" style="rounded=1;fillColor=#1a1a4d;fontColor=#fff;strokeColor=#334466;" vertex="1" parent="lane2">
      <mxGeometry x="340" y="35" width="120" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="a3" value="Issue Virtual Card" style="rounded=1;fillColor=#2d4d2d;fontColor=#fff;strokeColor=#336633;" vertex="1" parent="lane2">
      <mxGeometry x="700" y="35" width="120" height="40" as="geometry"/>
    </mxCell>

    <!-- LANE 3: Risk & Decisioning -->
    <mxCell id="lane3" value="Risk and Decisioning"
      style="swimlane;startSize=30;horizontal=0;collapsible=0;fillColor=#3a1a1a;fontColor=#ffcccc;strokeColor=#663333;fontSize=11;fontStyle=1;"
      vertex="1" parent="pool1">
      <mxGeometry x="0" y="240" width="900" height="110" as="geometry"/>
    </mxCell>
    <mxCell id="r1" value="AA Income Fetch" style="rounded=1;fillColor=#4d1a1a;fontColor=#fff;strokeColor=#663333;" vertex="1" parent="lane3">
      <mxGeometry x="430" y="35" width="120" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="r2" value="Credit Decision (ML)" style="rhombus;fillColor=#4d1a1a;fontColor=#fff;strokeColor=#663333;" vertex="1" parent="lane3">
      <mxGeometry x="580" y="25" width="100" height="60" as="geometry"/>
    </mxCell>

    <!-- LANE 4: Operations -->
    <mxCell id="lane4" value="Operations (VKYC + Cards)"
      style="swimlane;startSize=30;horizontal=0;collapsible=0;fillColor=#1a2a3a;fontColor=#ffffcc;strokeColor=#666633;fontSize=11;fontStyle=1;"
      vertex="1" parent="pool1">
      <mxGeometry x="0" y="350" width="900" height="110" as="geometry"/>
    </mxCell>
    <mxCell id="o1" value="VKYC Agent Session" style="rounded=1;fillColor=#2a2a1a;fontColor=#fff;strokeColor=#666633;" vertex="1" parent="lane4">
      <mxGeometry x="700" y="35" width="120" height="40" as="geometry"/>
    </mxCell>

    <!-- EDGES (cross-lane -- parent = pool1) -->
    <mxCell id="e1" edge="1" source="c1" target="a1" parent="pool1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e2" edge="1" source="c2" target="a1" parent="pool1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e3" edge="1" source="a1" target="a2" parent="pool1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e4" edge="1" source="c3" target="r1" parent="pool1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e5" edge="1" source="r1" target="r2" parent="pool1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e6" edge="1" source="r2" target="c4" parent="pool1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e7" edge="1" source="c4" target="o1" parent="pool1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e8" edge="1" source="o1" target="a3" parent="pool1"><mxGeometry relative="1" as="geometry"/></mxCell>
  </root>
</mxGraphModel>
\`\`\`

---

## Swimlane Legend

| Element | Meaning |
|---------|---------|
| Rounded rectangle | Process step / action |
| Diamond | Decision point |
| Green lane | Customer-facing steps |
| Blue lane | App / system steps |
| Red lane | Risk and decisioning steps |
| Yellow lane | Operations steps |
| Arrow | Sequence / handoff |

---

## Cross-Lane Handoffs (Key Integration Points)

| # | Handoff | From | To | Integration |
|---|---------|------|----|-----------| 
| H-01 | OTP verified -> PAN check | Customer | App | Mobile auth API |
| H-02 | AA consent granted -> income fetch | Customer | Risk | Account Aggregator API |
| H-03 | Credit decision -> VKYC initiation | Risk | Customer / Ops | Decisioning engine -> VKYC platform |
| H-04 | VKYC passed -> card issuance | Operations | App | VKYC webhook -> card issuing API |
`;}


// =================================================================
// HTML UI SCREENS -- Interactive prototype
// =================================================================
function mockHtmlUiScreens(ctx) {
  const { product, segment, inr } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  const color = '#c9980e';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${product} -- UI Prototype</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0c0906;color:#f0ebe0;min-height:100vh}
  .nav{background:#1a120c;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #2d1f14}
  .logo{font-size:18px;font-weight:700;color:${color}}
  .screens{display:flex;gap:16px;padding:24px;overflow-x:auto}
  .screen{background:#1a120c;border-radius:16px;width:320px;min-width:320px;border:1px solid #2d1f14;overflow:hidden}
  .screen-header{background:#2d1f14;padding:16px;font-weight:600;font-size:13px;color:${color};text-transform:uppercase;letter-spacing:.5px}
  .screen-body{padding:20px}
  .card-visual{background:linear-gradient(135deg,#1a120c,#3a2010);border-radius:12px;padding:24px;margin-bottom:20px;border:1px solid ${color}44}
  .card-number{font-size:13px;color:#aaa;letter-spacing:2px;margin-bottom:4px}
  .card-name{font-size:20px;font-weight:700;color:${color};margin-bottom:12px}
  .card-meta{display:flex;justify-content:space-between;font-size:11px;color:#888}
  .metric{background:#0c0906;border-radius:8px;padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center}
  .metric-label{font-size:12px;color:#888}
  .metric-value{font-weight:700;color:${color}}
  .btn{width:100%;padding:14px;border-radius:8px;border:none;cursor:pointer;font-size:14px;font-weight:600;margin-bottom:8px}
  .btn-primary{background:${color};color:#0c0906}
  .btn-secondary{background:#2d1f14;color:#f0ebe0;border:1px solid #3d2a1a}
  .progress-item{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #2d1f14}
  .step-num{width:28px;height:28px;border-radius:50%;background:${color};color:#0c0906;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
  .step-num.done{background:#2d5a2d}
  .step-num.active{background:${color};animation:pulse 1s infinite}
  .step-text{font-size:13px}
  .step-sub{font-size:11px;color:#888}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .offer-card{background:#0c0906;border-radius:8px;padding:12px;margin-bottom:8px;border-left:3px solid ${color}}
  .offer-title{font-size:13px;font-weight:600;margin-bottom:2px}
  .offer-desc{font-size:11px;color:#888}
  .tag{background:#2d1f14;color:${color};font-size:10px;padding:3px 8px;border-radius:20px;display:inline-block;margin-top:4px}
  .points-bar{background:#2d1f14;border-radius:6px;height:8px;margin-top:8px;overflow:hidden}
  .points-fill{height:100%;background:${color};border-radius:6px}
  h3{font-size:15px;font-weight:600;margin-bottom:12px}
  p{font-size:12px;color:#888;line-height:1.5}
</style>
</head>
<body>
<nav class="nav">
  <span class="logo">${product}</span>
  <span style="font-size:11px;color:#888">UI Prototype -- MOCK mode</span>
</nav>
<div class="screens">

  <!-- Screen 1: Card Dashboard -->
  <div class="screen">
    <div class="screen-header">01 -- Card Dashboard</div>
    <div class="screen-body">
      <div class="card-visual">
        <div class="card-number">•••• •••• •••• 4821</div>
        <div class="card-name">${product}</div>
        <div class="card-meta">
          <span>Expires 09/28</span>
          <span>${seg} Lifestyle</span>
        </div>
      </div>
      <div class="metric"><span class="metric-label">Points Balance</span><span class="metric-value">12,480 pts</span></div>
      <div class="metric"><span class="metric-label">Month Spend</span><span class="metric-value">${inr?'Rs.22,400':'GBP 1,120'}</span></div>
      <div class="metric"><span class="metric-label">${seg} Spend Share</span><span class="metric-value">38%</span></div>
      <div class="metric"><span class="metric-label">Credit Limit</span><span class="metric-value">${inr?'Rs.2.5 L':'GBP 5,000'}</span></div>
    </div>
  </div>

  <!-- Screen 2: Onboarding -->
  <div class="screen">
    <div class="screen-header">02 -- Application Onboarding</div>
    <div class="screen-body">
      <h3>Get your ${product}</h3>
      <p>Apply in under 10 minutes. No documents to upload.</p>
      <br/>
      <div class="progress-item">
        <div class="step-num done">✓</div>
        <div><div class="step-text">Mobile verification</div><div class="step-sub">OTP verified</div></div>
      </div>
      <div class="progress-item">
        <div class="step-num done">✓</div>
        <div><div class="step-text">PAN verification</div><div class="step-sub">Identity confirmed</div></div>
      </div>
      <div class="progress-item">
        <div class="step-num active">3</div>
        <div><div class="step-text">Income verification</div><div class="step-sub">Share via Account Aggregator</div></div>
      </div>
      <div class="progress-item">
        <div class="step-num" style="background:#2d1f14;color:#666">4</div>
        <div><div class="step-text" style="color:#666">Credit decision</div><div class="step-sub" style="color:#555">30 seconds</div></div>
      </div>
      <div class="progress-item" style="border-bottom:none">
        <div class="step-num" style="background:#2d1f14;color:#666">5</div>
        <div><div class="step-text" style="color:#666">Video KYC</div><div class="step-sub" style="color:#555">5 minutes</div></div>
      </div>
      <br/>
      <button class="btn btn-primary">Share via Account Aggregator</button>
      <button class="btn btn-secondary">Upload bank statement instead</button>
    </div>
  </div>

  <!-- Screen 3: Rewards & Offers -->
  <div class="screen">
    <div class="screen-header">03 -- Rewards and Offers</div>
    <div class="screen-body">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div>
          <div style="font-size:11px;color:#888">Points balance</div>
          <div style="font-size:24px;font-weight:700;color:${color}">12,480</div>
        </div>
        <button class="btn btn-primary" style="width:auto;padding:8px 16px;font-size:12px">Redeem</button>
      </div>
      <div class="points-bar"><div class="points-fill" style="width:52%"></div></div>
      <div style="font-size:11px;color:#888;margin-top:4px;margin-bottom:16px">7,520 more points to next reward tier</div>
      <h3>Partner Offers</h3>
      <div class="offer-card">
        <div class="offer-title">Cult.fit Premium -- 3 months</div>
        <div class="offer-desc">30% off annual membership + 3x reward points</div>
        <span class="tag">${seg} Partner</span>
      </div>
      <div class="offer-card">
        <div class="offer-title">Decathlon -- 15% off all gear</div>
        <div class="offer-desc">Valid on in-store and online purchases over ${inr?'Rs.2,000':'GBP 50'}</div>
        <span class="tag">5x Points</span>
      </div>
      <div class="offer-card">
        <div class="offer-title">BookMyShow Sports -- Early Access</div>
        <div class="offer-desc">Priority booking for ${seg} events in your city</div>
        <span class="tag">Exclusive</span>
      </div>
    </div>
  </div>

</div>
</body>
</html>
`;}


// =================================================================
// HTML DECK -- Presentation deck
// =================================================================
function mockHtmlDeck(ctx) {
  const { product, market, segment, inr, gbp } = ctx;
  const seg = segment.charAt(0).toUpperCase() + segment.slice(1);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${product} -- Investment Brief</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0c0906;color:#f0ebe0;overflow:hidden}
  .deck{width:100vw;height:100vh;display:flex;flex-direction:column}
  .slide{display:none;flex:1;padding:60px;flex-direction:column;justify-content:center}
  .slide.active{display:flex}
  .slide-num{position:absolute;bottom:24px;right:32px;font-size:12px;color:#555}
  .amber{color:#c9980e}
  h1{font-size:48px;font-weight:800;line-height:1.1;margin-bottom:16px}
  h2{font-size:32px;font-weight:700;margin-bottom:24px;color:#c9980e}
  h3{font-size:18px;font-weight:600;margin-bottom:12px}
  .sub{font-size:20px;color:#888;margin-bottom:32px}
  .grid{display:grid;gap:20px}
  .grid-2{grid-template-columns:1fr 1fr}
  .grid-3{grid-template-columns:repeat(3,1fr)}
  .card{background:#1a120c;border:1px solid #2d1f14;border-radius:12px;padding:24px}
  .card-accent{border-left:3px solid #c9980e}
  .stat{font-size:40px;font-weight:800;color:#c9980e}
  .stat-label{font-size:13px;color:#888;margin-top:4px}
  .table{width:100%;border-collapse:collapse;font-size:13px}
  .table th{background:#2d1f14;padding:10px 14px;text-align:left;color:#c9980e;font-weight:600}
  .table td{padding:10px 14px;border-bottom:1px solid #1a120c}
  .table tr:hover td{background:#1a120c}
  .pill{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;margin-right:6px}
  .pill-green{background:#1a3a1a;color:#4dbb4d}
  .pill-amber{background:#3a2a0a;color:#c9980e}
  .pill-red{background:#3a0a0a;color:#ff6666}
  .nav-btns{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);display:flex;gap:12px}
  button{background:#2d1f14;color:#f0ebe0;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:14px}
  button:hover{background:#3d2a1a}
  .divider{width:60px;height:3px;background:#c9980e;margin-bottom:24px}
</style>
</head>
<body>
<div class="deck">

  <div class="slide active" id="s1">
    <div class="divider"></div>
    <h1>${product}</h1>
    <p class="sub">The First Credit Card Built for ${seg} Enthusiasts in ${market}</p>
    <div class="grid grid-3" style="margin-top:40px">
      <div class="card card-accent"><div class="stat">${inr?'6.2M':'2.1M'}</div><div class="stat-label">Addressable ${seg} cardholders</div></div>
      <div class="card card-accent"><div class="stat">${inr?'Rs.38K Cr':'GBP 42Bn'}</div><div class="stat-label">Serviceable market (SAM)</div></div>
      <div class="card card-accent"><div class="stat">0</div><div class="stat-label">Purpose-built ${segment} cards today</div></div>
    </div>
    <span class="slide-num">1 / 6</span>
  </div>

  <div class="slide" id="s2">
    <h2>The Problem</h2>
    <div class="grid grid-2" style="align-items:start">
      <div>
        <div class="card card-accent" style="margin-bottom:16px">
          <h3>What ${seg} consumers want</h3>
          <ul style="margin-top:12px;padding-left:20px;color:#ccc;font-size:14px;line-height:2">
            <li>Rewards on gym + fitness spend</li>
            <li>Points on sports gear purchases</li>
            <li>Event access and ticket discounts</li>
            <li>Instant digital onboarding</li>
          </ul>
        </div>
      </div>
      <div class="card" style="border-color:#5a1a1a">
        <h3 style="color:#ff8888">What they get today</h3>
        <ul style="margin-top:12px;padding-left:20px;color:#ccc;font-size:14px;line-height:2">
          <li>1x generic cashback on everything</li>
          <li>Travel miles they rarely redeem</li>
          <li>5-7 day physical card wait</li>
          <li>No ${segment} merchant partners</li>
        </ul>
      </div>
    </div>
    <span class="slide-num">2 / 6</span>
  </div>

  <div class="slide" id="s3">
    <h2>Our Solution</h2>
    <div class="grid grid-2">
      <div class="card card-accent">
        <div style="font-size:28px;margin-bottom:8px">5x</div>
        <h3>Category Rewards</h3>
        <p style="color:#888;font-size:13px;margin-top:8px">5x points on all qualifying ${segment} merchant categories -- automatic, no activation needed</p>
      </div>
      <div class="card card-accent">
        <div style="font-size:28px;margin-bottom:8px">&lt;10 min</div>
        <h3>Digital Onboarding</h3>
        <p style="color:#888;font-size:13px;margin-top:8px">AA income verification + Video KYC -- virtual card issued the same session</p>
      </div>
      <div class="card card-accent">
        <div style="font-size:28px;margin-bottom:8px">10+</div>
        <h3>Co-Brand Partners</h3>
        <p style="color:#888;font-size:13px;margin-top:8px">Exclusive deals with gyms, ${segment} gear brands, event platforms, and travel providers</p>
      </div>
      <div class="card card-accent">
        <div style="font-size:28px;margin-bottom:8px">Live</div>
        <h3>Spend Intelligence</h3>
        <p style="color:#888;font-size:13px;margin-top:8px">Real-time ${segment} lifestyle spend dashboard -- categorised, actionable, and beautiful</p>
      </div>
    </div>
    <span class="slide-num">3 / 6</span>
  </div>

  <div class="slide" id="s4">
    <h2>Competitive Position</h2>
    <table class="table">
      <tr><th>Capability</th><th>HDFC Millennia</th><th>Kotak League</th><th>${product}</th></tr>
      <tr><td>${seg} 5x rewards</td><td><span class="pill pill-red">No</span></td><td><span class="pill pill-amber">Partial</span></td><td><span class="pill pill-green">Yes</span></td></tr>
      <tr><td>Digital onboarding &lt;10 min</td><td><span class="pill pill-amber">Partial</span></td><td><span class="pill pill-red">No</span></td><td><span class="pill pill-green">Yes</span></td></tr>
      <tr><td>Co-brand partner ecosystem</td><td><span class="pill pill-amber">2-3</span></td><td><span class="pill pill-amber">2-3</span></td><td><span class="pill pill-green">10+</span></td></tr>
      <tr><td>Lifestyle spend dashboard</td><td><span class="pill pill-red">No</span></td><td><span class="pill pill-red">No</span></td><td><span class="pill pill-green">Yes</span></td></tr>
      <tr><td>Virtual card on approval</td><td><span class="pill pill-amber">Partial</span></td><td><span class="pill pill-red">No</span></td><td><span class="pill pill-green">Yes</span></td></tr>
    </table>
    <span class="slide-num">4 / 6</span>
  </div>

  <div class="slide" id="s5">
    <h2>Financial Case</h2>
    <div class="grid grid-3" style="margin-bottom:32px">
      <div class="card card-accent"><div class="stat">${inr?'26M':'28M'}</div><div class="stat-label">Payback period</div></div>
      <div class="card card-accent"><div class="stat">${inr?'Rs.280Cr':'GBP 28M'}</div><div class="stat-label">3-year NPV</div></div>
      <div class="card card-accent"><div class="stat">${inr?'Rs.22Cr':'GBP 2.2M'}</div><div class="stat-label">Total investment ask</div></div>
    </div>
    <table class="table">
      <tr><th></th><th>Year 1</th><th>Year 2</th><th>Year 3</th></tr>
      <tr><td>Active cardholders</td><td>25,000</td><td>80,000</td><td>150,000</td></tr>
      <tr><td>Total Revenue</td><td>${inr?'Rs.72 Cr':'GBP 4.2M'}</td><td>${inr?'Rs.274 Cr':'GBP 15.3M'}</td><td>${inr?'Rs.573 Cr':'GBP 31.9M'}</td></tr>
      <tr><td>Total Costs</td><td>${inr?'Rs.62 Cr':'GBP 5.4M'}</td><td>${inr?'Rs.129 Cr':'GBP 10.1M'}</td><td>${inr?'Rs.226 Cr':'GBP 16.5M'}</td></tr>
      <tr><td style="font-weight:700;color:#c9980e">Net P&L</td><td style="color:#c9980e">${inr?'Rs.10 Cr':'(GBP 1.2M)'}</td><td style="color:#c9980e">${inr?'Rs.145 Cr':'GBP 5.2M'}</td><td style="color:#c9980e">${inr?'Rs.347 Cr':'GBP 15.4M'}</td></tr>
    </table>
    <span class="slide-num">5 / 6</span>
  </div>

  <div class="slide" id="s6">
    <h2>Ask and Next Steps</h2>
    <div class="grid grid-2">
      <div>
        <div class="card card-accent" style="margin-bottom:16px">
          <h3>Decision Required</h3>
          <p style="color:#ccc;font-size:14px;margin-top:8px">Board approval of <strong style="color:#c9980e">${inr?'Rs.22 Cr':'GBP 2.2M'}</strong> investment to proceed with Option A (Build). Required by end of Month 2 to maintain launch timeline.</p>
        </div>
        <div class="card">
          <h3>If Approved</h3>
          <ul style="margin-top:8px;padding-left:20px;color:#ccc;font-size:13px;line-height:2">
            <li>Design freeze by end of Month 1</li>
            <li>Alpha launch: Month 4</li>
            <li>Public launch: Month 7</li>
            <li>25,000 cards: Month 9</li>
          </ul>
        </div>
      </div>
      <div class="card">
        <h3>Milestones</h3>
        <div style="margin-top:16px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><span style="background:#c9980e;color:#0c0906;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700">M1</span><span style="font-size:13px">Design freeze + vendor contracts</span></div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><span style="background:#2d1f14;color:#c9980e;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700">M4</span><span style="font-size:13px">Alpha launch (1,000 beta users)</span></div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><span style="background:#2d1f14;color:#c9980e;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700">M7</span><span style="font-size:13px">Public launch</span></div>
          <div style="display:flex;align-items:center;gap:12px"><span style="background:#2d1f14;color:#c9980e;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700">M9</span><span style="font-size:13px">25,000 active cards</span></div>
        </div>
      </div>
    </div>
    <span class="slide-num">6 / 6</span>
  </div>

</div>
<div class="nav-btns">
  <button onclick="prev()">← Prev</button>
  <button onclick="next()">Next →</button>
</div>
<script>
  let cur=1,tot=6;
  function show(n){
    document.querySelectorAll('.slide').forEach(s=>s.classList.remove('active'));
    document.getElementById('s'+n).classList.add('active');
  }
  function next(){if(cur<tot){cur++;show(cur);}}
  function prev(){if(cur>1){cur--;show(cur);}}
  document.addEventListener('keydown',e=>{if(e.key==='ArrowRight')next();if(e.key==='ArrowLeft')prev();});
</script>
</body>
</html>
`;}


// =================================================================
// DEFAULT MOCK
// =================================================================
function defaultMock(ctx, skill) {
  const { product } = ctx;
  return `# ${skill.name.split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ')} -- ${product}

${hdr('Product Management', skill.name, skill.stage||'discovery')}

---

## Overview

This artifact was generated in MOCK mode for **${product}** using the **${skill.name}** skill.

Set **ANTHROPIC_API_KEY** in your environment to generate a live, context-aware artifact using Claude.

---

## Skill Details

| Field | Value |
|-------|-------|
| Skill | ${skill.name} |
| Domain | ${skill.domain || 'product-management'} |
| Stage | ${skill.stage || 'discovery'} |
| Output | ${skill.output || 'Markdown document'} |

---

## What this skill produces (live mode)

${skill.description || 'A structured artifact based on the skill definition.'}

${skill.body ? '**Skill instructions loaded:** ' + skill.name + ' SKILL.md is active.' : ''}
`;}




// =================================================================
// FLOWFORGE -- Draw.io Diagram (HSBC Red swimlane + FlowForge skill)
// =================================================================
function mockFlowForge(ctx) {
  const { product, brand } = ctx;
  const isHSBC = /hsbc/i.test(brand + ctx.brief + ctx.projectName);
  const theme = isHSBC ? 'hsbc-red' : 'tech-blue';

  // Palette selection
  const priF  = isHSBC ? '#DB0011' : '#E8F0FE';
  const priS  = isHSBC ? '#A30008' : '#5B8DEF';
  const priTx = isHSBC ? '#FFFFFF' : '#2D3748';
  const proF  = isHSBC ? '#FDECEA' : '#D6E4F9';
  const proS  = isHSBC ? '#DB0011' : '#5B8DEF';
  const proTx = isHSBC ? '#1A1A1A' : '#2D3748';
  const accF  = isHSBC ? '#F5C6CB' : '#FFF0E5';
  const accS  = isHSBC ? '#A30008' : '#E8A87C';
  const neuF  = isHSBC ? '#F5F5F5' : '#EDF2F7';
  const neuS  = isHSBC ? '#CCCCCC' : '#A0AEC0';
  const arrC  = isHSBC ? '#DB0011' : '#A0AEC0';
  const poolS = isHSBC ? '#DB0011' : '#5B8DEF';
  const lanF  = isHSBC ? '#DB0011' : '#E8F0FE';
  const lanTx = isHSBC ? '#FFFFFF' : '#2D3748';
  const titC  = isHSBC ? '#DB0011' : '#2D3748';

  // Layout constants
  const POOL_W = 1110, POOL_H = 480, CW = 1190, CH = 624;
  const PAD = 40, TH = 32, LH = 120, HW = 120, NW = 150, NH = 50, NG = 50, NY = 35;
  const px = PAD, py = PAD + TH;
  const nx = col => HW + col * (NW + NG);

  // Build XML via array join -- no nested template literals
  const xmlLines = [
    '<mxfile host="app.diagrams.net">',
    '  <diagram name="' + product + ' -- Application Journey" id="ff_' + Date.now() + '">',
    '    <mxGraphModel dx="0" dy="0" grid="0" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" pageWidth="' + CW + '" pageHeight="' + CH + '" background="none" math="0" shadow="0">',
    '      <root>',
    '        <mxCell id="0"/>',
    '        <mxCell id="1" parent="0"/>',
    '',
    '        <!-- Title -->',
    '        <mxCell id="title_main" value="&lt;b&gt;' + product + ' -- Application &amp; Onboarding Journey&lt;/b&gt;" style="text;html=1;fontSize=16;fontColor=' + titC + ';align=center;verticalAlign=middle;fontStyle=1;" parent="1" vertex="1">',
    '            <mxGeometry x="' + PAD + '" y="10" width="' + POOL_W + '" height="' + TH + '" as="geometry"/>',
    '        </mxCell>',
    '        <mxCell id="theme_badge" value="Theme: ' + theme + '" style="text;html=1;fontSize=9;fontColor=' + neuS + ';align=right;verticalAlign=middle;" parent="1" vertex="1">',
    '            <mxGeometry x="' + (PAD + POOL_W - 160) + '" y="10" width="160" height="16" as="geometry"/>',
    '        </mxCell>',
    '',
    '        <!-- Pool -->',
    '        <mxCell id="pool" value="" style="shape=pool;startSize=0;horizontal=1;childLayout=stackLayout;horizontalStack=0;resizeParent=1;resizeParentMax=0;collapsible=0;marginBottom=0;fillColor=none;strokeColor=' + poolS + ';strokeWidth=2;" parent="1" vertex="1">',
    '            <mxGeometry x="' + px + '" y="' + py + '" width="' + POOL_W + '" height="' + POOL_H + '" as="geometry"/>',
    '        </mxCell>',
    '',
    '        <!-- Lane 1: Customer -->',
    '        <mxCell id="lane_1" value="Customer" style="swimlane;startSize=' + HW + ';horizontal=0;fillColor=' + lanF + ';strokeColor=' + poolS + ';fontColor=' + lanTx + ';fontSize=13;fontStyle=1;swimlaneHead=1;" parent="pool" vertex="1">',
    '            <mxGeometry y="0" width="' + POOL_W + '" height="' + LH + '" as="geometry"/>',
    '        </mxCell>',
    '        <!-- Lane 2: App / Digital -->',
    '        <mxCell id="lane_2" value="App / Digital" style="swimlane;startSize=' + HW + ';horizontal=0;fillColor=' + lanF + ';strokeColor=' + poolS + ';fontColor=' + lanTx + ';fontSize=13;fontStyle=1;swimlaneHead=1;" parent="pool" vertex="1">',
    '            <mxGeometry y="' + LH + '" width="' + POOL_W + '" height="' + LH + '" as="geometry"/>',
    '        </mxCell>',
    '        <!-- Lane 3: Risk & Compliance -->',
    '        <mxCell id="lane_3" value="Risk &amp; Compliance" style="swimlane;startSize=' + HW + ';horizontal=0;fillColor=' + lanF + ';strokeColor=' + poolS + ';fontColor=' + lanTx + ';fontSize=13;fontStyle=1;swimlaneHead=1;" parent="pool" vertex="1">',
    '            <mxGeometry y="' + (LH*2) + '" width="' + POOL_W + '" height="' + LH + '" as="geometry"/>',
    '        </mxCell>',
    '        <!-- Lane 4: Operations -->',
    '        <mxCell id="lane_4" value="Operations" style="swimlane;startSize=' + HW + ';horizontal=0;fillColor=' + lanF + ';strokeColor=' + poolS + ';fontColor=' + lanTx + ';fontSize=13;fontStyle=1;swimlaneHead=1;" parent="pool" vertex="1">',
    '            <mxGeometry y="' + (LH*3) + '" width="' + POOL_W + '" height="' + LH + '" as="geometry"/>',
    '        </mxCell>',
    '',
    '        <!-- Customer nodes -->',
    '        <mxCell id="n_c1" value="&lt;b&gt;1. Discover Card&lt;/b&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=' + priF + ';strokeColor=' + priS + ';strokeWidth=1.5;arcSize=10;fontSize=12;fontColor=' + priTx + ';" parent="lane_1" vertex="1"><mxGeometry x="' + nx(0) + '" y="' + NY + '" width="' + NW + '" height="' + NH + '" as="geometry"/></mxCell>',
    '        <mxCell id="n_c2" value="2. Start Application" style="rounded=1;whiteSpace=wrap;html=1;fillColor=' + proF + ';strokeColor=' + proS + ';strokeWidth=1.5;arcSize=10;fontSize=12;fontColor=' + proTx + ';" parent="lane_1" vertex="1"><mxGeometry x="' + nx(1) + '" y="' + NY + '" width="' + NW + '" height="' + NH + '" as="geometry"/></mxCell>',
    '        <mxCell id="n_c3" value="3. Upload Documents" style="rounded=1;whiteSpace=wrap;html=1;fillColor=' + proF + ';strokeColor=' + proS + ';strokeWidth=1.5;arcSize=10;fontSize=12;fontColor=' + proTx + ';" parent="lane_1" vertex="1"><mxGeometry x="' + nx(2) + '" y="' + NY + '" width="' + NW + '" height="' + NH + '" as="geometry"/></mxCell>',
    '        <mxCell id="n_c4" value="4. Receive Decision" style="rounded=1;whiteSpace=wrap;html=1;fillColor=' + accF + ';strokeColor=' + accS + ';strokeWidth=1.5;arcSize=10;fontSize=12;fontColor=' + proTx + ';" parent="lane_1" vertex="1"><mxGeometry x="' + nx(3) + '" y="' + NY + '" width="' + NW + '" height="' + NH + '" as="geometry"/></mxCell>',
    '        <mxCell id="n_c5" value="&lt;b&gt;5. Activate Card&lt;/b&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=' + priF + ';strokeColor=' + priS + ';strokeWidth=1.5;arcSize=10;fontSize=12;fontColor=' + priTx + ';" parent="lane_1" vertex="1"><mxGeometry x="' + nx(4) + '" y="' + NY + '" width="' + NW + '" height="' + NH + '" as="geometry"/></mxCell>',
    '',
    '        <!-- App nodes -->',
    '        <mxCell id="n_a1" value="Product Page / AA" style="rounded=1;whiteSpace=wrap;html=1;fillColor=' + proF + ';strokeColor=' + proS + ';strokeWidth=1.5;arcSize=10;fontSize=12;fontColor=' + proTx + ';" parent="lane_2" vertex="1"><mxGeometry x="' + nx(0) + '" y="' + NY + '" width="' + NW + '" height="' + NH + '" as="geometry"/></mxCell>',
    '        <mxCell id="n_a2" value="Eligibility &amp; KYC" style="rounded=1;whiteSpace=wrap;html=1;fillColor=' + proF + ';strokeColor=' + proS + ';strokeWidth=1.5;arcSize=10;fontSize=12;fontColor=' + proTx + ';" parent="lane_2" vertex="1"><mxGeometry x="' + nx(1) + '" y="' + NY + '" width="' + NW + '" height="' + NH + '" as="geometry"/></mxCell>',
    '        <mxCell id="n_a3" value="Income Verify (AA)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=' + proF + ';strokeColor=' + proS + ';strokeWidth=1.5;arcSize=10;fontSize=12;fontColor=' + proTx + ';" parent="lane_2" vertex="1"><mxGeometry x="' + nx(2) + '" y="' + NY + '" width="' + NW + '" height="' + NH + '" as="geometry"/></mxCell>',
    '        <mxCell id="n_a4" value="Decision Engine" style="rhombus;whiteSpace=wrap;html=1;fillColor=' + accF + ';strokeColor=' + accS + ';strokeWidth=1.5;fontSize=11;fontColor=' + proTx + ';" parent="lane_2" vertex="1"><mxGeometry x="' + nx(3) + '" y="' + (NY-10) + '" width="' + NW + '" height="' + (NH+20) + '" as="geometry"/></mxCell>',
    '        <mxCell id="n_a5" value="Digital Card Issue" style="rounded=1;whiteSpace=wrap;html=1;fillColor=' + proF + ';strokeColor=' + proS + ';strokeWidth=1.5;arcSize=10;fontSize=12;fontColor=' + proTx + ';" parent="lane_2" vertex="1"><mxGeometry x="' + nx(4) + '" y="' + NY + '" width="' + NW + '" height="' + NH + '" as="geometry"/></mxCell>',
    '',
    '        <!-- Risk nodes -->',
    '        <mxCell id="n_r1" value="Bureau Pull (CIBIL)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=' + neuF + ';strokeColor=' + neuS + ';strokeWidth=1.5;arcSize=10;fontSize=11;fontColor=' + proTx + ';" parent="lane_3" vertex="1"><mxGeometry x="' + nx(1) + '" y="' + NY + '" width="' + NW + '" height="' + NH + '" as="geometry"/></mxCell>',
    '        <mxCell id="n_r2" value="AML / Sanctions" style="rounded=1;whiteSpace=wrap;html=1;fillColor=' + neuF + ';strokeColor=' + neuS + ';strokeWidth=1.5;arcSize=10;fontSize=11;fontColor=' + proTx + ';" parent="lane_3" vertex="1"><mxGeometry x="' + nx(2) + '" y="' + NY + '" width="' + NW + '" height="' + NH + '" as="geometry"/></mxCell>',
    '        <mxCell id="n_r3" value="Credit Model Score" style="rounded=1;whiteSpace=wrap;html=1;fillColor=' + accF + ';strokeColor=' + accS + ';strokeWidth=1.5;arcSize=10;fontSize=11;fontColor=' + proTx + ';" parent="lane_3" vertex="1"><mxGeometry x="' + nx(3) + '" y="' + NY + '" width="' + NW + '" height="' + NH + '" as="geometry"/></mxCell>',
    '',
    '        <!-- Ops nodes -->',
    '        <mxCell id="n_o1" value="Card Personalisation" style="rounded=1;whiteSpace=wrap;html=1;fillColor=' + proF + ';strokeColor=' + proS + ';strokeWidth=1.5;arcSize=10;fontSize=12;fontColor=' + proTx + ';" parent="lane_4" vertex="1"><mxGeometry x="' + nx(3) + '" y="' + NY + '" width="' + NW + '" height="' + NH + '" as="geometry"/></mxCell>',
    '        <mxCell id="n_o2" value="Physical + Digital Dispatch" style="rounded=1;whiteSpace=wrap;html=1;fillColor=' + proF + ';strokeColor=' + proS + ';strokeWidth=1.5;arcSize=10;fontSize=12;fontColor=' + proTx + ';" parent="lane_4" vertex="1"><mxGeometry x="' + nx(4) + '" y="' + NY + '" width="' + NW + '" height="' + NH + '" as="geometry"/></mxCell>',
    '',
    '        <!-- Arrows (all parent=1 for cross-lane routing) -->',
    '        <mxCell id="e_c1c2" style="edgeStyle=orthogonalEdgeStyle;endArrow=classic;strokeColor=' + arrC + ';strokeWidth=1.2;endSize=5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;html=1;" parent="1" source="n_c1" target="n_c2" edge="1"><mxGeometry relative="1" as="geometry"/></mxCell>',
    '        <mxCell id="e_c2c3" style="edgeStyle=orthogonalEdgeStyle;endArrow=classic;strokeColor=' + arrC + ';strokeWidth=1.2;endSize=5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;html=1;" parent="1" source="n_c2" target="n_c3" edge="1"><mxGeometry relative="1" as="geometry"/></mxCell>',
    '        <mxCell id="e_c3c4" style="edgeStyle=orthogonalEdgeStyle;endArrow=classic;strokeColor=' + arrC + ';strokeWidth=1.2;endSize=5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;html=1;" parent="1" source="n_c3" target="n_c4" edge="1"><mxGeometry relative="1" as="geometry"/></mxCell>',
    '        <mxCell id="e_c4c5" style="edgeStyle=orthogonalEdgeStyle;endArrow=classic;strokeColor=' + arrC + ';strokeWidth=1.2;endSize=5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;html=1;" parent="1" source="n_c4" target="n_c5" edge="1"><mxGeometry relative="1" as="geometry"/></mxCell>',
    '        <mxCell id="e_a1a2" style="edgeStyle=orthogonalEdgeStyle;endArrow=classic;strokeColor=' + arrC + ';strokeWidth=1.2;endSize=5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;html=1;" parent="1" source="n_a1" target="n_a2" edge="1"><mxGeometry relative="1" as="geometry"/></mxCell>',
    '        <mxCell id="e_a2a3" style="edgeStyle=orthogonalEdgeStyle;endArrow=classic;strokeColor=' + arrC + ';strokeWidth=1.2;endSize=5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;html=1;" parent="1" source="n_a2" target="n_a3" edge="1"><mxGeometry relative="1" as="geometry"/></mxCell>',
    '        <mxCell id="e_a3a4" style="edgeStyle=orthogonalEdgeStyle;endArrow=classic;strokeColor=' + arrC + ';strokeWidth=1.2;endSize=5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;html=1;" parent="1" source="n_a3" target="n_a4" edge="1"><mxGeometry relative="1" as="geometry"/></mxCell>',
    '        <mxCell id="e_a4a5" style="edgeStyle=orthogonalEdgeStyle;endArrow=classic;strokeColor=' + arrC + ';strokeWidth=1.2;endSize=5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;html=1;" parent="1" source="n_a4" target="n_a5" edge="1"><mxGeometry relative="1" as="geometry"/></mxCell>',
    '        <mxCell id="e_r1r2" style="edgeStyle=orthogonalEdgeStyle;endArrow=classic;strokeColor=' + arrC + ';strokeWidth=1.2;endSize=5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;html=1;" parent="1" source="n_r1" target="n_r2" edge="1"><mxGeometry relative="1" as="geometry"/></mxCell>',
    '        <mxCell id="e_r2r3" style="edgeStyle=orthogonalEdgeStyle;endArrow=classic;strokeColor=' + arrC + ';strokeWidth=1.2;endSize=5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;html=1;" parent="1" source="n_r2" target="n_r3" edge="1"><mxGeometry relative="1" as="geometry"/></mxCell>',
    '        <mxCell id="e_o1o2" style="edgeStyle=orthogonalEdgeStyle;endArrow=classic;strokeColor=' + arrC + ';strokeWidth=1.2;endSize=5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;html=1;" parent="1" source="n_o1" target="n_o2" edge="1"><mxGeometry relative="1" as="geometry"/></mxCell>',
    '        <!-- Cross-lane handoff arrows (dashed) -->',
    '        <mxCell id="e_c1a1" value="lands on app" style="edgeStyle=orthogonalEdgeStyle;endArrow=open;strokeColor=' + arrC + ';strokeWidth=0.8;endSize=4;html=1;dashed=1;fontSize=9;" parent="1" source="n_c1" target="n_a1" edge="1"><mxGeometry relative="1" as="geometry"/></mxCell>',
    '        <mxCell id="e_a2r1" value="bureau pull" style="edgeStyle=orthogonalEdgeStyle;endArrow=open;strokeColor=' + arrC + ';strokeWidth=0.8;endSize=4;html=1;dashed=1;fontSize=9;" parent="1" source="n_a2" target="n_r1" edge="1"><mxGeometry relative="1" as="geometry"/></mxCell>',
    '        <mxCell id="e_r3a4" value="score" style="edgeStyle=orthogonalEdgeStyle;endArrow=open;strokeColor=' + arrC + ';strokeWidth=0.8;endSize=4;html=1;dashed=1;fontSize=9;" parent="1" source="n_r3" target="n_a4" edge="1"><mxGeometry relative="1" as="geometry"/></mxCell>',
    '        <mxCell id="e_a4o1" value="approve" style="edgeStyle=orthogonalEdgeStyle;endArrow=open;strokeColor=' + arrC + ';strokeWidth=0.8;endSize=4;html=1;dashed=1;fontSize=9;" parent="1" source="n_a4" target="n_o1" edge="1"><mxGeometry relative="1" as="geometry"/></mxCell>',
    '        <mxCell id="e_a5c5" value="notify" style="edgeStyle=orthogonalEdgeStyle;endArrow=open;strokeColor=' + arrC + ';strokeWidth=0.8;endSize=4;html=1;dashed=1;fontSize=9;" parent="1" source="n_a5" target="n_c5" edge="1"><mxGeometry relative="1" as="geometry"/></mxCell>',
    '      </root>',
    '    </mxGraphModel>',
    '  </diagram>',
    '</mxfile>',
  ];
  const xml = xmlLines.join('\n');

  const handoffs = [
    '| Customer -> App       | Discover Card     | Product Page / AA  | User lands from marketing channel |',
    '| App -> Risk           | Eligibility & KYC | Bureau Pull        | Automated bureau check triggered  |',
    '| Risk -> App           | Credit Model      | Decision Engine    | Score fed into approve/decline    |',
    '| App -> Ops            | Decision Engine   | Card Personalise   | Approval triggers card production |',
    '| Ops -> Customer       | Digital Dispatch  | Activate Card      | Push notification + activation    |',
  ].join('\n');

  return '# FlowForge Diagram -- ' + product + '\n\n' +
    hdr('Diagramming', 'flowforge', 'Design') + '\n\n---\n\n' +
    '## Diagram Overview\n\n' +
    '| Attribute | Value |\n' +
    '|-----------|-------|\n' +
    '| **Diagram type** | Swimlane -- Application & Onboarding Journey |\n' +
    '| **Lanes** | Customer / App & Digital / Risk & Compliance / Operations |\n' +
    '| **Nodes** | 14 (5 Customer + 5 App + 3 Risk + 2 Ops) |\n' +
    '| **Colour theme** | ' + theme + ' |\n' +
    '| **Canvas** | ' + CW + ' x ' + CH + ' px |\n' +
    '| **Open in** | [app.diagrams.net](https://app.diagrams.net) -- Extras > Edit Diagram |\n\n---\n\n' +
    '## ASCII Sketch\n\n```\n' +
    ' LANE              Col-1            Col-2          Col-3          Col-4           Col-5\n' +
    ' -----------------------------------------------------------------------------------------\n' +
    ' Customer    [Discover Card] --> [Start App]  --> [Upload Docs]->[Rcv Decision]->[Activate]\n' +
    '                   |                                                                  ^\n' +
    ' App/Digital [Product Page]  --> [KYC Form]   --> [Income AA] ->[Decision Eng]->[Issuance]\n' +
    '                                      |                              ^    |\n' +
    ' Risk/Compl.                    [Bureau Pull] --> [AML Check]  --> [Credit Model]\n' +
    '                                                                         |\n' +
    ' Operations                                                       [Personalise] --> [Dispatch]\n' +
    '```\n\n---\n\n' +
    '## Coordinate Calculations\n\n```\n' +
    'LANE_H=120, LANE_HDR_W=120, NODE_W=150, NODE_H=50, NODE_GAP=50\n' +
    'pool_w = 120 + 5x150 + 4x50 + 40 = 1110\n' +
    'CANVAS_W = 1110 + 80 = 1190\n' +
    'CANVAS_H = 32 + 4x120 + 80 + 32 = 624\n' +
    'node_x(col) = 120 + col*(150+50)\n' +
    'node_y = (120-50)/2 = 35  [vertically centred within lane]\n' +
    '```\n\n---\n\n' +
    '## Cross-Lane Handoffs\n\n' +
    '| From Lane | Source Node | Target Node | Trigger |\n' +
    '|-----------|------------|-------------|----------|\n' +
    handoffs + '\n\n---\n\n' +
    '## Quality Checklist\n\n' +
    '| Check | Status |\n' +
    '|-------|--------|\n' +
    '| All node IDs unique | OK |\n' +
    '| Every arrow has valid source + target | OK |\n' +
    '| Lane heights accommodate all nodes without overlap | OK |\n' +
    '| ' + (isHSBC ? 'HSBC red theme -- no blue strokes visible' : 'tech-blue -- consistent palette') + ' | OK |\n' +
    '| Pool > Lane > Node hierarchy correct | OK |\n' +
    '| Canvas W/H match computed values | OK |\n' +
    '| Title cell present with correct width | OK |\n\n---\n\n' +
    '## Draw.io XML\n\n' +
    '> Copy and paste into [app.diagrams.net](https://app.diagrams.net) via **Extras > Edit Diagram**.\n\n' +
    '```xml\n' + xml + '\n```\n\n---\n\n' +
    '## Deployment Options\n\n' +
    '| Option | Steps |\n' +
    '|--------|-------|\n' +
    '| **app.diagrams.net (web)** | Extras > Edit Diagram > paste XML |\n' +
    '| **draw.io desktop** | File > Import > select .drawio file |\n' +
    '| **Confluence** | Insert > draw.io Diagram > paste XML |\n' +
    '| **Jira** | draw.io for Jira attachment > import XML |\n' +
    '| **VS Code** | Install "Draw.io Integration" extension |\n';
}
