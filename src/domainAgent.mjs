// domainAgent.mjs — Domain Agent with rich MOCK artifacts
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

  if (!isLive()) {
    return { content: buildMockContent(skill, taskBrief, project, context), stage, skill };
  }

  const system = [
    agentPrompt(domain), '',
    '## Active skill — follow these instructions precisely', skill.body, '',
    '## Output contract',
    `Produce a single, complete, well-structured Markdown artifact: ${skill.output}.`,
    'Do not include preamble or sign-off chatter — only the artifact itself.',
    'Use markdown tables, headers, code blocks, and lists to make the output readable and professional.',
  ].join('\n');

  const user = [
    `Project: ${project?.name || projectId}`,
    project?.description ? `Project description: ${project.description}` : '',
    context ? `\nExisting workspace artifacts (for continuity):\n${context}` : '',
    `\nTask: ${taskBrief}`,
  ].filter(Boolean).join('\n');

  const resp = await createMessage({
    model: MODEL, max_tokens: 4096, system,
    messages: [{ role: 'user', content: user }],
  });
  const content = resp.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
  return { content, stage, skill };
}

// ─────────────────────────────────────────────────────────────
// CONTEXT EXTRACTION
// ─────────────────────────────────────────────────────────────
function extractContext(brief, project) {
  const text = ((brief || '') + ' ' + (project?.name || '') + ' ' + (project?.description || '')).trim();
  // Product name — prefer quoted strings, then project name, then first capitalised run
  const quoted = text.match(/["']([A-Za-z0-9 ]{3,40})["']/)?.[1];
  const projectName = project?.name || '';
  const capMatch = text.match(/\b([A-Z][A-Za-z]+(?:Flex|Pay|Go|Pro|Plus|One|Now|AI|Card|App|Suite|Hub|Platform)?(?:\s+(?:Credit Card|Debit Card|Card|App|Platform|Suite|Hub|Pro))?)/)?.[1];
  const product = projectName || quoted || capMatch || 'Product';

  // Market
  const market = text.match(/\b(India|UK|US|USA|APAC|Europe|Southeast Asia|Middle East|global)\b/i)?.[1] || 'India';
  const currency = /india/i.test(market) ? 'INR' : /uk/i.test(market) ? 'GBP' : 'USD';
  const currencySymbol = /india/i.test(market) ? '₹' : /uk/i.test(market) ? '£' : '$';

  // Segment
  const segment = text.match(/\b(sports?|fitness|travel|premium|lifestyle|retail|SME|fintech|health|gaming|student|youth|millennial)\b/i)?.[1] || 'consumer';

  // Brand
  const brand = text.match(/\b(HSBC|SBI|HDFC|Axis|ICICI|Kotak|Amex|Visa|Mastercard|Apple|Google|Amazon|Meta|Uber|Grab|Paytm|Razorpay)\b/)?.[1] || '';

  // Type inference
  const isCreditCard = /credit card|debit card|card/i.test(text);
  const isSaaS = /saas|platform|dashboard|b2b/i.test(text);
  const isApp = /app|mobile|ios|android/i.test(text);

  return { product, market, currency, currencySymbol, segment, brand, brief: text, projectName, isCreditCard, isSaaS, isApp };
}

// ─────────────────────────────────────────────────────────────
// MOCK DISPATCH
// ─────────────────────────────────────────────────────────────
function buildMockContent(skill, taskBrief, project, context) {
  const ctx = extractContext(taskBrief, project);
  const builders = {
    'market-research':     mockMarketResearch,
    'prd':                 mockPRD,
    'user-story':          mockUserStories,
    'process-flow':        mockProcessFlow,
    'html-ui-screens':     mockHtmlUiScreens,
    'html-deck':           mockHtmlDeck,
    'competitive-analysis': mockCompetitiveAnalysis,
    'discovery-brief':     mockDiscoveryBrief,
    'prioritization-rice': mockPrioritization,
    'roadmap':             mockRoadmap,
    'project-charter':     mockProjectCharter,
    'sprint-plan':         mockSprintPlan,
    'status-report':       mockStatusReport,
    'raid-log':            mockRAIDLog,
    'plan-on-a-page':      mockPlanOnAPage,
  };
  const fn = builders[skill.name];
  return fn ? fn(ctx, skill) : defaultMock(ctx, skill);
}

// ─────────────────────────────────────────────────────────────
// MARKET RESEARCH
// ─────────────────────────────────────────────────────────────
function mockMarketResearch(ctx) {
  const { product, market, currencySymbol, segment, brand } = ctx;
  const brandStr = brand ? `${brand} ` : '';
  return `# Market Research Brief — ${product}

> **Domain:** Product Management | **Skill:** market-research | **Stage:** Discovery
> *AI-generated in MOCK mode. Set ANTHROPIC_API_KEY for live Claude analysis.*

---

## Executive Summary

The ${brandStr}${product} targets the **${segment} segment** in **${market}**, a fast-growing and underserved niche within the broader consumer financial products market. This brief sizes the opportunity, maps the competitive landscape, identifies macro tailwinds, and frames the go-forward thesis.

---

## 1. Opportunity & Target Segment

${brandStr}${product} is positioned for **digitally-native ${segment} enthusiasts** who currently lack a financial product that rewards their primary lifestyle spend categories. The core unmet need is a **single card that earns disproportionate rewards in ${segment}-related categories** (sports retail, fitness subscriptions, event ticketing, travel, dining) with a digital-first experience.

**Primary persona:** Urban professional, 25–38 years, household income ${currencySymbol}${market === 'India' ? '12–30 LPA' : '£45k–£90k'}, active sports participant or spectator, uses UPI/digital wallet for daily spend, holds 1–2 credit cards.

---

## 2. Market Sizing

### Top-Down
| Layer | Definition | Size | Source assumption |
|-------|-----------|------|-------------------|
| **TAM** | Total ${market} credit card outstanding balances | ${currencySymbol}${market === 'India' ? '2.4L Cr' : '210 Bn'} | Central bank / industry reports |
| **SAM** | Premium & lifestyle segment cardholders | ${currencySymbol}${market === 'India' ? '38,000 Cr' : '42 Bn'} | ~16% of TAM |
| **SOM** | Addressable in 36 months (${brandStr}market share) | ${currencySymbol}${market === 'India' ? '2,800 Cr' : '3.2 Bn'} | ~7% of SAM |

### Bottom-Up
- Estimated ${segment} lifestyle cardholders in ${market}: **${market === 'India' ? '6.2M' : '2.1M'}**
- Average annual card spend (lifestyle segment): **${currencySymbol}${market === 'India' ? '1.8 LPA' : '£8,400'}**
- Revenue per card (interchange + fees): **${currencySymbol}${market === 'India' ? '2,200 pa' : '£310 pa'}**
- **Implied annual revenue at 10% penetration: ${currencySymbol}${market === 'India' ? '1,364 Cr' : '£651M'}**

---

## 3. Competitive Landscape

| Player | Card / Product | Annual Fee | Key ${segment} Benefit | Weakness |
|--------|---------------|------------|------------------------|----------|
| HDFC Bank | Millennia Card | ${currencySymbol}${market === 'India' ? '1,000' : '£95'} | 5% cashback on Amazon/Flipkart | No sports-specific rewards |
| Axis Bank | Vistara Signature | ${currencySymbol}${market === 'India' ? '3,000' : '£120'} | Air miles, lounge access | Travel-heavy, not ${segment} |
| ICICI Bank | Coral Card | ${currencySymbol}${market === 'India' ? '500' : '£45'} | Movie tickets 2-for-1 | Limited lifestyle rewards |
| SBI Card | SimplyCLICK | ${currencySymbol}${market === 'India' ? '499' : '£35'} | Online shopping rewards | No ${segment} focus |
| Kotak | League Card | ${currencySymbol}${market === 'India' ? '2,500' : '£100'} | Sports event access | Niche, low distribution |
| **${product}** | **To be launched** | **TBD** | **${segment} ecosystem rewards** | **New entrant** |

---

## 4. Market Trends & Implications

| # | Trend | Implication for ${product} |
|---|-------|---------------------------|
| 1 | **${market === 'India' ? 'UPI credit-line integration (RBI mandate 2024)' : 'Open Banking / PSD2'}** | Cards must integrate with digital rails; virtual card issuance critical | 
| 2 | **${segment.charAt(0).toUpperCase() + segment.slice(1)} economy growth ${market === 'India' ? '(INR 9,000 Cr fitness market growing 20% YoY)' : '(+18% pa)'}** | Growing addressable base; first-mover advantage window open |
| 3 | **Rewards fatigue with generic cashback** | Niche, experiential rewards (event access, gear discounts) command higher perceived value |
| 4 | **Credit bureau data expansion** | More first-time borrowers are becoming creditworthy; widens addressable base |
| 5 | **Co-brand partnerships (sports brands, gyms, event platforms)** | Co-brand network can drive acquisition and lock in category rewards |

---

## 5. Opportunity Thesis & Key Risk

**Thesis:** The ${market} ${segment} lifestyle segment is large enough (${currencySymbol}${market === 'India' ? '38,000 Cr' : '£42 Bn'} SAM), growing fast, and structurally underserved by incumbents whose rewards skew toward travel or generic cashback. ${brandStr}${product} can own this niche by building a **rewards ecosystem around ${segment} spend** — events, gear, fitness, digital — and win on experience.

**Primary risk:** Co-brand partner dependency — if key partners (gym chains, sports retailers, ticketing platforms) do not commit to preferential rates, the reward value proposition weakens to parity.

**Secondary risk:** Activation and spend rates — lifestyle cardholders often hold the card but revert to existing cards for non-${segment} spend, reducing revenue per card.

---

## 6. Recommended Next Steps

1. Validate persona hypothesis with 12–15 in-depth customer interviews (4 weeks).
2. Secure LOIs from 3 anchor co-brand partners before card design is finalised.
3. Commission a credit risk model specific to the ${segment} lifestyle segment income profile.
4. Benchmark rewards rates vs HDFC Millennia and Axis Vistara as the floor.
`;
}

// ─────────────────────────────────────────────────────────────
// PRD
// ─────────────────────────────────────────────────────────────
function mockPRD(ctx) {
  const { product, market, currencySymbol, segment, brand } = ctx;
  const brandStr = brand ? `${brand} ` : '';
  return `# Product Requirements Document — ${product}

> **Domain:** Product Management | **Skill:** prd | **Stage:** Requirements
> *AI-generated in MOCK mode. Set ANTHROPIC_API_KEY for live Claude generation.*

---

## 1. Problem & Why Now

**Problem:** ${segment.charAt(0).toUpperCase() + segment.slice(1)}-active consumers in ${market} lack a credit card that meaningfully rewards their primary lifestyle spend. Existing cards reward travel or generic retail — not fitness, sports events, gear, or active travel. This leaves a segment with high disposable income and strong digital adoption underserved.

**Why now:** The ${market} ${segment} economy is growing at ~20% YoY. UPI credit line mandates (${market === 'India' ? 'RBI 2024' : 'Open Banking'}) are creating new distribution channels. Co-brand partners (gyms, sports apps, gear retailers) are actively seeking embedded financial products. First-mover advantage window is 12–18 months.

**Business case:** Acquiring ${market === 'India' ? '200,000' : '80,000'} active cardholders at ${currencySymbol}${market === 'India' ? '1.8 LPA' : '£8,400'} average annual spend = ${currencySymbol}${market === 'India' ? '3,600 Cr' : '£672M'} portfolio in 3 years. Estimated net interest margin + interchange: ${currencySymbol}${market === 'India' ? '360 Cr' : '£67M'} pa at maturity.

---

## 2. Target Users & Jobs-to-be-Done

### Primary Persona: "The Active Urban Professional"
- **Age:** 26–38 | **Income:** ${currencySymbol}${market === 'India' ? '12–25 LPA' : '£45k–£80k'} | **City:** Metro / Tier-1
- **Behaviour:** Pays gym membership, buys sports gear online, attends events, uses running/fitness apps
- **Current workaround:** Uses a general cashback card that gives 1–2% on all categories; misses out on category bonuses

### JTBD Statements
| # | When… | I want to… | So I can… |
|---|-------|-----------|----------|
| 1 | I buy sports gear online | Earn 5x points on every purchase | Redeem for my next pair of shoes |
| 2 | I book a gym membership | Get a recurring cashback or discount | Reduce my monthly fitness cost |
| 3 | I attend a sports event | Get priority access or cashback on tickets | Feel rewarded for my lifestyle |
| 4 | I travel for a match or race | Earn travel + ${segment} rewards on the same trip | Avoid switching between cards |
| 5 | I track my spend | See a lifestyle-categorised dashboard | Understand where my money goes |

---

## 3. Goals / Non-Goals

### Goals (v1.0)
- ✅ Issue a co-branded ${segment} lifestyle credit card with differentiated rewards
- ✅ Minimum 5x rewards on top-3 ${segment} merchant categories
- ✅ Digital-first onboarding: KYC to virtual card in < 10 minutes
- ✅ Native mobile dashboard with spend-by-category and points tracker
- ✅ Merchant co-brand benefits: gym, gear, event, travel partners

### Non-Goals (v1.0)
- ❌ Physical branch-based card application
- ❌ Business / SME card variant
- ❌ International currency card (v2 consideration)
- ❌ EMI conversion at launch

---

## 4. Solution Overview

The ${product} is a **${segment} lifestyle credit card** with:

1. **Rewards architecture:** 5x on sports/fitness merchants, 3x on dining & travel, 1x on all others
2. **Digital onboarding:** AA framework (${market === 'India' ? 'Account Aggregator' : 'Open Banking'}) + Video KYC → virtual card in session
3. **Partner ecosystem:** 10+ co-brand partners at launch (gym chains, gear brands, event ticketing, sports OTT)
4. **Smart dashboard:** Real-time categorised spend, points forecast, offer discovery
5. **Card controls:** Spend limits, category locks, international toggle — all in-app

---

## 5. Functional Requirements

| # | Requirement | Priority | Notes |
|---|------------|----------|-------|
| FR-01 | Digital application with AA-based income verification | P0 | < 10 min target |
| FR-02 | Video KYC integration (VKYC provider) | P0 | Regulatory requirement |
| FR-03 | Virtual card generation on approval | P0 | Tokenised for Apple/Google Pay |
| FR-04 | 5x rewards accrual on defined merchant categories | P0 | Real-time points posting |
| FR-05 | Points redemption catalog (gear, vouchers, events, statement credit) | P1 | Launch with 50+ options |
| FR-06 | Spend dashboard with category breakdown | P1 | 7/30/90 day views |
| FR-07 | Partner offer discovery (geo and category-based) | P1 | Push notification capable |
| FR-08 | EMV chip + contactless physical card | P0 | Delivered in 5 business days |
| FR-09 | UPI credit line linkage | P1 | Post-RBI circular compliance |
| FR-10 | In-app card controls (freeze, spend limits, PIN change) | P0 | |

---

## 6. Success Metrics

| Metric | Target (Month 6) | Target (Month 18) |
|--------|-----------------|-------------------|
| Cards issued | 25,000 | 150,000 |
| Activation rate (first spend in 30 days) | ≥ 65% | ≥ 70% |
| Monthly active cardholder rate | ≥ 55% | ≥ 60% |
| Avg monthly spend per active card | ${currencySymbol}${market === 'India' ? '14,000' : '£700'} | ${currencySymbol}${market === 'India' ? '18,000' : '£900'} |
| ${segment} category spend share | ≥ 30% | ≥ 35% |
| Rewards redemption rate | ≥ 40% | ≥ 55% |
| Net Promoter Score | ≥ 45 | ≥ 55 |
| Digital servicing rate | ≥ 85% | ≥ 90% |

---

## 7. Risks, Dependencies & Open Questions

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Co-brand partner drops out pre-launch | Medium | High | 2 backup partners per category |
| Credit bureau data gaps for target persona | Low | Medium | AA framework as primary source |
| Regulatory delay (VKYC approval) | Low | High | Submit to regulator in week 2 |
| Competitive response from HDFC Millennia | High | Medium | Lock partners via exclusivity clauses |

### Dependencies
- Account Aggregator onboarding (external vendor — 8-week lead time)
- Card network (Visa/Mastercard) scheme approval — 12 weeks
- Co-brand merchant API integrations — 6 weeks each

### Open Questions
1. Will the ${currencySymbol}${market === 'India' ? '999' : '£79'} joining fee be waived on first year? (Business decision)
2. Which gym chain gets exclusivity at launch?
3. Is v1 Android-only or iOS + Android simultaneously?
`;
}

// ─────────────────────────────────────────────────────────────
// USER STORIES
// ─────────────────────────────────────────────────────────────
function mockUserStories(ctx) {
  const { product, segment, market } = ctx;
  return `# User Stories — ${product}

> **Domain:** Product Management | **Skill:** user-story | **Stage:** Requirements
> *AI-generated in MOCK mode. Set ANTHROPIC_API_KEY for live Claude generation.*

---

## Epic: Digital Onboarding

### US-01 — Eligibility Check
**Story:** As a **prospective cardholder**, I want to check my eligibility in under 60 seconds, so that I know whether to proceed with the full application before investing time in it.

**Acceptance Criteria**
- **Given** I open the application landing page, **when** I enter my PAN and date of birth, **then** the system returns an eligibility decision in < 5 seconds.
- **Given** I am eligible, **when** the result displays, **then** I see my pre-approved credit limit range and an invitation to apply.
- **Given** I am not eligible, **when** the result displays, **then** I see a clear reason and an option to be notified when my profile qualifies.

**Priority:** P0 | **Estimate:** 5 pts | **Traces to:** FR-01

---

### US-02 — Digital KYC
**Story:** As an **applicant**, I want to complete KYC entirely on my phone, so that I never need to visit a branch or post physical documents.

**Acceptance Criteria**
- **Given** I am in the KYC step, **when** I complete the Video KYC call, **then** my identity is verified within the same session.
- **Given** the VKYC call drops, **when** I return to the app, **then** I can resume from the VKYC step without re-entering earlier data.
- **Given** KYC is complete, **when** my application is approved, **then** a virtual card number is issued within 60 seconds.

**Priority:** P0 | **Estimate:** 8 pts | **Traces to:** FR-02, FR-03

---

## Epic: Rewards & Benefits

### US-03 — Earn Accelerated Points
**Story:** As an **active cardholder**, I want to automatically earn 5x reward points on ${segment} category purchases, so that my everyday lifestyle spend builds meaningful rewards faster.

**Acceptance Criteria**
- **Given** I make a purchase at a recognised ${segment} merchant, **when** the transaction posts, **then** 5x points are credited within 24 hours and visible in my app.
- **Given** the merchant is not in the ${segment} category, **when** the transaction posts, **then** 1x base points are credited.
- **Given** I reach the monthly 5x cap (if any), **when** further ${segment} spend occurs, **then** I earn 1x base and receive an in-app notification.

**Priority:** P0 | **Estimate:** 5 pts | **Traces to:** FR-04

---

### US-04 — Redeem Points
**Story:** As an **active cardholder**, I want to browse and redeem my points for sports gear, event tickets, or statement credit, so that my rewards have tangible real-world value.

**Acceptance Criteria**
- **Given** I have ≥ 1,000 points, **when** I open the Rewards Catalog, **then** I see all available redemptions with my point balance prominently displayed.
- **Given** I select a redemption, **when** I confirm, **then** points are deducted and a confirmation voucher / credit is applied within 30 seconds.
- **Given** I have insufficient points, **when** I view an item, **then** the system shows how many more points I need and my projected date of attainment.

**Priority:** P1 | **Estimate:** 8 pts | **Traces to:** FR-05

---

## Epic: Card Management

### US-05 — Freeze / Unfreeze Card
**Story:** As a **cardholder**, I want to instantly freeze my card from the app if I suspect misuse, so that I can prevent fraud without waiting on hold with customer support.

**Acceptance Criteria**
- **Given** my card is active, **when** I toggle "Freeze card" in the app, **then** all future authorisations are declined within 1 second and I receive a push notification.
- **Given** my card is frozen, **when** I toggle "Unfreeze", **then** the card is active again within 5 seconds.
- **Given** I am on a poor network, **when** I tap freeze, **then** the action queues and executes on reconnection, with a visual "pending" state shown.

**Priority:** P0 | **Estimate:** 3 pts | **Traces to:** FR-10

---

### US-06 — Spend Category Dashboard
**Story:** As a **cardholder**, I want a real-time spend breakdown by lifestyle category, so that I can see how much I'm spending on ${segment} vs. dining vs. travel and plan accordingly.

**Acceptance Criteria**
- **Given** I open the Dashboard, **when** my transactions load, **then** I see a donut chart of spend by category for the current month.
- **Given** I tap a category, **when** the detail view opens, **then** I see individual transactions, merchant names, amounts, and points earned.
- **Given** I change the time filter to 90 days, **when** the chart updates, **then** data refreshes within 2 seconds.

**Priority:** P1 | **Estimate:** 5 pts | **Traces to:** FR-06

---

### US-07 — Discover Partner Offers
**Story:** As a **${segment}-active cardholder**, I want to receive contextual offers from partner brands near me or matching my spend history, so that I never miss a discount I would actually use.

**Acceptance Criteria**
- **Given** I open the Offers tab, **when** I am near a partner merchant (geo-enabled), **then** a "Near You" offer banner appears at the top.
- **Given** I have spent with a partner in the last 30 days, **when** I open the app, **then** a personalised offer notification appears for that merchant.
- **Given** I have opted out of location services, **when** I open the Offers tab, **then** offers are shown based on spend history only (no geo data used).

**Priority:** P1 | **Estimate:** 5 pts | **Traces to:** FR-07

---

## Story Map Summary

| Epic | US | Title | Priority | Points |
|------|----|-------|----------|--------|
| Onboarding | US-01 | Eligibility Check | P0 | 5 |
| Onboarding | US-02 | Digital KYC | P0 | 8 |
| Rewards | US-03 | Earn Accelerated Points | P0 | 5 |
| Rewards | US-04 | Redeem Points | P1 | 8 |
| Card Mgmt | US-05 | Freeze / Unfreeze Card | P0 | 3 |
| Card Mgmt | US-06 | Spend Category Dashboard | P1 | 5 |
| Card Mgmt | US-07 | Discover Partner Offers | P1 | 5 |
| **Total** | | | | **39 pts** |
`;
}

// ─────────────────────────────────────────────────────────────
// PROCESS FLOW
// ─────────────────────────────────────────────────────────────
function mockProcessFlow(ctx) {
  const { product, segment } = ctx;
  return `# Process Flows — ${product}

> **Domain:** Product Management | **Skill:** process-flow | **Stage:** Requirements
> *AI-generated in MOCK mode. Set ANTHROPIC_API_KEY for live Claude generation.*

---

## Flow 1: Customer Onboarding

The prospect discovers the card, checks eligibility, completes a fully digital application, passes Video KYC, and receives a virtual card — all in a single session targeting < 10 minutes end-to-end.

\`\`\`mermaid
flowchart TD
    A["🏠 Discover Card\n(Ad / Partner / App Store)"] --> B["Check Eligibility\n(PAN + DOB)"]
    B -->|Eligible| C["Start Application\n(Income, Employment)"]
    B -->|Ineligible| Z1["Show Alternatives\n+ Notify Me Later"]
    C --> D["Account Aggregator\nConsent & Fetch"]
    D -->|Consent Given| E["Video KYC\n(VKYC Call)"]
    D -->|Consent Refused| E2["Manual Document Upload"]
    E --> F{Credit Decision}
    E2 --> F
    F -->|Approved| G["Generate Virtual Card\n< 60 seconds"]
    F -->|Referred| H["Manual Review\n24–48 hrs"]
    F -->|Declined| Z2["Decline Notice\n+ Reason Code"]
    G --> I["Add to Apple / Google Pay"]
    I --> J["🎉 First Transaction\nReady"]
    H -->|Cleared| G
    H -->|Rejected| Z2

    style A fill:#1a1f5e,color:#fff
    style J fill:#16a34a,color:#fff
    style Z1 fill:#94a3b8,color:#fff
    style Z2 fill:#dc2626,color:#fff
\`\`\`

---

## Flow 2: Transaction & Points Accrual

Every card swipe triggers real-time merchant category classification, points calculation, and posting — with instant push notification to the cardholder.

\`\`\`mermaid
sequenceDiagram
    participant C as Cardholder
    participant POS as Merchant POS
    participant NET as Card Network
    participant BANK as Issuer Bank
    participant RWD as Rewards Engine
    participant APP as Mobile App

    C->>POS: Tap / Swipe Card
    POS->>NET: Authorisation Request
    NET->>BANK: Route to Issuer
    BANK->>BANK: Check limit & controls
    BANK-->>NET: Approved / Declined
    NET-->>POS: Response
    POS-->>C: Receipt

    BANK->>RWD: Post transaction event
    RWD->>RWD: Classify merchant category
    RWD->>RWD: Calculate points (1x / 3x / 5x)
    RWD-->>BANK: Points posted
    BANK->>APP: Push notification
    APP-->>C: "₹850 at Nike Store → 4,250 points earned 🏃"
\`\`\`

---

## Flow 3: Rewards Redemption

The cardholder browses the catalog, selects a reward, and redeems points — with instant confirmation and fulfillment orchestrated by the rewards platform.

\`\`\`mermaid
flowchart LR
    A["Open Rewards\nCatalog"] --> B["Browse Categories\n(Gear / Events / Fitness / Cash)"]
    B --> C["Select Reward"]
    C --> D{Sufficient Points?}
    D -->|Yes| E["Confirm Redemption"]
    D -->|No| F["Show points gap\n+ Estimated attainment date"]
    E --> G{Reward Type}
    G -->|Voucher| H["Generate Code\n(instant)"]
    G -->|Statement Credit| I["Apply to Balance\n(T+1)"]
    G -->|Event Ticket| J["Email PDF Ticket\n(< 5 min)"]
    G -->|Physical Gear| K["Ship via Partner\n(3–5 days)"]
    H --> L["🎁 Confirmation\n+ Points deducted"]
    I --> L
    J --> L
    K --> L

    style A fill:#1a1f5e,color:#fff
    style L fill:#16a34a,color:#fff
    style F fill:#f97316,color:#fff
\`\`\`

---

## Flow 4: ${segment.charAt(0).toUpperCase() + segment.slice(1)} Offer Discovery

The system proactively surfaces partner offers based on spend history and location, driving card usage at high-margin merchant categories.

\`\`\`mermaid
stateDiagram-v2
    [*] --> Idle: App opened
    Idle --> GeoCheck: User opens Offers tab
    GeoCheck --> NearbyOffers: Location enabled
    GeoCheck --> HistoryOffers: Location disabled
    NearbyOffers --> Display: Geo + spend ranked offers
    HistoryOffers --> Display: Spend history ranked offers
    Display --> Claimed: User taps Claim
    Claimed --> Activated: Offer linked to card
    Activated --> Redeemed: Qualifying transaction made
    Redeemed --> [*]: Cashback / points posted

    Display --> Dismissed: User dismisses
    Dismissed --> [*]
\`\`\`
`;
}

// ─────────────────────────────────────────────────────────────
// COMPETITIVE ANALYSIS
// ─────────────────────────────────────────────────────────────
function mockCompetitiveAnalysis(ctx) {
  const { product, market, segment, currencySymbol } = ctx;
  return `# Competitive Analysis — ${product}

> **Domain:** Product Management | **Skill:** competitive-analysis | **Stage:** Discovery
> *AI-generated in MOCK mode. Set ANTHROPIC_API_KEY for live Claude generation.*

---

## Overview

The ${market} ${segment}-lifestyle credit card market is populated by general-purpose rewards cards with partial lifestyle benefits. No single incumbent has built a card purpose-designed around ${segment} spend. This creates a clear whitespace for ${product} to own the category.

---

## Competitor Profiles

| # | Player | Card | Segment | Core Positioning |
|---|--------|------|---------|-----------------|
| 1 | HDFC Bank | Millennia | Millennial / Online | Cashback on Amazon, Flipkart, Swiggy |
| 2 | Axis Bank | Vistara Signature | Travel / Premium | Air miles, lounge access |
| 3 | ICICI Bank | Coral Card | Mass Affluent | Entertainment & dining rewards |
| 4 | SBI Card | SimplyCLICK | Digital-first | Online shopping cashback |
| 5 | Kotak | League Card | Sports fans | Sports event access (niche) |
| 6 | Amex | Platinum Travel | Ultra-premium | Travel, hotel, dining |
| **7** | **${product}** | **To launch** | **${segment} lifestyle** | **Purpose-built for ${segment} ecosystem** |

---

## Feature Matrix

| Capability | HDFC Millennia | Axis Vistara | ICICI Coral | SBI SimplyCLICK | Kotak League | **${product}** |
|-----------|:--------------:|:------------:|:-----------:|:---------------:|:------------:|:----------:|
| ${segment} category 5x rewards | ✗ | ✗ | ✗ | ✗ | ~ | **✓** |
| Fitness subscription discount | ✗ | ✗ | ✗ | ✗ | ~ | **✓** |
| Sports event access / tickets | ✗ | ✗ | ~ | ✗ | ✓ | **✓** |
| Sports gear brand partners | ✗ | ✗ | ✗ | ✗ | ~ | **✓** |
| Digital onboarding (< 10 min) | ~ | ✗ | ~ | ✓ | ✗ | **✓** |
| Virtual card on approval | ~ | ✗ | ~ | ✓ | ✗ | **✓** |
| Spend category dashboard | ✗ | ✗ | ✗ | ~ | ✗ | **✓** |
| UPI credit line integration | ~ | ✗ | ✗ | ~ | ✗ | **✓** |
| Lounge access | ✗ | ✓ | ✗ | ✗ | ✗ | **~** |
| Travel rewards | ~ | ✓ | ✗ | ✗ | ✗ | **~** |
| Dining rewards | ✓ | ~ | ✓ | ✗ | ✗ | **✓** |
| Annual fee waiver (spend-linked) | ✓ | ~ | ✓ | ✓ | ✗ | **✓** |

*Legend: ✓ Full  ~ Partial  ✗ None*

---

## Positioning Map

**Price axis (Annual Fee):** Low (< ${currencySymbol}${market === 'India' ? '500' : '£50'}) → High (> ${currencySymbol}${market === 'India' ? '3,000' : '£150'})
**Value axis:** Generic rewards → Lifestyle-specific rewards

- **Bottom-left (low fee, generic):** SBI SimplyCLICK, ICICI Coral
- **Top-left (low fee, lifestyle):** *Whitespace — ${product} opportunity at accessible price point*
- **Bottom-right (high fee, generic):** HDFC Millennia
- **Top-right (high fee, lifestyle):** Axis Vistara (travel niche), Amex Platinum
- **Mid (niche ${segment}):** Kotak League — limited distribution, no digital experience

**${product} target:** Mid-premium fee tier (${currencySymbol}${market === 'India' ? '1,499' : '£99'} pa) with high ${segment}-lifestyle specificity — a position no competitor occupies.

---

## Whitespace Gaps

| # | Gap | Opportunity |
|---|-----|-------------|
| 1 | **${segment}-category 5x rewards** | No card gives meaningful bonus on sports/fitness MCC codes — instant category ownership |
| 2 | **Co-brand partner ecosystem** | Gym chains, gear brands, event platforms have no exclusive card partner — first-mover gets exclusivity |
| 3 | **Spend intelligence for lifestyle** | No card shows a lifestyle-categorised dashboard — a high-engagement, low-cost differentiator |
| 4 | **UPI credit line in ${segment} context** | RBI mandate creates new issuance channel; incumbents are slow to activate |
| 5 | **Virtual card in < 10 min** | Most incumbents take 5–7 days for physical card; digital-native users will convert on instant gratification |

---

## Strategic Implications

- **Table stakes (must match):** Annual fee waiver on minimum annual spend; Apple/Google Pay tokenisation; basic travel accident insurance
- **Points of differentiation:** ${segment} merchant 5x rate; co-brand partner exclusives; lifestyle spend dashboard; < 10-min onboarding to virtual card
- **Areas to avoid:** Head-to-head on lounge access or travel miles (Axis Vistara owns that position and cannot be beaten on cost)

## Recommended Differentiation Strategy

${product} should own the **"${segment} lifestyle card"** position with a purpose-built rewards architecture, a curated partner ecosystem across the full ${segment} spend stack (gear, gym, events, travel, digital), and a digital-native experience that converts applicants in a single session. Competitors are anchored to travel or generic cashback — this niche is theirs to lose.
`;
}

// ─────────────────────────────────────────────────────────────
// DISCOVERY BRIEF
// ─────────────────────────────────────────────────────────────
function mockDiscoveryBrief(ctx) {
  const { product, market, segment, currencySymbol } = ctx;
  return `# Discovery Brief — ${product}

> **Domain:** Product Management | **Skill:** discovery-brief | **Stage:** Discovery
> *AI-generated in MOCK mode. Set ANTHROPIC_API_KEY for live Claude generation.*

---

## Opportunity Statement

${market} consumers with an active ${segment} lifestyle lack a credit card that meaningfully rewards their primary spend categories — causing high-value customers to distribute spend across multiple generic cards and leaving ${currencySymbol}${market === 'India' ? '38,000 Cr' : '£42Bn'} SAM underserved.

---

## Problem Context

Despite growing disposable incomes and deepening digital adoption, the ${market} credit card market remains dominated by travel-rewards and generic cashback propositions. The ${segment} lifestyle segment — worth ${currencySymbol}${market === 'India' ? '9,000 Cr' : '£18Bn'} in annual consumer spend — is growing at ~20% YoY but has no purpose-built financial product.

Current cardholders in this segment accumulate low-value generic rewards, miss category bonuses, and show low engagement with their card app. Churn risk is elevated because there is no lock-in tied to their lifestyle identity.

Co-brand partners (gyms, sports gear brands, ticketing platforms) are actively seeking embedded financial products but have no natural conversation partner at an issuing bank.

---

## Jobs-to-be-Done

| # | Situation | Motivation | Outcome |
|---|-----------|-----------|---------|
| 1 | When I buy sports gear or equipment | I want to earn meaningful rewards on that specific purchase | So I can feel financially rewarded for my lifestyle choices |
| 2 | When I pay for my monthly gym membership | I want to get a recurring discount or cashback | So my fitness costs are lower and I stay loyal to my card |
| 3 | When I book sports event tickets | I want priority access or cashback | So I feel like a VIP as a cardholder |
| 4 | When I track my monthly spend | I want to see a breakdown by ${segment} vs other categories | So I understand my ${segment} budget and feel in control |
| 5 | When I travel for sports events or races | I want to earn combined travel + ${segment} rewards | So I don't need to switch between two cards |
| 6 | When a friend asks what card I use | I want to recommend something unique and relevant | So I am seen as someone who lives their identity fully |

---

## Target Personas

### Persona 1: The Fitness-First Professional
- **Context:** Urban, 28–35, runs marathons, pays gym membership, buys gear online every 2–3 months
- **Primary pain:** Current card gives 1% on everything; fitness spend feels "wasted" on rewards
- **Current workaround:** Tracks deals manually on WhatsApp groups; uses brand EMI for big gear purchases

### Persona 2: The Weekend Sports Enthusiast
- **Context:** 30–42, weekend cricket / football / cycling, attends live events, uses sports OTT
- **Primary pain:** Existing cards offer lounge access they never use; nothing for match tickets or gear
- **Current workaround:** Books tickets via UPI (no rewards); holds an airline card that's irrelevant

### Persona 3: The Digital-First Young Earner
- **Context:** 22–28, early career, uses multiple UPI apps, brand-conscious, socially active
- **Primary pain:** Hasn't found a credit card that matches their identity; existing cards feel "corporate"
- **Current workaround:** Uses debit + UPI; hasn't committed to a credit card yet

---

## Core Hypotheses

| # | Hypothesis | Test Method | Success Signal |
|---|------------|-------------|----------------|
| H-01 | ${segment} lifestyle consumers will pay a ${currencySymbol}${market === 'India' ? '999' : '£79'} annual fee for category-specific rewards | A/B landing page with fee variants | ≥ 60% conversion at fee tier vs. free |
| H-02 | Gym + gear rewards are valued more than lounge access by this segment | Survey (n=200) with conjoint analysis | ${segment} rewards ranked > lounge in ≥ 70% responses |
| H-03 | Co-brand partner exclusivity drives 2x acquisition for card-partner vs. standalone | Partner co-marketing pilot | Partner-referred CPL ≤ 50% of direct CPL |
| H-04 | Digital onboarding (< 10 min) will increase completion rate by > 20 percentage points | A/B test vs. current branch-assisted flow | Completion rate ≥ 70% vs. current ~48% |
| H-05 | Lifestyle spend dashboard drives monthly active usage (opens app ≥ 3x/month) | Feature flag rollout to 1,000 pilot users | MAU app opens ≥ 3 after dashboard launch |

---

## Known Constraints

- **Regulatory:** VKYC must comply with ${market === 'India' ? 'RBI Master Direction on KYC 2016 (as amended 2023)' : 'FCA KYC and AML requirements'}; Account Aggregator consent framework required
- **Technical:** Card network (Visa/Mastercard) onboarding takes 10–14 weeks minimum; existing core banking system has 48-hr batch for credit limit updates
- **Budget:** MVP capex envelope: ${currencySymbol}${market === 'India' ? '8–12 Cr' : '£2–3M'}; marketing launch budget: ${currencySymbol}${market === 'India' ? '5 Cr' : '£1.2M'} in Year 1
- **Timeline:** Board commitment: launch-ready in 9 months from discovery sign-off

---

## Research Plan

| Phase | Method | Participants | Duration | Decision Gate |
|-------|--------|-------------|----------|---------------|
| 1 — Qualitative | In-depth interviews | 15 target personas | 3 weeks | Validate JTBD + willingness to pay |
| 2 — Quantitative | Online survey (conjoint) | 500 respondents | 2 weeks | Confirm feature priorities + fee sensitivity |
| 3 — Competitive audit | Mystery shopping + card analysis | 6 competitor cards | 1 week | Finalise differentiation matrix |
| 4 — Partner discovery | Exploratory partner interviews | 8 co-brand prospects | 2 weeks | LOI from ≥ 3 anchor partners |
| 5 — Hypothesis tests | A/B landing page tests | 2,000 impressions | 2 weeks | Validate H-01 and H-03 |

**Total discovery timeline:** 8 weeks
**Decision gate:** Discovery brief + research readout presented to Product & Risk steering committee for build/no-build decision.

---

## Open Questions

1. What is the minimum partner ecosystem size that makes the card proposition compelling at launch?
2. Should the product launch on Visa or Mastercard? (Network incentive packages being evaluated)
3. Is a co-branded physical card design feasible within the 9-month timeline?
4. What credit limit range is appropriate for the target income profile given risk appetite?
`;
}

// ─────────────────────────────────────────────────────────────
// HTML UI SCREENS
// ─────────────────────────────────────────────────────────────
function mockHtmlUiScreens(ctx) {
  const { product, segment, brand, currencySymbol, market } = ctx;
  const brandStr = brand || 'nivi4AI';
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${product} — UI Prototype</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f0f4f8;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:24px 16px}
.proto-header{text-align:center;margin-bottom:20px}
.proto-header h1{font-size:17px;font-weight:800;color:#0f172a;letter-spacing:-.3px}
.proto-header p{font-size:12px;color:#64748b;margin-top:4px}
.screen-nav{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;justify-content:center}
.screen-btn{padding:7px 16px;border:2px solid #e2e8f0;border-radius:20px;background:#fff;cursor:pointer;font-size:12px;font-weight:700;color:#64748b;transition:all .15s;font-family:inherit}
.screen-btn:hover{border-color:#1a1f5e;color:#1a1f5e}
.screen-btn.active{background:#1a1f5e;color:#fff;border-color:#1a1f5e}
.phone-outer{position:relative;display:inline-block}
.phone-frame{width:390px;min-height:844px;background:#fff;border-radius:44px;box-shadow:0 0 0 14px #1a1a2e,0 30px 80px rgba(0,0,0,.35);overflow:hidden;position:relative}
.screen{display:none;flex-direction:column;min-height:844px;background:#fff}
.screen.active{display:flex}
/* Status bar */
.sb{background:#1a1f5e;padding:14px 20px 6px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}
.sb-time{color:#fff;font-size:14px;font-weight:700}
.sb-icons{color:#fff;font-size:11px;display:flex;align-items:center;gap:4px}
/* Scrollable content area */
.content{flex:1;overflow-y:auto;padding-bottom:16px}
/* Bottom nav */
.bnav{background:#fff;border-top:1px solid #f1f5f9;display:flex;padding:10px 0 20px;flex-shrink:0}
.bnav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer}
.bnav-icon{font-size:20px;line-height:1}
.bnav-label{font-size:10px;color:#94a3b8;font-weight:600}
.bnav-item.active .bnav-label{color:#1a1f5e}
.bnav-item.active .bnav-icon{transform:scale(1.1)}
/* ─── SCREEN 1: LANDING ─── */
.s1-hero{background:linear-gradient(135deg,#1a1f5e 0%,#312e81 60%,#1e1b4b 100%);padding:28px 20px 32px;color:#fff;position:relative;overflow:hidden}
.s1-hero::after{content:'';position:absolute;right:-30px;top:-20px;width:160px;height:160px;background:rgba(249,115,22,.15);border-radius:50%}
.s1-hero-badge{background:rgba(249,115,22,.2);border:1px solid rgba(249,115,22,.5);color:#fdba74;font-size:10px;font-weight:800;padding:3px 10px;border-radius:99px;display:inline-block;margin-bottom:12px;letter-spacing:.5px}
.s1-hero h2{font-size:26px;font-weight:800;line-height:1.2;margin-bottom:8px}
.s1-hero p{font-size:13px;color:rgba(255,255,255,.8);line-height:1.5;margin-bottom:20px}
.card-3d{background:linear-gradient(135deg,#f97316,#ea580c);border-radius:14px;padding:18px 16px;margin:0 0 20px;box-shadow:0 8px 24px rgba(249,115,22,.4);position:relative;z-index:1}
.card-chip{width:32px;height:24px;background:linear-gradient(135deg,#fbbf24,#f59e0b);border-radius:4px;margin-bottom:16px}
.card-num{font-size:12px;color:rgba(255,255,255,.8);letter-spacing:2px;margin-bottom:8px}
.card-name{font-size:14px;font-weight:700;color:#fff}
.card-network{position:absolute;right:14px;bottom:14px;font-size:22px}
.s1-feat{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:16px}
.feat-card{background:#f8fafc;border-radius:12px;padding:12px;text-align:center}
.feat-icon{font-size:22px;margin-bottom:6px}
.feat-title{font-size:11px;font-weight:700;color:#1e293b}
.feat-desc{font-size:10px;color:#64748b;margin-top:2px;line-height:1.3}
.btn-apply{margin:0 16px 16px;background:linear-gradient(90deg,#f97316,#ea580c);color:#fff;border:none;border-radius:14px;padding:14px;font-size:15px;font-weight:700;width:calc(100% - 32px);cursor:pointer;font-family:inherit}
/* ─── SCREEN 2: APPLICATION ─── */
.s2-header{background:#1a1f5e;padding:20px 20px 18px;color:#fff}
.s2-header h2{font-size:18px;font-weight:800}
.s2-header p{font-size:12px;color:rgba(255,255,255,.7);margin-top:3px}
.progress-bar{height:4px;background:rgba(255,255,255,.2);margin-top:14px;border-radius:4px;overflow:hidden}
.progress-fill{width:33%;height:100%;background:#f97316;border-radius:4px}
.prog-steps{display:flex;justify-content:space-between;margin-top:6px}
.prog-step{font-size:9px;color:rgba(255,255,255,.6);font-weight:600}
.prog-step.done{color:#fdba74}
.form-section{padding:16px}
.form-label{font-size:11px;font-weight:700;color:#374151;margin-bottom:5px;display:block;text-transform:uppercase;letter-spacing:.4px}
.form-input{width:100%;border:1.5px solid #e5e7eb;border-radius:10px;padding:12px;font-size:14px;color:#1e293b;margin-bottom:14px;font-family:inherit;outline:none;background:#f9fafb}
.form-input.active-input{border-color:#1a1f5e;background:#fff}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.employment-chips{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}
.emp-chip{padding:7px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;color:#374151;background:#f9fafb}
.emp-chip.selected{border-color:#1a1f5e;background:#eff6ff;color:#1a1f5e}
.consent-box{background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:12px;margin-bottom:16px;display:flex;gap:8px;align-items:flex-start}
.consent-box p{font-size:11px;color:#166534;line-height:1.5}
.btn-next{background:#1a1f5e;color:#fff;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:700;width:100%;cursor:pointer;font-family:inherit}
/* ─── SCREEN 3: DASHBOARD ─── */
.dash-header{background:linear-gradient(135deg,#1a1f5e,#312e81);padding:20px 20px 0;color:#fff}
.dash-header-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.dash-greeting{font-size:14px;color:rgba(255,255,255,.8)}
.dash-name{font-size:20px;font-weight:800;margin-top:2px}
.notif-btn{width:36px;height:36px;background:rgba(255,255,255,.15);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer}
.dash-card{background:linear-gradient(135deg,#f97316,#ea580c);border-radius:16px;padding:18px;margin:0 -4px;box-shadow:0 8px 20px rgba(249,115,22,.4)}
.dash-balance-label{font-size:11px;color:rgba(255,255,255,.8);font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.dash-balance{font-size:28px;font-weight:800;color:#fff;margin-top:4px}
.dash-limit{font-size:11px;color:rgba(255,255,255,.7);margin-top:2px}
.dash-card-bottom{display:flex;justify-content:space-between;margin-top:14px;font-size:11px;color:rgba(255,255,255,.8)}
.dash-card-bottom span:last-child{font-weight:700;color:#fff}
.points-strip{background:#fff;border-radius:12px;margin:14px 16px 0;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.points-label{font-size:11px;color:#64748b;font-weight:600}
.points-val{font-size:18px;font-weight:800;color:#f97316}
.points-sub{font-size:10px;color:#94a3b8}
.redeem-btn{background:#fff7ed;border:1.5px solid #f97316;color:#ea580c;font-size:11px;font-weight:700;padding:5px 12px;border-radius:20px;cursor:pointer;font-family:inherit}
.spend-section{padding:14px 16px}
.spend-title{font-size:13px;font-weight:800;color:#0f172a;margin-bottom:10px}
.spend-cats{display:flex;flex-direction:column;gap:8px}
.spend-cat{display:flex;align-items:center;gap:10px}
.spend-cat-icon{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.spend-cat-bar{flex:1}
.spend-cat-name{font-size:11px;font-weight:700;color:#374151}
.spend-bar-track{height:6px;background:#f1f5f9;border-radius:4px;margin-top:3px;overflow:hidden}
.spend-bar-fill{height:100%;border-radius:4px}
.spend-cat-amt{font-size:11px;font-weight:700;color:#1e293b;white-space:nowrap}
.spend-cat-pts{font-size:9px;color:#f97316;font-weight:700}
/* ─── SCREEN 4: REWARDS ─── */
.rwd-header{background:linear-gradient(135deg,#1a1f5e,#312e81);padding:20px;color:#fff}
.rwd-header h2{font-size:18px;font-weight:800}
.rwd-points-row{display:flex;align-items:center;justify-content:space-between;margin-top:10px;background:rgba(255,255,255,.12);border-radius:10px;padding:10px 14px}
.rwd-pts-val{font-size:22px;font-weight:800;color:#fbbf24}
.rwd-pts-label{font-size:10px;color:rgba(255,255,255,.7)}
.rwd-pts-sub{font-size:10px;color:rgba(255,255,255,.5);text-align:right}
.rwd-cats{display:flex;gap:8px;padding:14px 16px 4px;overflow-x:auto}
.rwd-cat{padding:7px 14px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:20px;font-size:11px;font-weight:700;color:#475569;cursor:pointer;white-space:nowrap}
.rwd-cat.active{background:#1a1f5e;color:#fff;border-color:#1a1f5e}
.rwd-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px 16px}
.rwd-item{background:#f8fafc;border-radius:14px;overflow:hidden;cursor:pointer}
.rwd-item-img{background:linear-gradient(135deg,#1a1f5e,#312e81);height:80px;display:flex;align-items:center;justify-content:center;font-size:32px}
.rwd-item-body{padding:8px 10px}
.rwd-item-name{font-size:11px;font-weight:700;color:#1e293b;line-height:1.3}
.rwd-item-pts{font-size:12px;font-weight:800;color:#f97316;margin-top:3px}
.rwd-item-val{font-size:10px;color:#64748b}
</style>
</head>
<body>
<div class="proto-header">
  <h1>${product} — UI Prototype</h1>
  <p>Interactive mobile screens · ${brandStr} · ${segment.charAt(0).toUpperCase()+segment.slice(1)} Lifestyle Card</p>
</div>
<div class="screen-nav">
  <button class="screen-btn active" onclick="showScreen('landing',this)">🏠 Landing</button>
  <button class="screen-btn" onclick="showScreen('apply',this)">📝 Apply</button>
  <button class="screen-btn" onclick="showScreen('dashboard',this)">💳 Dashboard</button>
  <button class="screen-btn" onclick="showScreen('rewards',this)">🎁 Rewards</button>
</div>
<div class="phone-outer">
  <div class="phone-frame">

    <!-- SCREEN 1: LANDING -->
    <div class="screen active" id="landing">
      <div class="sb"><span class="sb-time">9:41</span><span class="sb-icons">●●● 5G 🔋</span></div>
      <div class="content">
        <div class="s1-hero">
          <div class="s1-hero-badge">✦ NEW LAUNCH</div>
          <h2>${product}</h2>
          <p>India's first credit card built for the ${segment} lifestyle. Earn 5x on gear, gym & events.</p>
          <div class="card-3d">
            <div class="card-chip"></div>
            <div class="card-num">•••• •••• •••• 7291</div>
            <div class="card-name">${brandStr.toUpperCase()}</div>
            <div class="card-network">●●</div>
          </div>
        </div>
        <div class="s1-feat">
          <div class="feat-card"><div class="feat-icon">🏃</div><div class="feat-title">5x on ${segment}</div><div class="feat-desc">Gear, gym, events & ${segment} apps</div></div>
          <div class="feat-card"><div class="feat-icon">✈️</div><div class="feat-title">3x Travel</div><div class="feat-desc">Flights, hotels & sports travel</div></div>
          <div class="feat-card"><div class="feat-icon">🍽️</div><div class="feat-title">3x Dining</div><div class="feat-desc">Pre & post-match dining</div></div>
          <div class="feat-card"><div class="feat-icon">⚡</div><div class="feat-title">&lt;10 min Apply</div><div class="feat-desc">Instant virtual card on approval</div></div>
        </div>
        <button class="btn-apply" onclick="document.querySelector('.screen-btn:nth-child(2)').click()">Apply Now — Free for 1st Year</button>
      </div>
      <div class="bnav">
        <div class="bnav-item active"><div class="bnav-icon">🏠</div><div class="bnav-label">Home</div></div>
        <div class="bnav-item"><div class="bnav-icon">🔍</div><div class="bnav-label">Explore</div></div>
        <div class="bnav-item"><div class="bnav-icon">🎁</div><div class="bnav-label">Rewards</div></div>
        <div class="bnav-item"><div class="bnav-icon">👤</div><div class="bnav-label">Profile</div></div>
      </div>
    </div>

    <!-- SCREEN 2: APPLICATION -->
    <div class="screen" id="apply">
      <div class="sb"><span class="sb-time">9:41</span><span class="sb-icons">●●● 5G 🔋</span></div>
      <div class="content">
        <div class="s2-header">
          <h2>Apply for ${product}</h2>
          <p>Step 1 of 3 — Personal Details</p>
          <div class="progress-bar"><div class="progress-fill"></div></div>
          <div class="prog-steps"><span class="prog-step done">● Details</span><span class="prog-step">○ Income</span><span class="prog-step">○ KYC</span></div>
        </div>
        <div class="form-section">
          <label class="form-label">Full Name (as per PAN)</label>
          <div class="form-input active-input">Priya Sharma</div>
          <label class="form-label">PAN Number</label>
          <div class="form-input">BPQPS6742H</div>
          <div class="form-row">
            <div><label class="form-label">Date of Birth</label><div class="form-input">12 / 06 / 1994</div></div>
            <div><label class="form-label">Mobile</label><div class="form-input">+91 98765•••••</div></div>
          </div>
          <label class="form-label">Employment Type</label>
          <div class="employment-chips">
            <div class="emp-chip selected">Salaried</div>
            <div class="emp-chip">Self-Employed</div>
            <div class="emp-chip">Business Owner</div>
          </div>
          <label class="form-label">Annual Income</label>
          <div class="form-input">${currencySymbol}18,00,000</div>
          <div class="consent-box">
            <span style="font-size:16px">✓</span>
            <p>I consent to ${brandStr} fetching my financial data via Account Aggregator for income verification. This is secure and RBI-regulated.</p>
          </div>
          <button class="btn-next" onclick="document.querySelector('.screen-btn:nth-child(3)').click()">Continue to Income Verification →</button>
        </div>
      </div>
    </div>

    <!-- SCREEN 3: DASHBOARD -->
    <div class="screen" id="dashboard">
      <div class="sb"><span class="sb-time">9:41</span><span class="sb-icons">●●● 5G 🔋</span></div>
      <div class="content">
        <div class="dash-header">
          <div class="dash-header-top">
            <div><div class="dash-greeting">Good morning 👋</div><div class="dash-name">Priya Sharma</div></div>
            <div class="notif-btn">🔔</div>
          </div>
          <div class="dash-card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div><div class="dash-balance-label">Available Credit</div><div class="dash-balance">${currencySymbol}${market==='India'?'3,45,230':'£8,240'}</div><div class="dash-limit">of ${currencySymbol}${market==='India'?'5,00,000':'£10,000'} limit</div></div>
              <div style="text-align:right;color:rgba(255,255,255,.9)"><div style="font-size:10px;font-weight:700">SPORTSFLEX</div><div style="font-size:11px;margin-top:2px">●● 7291</div></div>
            </div>
            <div class="dash-card-bottom"><span>Due ${currencySymbol}${market==='India'?'1,54,770':'£1,760'} on 15 Jul</span><span>Pay Now</span></div>
          </div>
        </div>
        <div class="points-strip">
          <div><div class="points-label">Reward Points</div><div class="points-val">14,820 pts</div><div class="points-sub">≈ ${currencySymbol}${market==='India'?'1,482':'£148'} value</div></div>
          <button class="redeem-btn">Redeem →</button>
        </div>
        <div class="spend-section">
          <div class="spend-title">This Month's Spend</div>
          <div class="spend-cats">
            <div class="spend-cat"><div class="spend-cat-icon" style="background:#fff7ed">🏃</div><div class="spend-cat-bar"><div class="spend-cat-name">${segment.charAt(0).toUpperCase()+segment.slice(1)} &amp; Fitness <span class="spend-cat-pts">5x pts</span></div><div class="spend-bar-track"><div class="spend-bar-fill" style="width:72%;background:#f97316"></div></div></div><div class="spend-cat-amt">${currencySymbol}${market==='India'?'12,400':'£620'}</div></div>
            <div class="spend-cat"><div class="spend-cat-icon" style="background:#f0fdf4">🍽️</div><div class="spend-cat-bar"><div class="spend-cat-name">Dining <span class="spend-cat-pts">3x pts</span></div><div class="spend-bar-track"><div class="spend-bar-fill" style="width:45%;background:#22c55e"></div></div></div><div class="spend-cat-amt">${currencySymbol}${market==='India'?'7,800':'£390'}</div></div>
            <div class="spend-cat"><div class="spend-cat-icon" style="background:#eff6ff">✈️</div><div class="spend-cat-bar"><div class="spend-cat-name">Travel <span class="spend-cat-pts">3x pts</span></div><div class="spend-bar-track"><div class="spend-bar-fill" style="width:30%;background:#3b82f6"></div></div></div><div class="spend-cat-amt">${currencySymbol}${market==='India'?'5,200':'£260'}</div></div>
            <div class="spend-cat"><div class="spend-cat-icon" style="background:#f5f3ff">🛍️</div><div class="spend-cat-bar"><div class="spend-cat-name">Others <span class="spend-cat-pts">1x pts</span></div><div class="spend-bar-track"><div class="spend-bar-fill" style="width:20%;background:#8b5cf6"></div></div></div><div class="spend-cat-amt">${currencySymbol}${market==='India'?'3,400':'£170'}</div></div>
          </div>
        </div>
      </div>
      <div class="bnav">
        <div class="bnav-item"><div class="bnav-icon">🏠</div><div class="bnav-label">Home</div></div>
        <div class="bnav-item active"><div class="bnav-icon">💳</div><div class="bnav-label">Card</div></div>
        <div class="bnav-item"><div class="bnav-icon">🎁</div><div class="bnav-label">Rewards</div></div>
        <div class="bnav-item"><div class="bnav-icon">👤</div><div class="bnav-label">Profile</div></div>
      </div>
    </div>

    <!-- SCREEN 4: REWARDS -->
    <div class="screen" id="rewards">
      <div class="sb"><span class="sb-time">9:41</span><span class="sb-icons">●●● 5G 🔋</span></div>
      <div class="content">
        <div class="rwd-header">
          <h2>Rewards Catalog</h2>
          <div class="rwd-points-row">
            <div><div class="rwd-pts-val">14,820 pts</div><div class="rwd-pts-label">Available to redeem</div></div>
            <div><div class="rwd-pts-sub">Expires never</div><div class="rwd-pts-sub" style="margin-top:2px">≈ ${currencySymbol}${market==='India'?'1,482':'£148'} value</div></div>
          </div>
        </div>
        <div class="rwd-cats"><div class="rwd-cat active">All</div><div class="rwd-cat">⚽ Sports</div><div class="rwd-cat">🏋️ Fitness</div><div class="rwd-cat">✈️ Travel</div><div class="rwd-cat">💰 Cash</div></div>
        <div class="rwd-grid">
          <div class="rwd-item"><div class="rwd-item-img">👟</div><div class="rwd-item-body"><div class="rwd-item-name">Nike Running Shoes Gift Card</div><div class="rwd-item-pts">5,000 pts</div><div class="rwd-item-val">Worth ${currencySymbol}${market==='India'?'500':'£50'}</div></div></div>
          <div class="rwd-item"><div class="rwd-item-img">🎟️</div><div class="rwd-item-body"><div class="rwd-item-name">IPL Match Ticket (T20)</div><div class="rwd-item-pts">8,000 pts</div><div class="rwd-item-val">Worth ${currencySymbol}${market==='India'?'800':'£80'}</div></div></div>
          <div class="rwd-item"><div class="rwd-item-img">🏋️</div><div class="rwd-item-body"><div class="rwd-item-name">Cult.fit 3-Month Pass</div><div class="rwd-item-pts">6,500 pts</div><div class="rwd-item-val">Worth ${currencySymbol}${market==='India'?'650':'£65'}</div></div></div>
          <div class="rwd-item"><div class="rwd-item-img">💳</div><div class="rwd-item-body"><div class="rwd-item-name">Statement Credit</div><div class="rwd-item-pts">1,000 pts</div><div class="rwd-item-val">= ${currencySymbol}${market==='India'?'100':'£10'} off bill</div></div></div>
        </div>
      </div>
      <div class="bnav">
        <div class="bnav-item"><div class="bnav-icon">🏠</div><div class="bnav-label">Home</div></div>
        <div class="bnav-item"><div class="bnav-icon">💳</div><div class="bnav-label">Card</div></div>
        <div class="bnav-item active"><div class="bnav-icon">🎁</div><div class="bnav-label">Rewards</div></div>
        <div class="bnav-item"><div class="bnav-icon">👤</div><div class="bnav-label">Profile</div></div>
      </div>
    </div>

  </div>
</div>
<script>
function showScreen(id,btn){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.screen-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if(btn)btn.classList.add('active');
}
</script>
</body>
</html>`;

  return `# Mobile UI Screens — ${product}

> **Domain:** Product Management | **Skill:** html-ui-screens | **Stage:** Discovery
> *AI-generated in MOCK mode. Open the HTML below in your browser for the full interactive prototype.*

---

**Screens included:** Landing / Hero · Application Form · Card Dashboard · Rewards Catalog

**How to view:** Copy the HTML block below, save as \`${product.replace(/ /g,'-').toLowerCase()}-prototype.html\`, and open in any browser.

\`\`\`html
${htmlContent}
\`\`\`
`;
}

// ─────────────────────────────────────────────────────────────
// HTML DECK
// ─────────────────────────────────────────────────────────────
function mockHtmlDeck(ctx) {
  const { product, market, segment, currencySymbol, brand } = ctx;
  const brandStr = brand || 'nivi4AI';
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${product} — Pitch Deck</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;overflow:hidden}
#deck{width:100%;height:100%;position:relative}
.slide{display:none;width:100%;height:100vh;padding:60px 80px;flex-direction:column;justify-content:center;position:relative;overflow:hidden}
.slide.active{display:flex}
.slide::before{content:'';position:absolute;right:-100px;top:-100px;width:400px;height:400px;background:rgba(249,115,22,.06);border-radius:50%;pointer-events:none}
.nav-btn{position:fixed;bottom:32px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;padding:10px 24px;border-radius:8px;cursor:pointer;font-family:inherit;font-size:14px;font-weight:600;transition:background .15s;z-index:100}
#prevBtn{left:32px}#nextBtn{right:32px}
.nav-btn:hover{background:rgba(255,255,255,.2)}
.counter{position:fixed;bottom:38px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.5);font-size:12px;font-weight:600;letter-spacing:.5px;z-index:100}
/* SLIDE TYPES */
.chip{display:inline-block;background:rgba(249,115,22,.2);border:1px solid rgba(249,115,22,.4);color:#fdba74;font-size:11px;font-weight:700;padding:4px 12px;border-radius:99px;margin-bottom:20px;letter-spacing:.5px}
h1.cover-title{font-size:64px;font-weight:900;color:#fff;line-height:1.05;letter-spacing:-2px}
h1.cover-title span{color:#f97316}
.cover-sub{font-size:20px;color:rgba(255,255,255,.6);margin-top:16px}
.cover-meta{margin-top:40px;font-size:13px;color:rgba(255,255,255,.4);display:flex;gap:24px}
h2.slide-title{font-size:42px;font-weight:800;color:#fff;line-height:1.1;margin-bottom:8px}
h2.slide-title span{color:#f97316}
.slide-sub{font-size:16px;color:rgba(255,255,255,.5);margin-bottom:32px}
.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:32px}
.stat-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:28px 24px}
.stat-num{font-size:42px;font-weight:900;color:#f97316;line-height:1}
.stat-label{font-size:13px;color:rgba(255,255,255,.6);margin-top:8px;line-height:1.4}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start}
ul.bullet-list{list-style:none;display:flex;flex-direction:column;gap:14px}
ul.bullet-list li{display:flex;gap:12px;align-items:flex-start;font-size:15px;color:rgba(255,255,255,.8);line-height:1.5}
ul.bullet-list li::before{content:'→';color:#f97316;font-weight:900;flex-shrink:0;margin-top:1px}
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.feat-box{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:24px}
.feat-box-icon{font-size:28px;margin-bottom:12px}
.feat-box-title{font-size:15px;font-weight:700;color:#fff;margin-bottom:6px}
.feat-box-desc{font-size:13px;color:rgba(255,255,255,.5);line-height:1.5}
table.data-table{width:100%;border-collapse:collapse;margin-top:16px}
table.data-table th{text-align:left;padding:10px 14px;font-size:12px;font-weight:700;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid rgba(255,255,255,.1)}
table.data-table td{padding:12px 14px;font-size:14px;color:rgba(255,255,255,.8);border-bottom:1px solid rgba(255,255,255,.06)}
.roadmap-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:28px}
.roadmap-col{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:20px}
.rm-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.7px;color:#f97316;margin-bottom:12px}
.rm-item{font-size:13px;color:rgba(255,255,255,.7);padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);line-height:1.4}
.cta-big{font-size:56px;font-weight:900;color:#fff;line-height:1.1;margin-bottom:20px}
.cta-big span{color:#f97316}
.cta-sub{font-size:18px;color:rgba(255,255,255,.6);margin-bottom:40px}
.cta-btn{display:inline-block;background:#f97316;color:#fff;font-weight:800;font-size:16px;padding:16px 40px;border-radius:12px}
</style>
</head>
<body>
<div id="deck">
  <div class="slide active" id="s1">
    <div class="chip">✦ PITCH DECK · CONFIDENTIAL</div>
    <h1 class="cover-title">${product}<br><span>${segment.charAt(0).toUpperCase()+segment.slice(1)} Card</span></h1>
    <p class="cover-sub">${brandStr} · ${market} Market Launch · ${new Date().getFullYear()}</p>
    <div class="cover-meta"><span>Product Discovery Phase</span><span>Prepared by BA Team</span><span>Version 1.0</span></div>
  </div>
  <div class="slide" id="s2">
    <div class="chip">PROBLEM</div>
    <h2 class="slide-title">The <span>${market}'s ${segment} consumers</span><br>are underserved</h2>
    <p class="slide-sub">Existing credit cards ignore their most important spend categories</p>
    <ul class="bullet-list">
      <li>The ${market} ${segment} lifestyle economy is worth ${currencySymbol}${market==='India'?'9,000 Cr':'£18Bn'} and growing at ~20% YoY</li>
      <li>No credit card gives meaningful rewards on gym, gear, events, and ${segment} travel in one product</li>
      <li>High-value ${segment} consumers spread spend across 3+ cards — none feels "theirs"</li>
      <li>Co-brand partners (gyms, gear brands, ticketing) have no exclusive financial product partner</li>
    </ul>
  </div>
  <div class="slide" id="s3">
    <div class="chip">MARKET OPPORTUNITY</div>
    <h2 class="slide-title">A <span>${currencySymbol}${market==='India'?'38,000 Cr':'£42Bn'}</span> serviceable market</h2>
    <p class="slide-sub">With clear first-mover advantage</p>
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-num">${market==='India'?'6.2M':'2.1M'}</div><div class="stat-label">Target ${segment} lifestyle cardholders in ${market}</div></div>
      <div class="stat-card"><div class="stat-num">20%</div><div class="stat-label">YoY growth in ${segment} lifestyle consumer spend</div></div>
      <div class="stat-card"><div class="stat-num">${currencySymbol}${market==='India'?'1.8L':'£8.4k'}</div><div class="stat-label">Average annual card spend per active cardholder</div></div>
    </div>
  </div>
  <div class="slide" id="s4">
    <div class="chip">SOLUTION</div>
    <h2 class="slide-title">The <span>${product}</span></h2>
    <p class="slide-sub">A credit card purpose-built for the ${segment} lifestyle</p>
    <div class="feat-grid">
      <div class="feat-box"><div class="feat-box-icon">🏃</div><div class="feat-box-title">5x Rewards</div><div class="feat-box-desc">On sports gear, gym memberships, fitness apps, event tickets</div></div>
      <div class="feat-box"><div class="feat-box-icon">⚡</div><div class="feat-box-title">&lt;10 Min Apply</div><div class="feat-box-desc">AA-powered income check + VKYC → virtual card in session</div></div>
      <div class="feat-box"><div class="feat-box-icon">🤝</div><div class="feat-box-title">Partner Ecosystem</div><div class="feat-box-desc">10+ exclusive co-brand partners at launch — gyms, gear, events, OTT</div></div>
    </div>
  </div>
  <div class="slide" id="s5">
    <div class="chip">SUCCESS METRICS</div>
    <h2 class="slide-title">How we <span>measure success</span></h2>
    <table class="data-table">
      <tr><th>Metric</th><th>Month 6</th><th>Month 18</th></tr>
      <tr><td>Cards Issued</td><td>25,000</td><td>150,000</td></tr>
      <tr><td>Activation Rate</td><td>≥ 65%</td><td>≥ 70%</td></tr>
      <tr><td>Monthly Active Rate</td><td>≥ 55%</td><td>≥ 60%</td></tr>
      <tr><td>Avg Monthly Spend / Card</td><td>${currencySymbol}${market==='India'?'14,000':'£700'}</td><td>${currencySymbol}${market==='India'?'18,000':'£900'}</td></tr>
      <tr><td>Net Promoter Score</td><td>≥ 45</td><td>≥ 55</td></tr>
    </table>
  </div>
  <div class="slide" id="s6">
    <div class="chip">ROADMAP</div>
    <h2 class="slide-title">What we're building <span>and when</span></h2>
    <div class="roadmap-row">
      <div class="roadmap-col"><div class="rm-label">Now (0–3 mo)</div><div class="rm-item">Discovery &amp; research sign-off</div><div class="rm-item">Co-brand partner LOIs</div><div class="rm-item">Card network scheme approval</div><div class="rm-item">AA + VKYC vendor selection</div></div>
      <div class="roadmap-col"><div class="rm-label">Next (3–7 mo)</div><div class="rm-item">Digital onboarding build</div><div class="rm-item">Rewards engine integration</div><div class="rm-item">Partner API integrations</div><div class="rm-item">Soft launch (10k cards)</div></div>
      <div class="roadmap-col"><div class="rm-label">Later (7–12 mo)</div><div class="rm-item">Full market launch</div><div class="rm-item">UPI credit line activation</div><div class="rm-item">Spend intelligence dashboard</div><div class="rm-item">EMI &amp; credit limit enhance</div></div>
    </div>
  </div>
  <div class="slide" id="s7">
    <div class="chip">RISKS</div>
    <h2 class="slide-title">Key risks &amp; <span>mitigations</span></h2>
    <table class="data-table">
      <tr><th>Risk</th><th>Likelihood</th><th>Impact</th><th>Mitigation</th></tr>
      <tr><td>Partner drops pre-launch</td><td>Medium</td><td>High</td><td>2 backup partners per category</td></tr>
      <tr><td>VKYC regulatory delay</td><td>Low</td><td>High</td><td>Submit regulator docs in week 2</td></tr>
      <tr><td>HDFC competitive response</td><td>High</td><td>Medium</td><td>Partner exclusivity clauses</td></tr>
      <tr><td>Low activation rate</td><td>Medium</td><td>Medium</td><td>In-app nudge engine + welcome bonus</td></tr>
    </table>
  </div>
  <div class="slide" id="s8">
    <div class="chip">ASK</div>
    <div class="cta-big">Ready to own the<br><span>${segment}</span><br>card market?</div>
    <p class="cta-sub">We need: Board approval · ${currencySymbol}${market==='India'?'12 Cr':'£2.5M'} MVP budget · Partner intro network</p>
    <div class="cta-btn">Approve Discovery Phase →</div>
  </div>
</div>
<button class="nav-btn" id="prevBtn" onclick="nav(-1)">← Prev</button>
<div class="counter" id="counter">1 / 8</div>
<button class="nav-btn" id="nextBtn" onclick="nav(1)">Next →</button>
<script>
var cur=0,slides=document.querySelectorAll('.slide'),n=slides.length;
function nav(d){slides[cur].classList.remove('active');cur=(cur+d+n)%n;slides[cur].classList.add('active');document.getElementById('counter').textContent=(cur+1)+' / '+n;}
document.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key===' ')nav(1);if(e.key==='ArrowLeft')nav(-1);});
</script>
</body>
</html>`;
  return `# Pitch Deck — ${product}

> **Domain:** Product Management | **Skill:** html-deck | **Stage:** Discovery
> *AI-generated in MOCK mode. Open the HTML below in your browser — use arrow keys or buttons to navigate slides.*

---

**Slides:** Cover · Problem · Market Size · Solution · Metrics · Roadmap · Risks · Ask

\`\`\`html
${htmlContent}
\`\`\`
`;
}

// ─────────────────────────────────────────────────────────────
// PROJECT MANAGEMENT SKILLS
// ─────────────────────────────────────────────────────────────
function mockPrioritization(ctx) {
  const { product } = ctx;
  return `# Prioritisation Framework — ${product}

> **Domain:** Product Management | **Skill:** prioritization-rice | **Stage:** Requirements
> *AI-generated in MOCK mode.*

## RICE Scoring

| Feature | Reach (mo) | Impact (1-3) | Confidence % | Effort (weeks) | **RICE Score** |
|---------|-----------|-------------|-------------|---------------|--------------|
| Digital onboarding (< 10 min) | 5,000 | 3 | 90% | 6 | **225** |
| 5x ${ctx.segment} rewards accrual | 4,800 | 3 | 85% | 4 | **306** |
| Spend category dashboard | 3,200 | 2 | 75% | 3 | **160** |
| Partner offer discovery | 2,800 | 2 | 70% | 4 | **98** |
| Points redemption catalog | 3,500 | 2 | 80% | 5 | **112** |
| Card controls (freeze/unfreeze) | 4,000 | 2 | 95% | 2 | **380** |
| UPI credit line integration | 2,000 | 2 | 60% | 8 | **30** |

## Priority Order (by RICE)
1. 🥇 Card controls — RICE 380 (P0, quick win)
2. 🥈 5x rewards accrual — RICE 306 (P0, core differentiator)
3. 🥉 Digital onboarding — RICE 225 (P0, acquisition driver)
4. Spend dashboard — RICE 160 (P1, engagement)
5. Redemption catalog — RICE 112 (P1, retention)
6. Partner offers — RICE 98 (P1, revenue)
7. UPI credit line — RICE 30 (P2, future)
`;
}

function mockRoadmap(ctx) {
  const { product } = ctx;
  return `# Product Roadmap — ${product}

> **Domain:** Product Management | **Skill:** roadmap | **Stage:** Planning
> *AI-generated in MOCK mode.*

## Now (Months 1–3) — Discovery & Build
- ✅ Discovery brief sign-off
- ✅ Co-brand partner LOIs (min 3)
- ✅ Card network scheme approval (Visa / Mastercard)
- 🔄 Digital onboarding: AA + VKYC integration
- 🔄 Rewards engine build (5x / 3x / 1x categories)

## Next (Months 4–7) — Soft Launch
- 📋 Partner API integrations (Cult.fit, Nike, BookMyShow)
- 📋 Mobile app: card dashboard + spend categories
- 📋 Points redemption catalog (50+ options)
- 📋 Soft launch: 10,000 pilot cardholders
- 📋 Card controls (freeze, limits, PIN)

## Later (Months 8–12) — Scale
- 🔮 Full market launch (mass media + digital)
- 🔮 UPI credit line activation (RBI mandate)
- 🔮 Spend intelligence & personalised offers
- 🔮 EMI conversion & credit limit enhancement
- 🔮 International card variant (v2)
`;
}

function mockProjectCharter(ctx) {
  const { product, market, brand } = ctx;
  const brandStr = brand ? `${brand} ` : '';
  return `# Project Charter — ${product}

> **Domain:** Project Management | **Skill:** project-charter | **Stage:** Ideation
> *AI-generated in MOCK mode.*

## Project Definition
**Project name:** ${product} — ${market} Launch
**Sponsor:** ${brandStr}Head of Retail Cards
**Project Manager:** [TBC]
**Target launch date:** 9 months from charter sign-off

## Objectives (SMART)
1. Issue 25,000 cards within 6 months of launch with ≥ 65% activation rate
2. Achieve ${market === 'India' ? '₹2,800 Cr' : '£280M'} card portfolio value within 36 months
3. Deliver digital onboarding with < 10-minute application-to-virtual-card flow
4. Secure ≥ 5 co-brand partner agreements before launch

## Scope
**In scope:** Digital onboarding, rewards architecture, mobile app, partner integrations, physical card issuance, credit decisioning
**Out of scope:** Branch-based applications, business card variant, international currency card (v2)

## Budget
| Phase | Budget |
|-------|--------|
| Discovery & Design | ${market === 'India' ? '₹1.5 Cr' : '£300k'} |
| Build & Integration | ${market === 'India' ? '₹8 Cr' : '£1.6M'} |
| Launch & Marketing | ${market === 'India' ? '₹5 Cr' : '£1M'} |
| **Total** | **${market === 'India' ? '₹14.5 Cr' : '£2.9M'}** |

## Key Stakeholders
| Role | Name | Responsibility |
|------|------|---------------|
| Executive Sponsor | [TBC] | Budget & strategic decisions |
| Product Owner | [TBC] | Requirements & backlog |
| Technology Lead | [TBC] | Architecture & delivery |
| Risk & Compliance | [TBC] | Regulatory sign-off |
| Marketing | [TBC] | GTM strategy |
`;
}

function mockSprintPlan(ctx) {
  const { product } = ctx;
  return `# Sprint Plan — Sprint 1 | ${product}

> **Domain:** Project Management | **Skill:** sprint-plan | **Stage:** Execution
> *AI-generated in MOCK mode.*

## Sprint Goal
*By end of Sprint 1, a prospective cardholder can check eligibility, enter personal details, and see a "pre-approved" confirmation screen — with data flowing end-to-end in a staging environment.*

## Capacity
| Team Member | Role | Available Days | Focus Factor | Capacity (pts) |
|------------|------|---------------|-------------|---------------|
| Dev A | Backend | 10 | 70% | 14 |
| Dev B | Frontend | 10 | 70% | 14 |
| Dev C | Mobile | 10 | 70% | 14 |
| QA A | Test | 10 | 80% | 16 |
| **Total** | | | | **58 pts** |

## Sprint Backlog
| Story | Points | Assignee | Status |
|-------|--------|---------|--------|
| US-01: Eligibility Check (PAN + DOB) | 5 | Dev A | To Do |
| US-02a: Application form — personal details | 3 | Dev B + Dev C | To Do |
| US-02b: Account Aggregator consent flow | 8 | Dev A | To Do |
| API: Eligibility service endpoint | 5 | Dev A | To Do |
| Unit tests: Eligibility engine | 3 | QA A | To Do |
| UI: Eligibility result screen | 3 | Dev B | To Do |
| UI: Progress stepper component | 2 | Dev C | To Do |

**Total committed: 29 pts** (conservative; buffer for discovery spikes)
`;
}

function mockStatusReport(ctx) {
  const { product } = ctx;
  return `# Status Report — Week 4 | ${product}

> **Domain:** Project Management | **Skill:** status-report | **Stage:** Execution
> *AI-generated in MOCK mode.*

## BLUF
**Overall: 🟡 AMBER** — Discovery phase on track; partner LOI timeline at risk due to procurement review. No impact to launch date if resolved by Week 6.

## RAG Summary
| Workstream | Status | Comment |
|-----------|--------|---------|
| Discovery & Research | 🟢 Green | Interviews complete; synthesis in progress |
| Co-brand Partner LOIs | 🟡 Amber | Procurement review adding 1-week delay |
| Card Network Approval | 🟢 Green | Visa submission made; 10-week SLA in progress |
| Technical Architecture | 🟢 Green | AA vendor selected; contracts being finalised |
| Regulatory | 🟢 Green | VKYC compliance memo submitted to compliance |

## Milestones
| Milestone | Planned | Forecast | Status |
|-----------|---------|---------|--------|
| Discovery sign-off | Week 4 | Week 4 | ✅ Done |
| Partner LOIs (3 min) | Week 5 | Week 6 | 🟡 At risk |
| Visa scheme approval | Week 14 | Week 14 | 🟢 On track |
| MVP build start | Week 8 | Week 8 | 🟢 On track |
| Soft launch | Week 30 | Week 30 | 🟢 On track |

## Decisions Needed
1. **Approve Cult.fit as anchor gym partner** — requires commercial director sign-off by Week 5
2. **Confirm card network** — Visa vs Mastercard selection by Week 6

## Next Week's Focus
- Synthesis workshop: customer interview findings
- Partner commercial negotiation: Cult.fit, Nike, BookMyShow
- AA vendor contract finalisation
`;
}

function mockRAIDLog(ctx) {
  const { product } = ctx;
  return `# RAID Log — ${product}

> **Domain:** Project Management | **Skill:** raid-log | **Stage:** Planning
> *AI-generated in MOCK mode.*

## Risks
| ID | Risk | Probability | Impact | Score | Owner | Mitigation |
|----|------|------------|--------|-------|-------|-----------|
| R-01 | Co-brand partner drops out pre-launch | M | H | 🔴 High | PM | Maintain 2 backup partners per category |
| R-02 | VKYC regulatory approval delayed | L | H | 🟡 Med | Compliance | Submit docs in Week 2; escalation path agreed |
| R-03 | HDFC launches competing ${ctx.segment} card | H | M | 🟡 Med | PO | Accelerate partner exclusivity clauses |
| R-04 | AA integration more complex than estimated | M | M | 🟡 Med | Tech Lead | Spike in Sprint 0; fixed-fee vendor contract |

## Assumptions
| ID | Assumption | Validation Method | By When |
|----|-----------|------------------|---------|
| A-01 | Target personas willing to pay ₹999 annual fee | A/B landing page test | Week 6 |
| A-02 | Visa scheme approval takes ≤ 10 weeks | Visa relationship manager confirmation | Week 2 |
| A-03 | AA income data sufficient for credit decisioning | Risk team analysis | Week 4 |

## Issues
| ID | Issue | Impact | Owner | Resolution | Target Date |
|----|-------|--------|-------|-----------|------------|
| I-01 | Procurement review delaying partner LOIs | 1-week delay to LOI milestone | PM | Escalated to procurement head | Week 5 |

## Dependencies
| ID | Dependency | Type | Provider | Due Date | Status |
|----|-----------|------|---------|---------|--------|
| D-01 | Visa / Mastercard scheme approval | External | Card network | Week 14 | In progress |
| D-02 | Account Aggregator API docs & sandbox | External | AA vendor | Week 6 | Confirmed |
| D-03 | VKYC provider integration | External | VKYC vendor | Week 8 | Vendor selected |
| D-04 | Credit bureau API access | External | CIBIL / Experian | Week 6 | Pending contract |
`;
}

function mockPlanOnAPage(ctx) {
  const { product, market } = ctx;
  return `# Plan on a Page — ${product}

> **Domain:** Project Management | **Skill:** plan-on-a-page | **Stage:** Planning
> *AI-generated in MOCK mode.*

## One-Sentence Summary
Launch the ${product} in ${market} within 9 months: digital onboarding, 5x ${ctx.segment} rewards, 5+ co-brand partners, 25k cards in Month 6.

## Objectives
1. 25,000 active cards by Month 6 with ≥ 65% activation
2. < 10-minute digital onboarding live at launch
3. ≥ 5 co-brand partner integrations

## Workstreams & Key Milestones
| Workstream | Month 1–2 | Month 3–5 | Month 6–7 | Month 8–9 |
|-----------|----------|----------|----------|----------|
| Product & Design | Discovery ✓ | PRD + UX | UAT | Launch |
| Technology | Vendor onboard | Build sprint | Integration test | Go-live |
| Partnerships | LOIs signed | API integration | Partner go-live | Scale |
| Risk & Compliance | VKYC docs | Regulatory review | Final approval | Monitoring |
| Marketing | Strategy | Creative | Soft launch | Mass media |

## Budget Summary
| Category | ${market === 'India' ? '₹ Cr' : '£M'} |
|---------|------|
| Technology build | ${market === 'India' ? '8.0' : '1.6'} |
| Partner integration | ${market === 'India' ? '1.5' : '0.3'} |
| Marketing (Year 1) | ${market === 'India' ? '5.0' : '1.0'} |
| **Total** | **${market === 'India' ? '14.5' : '2.9'}** |

## Top 3 Risks
1. 🔴 Partner LOI delay — mitigation: 2 backups per category
2. 🟡 VKYC regulatory approval — mitigation: early submission, escalation path
3. 🟡 HDFC competitive response — mitigation: partner exclusivity clauses

## Decision Gate
Board sign-off required at end of Month 2 to proceed to build phase.
`;
}

function defaultMock(ctx, skill) {
  return `# ${titleCase(skill.name)} — ${ctx.product}

> **Domain:** ${skill.domain} | **Skill:** ${skill.name} | **Stage:** ${skill.stage}
> *AI-generated in MOCK mode. Set ANTHROPIC_API_KEY for live Claude generation.*

## What this skill produces
${skill.description}

## Task Context
${ctx.brief || '(No task brief provided)'}

## Output
This skill (${skill.name}) will produce: **${skill.output}**

To see a fully AI-generated artifact, add your ANTHROPIC_API_KEY to the .env file in the workspace root.
`;
}

const titleCase = s => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
