# Sahayak v3 — Cursor Prompts for 5 Decision Features

> **Positioning:** "Know the real cost of a GeM order before you commit"
> **Core flow:** FIND → QUALIFY → SIMULATE → STRESS TEST → DECIDE → EXECUTE → PROTECT → LEARN

---

## PROMPT 1: True Cost Simulator + Bid/No-Bid Engine

```
Read CURSOR_START_PROMPT.md for full context. Existing features are built.

IMPORTANT: First fix these CRITICAL numbers in the codebase:

1. src/lib/rules/msme-rights.ts — Fix RBI rate:
   OLD: RBI_NOTIFIED_RATE = 0.0305 (3.05%)
   NEW: RBI_BANK_RATE = 0.055 (5.50%)
   OLD: PENALTY_RATE_ANNUAL = 0.0915 (9.15%)
   NEW: MSMED_PENALTY_RATE = 0.165 (16.50% = 3 × 5.50%)

2. src/lib/rules/msme-rights.ts — Fix MSME classification:
   OLD: Micro ≤ 2.5 Cr, Small ≤ 25 Cr
   NEW: Micro: investment ≤ 1 Cr AND turnover ≤ 5 Cr
   NEW: Small: investment ≤ 10 Cr AND turnover ≤ 50 Cr

3. src/app/page.tsx and src/app/impact/page.tsx — Fix seller numbers:
   OLD: "62L sellers"
   NEW: "22L+ sellers registered"
   OLD: "11L active"
   NEW: "11L+ MSE sellers active"
   OLD: "51L stuck"
   NEW: "Millions of registered sellers struggle to complete their first order"

4. Update all references to interest rate from ~9.15% to 16.50%

NOW BUILD the True Cost Simulator + Bid/No-Bid Engine:

1. src/lib/rules/true-cost.ts — Cost simulation engine:
   - calculateTrueCost(bid, sellerProfile) → {
       productCost: number,
       freightCost: number,
       packagingCost: number,
       installationCost: number,
       gstExposure: number,
       workingCapitalCost: number,
       reverseAuctionRisk: number,
       complianceCost: number,
       totalCost: number,
       estimatedRevenue: number,
       realMargin: number,
       realMarginPercent: number,
       riskLevel: "safe" | "caution" | "danger" | "loss",
       recommendation: "strong_bid" | "bid" | "caution" | "walk_away",
       recommendationReason: string,
       breakdown: { item, amount, note }[]
     }
   - calculateWorkingCapital(orderValue, paymentDays) → {
       lockedCapital: number,
       costOfCapital: number, // at 12% p.a.
       opportunityCost: number
     }
   - calculateFreightImpact(sellerPin, buyerPin, weight) → {
       cost: number,
       percentOfOrder: number,
       impact: "low" | "medium" | "high" | "critical"
     }
   - stressTest(bid, scenarios) → {
       scenario: string,
       margin: number,
       isViable: boolean
     }[]
     // Scenarios: "payment delayed 30 days", "reverse auction drops 10%", "freight increases 20%"

2. src/app/simulate/page.tsx — True Cost Simulator page:
   - Hero: "Know the REAL cost before you commit"
   - Input: Select a bid from opportunities (or enter custom)
   - Output sections:
     a) "Base Analysis"
        - Product cost
        - Freight (auto-calculated from pins)
        - Packaging (3% of product cost)
        - Installation (if applicable)
        - GST exposure (18% of invoice)
        - Working capital cost (at 12% p.a. for expected payment days)
     b) "True Margin"
        - Revenue: ₹X
        - Total cost: ₹Y
        - Real margin: ₹Z (not the gross margin you thought)
        - "Your bid price of ₹10L has a real margin of only ₹32,000 after all costs"
     c) "Stress Test"
        - Scenario 1: "Payment delayed 60 days" → margin becomes ₹X
        - Scenario 2: "Reverse auction drops 10%" → margin becomes ₹Y
        - Scenario 3: "Freight increases 20%" → margin becomes ₹Z
        - "Can you survive all three simultaneously?"
     d) "Bid/No-Bid Decision"
        - Big green card: "BID — Strong opportunity" (if margin > 15%)
        - Yellow card: "BID WITH CAUTION — Thin margin" (if 5-15%)
        - Red card: "WALK AWAY — Negative risk-adjusted margin" (if <5%)
        - "Why: [specific reason]"
        - "If you bid, set your floor price at ₹X (minimum profitable bid)"

3. src/components/BidNoBidCard.tsx — Decision card component:
   - Shows recommendation with color coding
   - Shows key numbers: real margin, risk level, stress test results
   - Expandable "Why this recommendation" section
   - "What would change this recommendation" tips

STOP after simulate page works.
```

