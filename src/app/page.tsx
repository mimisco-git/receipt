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

      {/* Hero ambient orb */}
      <div style={{
        position: "fixed", top: "5vh", left: "50%", transform: "translateX(-50%)",
        width: "min(900px, 100vw)", height: 600, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 60% 60% at 50% 30%, rgba(0,229,195,0.055) 0%, rgba(0,229,195,0.018) 45%, transparent 70%)",
        filter: "blur(40px)",
      }} />

      {/* HERO */}
      <section style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center",
        padding: "120px 20px 60px",
        position: "relative", zIndex: 1,
      }}>
        {/* Eyebrow pill with Lepton logo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5 }}
          className="pill pill-green"
          style={{ marginBottom: 28, fontSize: 11, gap: 8 }}
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
            fontSize: "clamp(32px, 7vw, 80px)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            maxWidth: 800,
            marginBottom: 20,
            color: "var(--text-1)",
          }}
        >
          Get paid the moment<br />
          your work is{" "}
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
            fontSize: "clamp(14px, 2vw, 17px)",
            color: "var(--text-2)",
            lineHeight: 1.7,
            maxWidth: 460,
            marginBottom: 36,
            padding: "0 4px",
          }}
        >
          AI-mediated freelance escrow on Arc. Client deposits USDC or EURC.
          You deliver. The agent verifies scope. Payment clears in under 500ms.
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
            style={{
              padding: "13px 24px", borderRadius: 12,
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            Create your service link
            <ArrowRight />
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
          gap: 10,
        }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              style={{
                padding: "28px",
                background: "linear-gradient(180deg, rgba(255,255,255,0.038) 0%, rgba(255,255,255,0.016) 100%)",
                backdropFilter: "blur(28px) saturate(160%)",
                WebkitBackdropFilter: "blur(28px) saturate(160%)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "var(--r-xl)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.10)",
                transition: "border-color 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.3s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.13)";
                (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(180deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.028) 100%)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(180deg, rgba(255,255,255,0.038) 0%, rgba(255,255,255,0.016) 100%)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(16px) saturate(150%)",
                WebkitBackdropFilter: "blur(16px) saturate(150%)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 18,
              }}>
                {f.icon}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: "var(--text-1)", letterSpacing: "-0.01em" }}>
                {f.title}
              </div>
              <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>
                {f.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* LIVE DEMO */}
      <section id="demo" style={{
        padding: "40px 20px 80px",
        display: "flex", flexDirection: "column", alignItems: "center",
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
          color: "var(--text-3)", textTransform: "uppercase", marginBottom: 12,
        }}>
          Live demo
        </div>
        <h2 style={{
          fontSize: "clamp(20px,3vw,34px)", fontWeight: 700,
          letterSpacing: "-0.03em", textAlign: "center", marginBottom: 10,
          color: "var(--text-1)",
        }}>
          Watch a payment clear
        </h2>
        <p style={{
          fontSize: 14, color: "var(--text-2)",
          textAlign: "center", maxWidth: 360, marginBottom: 40, lineHeight: 1.65,
          padding: "0 4px",
        }}>
          Real interface. Real orb. The ripple is exactly what your client sees when payment settles.
        </p>
        <PaymentOrbDemo />
      </section>

      {/* CTA SECTION */}
      <section style={{
        padding: "20px 20px 80px",
        display: "flex", flexDirection: "column", alignItems: "center",
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          maxWidth: 520, width: "100%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.018) 100%)",
          backdropFilter: "blur(40px) saturate(170%)",
          WebkitBackdropFilter: "blur(40px) saturate(170%)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "var(--r-2xl)",
          padding: "clamp(28px, 5vw, 44px)",
          textAlign: "center",
          boxShadow: "0 24px 60px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.12)",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "var(--green-dim)",
            border: "1px solid var(--green-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 18px",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="var(--green)">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <h3 style={{
            fontSize: "clamp(18px,3vw,22px)", fontWeight: 700, letterSpacing: "-0.02em",
            marginBottom: 10, color: "var(--text-1)",
          }}>
            Ready to get paid?
          </h3>
          <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.65, marginBottom: 24 }}>
            Set up your service in 60 seconds. Share the link. Get paid in USDC or EURC the moment your client approves.
          </p>
          <button
            className="btn-primary"
            onClick={() => router.push("/setup")}
            style={{
              padding: "13px 28px", borderRadius: 12, fontSize: 14,
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
          >
            Create your service link
            <ArrowRight />
          </button>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 12 }}>
            Free to use. No subscription. 10% platform fee per settled contract.
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
          fontSize: 10.5, color: "var(--text-3)",
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
            "EURC",
            "Next.js · Supabase",
          ].map(t => (
            <span key={t} className="font-mono" style={{
              padding: "4px 12px", borderRadius: 999, fontSize: 11,
              background: "var(--card)",
              border: "1px solid var(--line)",
              color: "var(--text-2)",
            }}>{t}</span>
          ))}
        </div>
        {/* Lepton attribution */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 12, color: "var(--text-3)", marginTop: 8,
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
