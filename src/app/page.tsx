"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { motion } from "framer-motion";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import HeroStats from "@/components/shared/HeroStats";
import HowItWorks from "@/components/shared/HowItWorks";
import PaymentOrbDemo from "@/components/shared/PaymentOrbDemo";

export default function HomePage() {
  const router = useRouter();
  const btnRef = useRef<HTMLButtonElement>(null);

  function onBtnMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX-rect.left)/rect.width)*100}%`);
    el.style.setProperty("--my", `${((e.clientY-rect.top)/rect.height)*100}%`);
    const x = (e.clientX - rect.left - rect.width/2) * 0.18;
    const y = (e.clientY - rect.top - rect.height/2) * 0.18;
    el.style.transform = `translate(${x}px,${y}px)`;
  }
  function onBtnLeave() { if (btnRef.current) btnRef.current.style.transform = ""; }

  return (
    <div style={{ background: "var(--layer-0)", minHeight: "100vh" }}>
      <Nav />

      {/* ── AMBIENT LIGHT FIELD (static, behind everything) ─────── */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: 1200, height: 600, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse at 50% 0%, rgba(0,229,160,0.04) 0%, rgba(74,144,232,0.02) 45%, transparent 70%)",
        filter: "blur(60px)",
      }} />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center",
        padding: "140px 24px 80px",
        position: "relative", zIndex: 1,
      }}>
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.55, ease: [0.25,0.46,0.45,0.94] }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "5px 14px", borderRadius: 999, marginBottom: 30,
            background: "var(--ledger-dim)",
            boxShadow: "inset 0 0 0 0.5px var(--ledger-edge)",
            fontSize: 10.5, fontWeight: 600, letterSpacing: "0.07em",
            color: "var(--ledger)", textTransform: "uppercase",
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--ledger)", animation: "pulse-dot 2s ease-in-out infinite" }} />
          Circle · Arc · USDC · Lepton Hackathon 2026
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.6, ease: [0.25,0.46,0.45,0.94] }}
          style={{
            fontSize: "clamp(44px, 6.5vw, 84px)",
            fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.03,
            maxWidth: 820, marginBottom: 22,
          }}
        >
          Get paid the moment<br />
          your work is{" "}
          <span style={{
            background: "linear-gradient(135deg, #00E5A0 0%, #00C0FF 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>approved.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.55 }}
          style={{
            fontSize: "clamp(15px,1.8vw,18px)", color: "var(--ash)",
            lineHeight: 1.72, maxWidth: 480, marginBottom: 44,
          }}
        >
          Receipt is AI-mediated freelance escrow. Client deposits USDC.
          You deliver. The agent verifies scope alignment. Payment clears on Arc in under 500ms.
          No invoices. No waiting. No chargebacks.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34, duration: 0.5 }}
          style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 80 }}
        >
          <button
            ref={btnRef}
            onMouseMove={onBtnMove}
            onMouseLeave={onBtnLeave}
            onClick={() => router.push("/setup")}
            className="btn-primary"
            style={{ padding: "14px 28px", borderRadius: 14, fontSize: 14, transition: "transform 0.15s ease, box-shadow 0.2s ease" }}
          >
            <span style={{ position: "relative", zIndex: 1 }}>Create your service link →</span>
          </button>

          <button
            className="btn-ghost"
            onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
            style={{ padding: "14px 28px", borderRadius: 14, fontSize: 14 }}
          >
            See live demo
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          <HeroStats />
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section style={{ padding: "0 24px 80px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 820, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {[
            { icon: "⚡", title: "Sub-500ms settlement", desc: "Arc finalizes via submitBatch() faster than your bank sends a confirmation SMS." },
            { icon: "🤖", title: "Agent-verified scope",  desc: "The Receipt Agent reads brief vs delivery, scores alignment, and releases funds autonomously." },
            { icon: "🔒", title: "Zero invoice chasing",  desc: "USDC locks in Circle escrow before work begins. Client cannot withdraw. Payment is guaranteed." },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.09, duration: 0.45 }}
              style={{
                padding: "22px",
                background: "linear-gradient(180deg, rgba(255,255,255,0.022), rgba(255,255,255,0.008))",
                borderRadius: "var(--r-lg)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.055), inset 0 -1px 0 rgba(0,0,0,0.2)",
                transition: "box-shadow 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.09), inset 0 -1px 0 rgba(0,0,0,0.2), 0 0 0 0.5px rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.055), inset 0 -1px 0 rgba(0,0,0,0.2)"; }}
            >
              <div style={{ fontSize: 20, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 7, letterSpacing: "-0.01em" }}>{f.title}</div>
              <div style={{ fontSize: 12, color: "var(--ash)", lineHeight: 1.7 }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── LIVE DEMO ────────────────────────────────────────────── */}
      <section id="demo" style={{
        padding: "40px 24px 80px",
        display: "flex", flexDirection: "column", alignItems: "center",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.1em", color: "var(--mist)", textTransform: "uppercase", marginBottom: 12 }}>
          Live demo
        </div>
        <h2 style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 700, letterSpacing: "-0.035em", textAlign: "center", marginBottom: 8 }}>
          Watch a payment clear
        </h2>
        <p style={{ fontSize: 13.5, color: "var(--ash)", textAlign: "center", maxWidth: 360, marginBottom: 36, lineHeight: 1.7 }}>
          Real interface. Real orb. The ripple is exactly what your client sees when USDC clears.
        </p>
        <PaymentOrbDemo />
      </section>

      {/* ── TECHNICAL STACK ──────────────────────────────────────── */}
      <section style={{
        padding: "40px 24px 80px",
        borderTop: "none",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 18,
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          width: "100%", maxWidth: 820,
          height: 0.5, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
          marginBottom: 32,
        }} />
        <div style={{ fontSize: 10.5, color: "var(--mist)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Settlement architecture
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {[
            "Circle Programmable Wallets",
            "Circle Gateway batching",
            "x402 HTTP Payment Protocol",
            "EIP-3009 TransferWithAuthorization",
            "submitBatch() on Arc L1",
            "USDC native settlement",
            "NVIDIA NIM · Llama 3.3-70b Agent",
          ].map(t => (
            <span key={t} className="font-mono" style={{
              padding: "4px 11px", borderRadius: 999, fontSize: 11,
              background: "rgba(255,255,255,0.035)",
              boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.07)",
              color: "var(--ash)",
            }}>{t}</span>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