---

## PROMPT 2: Corrigendum Intelligence

```
Read CURSOR_START_PROMPT.md for full context.

BUILD Corrigendum Intelligence — alerts sellers when bid specifications change:

1. src/data/corrigenda.json — Mock corrigendum data:
   [
     {
       id: "CORR-2026-001",
       bidId: "GEM-2026-CHA-042",
       corrigendumNumber: 2,
       publishedDate: "2026-08-20",
       changes: [
         { field: "deliveryDays", oldValue: 30, newValue: 20, impact: "deadline" },
         { field: "estimatedValue", oldValue: 2100000, newValue: 2500000, impact: "value" },
         { field: "requiredCertifications", oldValue: ["BIS"], newValue: ["BIS", "ISO 9001"], impact: "eligibility" }
       ],
       readyBefore: 87,
       readyAfter: 62,
       impactSummary: "Delivery deadline shortened by 10 days. ISO 9001 now required."
     },
     {
       id: "CORR-2026-002",
       bidId: "GEM-2026-DESK-089",
       corrigendumNumber: 1,
       publishedDate: "2026-08-22",
       changes: [
         { field: "quantity", oldValue: 100, newValue: 200, impact: "capacity" },
         { field: "goldenParameters.material", oldValue: "Mild Steel", newValue: "Stainless Steel", impact: "specification" }
       ],
       readyBefore: 92,
       readyAfter: 45,
       impactSummary: "Material changed to Stainless Steel. Quantity doubled."
     }
   ]

2. src/lib/rules/corrigendum.ts — Corrigendum detection engine:
   - detectChanges(originalBid, newBid) → {
       changes: { field, oldValue, newValue, impact }[],
       readinessBefore: number,
       readinessAfter: number,
       readinessDelta: number,
       severity: "minor" | "moderate" | "major" | "critical",
       newBlockers: string[],
       removedBlockers: string[]
     }
   - getCorrigendumImpact(changes) → {
       impactSummary: string,
       whatChanged: string[],
       whatItMeans: string,
       actionRequired: string
     }

3. src/app/corrigenda/page.tsx — Corrigendum Intelligence page:
   - Hero: "Bid changed? Your readiness may no longer be valid."
   - Section 1: "Active Corrigenda"
     - List of bids with recent corrigenda
     - Each shows:
       - Bid title + corrigendum number
       - "Published: Aug 20, 2026"
       - Change summary: "Delivery: 30→20 days, ISO now required"
       - Readiness impact: "Was 87% → Now 62%" (with delta arrow)
       - Severity badge: "MAJOR" / "MODERATE" / "MINOR"
   - Section 2: "What changed in detail"
     - Before/After comparison table
     - "Delivery deadline: 30 days → 20 days ❌ (you need 25 days minimum)"
     - "Certifications: BIS → BIS + ISO 9001 ❌ (you don't have ISO)"
   - Section 3: "Your options"
     - "Option 1: Fix the new blockers" → "Get ISO 9001 (takes 4-6 weeks, ₹25,000)"
     - "Option 2: Walk away" → "Save your time and capacity for other bids"
     - "Option 3: Bid anyway" → "Risk: 62% readiness, likely technical rejection"
   - Section 4: "How to prevent corrigendum shock"
     - "Check bid daily for corrigenda"
     - "Don't invest heavily until corrigendum window closes"
     - "Most corrigenda published within first 7 days of bid"
   - Auto-link: On bid detail page, show "Check for corrigenda" badge

STOP after corrigenda page works.
```

---

