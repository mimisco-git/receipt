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
    color: "var(--accent)",
    bg: "rgba(0,229,195,0.04)",
  },
  {
    num: "02",
    icon: <ShieldIcon />,
    title: "Client funds escrow",
    desc: "Your client deposits USDC or EURC into a Circle smart wallet. Funds lock before work begins. They cannot withdraw.",
    color: "var(--accent)",
    bg: "rgba(0,229,195,0.04)",
  },
  {
    num: "03",
    icon: <CheckIcon />,
    title: "Agent validates, Arc settles",
    desc: "You deliver. The AI agent verifies scope alignment against the original brief. Payment clears in under 500ms.",
    color: "var(--accent)",
    bg: "rgba(0,229,195,0.04)",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" style={{
      padding: "80px 24px",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <div style={{
        fontSize: 14, fontWeight: 600, letterSpacing: "0.1em",
        color: "var(--text-3)", textTransform: "uppercase", marginBottom: 14,
      }}>
        The process
      </div>
      <h2 style={{
        fontSize: "clamp(26px,3.5vw,40px)",
        fontWeight: 700, letterSpacing: "-0.05em",
        lineHeight: 1.05,
        textAlign: "center", marginBottom: 10, color: "var(--text-1)",
      }}>
        Three steps. No invoices.
      </h2>
      <p style={{
        fontSize: 19, color: "var(--text-2)",
        textAlign: "center", maxWidth: 420,
        marginBottom: 52, lineHeight: 1.70,
      }}>
        <strong style={{ fontWeight: 700, color: "#FFFFFF" }}>From brief to payment</strong> in one flow.
        The agent handles <strong style={{ fontWeight: 700, color: "#FFFFFF" }}>evaluation</strong> and{" "}
        <strong style={{ fontWeight: 700, color: "#FFFFFF" }}>dispute resolution</strong> automatically.
      </p>

      <div className="how-grid" style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        maxWidth: 860, width: "100%", gap: 20,
      }}>
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            style={{
              padding: "32px 28px",
              background: "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.030) 0%, rgba(255,255,255,.012) 100%)",
              backdropFilter: "blur(30px) saturate(180%)",
              WebkitBackdropFilter: "blur(30px) saturate(180%)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 28,
              boxShadow: "0 16px 40px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08)",
              transition: "transform 500ms cubic-bezier(0.34,1.4,0.64,1), border-color 280ms ease, background 280ms ease, box-shadow 400ms ease",
              position: "relative", overflow: "hidden",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,.13)";
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,.06) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.050) 0%, rgba(255,255,255,.025) 100%)";
              e.currentTarget.style.boxShadow = "0 24px 56px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.12)";
              e.currentTarget.style.transform = "translateY(-5px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,.08)";
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.030) 0%, rgba(255,255,255,.012) 100%)";
              e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Step number */}
            <div style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: 14, color: "var(--text-3)",
              letterSpacing: "0.08em", marginBottom: 22,
            }}>
              {step.num}
            </div>

            {/* Glass icon container */}
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(255,255,255,.025)",
              backdropFilter: "blur(18px) saturate(150%)",
              WebkitBackdropFilter: "blur(18px) saturate(150%)",
              border: "1px solid rgba(255,255,255,.06)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 22,
            }}>
              {step.icon}
            </div>

            {/* Accent bar */}
            <div style={{
              width: 24, height: 2, borderRadius: 999,
              background: step.color, opacity: 0.7,
              marginBottom: 16,
            }} />

            <div style={{
              fontSize: 18, fontWeight: 600, marginBottom: 10,
              color: "var(--text-1)", letterSpacing: "-0.01em",
            }}>
              {step.title}
            </div>
            <div style={{
              fontSize: 17, opacity: 0.72, color: "inherit",
              lineHeight: 1.7,
            }}>
              {step.desc}
            </div>
          </motion.div>
        ))}
      </div>


    </section>
  );
}
