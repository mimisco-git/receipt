"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Set your rate",
    desc: "Describe your service, set your USDC price, and get a shareable link in under 60 seconds.",
    color: "var(--green)",
  },
  {
    num: "02",
    title: "Client funds escrow",
    desc: "Your client deposits USDC into a Circle smart wallet. Funds lock before work begins.",
    color: "var(--amber)",
  },
  {
    num: "03",
    title: "Agent validates, Arc settles",
    desc: "You deliver. The AI agent verifies scope alignment. Payment clears in under 500ms.",
    color: "var(--blue)",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" style={{
      padding: "120px 24px 160px",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: "center", marginBottom: 72 }}
      >
        <h2 style={{
          fontSize: "clamp(28px,4vw,48px)",
          fontWeight: 700, letterSpacing: "-0.035em",
          marginBottom: 16, color: "var(--text-1)",
        }}>
          Three steps. No invoices.
        </h2>
        <p style={{
          fontSize: 16, color: "var(--text-3)",
          maxWidth: 400, margin: "0 auto", lineHeight: 1.6,
        }}>
          From brief to payment in one flow.
        </p>
      </motion.div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        maxWidth: 860, width: "100%", gap: 16,
      }}>
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              padding: "36px 28px",
              background: "rgba(255,255,255,0.025)",
              borderRadius: 20,
              position: "relative",
            }}
          >
            <div style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: 11, color: "var(--text-3)",
              letterSpacing: "0.06em", marginBottom: 24, opacity: 0.5,
            }}>
              {step.num}
            </div>

            <div style={{
              width: 24, height: 2, borderRadius: 999,
              background: step.color, opacity: 0.5,
              marginBottom: 18,
            }} />

            <div style={{
              fontSize: 17, fontWeight: 600, marginBottom: 12,
              color: "var(--text-1)", letterSpacing: "-0.015em",
            }}>
              {step.title}
            </div>
            <div style={{
              fontSize: 14, color: "var(--text-3)",
              lineHeight: 1.7,
            }}>
              {step.desc}
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          #how > div[style*="grid"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