## PROMPT 3: PRC → CRAC Deadlock Escalation

```
Read CURSOR_START_PROMPT.md for full context. Payment tracker exists at /payments.

BUILD PRC → CRAC Deadlock Escalation — the "invisible victim" feature:

1. src/data/prc-crac-deadlock.json — Mock deadlock scenarios:
   [
     {
       orderId: "ORD-2026-004",
       bidTitle: "Steel Almirahs for District Court",
       department: "Justice Department, UP",
       orderValue: 850000,
       deliveryDate: "2026-07-10",
       deliveryConfirmed: true,
       prcDate: null,
       prcStatus: "not_generated",
       cracDate: null,
       cracStatus: "blocked_by_prc",
       daysSinceDelivery: 47,
       daysSincePRCExpected: 37,
       stuckReason: "Consignee has not generated PRC (Parts Receipt Certificate). Without PRC, CRAC cannot be generated. Without CRAC, payment cannot start.",
       sellerCanDo: [
         "Email consignee requesting PRC generation",
         "Visit consignee office with delivery proof",
         "Raise GeM incident citing non-generation of PRC",
         "File CPGRAMS grievance if no response in 15 days"
       ],
       escalationLevel: 2,
       nextEscalation: "Raise GeM Incident"
     }
   ]

2. src/lib/rules/prc-crac-deadlock.ts — Deadlock detection engine:
   - detectDeadlock(order) → {
       isDeadlocked: boolean,
       deadlockType: "prc_pending" | "crac_pending" | "invoice_pending" | "payment_pending",
       daysStuck: number,
       whoIsStuck: "consignee" | "buyer_finance" | "pfms" | "unknown",
       canSellerAct: boolean,
       sellerActions: string[],
       escalationPath: { level, action, daysToWait, portal }[],
       msmmedEligible: boolean,
       interestAccrued: number
     }
   - getDeadlockEscalation(order) → {
       currentLevel: number,
       levels: {
         level: number,
         action: string,
         portal: string,
         template: string,
         daysToWait: number
       }[]
     }
   - calculateDeadlockInterest(order) → {
       principal: number,
       daysOverdue: number,
       interestRate: number, // 16.50% p.a.
       interestAccrued: number,
       totalOwed: number
     }

3. src/app/deadlock/page.tsx — Deadlock Escalation page:
   - Hero: "Payment stuck? You might be in a process deadlock."
   - Section 1: "What is a deadlock?"
     - Visual diagram:
       Seller delivers → PRC pending → CRAC blocked → Payment frozen
     - "You did everything right. But the next action belongs to someone else."
     - "This is the #1 reason sellers quit GeM."
   - Section 2: "Your stuck orders"
     - For each stuck order:
       - Order details + value
       - "Days since delivery: 47"
       - "Stuck at: PRC not generated by consignee"
       - Visual timeline: Delivery ✓ → PRC ✗ → CRAC ⏸ → Payment ⏸
       - "Who's blocking: [Consignee name]"
       - "What you can do:"
   - Section 3: "Escalation playbook"
     - Level 1: "Email consignee" (template provided)
     - Level 2: "Visit consignee office with delivery proof"
     - Level 3: "Raise GeM incident" (link to gem.gov.in)
     - Level 4: "File CPGRAMS grievance" (link to pgportal.gov.in)
     - Level 5: "File MSME Samadhaan" (link to samadhaan.msme.gov.in)
     - Each level has: template letter, portal link, expected response time
   - Section 4: "You're owed interest"
     - "Under MSMED Act Section 16, buyer owes 16.50% p.a. interest"
     - "₹8,50,000 × 47 days = ₹17,836 interest accrued"
     - "This is YOUR money. Claim it."
     - "Calculate interest" button → shows breakdown
   - Section 5: "Prevent future deadlocks"
     - "Always get stamped POD with receiver name"
     - "Follow up on PRC within 7 days of delivery"
     - "Keep written records of all communications"
   - Integration: Show deadlock alert on /payments page for stuck orders

STOP after deadlock page works.
```

---

## PROMPT 4: Learning from Wins/Losses

