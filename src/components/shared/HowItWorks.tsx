"use client";

import { motion } from "framer-motion";

// Monochrome SVG icons replacing emojis
function LinkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="rgba(200,208,220,0.55)" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="rgba(200,208,220,0.55)" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="rgba(200,208,220,0.55)" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="rgba(200,208,220,0.55)" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="rgba(200,208,220,0.55)" />
    </svg>
  );
}

const steps = [
  {
    icon: <LinkIcon />,
    title: "Set your rate",
    desc: "Describe your service, set your USDC price, get a shareable link in under 60 seconds. No contracts. No back-and-forth.",
    accent: "rgba(0,232,150,0.08)",
    dot: "var(--ledger)",
  },
  {
    icon: <LockIcon />,
    title: "Client funds escrow",
    desc: "Your client deposits USDC into a Circle smart wallet. Funds lock before work begins. They cannot withdraw.",
    accent: "rgba(240,165,0,0.07)",
    dot: "var(--amber)",
  },
  {
    icon: <ZapIcon />,
    title: "Agent validates, Arc settles",
    desc: "You deliver. The Receipt Agent verifies scope alignment against the original brief. Payment clears in under 500ms.",
    accent: "rgba(75,143,232,0.07)",
    dot: "var(--blue)",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" style={{
      padding: "72px 24px",
      display: "flex", flexDirection: "column", alignItems: "center",
      background: "linear-gradient(180deg, transparent, rgba(0,232,150,0.012), transparent)",
    }}>
      <div style={{
        fontSize: 10.5, fontWeight: 600, letterSpacing: "0.1em",
        color: "var(--mist)", textTransform: "uppercase", marginBottom: 14,
      }}>
        The process
      </div>
      <h2 style={{
        fontSize: "clamp(26px, 3.5vw, 38px)",
        fontWeight: 700, letterSpacing: "-0.035em",
        textAlign: "center", marginBottom: 10,
      }}>
        Three steps. No invoices.
      </h2>
      <p style={{
        fontSize: 14.5, color: "var(--ash)",
        textAlign: "center", maxWidth: 400,
        marginBottom: 52, lineHeight: 1.7,
      }}>
        From brief to payment in one flow. The agent handles evaluation and
        dispute resolution automatically.
      </p>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        maxWidth: 860, width: "100%",
        gap: 0,
      }}>
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              padding: "30px 26px",
              background: "var(--glass)",
              // Soft white stroke — the key Apple glass refinement
              border: "1px solid rgba(255,255,255,0.045)",
              borderRadius: i === 0 ? "var(--r) 0 0 var(--r)" : i === 2 ? "0 var(--r) var(--r) 0" : "0",
              marginLeft: i > 0 ? -1 : 0,
              position: "relative", cursor: "default",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              transition: "border-color 0.25s ease",
              overflow: "hidden",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
              e.currentTarget.style.zIndex = "1";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.045)";
              e.currentTarget.style.zIndex = "0";
            }}
          >
            {/* Ambient glow bleed per step */}
            <div style={{
              position: "absolute", inset: 0,
              background: step.accent,
              pointerEvents: "none",
              borderRadius: "inherit",
            }} />

            {/* Step number */}
            <div style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: 10.5, fontWeight: 500, color: "var(--mist)",
              letterSpacing: "0.08em", marginBottom: 18,
              position: "relative",
            }}>
              0{i + 1}
            </div>

            {/* SVG Icon in wrapper */}
            <div className="icon-wrap" style={{ marginBottom: 16, position: "relative" }}>
              {step.icon}
            </div>

            {/* Accent dot */}
            <div style={{
              width: 4, height: 4, borderRadius: "50%",
              background: step.dot, marginBottom: 10,
              opacity: 0.7, position: "relative",
            }} />

            <div style={{
              fontSize: 15, fontWeight: 600, marginBottom: 9,
              letterSpacing: "-0.01em", position: "relative",
            }}>
              {step.title}
            </div>
            <div style={{
              fontSize: 12.5, color: "var(--ash)",
              lineHeight: 1.7, position: "relative",
            }}>
              {step.desc}
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          #how > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
          #how > div[style*="grid-template-columns"] > div:first-child {
            border-radius: var(--r) var(--r) 0 0 !important;
          }
          #how > div[style*="grid-template-columns"] > div:last-child {
            border-radius: 0 0 var(--r) var(--r) !important;
          }
          #how > div[style*="grid-template-columns"] > div {
            margin-left: 0 !important;
            margin-top: -1px;
          }
        }
      `}</style>
    </section>
  );
}
