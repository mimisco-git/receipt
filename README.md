# Receipt

**Get paid the moment your work is approved.**

Receipt is an AI-mediated freelance escrow platform built on Circle's Agent Stack and Arc. Freelancers create a service link, clients deposit USDC into escrow, the Receipt Agent evaluates the delivery against the brief, and payment settles on Arc in under 500ms.

Built for the **Lepton Agents Hackathon** by Canteen x Circle.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Framer Motion |
| Styling | Tailwind CSS, CSS custom properties |
| Database | PostgreSQL via Prisma (Supabase recommended) |
| Wallets | Circle Agent Stack (custodial wallets) |
| Payments | Circle Gateway, x402 protocol |
| Settlement | Arc Testnet, USDC |
| AI Agent | Claude (claude-sonnet-4-6) via Anthropic API |
| Fonts | Inter, JetBrains Mono |

---

## Quick Start (Demo Mode)

Receipt works in demo mode with no external services. You can run the full UI locally without any API keys.

```bash
# 1. Clone and install
git clone https://github.com/yourname/receipt
cd receipt
npm install

# 2. Copy env file
cp .env.example .env.local

# 3. Run in demo mode (no API keys needed)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

In demo mode:
- All payments are simulated
- The AI agent uses a mock evaluation (or real Claude if ANTHROPIC_API_KEY is set)
- Wallet provisioning returns fake addresses
- No database is required

---

## Full Setup (Production)

### 1. Database (Supabase)

Create a project at [supabase.com](https://supabase.com). Copy the connection string to `DATABASE_URL` in `.env.local`.

```bash
npm run db:generate
npm run db:push
```

### 2. Circle (Agent Stack)

1. Create an account at [console.circle.com](https://console.circle.com)
2. Create a new app and get your API key
3. Copy the API key and Entity Secret to `.env.local`
4. Set `NEXT_PUBLIC_CIRCLE_APP_ID`

### 3. Anthropic (AI Agent)

1. Get an API key at [console.anthropic.com](https://console.anthropic.com)
2. Copy to `ANTHROPIC_API_KEY` in `.env.local`

### 4. Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Circle
CIRCLE_API_KEY="..."
CIRCLE_ENTITY_SECRET="..."
NEXT_PUBLIC_CIRCLE_APP_ID="..."

# Arc
ARC_RPC_URL="https://rpc.arc.testnet.circle.com"
SELLER_WALLET_ADDRESS="0x..."
SELLER_PRIVATE_KEY="0x..."

# Anthropic
ANTHROPIC_API_KEY="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_PLATFORM_FEE_PERCENT="10"
```

### 5. Deploy to Vercel

```bash
npm run build
# Then push to GitHub and connect to Vercel
```

---

## Project Structure

```
receipt/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── setup/page.tsx        # Freelancer onboarding (3 steps)
│   │   ├── hire/[slug]/page.tsx  # Client brief + escrow funding
│   │   ├── escrow/[id]/page.tsx  # Live escrow tracking + approval
│   │   ├── dashboard/page.tsx    # Freelancer earnings dashboard
│   │   └── api/
│   │       ├── service/route.ts  # Service CRUD
│   │       ├── escrow/route.ts   # Contract creation
│   │       ├── agent/route.ts    # AI evaluation + payment release
│   │       └── wallet/route.ts   # Circle wallet provisioning
│   ├── components/
│   │   ├── layout/               # Nav, Footer
│   │   └── shared/               # PaymentOrb, HeroStats, HowItWorks, PaymentOrbDemo
│   ├── lib/
│   │   ├── utils.ts              # formatUsdc, slugify, platformFee
│   │   ├── db.ts                 # Prisma client
│   │   ├── circle.ts             # Circle API wrapper
│   │   └── agent.ts              # Claude evaluation logic
│   └── types/index.ts            # TypeScript types
├── prisma/schema.prisma          # Database schema
├── .env.example                  # Environment variable template
└── README.md
```

---

## How It Works

### For Freelancers

1. Go to `/setup` and describe your service with a USDC price
2. Get a shareable link: `receipt.so/hire/your-slug`
3. Share it with clients on Twitter, WhatsApp, email, anywhere
4. When a client approves your delivery, USDC hits your Circle wallet in under 500ms

### For Clients

1. Click the freelancer's link at `/hire/[slug]`
2. Read the service description and pricing
3. Submit your brief and deposit USDC into escrow
4. When you receive the delivery, click Approve
5. The Receipt Agent validates the delivery against your brief
6. Payment releases automatically

### The AI Agent

The Receipt Agent (powered by Claude) does three things:

1. **Evaluation**: reads the client brief and freelancer delivery, then scores the match from 0-100
2. **Recommendation**: APPROVE (score 75+), PARTIAL (score 40-74), or DISPUTE (score below 40)
3. **Arbitration**: if disputed, re-evaluates with both parties' evidence and proposes a fair split

The agent verdict is logged onchain alongside the transaction.

---

## Design System

The design uses a custom dark theme with these core tokens:

| Token | Value | Usage |
|---|---|---|
| `--space` | `#0A0E1A` | Page background |
| `--surface` | `#111827` | Card backgrounds |
| `--card` | `#1C2333` | Input backgrounds |
| `--mint` | `#00F5A0` | Primary accent (payments, CTAs) |
| `--amber` | `#F59E0B` | Locked escrow state |
| Inter | sans | UI text |
| JetBrains Mono | mono | All financial figures |

The signature element is the **Payment Orb**: a breathing, glowing circle that represents the escrow amount. It pulses amber while funds are locked, then crystallizes to mint with a particle burst when payment is released.

---

## API Reference

### POST /api/service
Create a new freelancer service.
```json
{ "name": "Amara", "title": "SEO blog post", "description": "...", "priceUsdc": 8.00 }
```

### GET /api/service?slug=amara-seo
Fetch a service by slug.

### POST /api/escrow
Create a new contract (client submits brief).
```json
{ "serviceId": "...", "clientName": "James", "brief": "Write about..." }
```

### POST /api/agent
Submit a delivery for AI evaluation.
```json
{ "contractId": "...", "deliveryNote": "https://docs.google.com/..." }
```

### PUT /api/agent
Approve or dispute a contract.
```json
{ "contractId": "...", "action": "APPROVE" }
```

### POST /api/wallet
Provision a Circle wallet for a user.
```json
{ "userId": "...", "role": "freelancer" }
```

---

## Hackathon Notes

This project was built for the Lepton Agents Hackathon (June 15-29, 2026), organized by Canteen x Circle x Arc.

**RFBs addressed:**
- RFB 6 (Creator and Publisher Monetization): freelancers are creators. This gives them instant payment with no platform lock-in.
- RFB 1 (Autonomous Paying Agents): the Receipt Agent makes autonomous economic decisions about payment release.

**Circle stack used:**
- Circle Agent Wallets (custodial wallet provisioning)
- Circle Gateway (USDC escrow and settlement)
- x402 protocol (payment-required flow on delivery endpoint)
- Arc Testnet (settlement chain, sub-500ms finality)
- USDC (settlement currency)

**Passphrase:** SITEx2224
