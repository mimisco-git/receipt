# Receipt

**Get paid the moment your work is approved.**

Receipt is an AI-mediated freelance escrow platform built on Circle's Agent Stack, x402 protocol, and Arc. Workers create services, clients fund escrow in USDC or EURC, the Receipt Agent autonomously evaluates deliveries and releases payment on Arc in under 500ms.

Built for the **Lepton Agents Hackathon** by Canteen x Circle (June 15-29, 2026).

**Live:** [receipt-nine-kohl.vercel.app](https://receipt-nine-kohl.vercel.app)

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Framer Motion, Tailwind CSS |
| Database | PostgreSQL via Prisma (Supabase) |
| AI Agent | NVIDIA NIM (Llama 3.3-70b-instruct) |
| Wallets | Circle Programmable Wallets |
| Payments | x402 Protocol, Circle Gateway Nanopayments |
| Settlement | Arc Testnet, USDC, EURC |
| Escrow | On-chain ERC-20 transfers via viem |

---

## Circle Tool Usage

| Tool | How Receipt Uses It |
|---|---|
| **x402 Protocol** | `/api/evaluate` is an x402-protected endpoint — agents pay $0.01 USDC per AI evaluation via HTTP 402 Payment Required |
| **USDC** | Primary escrow currency. Buyer deposits → escrow wallet → freelancer on approval |
| **EURC** | Euro stablecoin support. Full escrow flow in EURC alongside USDC |
| **Circle Wallets** | `/api/wallet` provisions custodial wallets for new users via Circle API |
| **Arc Testnet** | All escrow deposits and settlements execute on-chain on Arc (chain ID: 5042002) |
| **Gateway** | Nanopayment settlement for x402-protected AI evaluation endpoint |

---

## RFB Alignment

**RFB 06 — Creator & Publisher Monetization**
Freelancers are creators. Receipt gives them instant per-piece payment without subscriptions or invoice chasing. Set a price, share a link, get paid in USDC/EURC the moment the AI agent approves the delivery.

**RFB 01 — Autonomous Paying Agents**
The Receipt Agent makes autonomous economic decisions:
- Scores delivery vs brief (0-100) using NVIDIA NIM
- **Auto-releases payment** when score >= 75 — no human click needed
- Disputes when score < 40 — freezes funds automatically
- The agent evaluation endpoint itself is x402-protected — agents pay to use it

---

## How It Works

### For Workers
1. Go to `/setup` → select "Offer a service"
2. Describe your service, set price in USDC or EURC
3. Get a shareable link: `receipt.app/hire/your-slug`
4. When a client funds escrow and you deliver, the AI agent evaluates and auto-releases payment

### For Clients
1. Browse the `/marketplace` or open a worker's hire link
2. Submit your brief, fund escrow (real USDC/EURC deposit on Arc)
3. Worker delivers → AI agent scores → payment auto-releases if score >= 75
4. Or post a job at `/setup` → "Post a job" → workers find it on the marketplace

### The AI Agent
The Receipt Agent (NVIDIA NIM / Llama 3.3-70b) operates autonomously:
1. **Evaluation**: reads brief vs delivery, scores alignment 0-100
2. **Auto-release**: score >= 75 → payment releases instantly, no human approval needed
3. **Auto-dispute**: score < 40 → funds frozen, dispute opened
4. **x402 API**: the evaluation itself is a paid x402 service ($0.01 per call)
5. **Streaming**: reasoning types character-by-character in real-time, then score bar animates

### Worker Matching Agent
When a client posts a job, the AI matching agent scans all active freelancers and returns the top 3 best-fit workers — with a per-worker reason — ranked by the AI based on the job brief.

### Rating System
After a contract settles, clients can rate the worker 1–5 stars with an optional note. Ratings aggregate per freelancer and display as star ratings on marketplace listing cards.

### AI Description Enhancer
On the `/setup` page, clicking "✦ Enhance with AI" rewrites the description to be clearer, more professional, and more compelling — using the same NVIDIA NIM → Groq → Anthropic fallback chain.

---

## x402 Integration

The AI evaluation endpoint at `/api/evaluate` implements the x402 protocol:

```
GET /api/evaluate
→ Returns payment requirements (USDC/EURC accepted)

POST /api/evaluate (without payment header)
→ 402 Payment Required

POST /api/evaluate (with x402 payment header)
→ AI evaluation result
```

Any agent can pay $0.01 USDC to evaluate a delivery against a brief — making Receipt's AI arbiter a composable, paid service in the x402 ecosystem.

---

## Project Structure

```
receipt/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing page with live stats
│   │   ├── setup/page.tsx            # Service/job creation (role-aware)
│   │   ├── hire/[slug]/page.tsx      # Client hire / worker accept flow
│   │   ├── escrow/[id]/page.tsx      # Live escrow tracking + AI evaluation + settlement
│   │   ├── marketplace/page.tsx      # Browse services and open jobs
│   │   ├── profile/page.tsx          # User profile (worker/client)
│   │   ├── dashboard/page.tsx        # Auto-routes to role dashboard
│   │   ├── worker-dashboard/         # Worker earnings + contract history
│   │   ├── client-dashboard/         # Client contract tracking
│   │   └── api/
│   │       ├── evaluate/route.ts     # x402-protected AI evaluation
│   │       ├── service/route.ts      # Service/job CRUD
│   │       ├── escrow/route.ts       # Contract creation + real USDC deposit
│   │       ├── agent/route.ts        # AI evaluation + auto-release (streaming)
│   │       ├── agent/match/route.ts  # AI worker matching for job briefs
│   │       ├── ai/enhance/route.ts   # AI description enhancer
│   │       ├── rating/route.ts       # Post-settlement star rating
│   │       ├── contracts/route.ts    # Contract queries
│   │       ├── wallet/route.ts       # Circle wallet provisioning
│   │       ├── wallet/balances/      # Live on-chain balance check
│   │       └── stats/route.ts        # Live traction metrics
│   ├── components/
│   │   ├── layout/                   # Nav (glassmorphism), Footer
│   │   └── shared/                   # PaymentOrb, HeroStats, HowItWorks, Confetti
│   ├── lib/
│   │   ├── x402.ts                   # Arc escrow: deposit, release, balance check
│   │   ├── agent.ts                  # AI evaluation (NVIDIA → Groq → Anthropic → local)
│   │   ├── circle.ts                 # Circle Wallet API
│   │   ├── db.ts                     # Prisma client
│   │   ├── profile.ts               # Client-side profile persistence
│   │   └── utils.ts                  # Formatting, fees, slugs
│   └── styles/globals.css            # Design tokens + animations
├── prisma/schema.prisma              # DB schema (Freelancer, Service, Contract, Transaction)
└── supabase/migrations/              # SQL migration
```

---

## API Reference

### x402 Endpoints

**GET /api/evaluate** — Payment requirements for AI evaluation
**POST /api/evaluate** — x402-protected AI evaluation ($0.01 USDC/EURC per call)

### Core Endpoints

**POST /api/service** — Create a service or job listing
**GET /api/service?slug=xxx** — Fetch service by slug
**GET /api/service/list** — List all active services and jobs
**POST /api/escrow** — Fund escrow (real USDC/EURC deposit on Arc)
**GET /api/escrow?id=xxx** — Get contract details
**POST /api/agent** — Submit delivery for AI evaluation + auto-release (streaming)
**PUT /api/agent** — Manual approve or dispute
**POST /api/agent/match** — AI worker matching for job briefs → top 3 ranked workers
**POST /api/ai/enhance** — AI description enhancer for service/job listings
**POST /api/rating** — Submit 1-5 star rating after contract settlement
**GET /api/wallet/balances** — Live buyer/seller wallet balances
**GET /api/stats** — Live traction metrics (services, contracts, volume)
**POST /api/wallet** — Provision Circle custodial wallet

---

## On-Chain Verification

All transactions are verifiable on the Arc testnet explorer:
**[testnet.arcscan.app](https://testnet.arcscan.app)**

The escrow page shows:
- Live wallet balances (buyer + escrow)
- Real transaction hashes linked to ArcScan
- Actual settlement time in milliseconds

---

## Hackathon Notes

**Passphrase:** SITEx2224

**Event:** Lepton Agents Hackathon (June 15-29, 2026) by Canteen x Circle

**Circle stack used:**
- x402 Protocol (pay-per-evaluation AI endpoint)
- USDC + EURC (dual stablecoin escrow)
- Circle Programmable Wallets (user wallet provisioning)
- Arc Testnet (settlement layer, sub-500ms finality)
- Gateway Nanopayments (x402 settlement)

**Agentic behavior:**
- AI agent scores deliveries autonomously (NVIDIA NIM → Groq → Anthropic fallback chain)
- Auto-releases payment when score >= 75
- Auto-disputes when score < 40
- Evaluation streams in real-time — reasoning types character-by-character, score bar animates
- Worker matching agent ranks top 3 freelancers per job brief with AI reasoning
- AI description enhancer rewrites service/job descriptions on demand
- Rating system aggregates per-freelancer star ratings from settled contracts
- Evaluation endpoint is x402-paid — other agents can use it as a composable service
