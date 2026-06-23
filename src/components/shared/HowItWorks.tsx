"use client";

import { motion } from "framer-motion";

function LinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      stroke="rgba(248,250,252,0.5)">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      stroke="rgba(248,250,252,0.5)">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      stroke="rgba(248,250,252,0.5)">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const steps = [
  {
    num: "01",
    icon: <LinkIcon />,
    title: "Set your rate",
    desc: "Describe your service, set your price in USDC or EURC, get a shareable link in under 60 seconds. No contracts, no paperwork.",
    color: "var(--green)",
    bg: "rgba(16,217,138,0.06)",
  },
  {
    num: "02",
    icon: <ShieldIcon />,
    title: "Client funds escrow",
    desc: "Your client deposits USDC or EURC into a Circle smart wallet. Funds lock before work begins. They cannot withdraw.",
    color: "var(--amber)",
    bg: "rgba(245,158,11,0.06)",
  },
  {
    num: "03",
    icon: <CheckIcon />,
    title: "Agent validates, Arc settles",
    desc: "You deliver. The AI agent verifies scope alignment against the original brief. Payment clears in under 500ms.",
    color: "var(--blue)",
    bg: "rgba(59,130,246,0.06)",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" style={{
      padding: "80px 24px",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
        color: "var(--text-3)", textTransform: "uppercase", marginBottom: 14,
      }}>
        The process
      </div>
      <h2 style={{
        fontSize: "clamp(26px,3.5vw,40px)",
        fontWeight: 700, letterSpacing: "-0.03em",
        textAlign: "center", marginBottom: 10, color: "var(--text-1)",
      }}>
        Three steps. No invoices.
      </h2>
      <p style={{
        fontSize: 15, color: "var(--text-2)",
        textAlign: "center", maxWidth: 420,
        marginBottom: 52, lineHeight: 1.65,
      }}>
        From brief to payment in one flow. The agent handles evaluation
        and dispute resolution automatically.
      </p>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        maxWidth: 860, width: "100%", gap: 10,
      }}>
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            style={{
              padding: "28px 24px",
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-lg)",
              transition: "border-color 0.2s ease, background 0.2s ease",
              position: "relative", overflow: "hidden",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--line-2)";
              e.currentTarget.style.background = "var(--card-2)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--line)";
              e.currentTarget.style.background = "var(--card)";
            }}
          >
            {/* Subtle color bleed */}
            <div style={{
              position: "absolute", inset: 0,
              background: step.bg,
              pointerEvents: "none",
            }} />

            {/* Step number */}
            <div style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: 11, color: "var(--text-3)",
              letterSpacing: "0.06em", marginBottom: 20, position: "relative",
            }}>
              {step.num}
            </div>

            {/* Icon */}
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--line)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 20, position: "relative",
            }}>
              {step.icon}
            </div>

            {/* Color accent bar */}
            <div style={{
              width: 28, height: 2, borderRadius: 999,
              background: step.color, opacity: 0.6,
              marginBottom: 14, position: "relative",
            }} />

            <div style={{
              fontSize: 15, fontWeight: 600, marginBottom: 10,
              color: "var(--text-1)", position: "relative", letterSpacing: "-0.01em",
            }}>
              {step.title}
            </div>
            <div style={{
              fontSize: 13, color: "var(--text-2)",
              lineHeight: 1.65, position: "relative",
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