```
Read CURSOR_START_PROMPT.md for full context.

BUILD Learning Engine — turns every bid into intelligence:

1. src/data/bid-history.json — Mock bid history for Ramesh:
   [
     { bidId: "B001", result: "won", margin: 12, reason: "competitive pricing", category: "office_chairs", distance: 200 },
     { bidId: "B002", result: "lost", margin: null, reason: "price_8_percent_above_l1", category: "office_chairs", distance: 450 },
     { bidId: "B003", result: "lost", margin: null, reason: "technical_rejection_bis_missing", category: "desks", distance: 300 },
     { bidId: "B004", result: "won", margin: 18, reason: "mse_preference", category: "chairs", distance: 150 },
     { bidId: "B005", result: "lost", margin: null, reason: "freight_uncompetitive", category: "tables", distance: 1800 },
     { bidId: "B006", result: "lost", margin: null, reason: "deadline_too_tight", category: "storage", distance: 500 },
     { bidId: "B007", result: "won", margin: 8, reason: "best_technical_score", category: "ergonomic_chairs", distance: 100 },
     { bidId: "B008", result: "lost", margin: null, reason: "reverse_auction_panic", category: "office_chairs", distance: 600 },
     { bidId: "B009", result: "lost", margin: null, reason: "missing_oem_authorization", category: "computers", distance: 400 },
     { bidId: "B010", result: "won", margin: 15, reason: "local_delivery_advantage", category: "office_chairs", distance: 80 }
   ]

2. src/lib/rules/learning.ts — Learning engine:
   - analyzeWinPatterns(history) → {
       wins: { count, avgMargin, commonFactors[] },
       losses: { count, commonReasons[] },
       insights: string[],
       recommendations: string[]
     }
   - analyzeLossPatterns(history) → {
       byReason: { reason, count, percentage }[],
       byCategory: { category, winRate, avgMargin }[],
       byDistance: { range, winRate }[],
       byPrice: { factor, impact }[]
     }
   - getPersonalizedAdvice(history, newBid) → {
       relevanceScore: number,
       whyThisBidMightWin: string[],
       whyThisBidMightLose: string[],
       pastSimilarBids: { bidId, result, margin }[],
       recommendation: string
     }
   - calculateWinRate(history) → number
   - getImprovementAreas(history) → { area, currentPerformance, potentialImpact }[]

3. src/app/learn/page.tsx — Learning Dashboard:
   - Hero: "Every bid teaches you something. Here's what yours said."
   - Section 1: "Your win/loss record"
     - Win rate: X% (Y wins out of Z bids)
     - Visual: pie chart (div-based) showing wins vs losses
     - Average margin on won bids: X%
   - Section 2: "Why you lose"
     - Table: | Reason | Frequency | What to do |
     - "Price too high" → 4 bids (40%) → "Use floor price calculator"
     - "Freight uncompetitive" → 2 bids (20%) → "Focus on nearby bids"
     - "Missing certification" → 1 bid (10%) → "Get BIS before bidding"
     - "Reverse auction panic" → 1 bid (10%) → "Set hard floor price"
     - "Missing OEM authorization" → 1 bid (10%) → "Get MAF before bidding"
   - Section 3: "Your sweet spots"
     - "You win 60% of bids within 200km"
     - "You win 80% of MSE-reserved tenders"
     - "Your avg margin is 14% on office chairs"
     - "Focus on: office chairs, local delivery, MSE-reserved"
   - Section 4: "Your distance trap"
     - "Win rate within 200km: 60%"
     - "Win rate 200-500km: 30%"
     - "Win rate >500km: 10%"
     - "Your problem: freight makes distant bids uncompetitive"
   - Section 5: "Personalized advice for your next bid"
     - Select a bid → get advice:
       - "This bid is 350km away. Your win rate at this distance: 30%"
       - "Similar past bids: 2 won, 3 lost"
       - "To win: price within 5% of L1, ensure all certs ready"
       - "Risk: reverse auction could drop margin below 5%"
   - Section 6: "Improvement plan"
     - "Do these 3 things to improve your win rate from 30% to 50%:"
     - 1. "Focus on bids within 200km"
     - 2. "Get BIS certification for all product categories"
     - 3. "Set floor prices before reverse auctions"

STOP after learn page works.
```

