"use client";

import Nav from "@/components/layout/Nav";
import { motion } from "framer-motion";

const sections = [
  {
    title: "Platform Overview",
    items: [
      { label: "Receipt is an AI-mediated freelance escrow platform. Workers offer services or clients post jobs. Payment is held in escrow (USDC or EURC on Arc) and released automatically when the AI agent approves the delivery." },
      { label: "Key features: streaming AI evaluation with real-time reasoning, AI worker matching for jobs, a 1–5 star rating system, AI description enhancer, contract timeline, and confetti on settlement." },
    ],
  },
  {
    title: "x402 Protocol",
    items: [
      { label: "Receipt's AI evaluation endpoint is x402-protected. Any agent can pay $0.01 USDC per evaluation via HTTP 402 Payment Required." },
      { label: "GET  /api/evaluate  →  returns x402 payment requirements", mono: true },
      { label: "POST /api/evaluate  →  x402 payment header required; runs AI evaluation", mono: true },
    ],
  },
  {
    title: "Escrow Flow",
    items: [
      { label: "1. Worker creates a service (or client posts a job) with a price in USDC or EURC." },
      { label: "2. Client funds escrow: real USDC/EURC transfers from the buyer wallet to the escrow wallet on Arc." },
      { label: "3. Worker submits delivery. The AI agent (NVIDIA NIM Llama 3.3-70b) evaluates it against the original brief." },
      { label: "4. Score ≥ 75: agent auto-releases payment to the worker's wallet. No human approval needed." },
      { label: "5. Score < 40: agent auto-disputes. Funds remain locked." },
    ],
  },
  {
    title: "AI Agent",
    items: [
      { label: "Model: NVIDIA NIM (meta/llama-3.3-70b-instruct) with Groq and Anthropic fallback." },
      { label: "The agent scores delivery against the brief from 0 to 100, analyzing content quality, keyword alignment, and scope coverage." },
      { label: "APPROVE (≥ 75): auto-release payment" },
      { label: "PARTIAL (40–74): human review required" },
      { label: "DISPUTE (< 40): auto-freeze funds" },
      { label: "Evaluation streams in real-time. Reasoning appears character-by-character as the agent thinks, then the score bar animates to the final value." },
    ],
  },
  {
    title: "Worker Matching Agent",
    items: [
      { label: "When a client posts a job, the AI matching agent scans all active freelancers and ranks the top 3 best fits." },
      { label: "Rankings consider the job brief, worker titles, and service descriptions, not random ordering." },
      { label: "Each match includes a one-line reason explaining why that worker fits the brief." },
      { label: "POST /api/agent/match  { brief, serviceId } → { matches: [{ name, title, slug, reason, jobsDone }] }", mono: true },
    ],
  },
  {
    title: "Rating System",
    items: [
      { label: "After a contract settles, clients can rate the worker 1–5 stars with an optional note." },
      { label: "Ratings are averaged per freelancer and displayed on their marketplace listing card." },
      { label: "Only settled contracts with a non-null rating count toward the average. No fake or pending ratings." },
      { label: "POST /api/rating  { contractId, rating, note } → updates contract record", mono: true },
    ],
  },
  {
    title: "AI Description Enhancer",
    items: [
      { label: "When creating a service or job listing, click '✦ Enhance with AI' to rewrite your description." },
      { label: "The AI rewrites the description to be clearer, more professional, and more likely to attract quality clients or workers." },
      { label: "POST /api/ai/enhance  { text, context } → { enhanced, model }", mono: true },
    ],
  },
  {
    title: "Currencies",
    items: [
      { label: "USDC: USD Coin by Circle (digital dollar)" },
      { label: "EURC: Euro Coin by Circle (digital euro)" },
      { label: "Both settle on Arc Testnet with sub-500ms finality." },
    ],
  },
  {
    title: "API Reference",
    items: [
      { label: "POST /api/service          →  create a service or job listing", mono: true },
      { label: "GET  /api/service?slug=xxx →  fetch service by slug", mono: true },
      { label: "GET  /api/service/list     →  list all active services and jobs", mono: true },
      { label: "POST /api/escrow           →  fund escrow (real on-chain deposit)", mono: true },
      { label: "GET  /api/escrow?id=xxx    →  get contract details", mono: true },
      { label: "POST /api/agent            →  submit delivery for AI evaluation (streaming)", mono: true },
      { label: "PUT  /api/agent            →  manual approve or dispute", mono: true },
      { label: "POST /api/evaluate         →  x402-protected AI evaluation", mono: true },
      { label: "GET  /api/evaluate         →  x402 payment requirements", mono: true },
      { label: "POST /api/agent/match      →  AI worker matching for job briefs", mono: true },
      { label: "POST /api/ai/enhance       →  AI description enhancer", mono: true },
      { label: "POST /api/rating           →  submit rating after settlement", mono: true },
      { label: "GET  /api/wallet/balances  →  live wallet balances", mono: true },
      { label: "GET  /api/stats            →  live platform metrics", mono: true },
      { label: "POST /api/wallet           →  provision Circle wallet", mono: true },
    ],
  },
];

