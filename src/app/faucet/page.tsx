"use client";

import { useState } from "react";
import Nav from "@/components/layout/Nav";
import { motion } from "framer-motion";

const FAUCET_URL = "https://faucet.circle.com";
const EXPLORER_URL = "https://testnet.arcscan.app";

const steps = [
  {
    num: "1",
    title: "Get test USDC",
    desc: "Visit Circle's faucet to claim free testnet USDC on Arc. You'll need a wallet address.",
    link: FAUCET_URL,
    linkLabel: "Open Circle Faucet",
    color: "var(--green)",
  },
  {
    num: "2",
    title: "Set up your profile",
    desc: "Create your Receipt profile with your wallet address. Choose worker or client role.",
    link: "/profile",
    linkLabel: "Set up profile",
    color: "var(--blue)",
  },
  {
    num: "3",
    title: "Create or accept a job",
    desc: "Workers: offer a service. Clients: post a job or hire a worker from the marketplace.",
    link: "/setup",
    linkLabel: "Get started",
    color: "var(--amber)",
  },
  {
    num: "4",
    title: "Watch the AI settle your payment",
    desc: "Submit your delivery. The Receipt Agent scores it and auto-releases payment if score >= 75.",
    link: "/marketplace",
    linkLabel: "Browse marketplace",
    color: "var(--green)",
  },
];

export default function FaucetPage() {
  const [copied, setCopied] = useState(false);

  function copyAddress(addr: string) {
    navigator.clipboard?.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "100px 20px 60px" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.05em", marginBottom: 8 }}>
            Get started with test funds
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-2)", marginBottom: 32, lineHeight: 1.7 }}>
            Receipt runs on Arc Testnet with test USDC and EURC. Claim free tokens from the Circle faucet
            and start using the platform in under 2 minutes.
          </p>

          {/* Faucet CTA */}
          <div style={{
            padding: 24, borderRadius: 28,
            background: "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.030) 0%, rgba(255,255,255,.012) 100%)",
            backdropFilter: "blur(30px) saturate(180%)",
            WebkitBackdropFilter: "blur(30px) saturate(180%)",
            border: "1px solid rgba(255,255,255,.08)",
            marginBottom: 32,
            boxShadow: "0 16px 40px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "var(--green-dim)", border: "1px solid var(--green-border)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>
                💧
              </div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 700 }}>Circle Testnet Faucet</div>
                <div style={{ fontSize: 15, color: "var(--text-3)" }}>Free USDC and EURC on Arc Testnet</div>
              </div>
            </div>

            <a
              href={FAUCET_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 24px", borderRadius: "var(--r-sm)",
                textDecoration: "none", fontSize: 17,
              }}
            >
              Claim test USDC / EURC
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Network details
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 15 }}>
                {[
                  ["Network", "Arc Testnet"],
                  ["Chain ID", "5042002"],
                  ["Gas token", "USDC (18 decimals)"],
                  ["RPC", "https://rpc.testnet.arc.network"],
                  ["Explorer", "testnet.arcscan.app"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ color: "var(--text-3)" }}>{k}</span>
                    <span className="font-mono" style={{ color: "var(--text-2)", fontSize: 14 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Steps */}
          <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 16 }}>How to use Receipt</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  display: "flex", gap: 16, padding: "18px 20px",
                  background: "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.030) 0%, rgba(255,255,255,.012) 100%)",
                  backdropFilter: "blur(30px) saturate(180%)",
                  WebkitBackdropFilter: "blur(30px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,.08)",
                  boxShadow: "0 16px 40px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08)",
                  borderRadius: 28,
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: `${s.color}15`, border: `1px solid ${s.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700, color: s.color,
                }}>
                  {s.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 16, opacity: 0.72, color: "inherit", lineHeight: 1.55, marginBottom: 8 }}>{s.desc}</div>
                  <a
                    href={s.link}
                    target={s.link.startsWith("http") ? "_blank" : undefined}
                    rel={s.link.startsWith("http") ? "noreferrer" : undefined}
                    style={{ fontSize: 15, fontWeight: 600, color: s.color, textDecoration: "none" }}
                  >
                    {s.linkLabel} →
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Supported wallets */}
          <div style={{
            padding: "16px 20px", borderRadius: "var(--r-lg)",
            background: "var(--green-dim)", border: "1px solid var(--green-border)",
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--green)", marginBottom: 6 }}>
              Supported wallets
            </div>
            <div style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.6 }}>
              MetaMask, Rabby, Coinbase Wallet, Rainbow — any EVM wallet works. Add Arc Testnet
              as a custom network with chain ID <span className="font-mono">5042002</span> and
              RPC <span className="font-mono">https://rpc.testnet.arc.network</span>.
            </div>
          </div>

        </motion.div>
      </main>
    </div>
  );
}
