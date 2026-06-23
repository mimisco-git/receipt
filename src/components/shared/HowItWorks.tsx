"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Set your rate",
    desc: "Create a service link with your USDC price. Share it with clients.",
  },
  {
    num: "02",
    title: "Client funds escrow",
    desc: "USDC deposits into a Circle smart wallet. Locked before work begins.",
  },
  {
    num: "03",
    title: "Agent verifies, Arc settles",
    desc: "AI validates delivery against the brief. Payment clears in under 500ms.",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export default function HowItWorks() {
  return (
    <section id="how" style={{
      padding: "100px 24px 180px",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        style={{ textAlign: "center", marginBottom: 80 }}
      >
        <h2 style={{
          fontSize: "clamp(28px, 5vw, 52px)",
          fontWeight: 700, letterSpacing: "-0.04em",
          lineHeight: 1, color: "var(--text-1)",
          marginBottom: 16,
        }}>
          Three steps. No invoices.
        </h2>
        <p style={{
          fontSize: 16, color: "var(--text-3)",
          maxWidth: 340, margin: "0 auto",
        }}>
          From brief to payment in one flow.
        </p>
      </motion.div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        maxWidth: 800, width: "100%", gap: 1,
      }}>
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.12, duration: 0.8, ease }}
            style={{
              padding: "40px 32px",
              position: "relative",
            }}
          >
            <div style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: 12, color: "var(--text-3)",
              marginBottom: 20, opacity: 0.4,
            }}>
              {step.num}
            </div>

            <div style={{
              fontSize: 18, fontWeight: 600, marginBottom: 12,
              color: "var(--text-1)", letterSpacing: "-0.02em",
            }}>
              {step.title}
            </div>
            <div style={{
              fontSize: 14, color: "var(--text-3)",
              lineHeight: 1.65,
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
