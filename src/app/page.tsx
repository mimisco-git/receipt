"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import HowItWorks from "@/components/shared/HowItWorks";
import PaymentOrbDemo from "@/components/shared/PaymentOrbDemo";
import LeptonLogo from "@/components/shared/LeptonLogo";

function ArrowRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function HomePage() {
  const router = useRouter();

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />

      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: 600, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse at 50% 0%, rgba(0,209,132,0.03) 0%, transparent 60%)",
        filter: "blur(80px)",
      }} />

      {/* ─── HERO ─── */}
      <section style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center",
        padding: "160px 24px 100px",
        position: "relative", zIndex: 1,
      }}>
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5, duration: 1 }}
          style={{
            marginBottom: 28,
            fontSize: 11, fontWeight: 500,
            color: "var(--text-3)", letterSpacing: "0.06em",
          }}
        >
          Circle · Arc · USDC · Lepton 2026
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 1, ease }}
          style={{
            fontSize: "clamp(36px, 7vw, 76px)",
            fontWeight: 700,
            letterSpacing: "-0.045em",
            lineHeight: 1,
            maxWidth: 680,
            marginBottom: 28,
            color: "var(--text-1)",
            wordBreak: "keep-all",
          }}
        >
          Get paid the moment your work is{" "}
          <span style={{
            background: "linear-gradient(135deg, #00D184 0%, #38BDF8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            approved.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          style={{
            fontSize: "clamp(15px, 1.8vw, 17px)",
            color: "var(--text-3)",
            lineHeight: 1.5,
            maxWidth: 360,
            marginBottom: 48,
          }}
        >
          AI-verified freelance escrow. USDC settles in under 500ms.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8, ease }}
          style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}
        >
          <button
            className="btn-primary"
            onClick={() => router.push("/setup")}
            style={{
              padding: "16px 32px", borderRadius: 14,
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 15, fontWeight: 600,
            }}
          >
            Create your service link
            <ArrowRight />
          </button>
          <button
            className="btn-ghost"
            onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
            style={{ padding: "16px 28px", borderRadius: 14, fontSize: 15 }}
          >
            Watch the demo
          </button>
        </motion.div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <HowItWorks />

      {/* ─── LIVE SETTLEMENT ─── */}
      <section id="demo" style={{
        padding: "80px 24px 180px",
        display: "flex", flexDirection: "column", alignItems: "center",
        position: "relative", zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <h2 style={{
            fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 700,
            letterSpacing: "-0.04em", lineHeight: 1,
            color: "var(--text-1)", marginBottom: 16,
          }}>
            Watch a payment clear.
          </h2>
          <p style={{ fontSize: "clamp(14px, 1.6vw, 16px)", color: "var(--text-3)", maxWidth: 340, margin: "0 auto" }}>
            The settlement completes in under 500ms.
          </p>
        </motion.div>
        <PaymentOrbDemo />
      </section>

      {/* ─── CTA ─── */}
      <section style={{
        padding: "0 24px 180px",
        display: "flex", flexDirection: "column", alignItems: "center",
        position: "relative", zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          style={{ textAlign: "center", maxWidth: 440 }}
        >
          <h3 style={{
            fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 700,
            letterSpacing: "-0.035em", lineHeight: 1,
            marginBottom: 16, color: "var(--text-1)",
          }}>
            Ready to get paid?
          </h3>
          <p style={{ fontSize: "clamp(14px, 1.6vw, 16px)", color: "var(--text-3)", marginBottom: 36 }}>
            Set up in 60 seconds. Get paid the moment your client approves.
          </p>
          <button
            className="btn-primary"
            onClick={() => router.push("/setup")}
            style={{
              padding: "16px 36px", borderRadius: 14, fontSize: 15, fontWeight: 600,
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
          >
            Create your service link
            <ArrowRight />
          </button>
        </motion.div>
      </section>

      {/* ─── BUILT ON — demoted to plain text links ─── */}
      <section style={{
        padding: "0 24px 60px",
        textAlign: "center",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginBottom: 12 }}>
          Circle{" "}<span style={{ opacity: 0.4 }}>·</span>{" "}
          Arc{" "}<span style={{ opacity: 0.4 }}>·</span>{" "}
          USDC{" "}<span style={{ opacity: 0.4 }}>·</span>{" "}
          Claude
        </div>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          fontSize: 11, color: "rgba(255,255,255,0.15)",
        }}>
          <LeptonLogo size={11} />
          <a
            href="https://lepton.thecanteenapp.com"
            target="_blank" rel="noreferrer"
            style={{ color: "rgba(255,255,255,0.2)", textDecoration: "none" }}
          >
            Lepton by Canteen
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
