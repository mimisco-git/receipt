"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import HeroStats from "@/components/shared/HeroStats";
import HowItWorks from "@/components/shared/HowItWorks";
import PaymentOrbDemo from "@/components/shared/PaymentOrbDemo";
import LeptonLogo from "@/components/shared/LeptonLogo";

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

const features = [
  {
    title: "Sub-500ms settlement",
    desc: "Arc finalizes faster than your bank sends a confirmation SMS.",
  },
  {
    title: "Agent-verified scope",
    desc: "The Receipt Agent reads brief vs delivery and releases funds autonomously.",
  },
  {
    title: "Zero invoice chasing",
    desc: "USDC locks in escrow before work begins. Payment is guaranteed.",
  },
];

export default function HomePage() {
  const router = useRouter();

  const slow = { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />

      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "min(900px, 100vw)", height: 600, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse, rgba(52,211,153,0.04) 0%, rgba(74,158,248,0.015) 50%, transparent 70%)",
        filter: "blur(80px)",
      }} />

      {/* HERO */}
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="pill pill-green"
          style={{ marginBottom: 32, fontSize: 11, gap: 8 }}
        >
          <span className="pill-dot" style={{ animation: "pulse-dot 2.5s ease-in-out infinite" }} />
          Circle · Arc · USDC
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <LeptonLogo size={14} />
            Lepton 2026
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...slow }}
          style={{
            fontSize: "clamp(36px, 7.5vw, 88px)",
            fontWeight: 700,
            letterSpacing: "-0.045em",
            lineHeight: 1.02,
            maxWidth: 820,
            marginBottom: 28,
            color: "var(--text-1)",
          }}
        >
          Get paid the moment<br />
          your work is{" "}
          <span style={{
            background: "linear-gradient(135deg, #34D399 0%, #38BDF8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            approved.
          </span>
        </motion.h1>

        {/* Sub — shorter, less text */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, ...slow }}
          style={{
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "var(--text-3)",
            lineHeight: 1.6,
            maxWidth: 420,
            marginBottom: 48,
          }}
        >
          AI-mediated freelance escrow. Client deposits USDC.
          Agent verifies. Payment clears in under 500ms.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, ...slow }}
          style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 80 }}
        >
          <button
            className="btn-primary"
            onClick={() => router.push("/setup")}
            style={{
              padding: "14px 28px", borderRadius: 14,
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 15,
            }}
          >
            Create your service link
            <ArrowRight />
          </button>
          <button
            className="btn-ghost"
            onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
            style={{ padding: "14px 28px", borderRadius: 14, fontSize: 15 }}
          >
            Watch the demo
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          <HeroStats />
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <HowItWorks />

      {/* FEATURE CARDS — borderless, more spacing */}
      <section style={{ padding: "0 24px 160px", position: "relative", zIndex: 1 }}>
        <div style={{
          maxWidth: 860, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{
                padding: "32px 28px",
                background: "rgba(255,255,255,0.025)",
                borderRadius: 20,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: "var(--text-1)", letterSpacing: "-0.01em" }}>
                {f.title}
              </div>
              <div style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.7 }}>
                {f.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* LIVE DEMO */}
      <section id="demo" style={{
        padding: "80px 24px 160px",
        display: "flex", flexDirection: "column", alignItems: "center",
        position: "relative", zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <h2 style={{
            fontSize: "clamp(28px,4vw,48px)", fontWeight: 700,
            letterSpacing: "-0.035em", marginBottom: 14,
            color: "var(--text-1)",
          }}>
            Watch a payment clear.
          </h2>
          <p style={{
            fontSize: 15, color: "var(--text-3)",
            maxWidth: 380, margin: "0 auto", lineHeight: 1.6,
          }}>
            The ripple is exactly what your client sees when USDC settles on Arc.
          </p>
        </motion.div>
        <PaymentOrbDemo />
      </section>

      {/* CTA SECTION — borderless */}
      <section style={{
        padding: "0 24px 160px",
        display: "flex", flexDirection: "column", alignItems: "center",
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          maxWidth: 480, width: "100%",
          background: "rgba(255,255,255,0.025)",
          borderRadius: 24,
          padding: "clamp(32px, 6vw, 56px)",
          textAlign: "center",
        }}>
          <h3 style={{
            fontSize: "clamp(22px,3.5vw,32px)", fontWeight: 700, letterSpacing: "-0.03em",
            marginBottom: 14, color: "var(--text-1)",
          }}>
            Ready to get paid?
          </h3>
          <p style={{ fontSize: 15, color: "var(--text-3)", lineHeight: 1.6, marginBottom: 32 }}>
            Set up your service in 60 seconds. Share the link. Get paid the moment your client approves.
          </p>
          <button
            className="btn-primary"
            onClick={() => router.push("/setup")}
            style={{
              padding: "14px 32px", borderRadius: 14, fontSize: 15,
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
          >
            Create your service link
            <ArrowRight />
          </button>
          <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 16, opacity: 0.6 }}>
            10% platform fee per settled contract.
          </div>
        </div>
      </section>

      {/* TECH STACK — reduced to 4 items, no borders */}
      <section style={{
        padding: "0 24px 80px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          fontSize: 11, color: "var(--text-3)",
          fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase",
          opacity: 0.6,
        }}>
          Built on
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {[
            "Circle Wallets",
            "Arc L1",
            "USDC",
            "Claude Sonnet 4.6",
          ].map(t => (
            <span key={t} className="font-mono" style={{
              padding: "6px 14px", borderRadius: 999, fontSize: 12,
              background: "rgba(255,255,255,0.03)",
              color: "var(--text-3)",
            }}>{t}</span>
          ))}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 12, color: "var(--text-3)", marginTop: 4, opacity: 0.5,
        }}>
          Built for
          <LeptonLogo size={14} />
          <a
            href="https://lepton.thecanteenapp.com"
            target="_blank" rel="noreferrer"
            style={{ color: "var(--text-2)", textDecoration: "none", fontWeight: 500 }}
          >
            Lepton by Canteen
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
