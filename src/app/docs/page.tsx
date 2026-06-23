"use client";

import Nav from "@/components/layout/Nav";
import { motion } from "framer-motion";

const sections = [
  {
    title: "Platform Overview",
    items: [
      { label: "Receipt is an AI-mediated freelance escrow platform. Workers offer services or clients post jobs. Payment is held in escrow (USDC or EURC on Arc) and released automatically when the AI agent approves the delivery." },
    ],
  },
  {
    title: "x402 Protocol",
    items: [
      { label: "Receipt's AI evaluation endpoint is x402-protected. Any agent can pay $0.01 USDC per evaluation via HTTP 402 Payment Required." },
      { label: "GET /api/evaluate — returns payment requirements", mono: true },
      { label: "POST /api/evaluate — with x402 payment header, runs AI evaluation", mono: true },
    ],
  },
  {
    title: "Escrow Flow",
    items: [
      { label: "1. Worker creates a service (or client posts a job) with price in USDC or EURC" },
      { label: "2. Client funds escrow — real USDC/EURC transfers from buyer wallet to escrow wallet on Arc" },
      { label: "3. Worker submits delivery — AI agent (NVIDIA NIM Llama 3.3-70b) evaluates it against the brief" },
      { label: "4. Score >= 75 — agent auto-releases payment to worker's wallet. No human approval needed." },
      { label: "5. Score < 40 — agent auto-disputes. Funds remain locked." },
    ],
  },
  {
    title: "AI Agent",
    items: [
      { label: "Model: NVIDIA NIM (meta/llama-3.3-70b-instruct)" },
      { label: "The agent scores delivery vs brief from 0-100, analyzing content quality, keyword alignment, and scope coverage." },
      { label: "APPROVE (>= 75): auto-release payment" },
      { label: "PARTIAL (40-74): human review required" },
      { label: "DISPUTE (< 40): auto-freeze funds" },
    ],
  },
  {
    title: "Currencies",
    items: [
      { label: "USDC — USD Coin by Circle (digital dollar)" },
      { label: "EURC — Euro Coin by Circle (digital euro)" },
      { label: "Both settle on Arc Testnet with sub-500ms finality" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { label: "POST /api/service — create a service or job listing", mono: true },
      { label: "GET  /api/service?slug=xxx — fetch service by slug", mono: true },
      { label: "GET  /api/service/list — list all active services/jobs", mono: true },
      { label: "POST /api/escrow — fund escrow (real on-chain deposit)", mono: true },
      { label: "GET  /api/escrow?id=xxx — get contract details", mono: true },
      { label: "POST /api/agent — submit delivery for AI evaluation", mono: true },
      { label: "PUT  /api/agent — manual approve or dispute", mono: true },
      { label: "POST /api/evaluate — x402-protected AI evaluation", mono: true },
      { label: "GET  /api/evaluate — x402 payment requirements", mono: true },
      { label: "GET  /api/wallet/balances — live wallet balances", mono: true },
      { label: "GET  /api/stats — live platform metrics", mono: true },
      { label: "POST /api/wallet — provision Circle wallet", mono: true },
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
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "100px 20px 60px" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 8 }}>
            Documentation
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 36, lineHeight: 1.7 }}>
            Everything you need to know about Receipt — AI-mediated escrow on Arc with USDC and EURC.
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
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "var(--green)" }}>
                {section.title}
              </h2>
              <div style={{
                padding: "16px 20px", borderRadius: "var(--r-lg)",
                background: "var(--card)", border: "1px solid var(--line)",
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                {section.items.map((item, i) => (
                  <div key={i} style={{
                    color: "var(--text-2)", lineHeight: 1.6,
                    fontFamily: item.mono ? '"DM Mono", monospace' : "inherit",
                    fontSize: item.mono ? 12 : 13,
                    padding: item.mono ? "4px 8px" : 0,
                    background: item.mono ? "rgba(0,0,0,0.2)" : "transparent",
                    borderRadius: item.mono ? 6 : 0,
                  }}>
                    {item.label}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* External links */}
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "var(--green)" }}>
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
                  padding: "14px 16px", borderRadius: "var(--r-lg)",
                  background: "var(--card)", border: "1px solid var(--line)",
                  textDecoration: "none", color: "inherit",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--line-2)"; e.currentTarget.style.background = "var(--card-2)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "var(--card)"; }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--green)" }}>
                  {l.label} ↗
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{l.desc}</div>
              </a>
            ))}
          </div>

        </motion.div>
      </main>
    </div>
  );
}
