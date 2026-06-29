---
name: go-to-market
domain: product-management
description: Build a go-to-market plan covering target segment, value proposition, messaging, channel mix, launch phases, and success metrics. Adapts for soft launch, GA, or major product launch.
when_to_use: The user needs a GTM plan, launch strategy, release communication plan, channel plan, or wants to define how to reach target customers at launch.
argument-hint: "[product, feature, or initiative being launched]"
retrieval_intent: launch plan, target customers, messaging, channels, launch phases, GTM
output: Go-to-Market Plan (Markdown)
stage: deliver
---

# Go-to-Market Plan

A GTM plan ensures the right customers hear about the right product through the right channels at the right time â€” and that success is measurable from day one. The best launches are not events; they are campaigns with phases, feedback loops, and the ability to amplify or pull back.

## When to Use
- Launching a new product or major feature
- Moving from beta to general availability
- Repositioning an existing product for a new segment
- Planning a coordinated launch across marketing, sales, and product
- Defining how success will be measured for a launch

## Launch Types

### Type A: Soft Launch / Beta (Limited rollout)
- Goal: validate with real users before full exposure
- Audience: existing users, waitlist, design partners
- Rollout: feature flag or manual invite
- Success: qualitative feedback + early quantitative signals

### Type B: General Availability (Full launch)
- Goal: maximise awareness and adoption in target segment
- Audience: all eligible users + new acquisition
- Rollout: full release with coordinated marketing push
- Success: activation rate, day-7 retention, revenue impact

### Type C: Major Product Launch (External event or press)
- Goal: create market moment, drive brand awareness + pipeline
- Audience: market at large, press, analysts, investors
- Rollout: coordinated with PR, analyst briefings, events
- Success: share of voice, inbound pipeline, press coverage

## Framework: GTM Plan (6 Steps)

### Step 1: Target Segment & Persona
Define who this launch is for:
- **Primary segment**: One specific, reachable group (not "everyone")
- **Persona**: Job title / role, company size/type, key pain points
- **Segment size**: How many people in this segment can you reach?
- **Where they are**: What channels, communities, and media do they use?

### Step 2: Value Proposition
Craft the core message using the before/after/bridge format:
- **Before**: What is painful or broken for this persona today?
- **After**: What does their world look like with your product?
- **Bridge**: Your product is how they get there

One-sentence value prop: "[Product] helps [persona] [outcome] by [mechanism], unlike [alternative]."

### Step 3: Key Messages (3-5 max)
Distil the value prop into 3-5 supporting messages:
- Message 1: Primary differentiation
- Message 2: Secondary proof point
- Message 3: Objection handler (addresses the most common "but...")
- Proof points: quotes, data, case studies that back each message

### Step 4: Channel Plan

| Channel | Audience | Message | Owner | Budget | Timing |
|---------|---------|---------|-------|--------|--------|
| In-product (banner/modal) | Existing users | Upgrade/adoption | PM | $0 | Day 0 |
| Email (existing list) | Subscribers | Feature value | Marketing | $0 | Day 0-3 |
| Blog post | SEO + social | Educational | Marketing | $0 | Day 0 |
| Social media (LinkedIn/X) | Professional network | Launch announcement | Marketing | Low | Day 0-7 |
| PR / press outreach | Analysts, press | Market moment | Comms | Medium | Day -7 to 0 |
| Paid acquisition | New users | Trial/signup | Marketing | High | Day 7+ |
| Sales enablement | Prospects | Win rate | Sales | $0 | Day -14 |
| Community / influencers | Niche audience | Authentic advocacy | PM/Marketing | Low | Day 0-30 |

### Step 5: Launch Phases & Timeline

**T-4 weeks (Prepare)**
- Finalise messaging and assets
- Brief internal teams (sales, support, CS)
- Enable feature flags; begin staged rollout to internal users
- Prepare support documentation and FAQs

**T-1 week (Warm-up)**
- Brief press and analysts under embargo
- Activate waitlist or early access cohort
- Pre-schedule social and email content
- QA all launch assets

**T=0 (Launch day)**
- Release to all eligible users
- Publish blog post and social content
- Send launch email to list
- Monitor dashboards in real-time

**T+1 to T+4 weeks (Amplify)**
- Share early results and social proof
- Retarget engaged visitors
- Run paid acquisition if metrics support it
- Collect feedback and iterate

### Step 6: Success Metrics

| Metric | Type | Target | Measurement window |
|--------|------|--------|-------------------|
| Activation rate | Primary | X% | 7 days post-launch |
| Day-30 retention | Primary | X% | 30 days |
| Revenue impact | Business | $X | 90 days |
| Support ticket volume | Guardrail | <X | Launch week |
| NPS / CSAT | Quality | >X | 30 days |

Define launch criteria for each phase: the minimum conditions before proceeding to the next rollout stage.

## Quality Checklist
- [ ] Primary segment is specific and reachable (not "SMBs" â€” be more precise)
- [ ] Value proposition is tested with real users before launch
- [ ] Channel plan has owners and timelines, not just categories
- [ ] Internal teams (support, sales, CS) briefed before launch day
- [ ] Go/no-go criteria defined for each rollout phase
- [ ] Rollback plan documented: how to revert and under what conditions

## Common Pitfalls
- Building for everyone â€” the broadest launch message is also the weakest
- Channel plan without owners â€” "we will post on LinkedIn" means no one will
- No internal readiness â€” support volume spikes if the team is not prepared
- Measuring vanity metrics on launch day â€” impressions and signups without activation tell you nothing
- One-day campaign â€” launches that sustain momentum for 4 weeks outperform one-day events
