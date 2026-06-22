"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PaymentOrb from "./PaymentOrb";

type Phase = "idle" | "brief" | "locking" | "locked" | "evaluating" | "released";

export default function PaymentOrbDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const amount = 8.0;

  function fund() {
    setPhase("locking");
    setTimeout(() => {
      setPhase("locked");
      setTimeout(() => {
        setPhase("evaluating");
        let s = 0;
        const t = setInterval(() => {
          s = Math.min(s + 1.4, 90);
          setScore(Math.round(s));
          if (s >= 90) clearInterval(t);
        }, 22);
      }, 1200);
    }, 700);
  }

  function approve() { setPhase("released"); }
  function reset()   { setPhase("idle"); setScore(0); }

  const orbState = phase === "released" ? "released"
    : (phase === "locked" || phase === "evaluating" || phase === "locking") ? "locked"
    : "idle";

  const pillPhase: Record<Phase, { label: string; cls: string }> = {
    idle:       { label: "No active contract",  cls: "pill pill-mist" },
    brief:      { label: "Awaiting deposit",    cls: "pill pill-mist" },
    locking:    { label: "Locking funds",       cls: "pill pill-amber" },
    locked:     { label: "Funds locked",        cls: "pill pill-amber" },
    evaluating: { label: "Agent reviewing",     cls: "pill pill-amber" },
    released:   { label: "Settled on Arc",      cls: "pill pill-ledger" },
  };

  const trackMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    e.currentTarget.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <div
      className="card-raised"
      style={{
        width: "100%", maxWidth: 840, overflow: "hidden",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.09), 0 40px 100px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.06)",
      }}
    >
      {/* Mac chrome */}
      <div style={{
        display: "flex", alignItems: "center", padding: "11px 18px",
        background: "rgba(0,0,0,0.22)",
        boxShadow: "inset 0 -0.5px 0 rgba(255,255,255,0.04)",
        gap: 10,
      }}>
        <div style={{ display: "flex", gap: 5.5 }}>
          {["rgba(255,95,87,0.8)", "rgba(254,188,46,0.8)", "rgba(40,200,64,0.8)"].map(c => (
            <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{
          flex: 1, textAlign: "center", fontSize: 10.5,
          color: "var(--mist)", fontFamily: '"DM Mono", monospace',
        }}>
          receipt.so / escrow / demo-contract
        </div>
      </div>

      {/* Settlement strip */}
      <div className="strip">
        {["Circle Gateway", "Arc Testnet", "USDC · EIP-3009", "x402 Protocol"].map(s => (
          <span key={s}><span className="strip-dot" />{s}</span>
        ))}
      </div>

      {/* Body: side-by-side, equal height, no stretching */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "clamp(180px, 40%, 240px) 1fr",
        alignItems: "stretch",
      }}>

        {/* ── LEFT: ORB COLUMN ─────────────────────────────────────── */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "28px 16px",
          boxShadow: "inset -0.5px 0 0 rgba(255,255,255,0.04)",
          minHeight: 380,
        }}>
          {/* Status label */}
          <div style={{ fontSize: 10.5, color: "var(--ash)", fontWeight: 400, textAlign: "center", minHeight: 16 }}>
            {phase === "idle"       && "No active contract"}
            {phase === "brief"      && "Brief received"}
            {phase === "locking"    && "Depositing to Circle"}
            {phase === "locked"     && "Awaiting delivery"}
            {phase === "evaluating" && "Agent verifying scope"}
            {phase === "released"   && "Payment cleared"}
          </div>

          {/* Orb . fixed size, no float animation here to avoid jump */}
          <PaymentOrb amount={amount} state={orbState} size={150} />

          {/* Status pill */}
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={pillPhase[phase].cls}
          >
            <span className="pill-dot" style={{
              animation: (phase === "locked" || phase === "evaluating" || phase === "locking")
                ? "pulse-dot 1.4s ease-in-out infinite" : "none",
            }} />
            {pillPhase[phase].label}
          </motion.div>

          {/* Settlement breakdown . only when active */}
          <AnimatePresence>
            {(phase === "locked" || phase === "evaluating" || phase === "released") && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ width: "100%", padding: "0 8px" }}
              >
                {[
                  ["Contract",    `$${amount.toFixed(2)}`],
                  ["Fee",         "10%"],
                  ["You receive", `$${(amount * 0.9).toFixed(2)}`],
                  ["Chain",       "Arc"],
                ].map(([k, v]) => (
                  <div key={k} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "3px 0", fontSize: 10.5,
                    boxShadow: "inset 0 -0.5px 0 rgba(255,255,255,0.04)",
                  }}>
                    <span style={{ color: "var(--mist)" }}>{k}</span>
                    <span className="font-mono" style={{
                      fontSize: 10.5, fontWeight: 400,
                      color: k === "You receive" ? "var(--ledger)" : "var(--ink-2)",
                    }}>{v} USDC</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT: FLOW COLUMN ───────────────────────────────────── */}
        <div style={{
          padding: "24px 24px",
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          gap: 16,
        }}>
          {/* Top: info + brief + agent */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4, letterSpacing: "-0.01em" }}>
              SEO blog post · Lagos solar
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ash)", marginBottom: 16, lineHeight: 1.6 }}>
              Walk through a real escrow contract. Each step is exactly what the freelancer and client see.
            </div>

            {/* Client brief */}
            <AnimatePresence>
              {phase !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: "11px 13px", borderRadius: "var(--r)",
                    background: "rgba(0,0,0,0.22)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 0 0 0.5px rgba(255,255,255,0.04)",
                    marginBottom: 10,
                  }}
                >
                  <div style={{
                    fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em",
                    color: "var(--mist)", textTransform: "uppercase", marginBottom: 7,
                  }}>
                    Client brief
                  </div>
                  <div style={{
                    fontSize: 11.5, lineHeight: 1.65, color: "var(--ash)", fontStyle: "italic",
                    paddingLeft: 9, boxShadow: "inset 2px 0 0 rgba(255,255,255,0.06)",
                  }}>
                    Write a 1000-word blog post about solar panel installation for homeowners in Lagos, Nigeria. Focus on cost savings and the new government incentive program.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Agent evaluation */}
            <AnimatePresence>
              {(phase === "evaluating" || phase === "released") && (
                <motion.div
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: "12px 13px", borderRadius: "var(--r)",
                    background: "linear-gradient(135deg, rgba(0,229,160,0.04), rgba(74,144,232,0.03))",
                    boxShadow: "inset 0 1px 0 rgba(0,229,160,0.08), inset 0 0 0 0.5px rgba(0,229,160,0.10)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 7,
                      background: "linear-gradient(135deg, rgba(0,229,160,0.18), rgba(74,144,232,0.14))",
                      boxShadow: "inset 0 0 0 0.5px rgba(0,229,160,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                    }}>🤖</div>
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 600 }}>Receipt Agent</div>
                      <div style={{ fontSize: 10, color: "var(--mist)" }}>Scope evaluator · autonomous</div>
                    </div>
                  </div>

                  {score < 90 && phase === "evaluating" ? (
                    <div style={{ display: "flex", gap: 4 }}>
                      {[0, 0.17, 0.34].map(d => (
                        <div key={d} style={{
                          width: 4.5, height: 4.5, borderRadius: "50%",
                          background: "var(--ledger)", opacity: 0.25,
                          animation: `thinking 1.1s ${d}s ease-in-out infinite`,
                        }} />
                      ))}
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div style={{ fontSize: 11, color: "var(--ash)", lineHeight: 1.65, marginBottom: 8 }}>
                        Word count: <strong style={{ color: "var(--ink-2)" }}>1,023</strong>.
                        Lagos data: <strong style={{ color: "var(--ink-2)" }}>confirmed</strong>. Scope alignment:
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          flex: 1, height: 2, borderRadius: 999,
                          background: "rgba(255,255,255,0.06)", overflow: "hidden",
                        }}>
                          <motion.div
                            style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #00E5A0, #00C0FF)" }}
                            initial={{ width: "0%" }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 0.65, ease: "easeOut" }}
                          />
                        </div>
                        <span className="font-mono" style={{ fontSize: 11, color: "var(--ledger)", minWidth: 32 }}>{score}%</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom: action button + note . always sticks to bottom */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <motion.button key="idle"
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="btn-primary"
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  onMouseMove={trackMouse}
                  onClick={() => setPhase("brief")}
                  style={{ width: "100%", padding: "12px", borderRadius: "var(--r-sm)", fontSize: 13 }}
                >
                  Submit brief as client
                </motion.button>
              )}

              {phase === "brief" && (
                <motion.button key="brief"
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  whileTap={{ scale: 0.97, y: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  onClick={fund}
                  style={{
                    width: "100%", padding: "12px", borderRadius: "var(--r-sm)", fontSize: 13,
                    fontWeight: 600, border: "none", cursor: "pointer",
                    background: "var(--amber)", color: "#02040A",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 1px 0 rgba(0,0,0,0.3)",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  Fund escrow · $8.00 USDC
                </motion.button>
              )}

              {phase === "locking" && (
                <motion.div key="locking"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{
                    width: "100%", padding: "12px", borderRadius: "var(--r-sm)", fontSize: 13,
                    background: "rgba(0,0,0,0.22)",
                    boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.07)",
                    color: "var(--ash)", textAlign: "center",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                  }}
                >
                  <span style={{
                    width: 12, height: 12, borderRadius: "50%",
                    border: "1.5px solid var(--amber)", borderTopColor: "transparent",
                    display: "inline-block", animation: "spin 0.7s linear infinite",
                  }} />
                  Depositing to Circle escrow...
                </motion.div>
              )}

              {phase === "evaluating" && score >= 90 && (
                <motion.button key="approve"
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className="btn-primary"
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  onMouseMove={trackMouse}
                  onClick={approve}
                  style={{ width: "100%", padding: "12px", borderRadius: "var(--r-sm)", fontSize: 13 }}
                >
                  Approve · release payment
                </motion.button>
              )}

              {phase === "released" && (
                <motion.button key="reset"
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className="btn-ghost"
                  whileTap={{ scale: 0.97 }}
                  onClick={reset}
                  style={{ width: "100%", padding: "11px", borderRadius: "var(--r-sm)", fontSize: 13 }}
                >
                  Reset demo
                </motion.button>
              )}
            </AnimatePresence>

            <div style={{ textAlign: "center", fontSize: 10.5, color: "var(--mist)", lineHeight: 1.55 }}>
              {phase === "released"
                ? "Settled via submitBatch() on Arc in 482ms. Transaction onchain."
                : "Buyer signs EIP-3009 offchain. Gateway batches and settles via submitBatch()."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