---

## PROMPT 5: Update Landing Page + Reposition

```
Read CURSOR_START_PROMPT.md for full context. All features are built.

REPOSITION Sahayak with new messaging:

1. Update src/app/page.tsx — New landing page:
   - Hero: "Know the real cost of a GeM order before you commit"
   - Subtitle: "Don't just find tenders. Decide which ones are worth pursuing."
   - Stats strip (CORRECTED):
     - "₹18.4L Cr" GMV (cite: GeM FY26)
     - "22L+" Sellers
     - "68%" MSE Orders
     - "16.5%" MSMED penalty rate
   - NEW feature cards:
     - "Simulate" — "See your real margin after freight, GST, working capital"
     - "Decide" — "Bid or walk away — we'll tell you"
     - "Protect" — "CRAC tracking, payment alerts, interest claims"
     - "Learn" — "Every bid teaches you something"
   - NEW "How it works" (8 steps):
     1. Find matching tenders
     2. Check eligibility
     3. Simulate true cost
     4. Stress test scenarios
     5. Decide: Bid or Don't Bid
     6. Execute with confidence
     7. Track CRAC and payment
     8. Learn from every outcome
   - Updated CTA: "Simulate your first bid" → /simulate

2. Update src/components/MobileNav.tsx — New navigation:
   - Home | Simulate | Opportunities | Payments | Profile
   - (Catalogue and other features accessible from profile)

3. Add disclaimer to ALL pages:
   "Sahayak is a prototype for hackathon purposes. Not affiliated with GeM.
   All data, scores, and recommendations are simulated. Verify all numbers
   against official GeM/MSME sources before acting."

4. Create src/app/api/ai/explain-simulation/route.ts — AI explanation for simulation:
   - Input: true cost simulation results
   - Output: Plain-language explanation of why this bid is/isn't worth pursuing
   - Fallback: template string if no API key

STOP. Repositioning complete.
```

---

## BUILD ORDER

| Session | Feature | Time | Prompt |
|---------|---------|------|--------|
| 1 | Fix numbers + True Cost Simulator + Bid/No-Bid | 40 min | Prompt 1 |
| 2 | Corrigendum Intelligence | 25 min | Prompt 2 |
| 3 | PRC → CRAC Deadlock Escalation | 30 min | Prompt 3 |
| 4 | Learning from Wins/Losses | 25 min | Prompt 4 |
| 5 | Reposition landing page + Nav | 15 min | Prompt 5 |

---

## FINAL PAIN POINT COUNT

| # | Pain Point | Feature | Status |
|---|-----------|---------|--------|
| 1 | Udyam before GeM | /udyam | ✅ |
| 2 | CRAC not generated | /payments + alerts | ✅ |
| 3 | Payment delayed 30-90+ days | /msme-rights + interest | ✅ |
| 4 | Escalation maze | Escalation coach | ✅ |
| 5 | DSC expired | /bid-prep | ✅ |
| 6 | Reverse auction confusion | /reverse-auction | ✅ |
| 7 | Catalogue rejection cycles | /catalogue-check | ✅ |
| 8 | POD documentation | /delivery | ✅ |
| 9 | Rating death spiral | /rating-recovery | ✅ |
| 10 | Post-first-order confusion | /playbook | ✅ |
| 11 | Transport cost unknown | /transport | ✅ |
| 12 | Inclusive Freight Trap | /freight-decoupler | ✅ |
| 13 | Regional Vendor Deserts | /vendor-deserts | ✅ |
| 14 | GST payment surprise | GST planner | ✅ |
| 15 | **True cost invisible** | /simulate | 🔥 NEW |
| 16 | **Bid/No-Bid decision** | /simulate | 🔥 NEW |
| 17 | **Corrigendum shock** | /corrigenda | 🔥 NEW |
| 18 | **PRC → CRAC deadlock** | /deadlock | 🔥 NEW |
| 19 | **No learning from history** | /learn | 🔥 NEW |

**Total: 19 pain points solved**
