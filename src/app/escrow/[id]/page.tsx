"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/layout/Nav";
import PaymentOrb from "@/components/shared/PaymentOrb";
import { formatUsdc } from "@/lib/utils";

type Phase = "pending" | "delivered" | "evaluating" | "approved" | "settled" | "disputed";

const DEMO_CONTRACT = {
  id: "demo",
  clientName: "James Adeyemi",
  brief:
    "Write a 1000-word blog post about the benefits of solar panel installation for homeowners in Lagos, Nigeria. Focus on cost savings and the new government incentive program. Tone should be practical and optimistic.",
  amountUsdc: 8.0,
  netAmountUsdc: 7.2,
  platformFee: 0.8,
  service: { title: "SEO blog post, 1000 words" },
  freelancer: { name: "Amara Nwosu", avatarColor: "#667eea" },
  createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
};

export default function EscrowPage() {
  const { id } = useParams<{ id: string }>();
  const [phase, setPhase] = useState<Phase>("pending");
  const [agentScore, setAgentScore] = useState(0);
  const [scoreRunning, setScoreRunning] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const contract = DEMO_CONTRACT;
  const price = contract.amountUsdc;

  function launchParticles() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const particles = Array.from({ length: 80 }, () => ({
      x: cx,
      y: cy,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 0.5) * 18,
      r: Math.random() * 4 + 1,
      alpha: 1,
      color: Math.random() > 0.4 ? "#00F5A0" : "#00C8FF",
    }));

    let frame = 0;
    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.alpha -= 0.015;
        if (p.alpha <= 0) return;
        ctx!.save();
        ctx!.globalAlpha = Math.max(0, p.alpha);
        ctx!.fillStyle = p.color;
        ctx!.shadowBlur = 12;
        ctx!.shadowColor = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      });
      if (++frame < 110) requestAnimationFrame(draw);
    }
    draw();
  }

  async function submitDelivery() {
    if (!deliveryNote.trim()) return;
    setSubmitting(true);
    setPhase("delivered");

    setTimeout(() => {
      setPhase("evaluating");
      setScoreRunning(true);
      let s = 0;
      const t = setInterval(() => {
        s = Math.min(s + 1.8, 90);
        setAgentScore(Math.round(s));
        if (s >= 90) {
          clearInterval(t);
          setScoreRunning(false);
        }
      }, 22);
      setSubmitting(false);
    }, 1200);
  }

  function approvePayment() {
    setPhase("approved");
    setTimeout(() => {
      setPhase("settled");
      setTimeout(launchParticles, 100);
    }, 700);
  }

  const orbState =
    phase === "settled" || phase === "approved"
      ? "released"
      : phase === "pending" || phase === "delivered" || phase === "evaluating"
      ? "locked"
      : "idle";

  return (
    <div className="min-h-screen" style={{ background: "var(--space)" }}>
      <Nav />

      <main className="flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-16">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold mb-3"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              Contract #{id?.toString().slice(0, 8)}
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ letterSpacing: "-0.02em" }}
            >
              {contract.service.title}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Client: {contract.clientName}. Freelancer: {contract.freelancer.name}.
            </p>
          </div>

          {/* Main card */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
            }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none z-10"
              style={{ width: "100%", height: "100%" }}
            />

            <div className="grid md:grid-cols-2">
              {/* Left: Orb */}
              <div
                className="flex flex-col items-center justify-center gap-5 p-8"
                style={{ borderRight: "1px solid var(--border)" }}
              >
                <div className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  {phase === "pending"    && "Awaiting delivery"}
                  {phase === "delivered"  && "Delivery submitted"}
                  {phase === "evaluating" && "Agent evaluating..."}
                  {phase === "approved"   && "Releasing payment..."}
                  {phase === "settled"    && "Payment settled"}
                  {phase === "disputed"   && "Under dispute review"}
                </div>

                <PaymentOrb amount={price} state={orbState} size={170} />

                <StatusPill phase={phase} />

                {/* Details */}
                <div className="w-full space-y-2 text-xs">
                  {[
                    ["Contract", `$${formatUsdc(price)} USDC`],
                    ["Platform fee", "10%"],
                    ["Freelancer gets", `$${formatUsdc(contract.netAmountUsdc)} USDC`],
                    ["Chain", "Arc Testnet"],
                    ["Settlement", phase === "settled" ? "482ms" : "Under 500ms"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span style={{ color: "var(--text-muted)" }}>{k}</span>
                      <span
                        className="font-mono font-semibold"
                        style={{
                          color:
                            k === "Freelancer gets"
                              ? "var(--mint)"
                              : k === "Settlement" && phase === "settled"
                              ? "var(--mint)"
                              : "var(--text-primary)",
                        }}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Flow */}
              <div className="p-7 flex flex-col justify-between">
                <div>
                  {/* Brief */}
                  <div
                    className="p-4 rounded-xl mb-4"
                    style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                  >
                    <div
                      className="text-xs font-semibold uppercase tracking-widest mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Client brief
                    </div>
                    <div
                      className="text-xs leading-relaxed italic"
                      style={{
                        color: "var(--text-secondary)",
                        borderLeft: "2px solid var(--border-light)",
                        paddingLeft: 12,
                      }}
                    >
                      {contract.brief}
                    </div>
                  </div>

                  {/* Delivery input */}
                  <AnimatePresence>
                    {phase === "pending" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-4"
                      >
                        <label
                          className="block text-xs font-medium mb-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Your delivery (paste link or content)
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Paste your Google Doc link, Notion URL, or the content itself..."
                          value={deliveryNote}
                          onChange={(e) => setDeliveryNote(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none transition-all duration-200"
                          style={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            color: "var(--text-primary)",
                          }}
                          onFocus={(e) =>
                            (e.currentTarget.style.borderColor = "rgba(0,245,160,0.4)")
                          }
                          onBlur={(e) =>
                            (e.currentTarget.style.borderColor = "var(--border)")
                          }
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Agent card */}
                  <AnimatePresence>
                    {(phase === "evaluating" || phase === "approved" || phase === "settled") && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 rounded-xl"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(0,245,160,0.05), rgba(59,130,246,0.05))",
                          border: "1px solid rgba(0,245,160,0.18)",
                        }}
                      >
                        <div className="flex items-center gap-2.5 mb-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(0,245,160,0.2), rgba(59,130,246,0.2))",
                              border: "1px solid rgba(0,245,160,0.2)",
                            }}
                          >
                            🤖
                          </div>
                          <div>
                            <div className="text-xs font-semibold">Receipt Agent</div>
                            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                              Brief evaluator
                            </div>
                          </div>
                        </div>

                        {scoreRunning ? (
                          <div className="flex gap-1.5">
                            {[0, 0.2, 0.4].map((d) => (
                              <div
                                key={d}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  background: "var(--mint)",
                                  opacity: 0.4,
                                  animation: `thinking 1.2s ${d}s ease-in-out infinite`,
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div
                              className="text-xs leading-relaxed mb-3"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              Delivery reviewed. Word count: <strong>1,023</strong>. Lagos incentive
                              data: <strong>confirmed</strong>. Tone: <strong>practical and optimistic</strong>. Brief match:
                            </div>
                            <div className="flex items-center gap-3">
                              <div
                                className="flex-1 h-1 rounded-full overflow-hidden"
                                style={{ background: "var(--card)" }}
                              >
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{
                                    background: "linear-gradient(90deg, #00F5A0, #00C8FF)",
                                  }}
                                  initial={{ width: "0%" }}
                                  animate={{ width: `${agentScore}%` }}
                                  transition={{ duration: 0.8 }}
                                />
                              </div>
                              <span
                                className="font-mono font-semibold text-xs"
                                style={{ color: "var(--mint)", minWidth: 36 }}
                              >
                                {agentScore}%
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Settled state */}
                  <AnimatePresence>
                    {phase === "settled" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-4 p-5 rounded-xl text-center"
                        style={{
                          background: "var(--mint-dim)",
                          border: "1px solid rgba(0,245,160,0.25)",
                        }}
                      >
                        <div
                          className="text-3xl font-mono font-semibold mb-1"
                          style={{ color: "var(--mint)" }}
                        >
                          ${formatUsdc(contract.netAmountUsdc)}
                        </div>
                        <div className="text-xs" style={{ color: "var(--mint)" }}>
                          USDC settled to Amara&apos;s wallet in 482ms
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Actions */}
                <div className="space-y-2.5 mt-4">
                  {phase === "pending" && (
                    <button
                      onClick={submitDelivery}
                      disabled={!deliveryNote.trim() || submitting}
                      className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: "var(--mint)", color: "#0A0E1A" }}
                    >
                      {submitting ? "Submitting..." : "Submit delivery for review"}
                    </button>
                  )}

                  {phase === "evaluating" && !scoreRunning && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <button
                        onClick={approvePayment}
                        className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90"
                        style={{ background: "var(--mint)", color: "#0A0E1A" }}
                      >
                        Approve and release payment
                      </button>
                      <button
                        onClick={() => setPhase("disputed")}
                        className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                          background: "transparent",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        Flag an issue
                      </button>
                    </motion.div>
                  )}

                  {phase === "disputed" && (
                    <div
                      className="p-4 rounded-xl text-sm text-center"
                      style={{
                        background: "var(--red-dim)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Dispute opened. The Receipt Agent will re-evaluate within 60 seconds
                      and propose a fair resolution.
                    </div>
                  )}

                  <div
                    className="text-center text-xs leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {phase === "settled"
                      ? "Transaction recorded on Arc Testnet. Contract complete."
                      : "Settlement via Circle Gateway on Arc Testnet."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes thinking {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}

function StatusPill({ phase }: { phase: Phase }) {
  const config = {
    pending:    { label: "Funds locked in escrow", color: "amber" },
    delivered:  { label: "Delivery received",       color: "blue" },
    evaluating: { label: "Agent reviewing",          color: "amber" },
    approved:   { label: "Releasing payment",        color: "mint" },
    settled:    { label: "Settled on Arc",           color: "mint" },
    disputed:   { label: "Under review",             color: "red" },
  };

  const { label, color } = config[phase];

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    mint:  { bg: "var(--mint-dim)",  text: "var(--mint)",  border: "rgba(0,245,160,0.25)" },
    amber: { bg: "var(--amber-dim)", text: "var(--amber)", border: "rgba(245,158,11,0.25)" },
    blue:  { bg: "rgba(59,130,246,0.12)", text: "#60A5FA", border: "rgba(59,130,246,0.25)" },
    red:   { bg: "var(--red-dim)",   text: "var(--red)",   border: "rgba(239,68,68,0.25)" },
  };

  const c = colorMap[color];

  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-500"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: "currentColor",
          animation: color === "amber" ? "pulse-dot 1.5s ease-in-out infinite" : "none",
        }}
      />
      {label}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
}