const links = [
  { label: "Circle Faucet", href: "https://faucet.circle.com", desc: "Get test USDC / EURC" },
  { label: "Arc Explorer", href: "https://testnet.arcscan.app", desc: "Verify transactions on-chain" },
  { label: "Arc Docs", href: "https://docs.arc.io", desc: "Arc chain documentation" },
  { label: "Circle Agent Stack", href: "https://developers.circle.com/agent-stack", desc: "Circle developer tools" },
  { label: "x402 Protocol", href: "https://developers.circle.com/gateway/nanopayments", desc: "Nanopayments standard" },
  { label: "GitHub", href: "https://github.com/mimisco-git/receipt", desc: "Receipt source code" },
  { label: "Lepton Hackathon", href: "https://lepton.thecanteenapp.com", desc: "Hackathon details" },
];

export default function DocsPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <main style={{ maxWidth: 780, margin: "0 auto", padding: "100px 20px 60px" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 750, letterSpacing: "-0.04em", marginBottom: 10 }}>
            Documentation
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-2)", marginBottom: 44, lineHeight: 1.75 }}>
            Everything you need to know about Receipt: AI-mediated escrow on Arc with USDC and EURC.
          </p>

          {/* Sections */}
          {sections.map((section, si) => (
            <motion.div
              key={si}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.05 }}
              style={{ marginBottom: 28 }}
            >
              <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 12, color: "var(--green)" }}>
                {section.title}
              </h2>
              <div style={{
                padding: "20px 24px", borderRadius: 28,
                background: "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.030) 0%, rgba(255,255,255,.012) 100%)",
                backdropFilter: "blur(30px) saturate(180%)",
                WebkitBackdropFilter: "blur(30px) saturate(180%)",
                border: "1px solid rgba(255,255,255,.08)",
                boxShadow: "0 16px 40px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08)",
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                {section.items.map((item, i) => (
                  <div key={i} style={{
                    opacity: item.mono ? 0.80 : 0.85,
                    color: "inherit",
                    lineHeight: item.mono ? 1.5 : 1.70,
                    fontFamily: item.mono ? '"DM Mono", monospace' : "inherit",
                    fontSize: item.mono ? 13 : 15,
                    padding: item.mono ? "6px 10px" : 0,
                    background: item.mono ? "rgba(0,0,0,0.25)" : "transparent",
                    borderRadius: item.mono ? 7 : 0,
                    overflowX: "auto",
                  }}>
                    {item.label}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* External links */}
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 12, color: "var(--green)" }}>
            Resources
          </h2>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 10, marginBottom: 32,
          }}>
            {links.map(l => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "14px 16px", borderRadius: 28,
                  background: "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.030) 0%, rgba(255,255,255,.012) 100%)",
                  backdropFilter: "blur(30px) saturate(180%)",
                  WebkitBackdropFilter: "blur(30px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,.08)",
                  boxShadow: "0 16px 40px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08)",
                  textDecoration: "none", color: "inherit",
                  transition: "transform 500ms cubic-bezier(0.34,1.4,0.64,1), border-color 280ms ease, background 280ms ease, box-shadow 400ms ease",
                  display: "block",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,.13)";
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,.06) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.050) 0%, rgba(255,255,255,.025) 100%)";
                  e.currentTarget.style.boxShadow = "0 24px 56px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.12)";
                  e.currentTarget.style.transform = "translateY(-5px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,.08)";
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.030) 0%, rgba(255,255,255,.012) 100%)";
                  e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: "var(--green)" }}>
                  {l.label} ↗
                </div>
                <div style={{ fontSize: 14, color: "var(--text-3)" }}>{l.desc}</div>
              </a>
            ))}
          </div>

        </motion.div>
      </main>
    </div>
  );
}
