"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Nav from "@/components/layout/Nav";
import HeroStats from "@/components/shared/HeroStats";
import HowItWorks from "@/components/shared/HowItWorks";
import PaymentOrbDemo from "@/components/shared/PaymentOrbDemo";
import LeptonLogo from "@/components/shared/LeptonLogo";

function ZapSVG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" stroke="var(--green)">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function AgentSVG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" stroke="var(--blue)">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
      <path d="M16 3.5a4 4 0 0 1 0 9" />
      <path d="M19 20v-2a6 6 0 0 0-3-5.2" />
    </svg>
  );
}
function LockSVG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" stroke="var(--green)">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

const features = [
  { icon: <ZapSVG />,   title: "Sub-500ms settlement",  desc: "Arc finalizes via submitBatch() faster than your bank sends a confirmation SMS. No waiting." },
  { icon: <AgentSVG />, title: "Agent-verified scope",   desc: "The Receipt Agent reads brief vs delivery, scores alignment, and releases funds autonomously." },
  { icon: <LockSVG />,  title: "Zero invoice chasing",   desc: "USDC or EURC locks in Circle escrow before work begins. The client cannot withdraw. Payment is guaranteed." },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />

      {/* Hero ambient — two-orb light system */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "min(1100px, 100vw)", height: 720, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 65% 55% at 50% 20%, rgba(0,229,195,0.072) 0%, rgba(0,229,195,0.022) 48%, transparent 70%)",
        filter: "blur(48px)",
      }} />
      <div style={{
        position: "fixed", top: "10vh", left: "20%",
        width: 400, height: 400, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,229,195,0.018) 0%, transparent 70%)",
        filter: "blur(60px)",
      }} />

      {/* HERO */}
      <section style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center",
        padding: "120px 20px 80px",
        position: "relative", zIndex: 1,
      }}>
        {/* Eyebrow pill with Lepton logo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5 }}
          className="pill pill-green"
          style={{ marginBottom: 28, fontSize: 14, gap: 8 }}
        >
          <span className="pill-dot" style={{ animation: "pulse-dot 2s ease-in-out infinite" }} />
          Circle · Arc · USDC · EURC
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <LeptonLogo size={14} />
            Lepton Hackathon 2026
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          style={{
            fontFamily: '"Geist", "Inter", sans-serif',
            fontSize: "clamp(62px, 10vw, 128px)",
            fontWeight: 750,
            letterSpacing: "-0.03em",
            lineHeight: 1.04,
            maxWidth: 1100,
            marginBottom: 36,
            color: "#FFFFFF",
          }}
        >
          Get paid the moment your work is{" "}
          <span style={{ color: "var(--accent)" }}>
            approved.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.55 }}
          style={{
            fontSize: "clamp(19px, 2.1vw, 23px)",
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.80,
            maxWidth: 720,
            marginBottom: 44,
            padding: "0 4px",
          }}
        >
          AI-mediated freelance escrow on Arc. Client deposits{" "}
          <strong style={{ fontWeight: 700, color: "#FFFFFF" }}>USDC</strong> or{" "}
          <strong style={{ fontWeight: 700, color: "#FFFFFF" }}>EURC</strong>.
          You deliver. The agent{" "}
          <strong style={{ fontWeight: 700, color: "#FFFFFF" }}>verifies scope</strong>.
          Payment clears in{" "}
          <strong style={{ fontWeight: 700, color: "#FFFFFF" }}>under 500ms</strong>.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 60 }}
        >
          <button
            className="btn-primary"
            onClick={() => router.push("/setup")}
            style={{ padding: "13px 24px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8 }}
          >
            Create your service link
            <ArrowRight />
          </button>
          <button
            className="btn-ghost"
            onClick={() => router.push("/marketplace")}
            style={{
              padding: "13px 24px", borderRadius: 12,
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            Browse marketplace
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <HeroStats />
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <HowItWorks />

      {/* FEATURE CARDS */}
      <section style={{ padding: "0 20px 80px", position: "relative", zIndex: 1 }}>
        <div style={{
          maxWidth: 860, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
        }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.09, duration: 0.55 }}
              style={{
                padding: "36px",
                background: "linear-gradient(135deg, rgba(255,255,255,.045) 0%, transparent 38%), linear-gradient(180deg, rgba(255,255,255,.032) 0%, rgba(255,255,255,.010) 100%)",
                backdropFilter: "blur(32px) saturate(200%)",
                WebkitBackdropFilter: "blur(32px) saturate(200%)",
                border: "1px solid rgba(255,255,255,.085)",
                borderRadius: 28,
                boxShadow: "0 20px 48px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.10)",
                position: "relative", overflow: "hidden",
                transition: "transform 500ms cubic-bezier(0.34,1.4,0.64,1), border-color 280ms ease, background 280ms ease, box-shadow 400ms ease",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "rgba(255,255,255,.15)";
                el.style.background = "linear-gradient(135deg, rgba(255,255,255,.07) 0%, transparent 38%), linear-gradient(180deg, rgba(255,255,255,.055) 0%, rgba(255,255,255,.022) 100%)";
                el.style.boxShadow = "0 28px 64px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.14)";
                el.style.transform = "translateY(-6px)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "rgba(255,255,255,.085)";
                el.style.background = "linear-gradient(135deg, rgba(255,255,255,.045) 0%, transparent 38%), linear-gradient(180deg, rgba(255,255,255,.032) 0%, rgba(255,255,255,.010) 100%)";
                el.style.boxShadow = "0 20px 48px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.10)";
                el.style.transform = "translateY(0)";
              }}
            >
              {/* Top-left light catch on card surface */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "linear-gradient(135deg, rgba(255,255,255,.06) 0%, transparent 40%)",
                borderRadius: "inherit",
              }} />
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "rgba(255,255,255,.030)",
                backdropFilter: "blur(20px) saturate(160%)",
                WebkitBackdropFilter: "blur(20px) saturate(160%)",
                border: "1px solid rgba(255,255,255,.08)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.12), inset 0 -1px 0 rgba(0,0,0,.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20,
                position: "relative",
              }}>
                {f.icon}
              </div>
              <div style={{ fontSize: 19, fontWeight: 660, marginBottom: 10, color: "#FFFFFF", letterSpacing: "-0.025em", position: "relative" }}>
                {f.title}
              </div>
              <div style={{ fontSize: 21, color: "rgba(255,255,255,0.82)", lineHeight: 1.80, position: "relative" }}>
                {f.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* LIVE DEMO — MacBook window */}
      <section id="demo" style={{
        padding: "80px 20px 100px",
        display: "flex", flexDirection: "column", alignItems: "center",
        position: "relative", zIndex: 1,
        background: "radial-gradient(ellipse 70% 40% at 50% 50%, rgba(0,0,0,.18) 0%, transparent 100%)",
      }}>
        <div style={{
          fontSize: 14, fontWeight: 600, letterSpacing: "0.12em",
          color: "rgba(255,255,255,.35)", textTransform: "uppercase", marginBottom: 14,
        }}>
          Interactive demo
        </div>
        <h2 style={{
          fontFamily: '"Geist", "Inter", sans-serif',
          fontSize: "clamp(28px,4.5vw,50px)", fontWeight: 730,
          letterSpacing: "-0.04em", lineHeight: 1.06,
          textAlign: "center", marginBottom: 18,
          color: "#FFFFFF",
        }}>
          Watch a payment clear
        </h2>
        <p style={{
          fontSize: "clamp(17px,1.9vw,20px)", color: "rgba(255,255,255,.85)",
          textAlign: "center", maxWidth: 440, marginBottom: 52, lineHeight: 1.80,
        }}>
          <strong style={{ fontWeight: 700, color: "#FFFFFF" }}>Real interface. Real orb.</strong> The ripple is exactly what your client sees when{" "}
          <strong style={{ fontWeight: 700, color: "#FFFFFF" }}>payment settles</strong>.
        </p>

        {/* Cyan ambient glow behind window */}
        <div style={{
          position: "relative", width: "100%", maxWidth: 640,
          display: "flex", justifyContent: "center",
        }}>
          <div style={{
            position: "absolute", top: "30%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 480, height: 300,
            background: "radial-gradient(ellipse at center, rgba(0,229,195,.09) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none", zIndex: 0,
          }} />

          {/* MacBook-style window frame */}
          <div style={{
            width: "100%", maxWidth: 640, position: "relative", zIndex: 1,
            background: "linear-gradient(135deg, rgba(255,255,255,.05) 0%, transparent 38%), linear-gradient(180deg, rgba(255,255,255,.032) 0%, rgba(255,255,255,.010) 100%)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(255,255,255,.11)",
            borderRadius: 22,
            boxShadow: "0 60px 140px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.04) inset, inset 0 1px 0 rgba(255,255,255,.14)",
            overflow: "hidden",
          }}>
            {/* Window chrome */}
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "14px 18px",
              background: "rgba(255,255,255,.028)",
              borderBottom: "1px solid rgba(255,255,255,.07)",
            }}>
              {(["#FF5F57","#FEBC2E","#28C840"] as const).map((c, i) => (
                <div key={i} style={{
                  width: 12, height: 12, borderRadius: "50%",
                  background: c, opacity: 0.88,
                  boxShadow: `0 0 7px ${c}77`,
                }} />
              ))}
              <div style={{
                flex: 1, textAlign: "center",
                fontSize: 14, fontFamily: '"DM Mono", monospace',
                color: "rgba(255,255,255,.32)", letterSpacing: "0.02em",
              }}>
                receipt.app · escrow · Arc Testnet
              </div>
            </div>

            {/* Window content */}
            <div style={{ padding: "36px 28px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <PaymentOrbDemo />
            </div>

            {/* Top-left light reflection */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "linear-gradient(135deg, rgba(255,255,255,.05) 0%, transparent 32%)",
              borderRadius: "inherit",
            }} />
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{
        padding: "20px 20px 100px",
        display: "flex", flexDirection: "column", alignItems: "center",
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          maxWidth: 560, width: "100%",
          background: "linear-gradient(135deg, rgba(255,255,255,.055) 0%, transparent 38%), linear-gradient(180deg, rgba(255,255,255,.035) 0%, rgba(255,255,255,.012) 100%)",
          backdropFilter: "blur(40px) saturate(200%)",
          WebkitBackdropFilter: "blur(40px) saturate(200%)",
          border: "1px solid rgba(255,255,255,.11)",
          borderRadius: 32,
          padding: "clamp(36px, 6vw, 56px)",
          textAlign: "center",
          boxShadow: "0 40px 96px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.15)",
          position: "relative", overflow: "hidden",
        }}>
          {/* Top-left light on CTA card */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "linear-gradient(135deg, rgba(255,255,255,.07) 0%, transparent 35%)",
            borderRadius: "inherit",
          }} />
          <div style={{
            width: 52, height: 52, borderRadius: 15,
            background: "rgba(0,229,195,.10)",
            border: "1px solid rgba(0,229,195,.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 0 24px rgba(0,229,195,.12)",
            position: "relative",
          }}>
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" stroke="var(--green)">
              <circle cx="12" cy="12" r="9" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <h3 style={{
            fontFamily: '"Geist", "Inter", sans-serif',
            fontSize: "clamp(22px,3.4vw,32px)", fontWeight: 730, letterSpacing: "-0.04em",
            lineHeight: 1.1, marginBottom: 16, color: "#FFFFFF",
            position: "relative",
          }}>
            Ready to get paid?
          </h3>
          <p style={{
            fontSize: "clamp(16px,1.8vw,19px)", color: "rgba(255,255,255,.85)",
            lineHeight: 1.80, marginBottom: 28, position: "relative",
          }}>
            Set up your service in 60 seconds. Share the link. Get paid in USDC or EURC the moment your client approves.
          </p>
          <button
            className="btn-primary"
            onClick={() => router.push("/setup")}
            style={{ padding: "14px 32px", borderRadius: 13, display: "inline-flex", alignItems: "center", gap: 9 }}
          >
            Create your service link
            <ArrowRight />
          </button>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,.30)", marginTop: 14, position: "relative" }}>
            Free to use · No subscription · 10% fee per settled contract
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section style={{
        padding: "20px 20px 60px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          width: "100%", maxWidth: 820,
          height: 1, background: "linear-gradient(90deg, transparent, var(--line), transparent)",
          marginBottom: 20,
        }} />
        <div style={{
          fontSize: 13, color: "var(--text-3)",
          fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          Built on
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", padding: "0 8px" }}>
          {[
            "Circle Programmable Wallets",
            "Circle Gateway",
            "x402 Protocol",
            "EIP-3009",
            "Arc L1 Testnet",
            "USDC · EURC",
            "NVIDIA NIM · Llama 3.3-70b",
            "Next.js · Supabase",
          ].map(t => (
            <span key={t} className="font-mono" style={{
              padding: "4px 12px", borderRadius: 999, fontSize: 14,
              background: "rgba(255,255,255,.025)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,.08)",
              color: "var(--text-2)",
            }}>{t}</span>
          ))}
        </div>
        {/* Lepton attribution */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 15, color: "rgba(255,255,255,.65)", marginTop: 8,
        }}>
          Built for
          <LeptonLogo size={16} />
          <a
            href="https://lepton.thecanteenapp.com"
            target="_blank" rel="noreferrer"
            style={{ color: "var(--text-2)", textDecoration: "none", fontWeight: 500 }}
          >
            Lepton by Canteen
          </a>
          · June 2026
        </div>
      </section>

    </div>
  );
}
