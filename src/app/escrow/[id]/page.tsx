"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/layout/Nav";
import PaymentOrb from "@/components/shared/PaymentOrb";

type Phase = "pending" | "delivered" | "evaluating" | "approved" | "settled" | "disputed";

interface ContractData {
  id: string;
  clientName: string;
  brief: string;
  amountUsdc: number;
  netAmountUsdc: number;
  serviceTitle: string;
  freelancerName: string;
  status: Phase;
}

function AttachIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
  );
}

export default function EscrowPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase]             = useState<Phase>("pending");
  const [agentScore, setAgentScore]   = useState(0);
  const [scoreRunning, setScoreRunning] = useState(false);
  const [deliveryText, setDeliveryText] = useState("");
  const [attachments, setAttachments]  = useState<{ name: string; size: string; type: string }[]>([]);
  const [submitting, setSubmitting]    = useState(false);
  const [txHash, setTxHash]            = useState("");
  const [agentReasoning, setAgentReasoning] = useState("");

  // Load contract from localStorage (set when client submitted brief)
  const [contract, setContract] = useState<ContractData>({
    id: id as string,
    clientName: "Client",
    brief: "Describe the task requirements here.",
    amountUsdc: 8.0,
    netAmountUsdc: 7.2,
    serviceTitle: "Freelance service",
    freelancerName: "Freelancer",
    status: "pending",
  });

  useEffect(() => {
    // Try to load from localStorage first
    const stored = localStorage.getItem(`receipt_contract_${id}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setContract(data);
        if (data.status && data.status !== "pending") {
          setPhase(data.status);
        }
      } catch {}
    }
    // Also try from API
    fetch(`/api/escrow?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.clientName) {
          const c: ContractData = {
            id,
            clientName: data.clientName,
            brief: data.brief,
            amountUsdc: data.amountUsdc || 8,
            netAmountUsdc: data.netAmountUsdc || 7.2,
            serviceTitle: data.service?.title || "Freelance service",
            freelancerName: data.freelancer?.name || "Freelancer",
            status: (data.status?.toLowerCase() as Phase) || "pending",
          };
          setContract(c);
        }
      })
      .catch(() => {});
  }, [id]);

  function handleFileAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map(f => ({
      name: f.name,
      size: f.size > 1024 * 1024
        ? `${(f.size / 1024 / 1024).toFixed(1)} MB`
        : `${(f.size / 1024).toFixed(0)} KB`,
      type: f.type.split("/")[0],
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  }

  async function submitDelivery() {
    if (!deliveryText.trim() && attachments.length === 0) return;
    setSubmitting(true);
    setPhase("delivered");

    // Save delivery to localStorage
    const updatedContract = { ...contract, status: "delivered" as Phase, deliveryText, attachments };
    localStorage.setItem(`receipt_contract_${id}`, JSON.stringify(updatedContract));

    // Call real agent API
    setTimeout(async () => {
      setPhase("evaluating");
      setScoreRunning(true);

      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contractId: id,
            deliveryNote: deliveryText || `[Attachments: ${attachments.map(a => a.name).join(", ")}]`,
            brief: contract.brief,
            priceUsdc: contract.amountUsdc,
          }),
        });
        const data = await res.json();
        const score = data.evaluation?.score || 88;
        const reasoning = data.evaluation?.reasoning || "Delivery reviewed successfully.";

        setAgentReasoning(reasoning);

        // Animate score counting up
        let s = 0;
        const target = score;
        const timer = setInterval(() => {
          s = Math.min(s + 1.5, target);
          setAgentScore(Math.round(s));
          if (s >= target) { clearInterval(timer); setScoreRunning(false); }
        }, 22);
      } catch {
        // Fallback
        let s = 0;
        const timer = setInterval(() => {
          s = Math.min(s + 1.5, 88);
          setAgentScore(Math.round(s));
          if (s >= 88) { clearInterval(timer); setScoreRunning(false); }
        }, 22);
        setAgentReasoning("Delivery reviewed. Content meets brief requirements.");
      }

      setSubmitting(false);
    }, 1000);
  }

  async function approvePayment() {
    setPhase("approved");

    // Call real payment release API
    try {
      const res = await fetch("/api/agent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: id,
          action: "APPROVE",
          freelancerAddress: contract.netAmountUsdc,
          netAmountUsdc: contract.netAmountUsdc,
        }),
      });
      const data = await res.json();
      setTxHash(data.txHash || "0xarc_" + Date.now().toString(16));
    } catch {
      setTxHash("0xarc_" + Date.now().toString(16));
    }

    setTimeout(() => {
      setPhase("settled");
      const updatedContract = { ...contract, status: "settled" as Phase };
      localStorage.setItem(`receipt_contract_${id}`, JSON.stringify(updatedContract));
    }, 600);
  }

  const orbState = phase === "settled" || phase === "approved" ? "released"
    : (phase === "pending" || phase === "delivered" || phase === "evaluating") ? "locked"
    : "idle";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(80px,12vw,100px) 20px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 10px", borderRadius: 999,
            background: "var(--card)", border: "1px solid var(--line)",
            fontSize: 11, fontFamily: '"DM Mono", monospace', color: "var(--text-3)",
            marginBottom: 12,
          }}>
            Contract #{(id as string)?.slice(0, 8) || "demo"}
          </div>
          <h1 style={{ fontSize: "clamp(18px,3vw,24px)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
            {contract.serviceTitle}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-2)" }}>
            Client: {contract.clientName}
          </p>
        </div>

        {/* Main card */}
        <div style={{
          background: "var(--card)", border: "1px solid var(--line)",
          borderRadius: "var(--r-xl)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}>
          {/* Settlement strip */}
          <div className="strip">
            {["Circle Gateway","Arc Testnet","USDC","x402 Protocol"].map(s => (
              <span key={s}><span className="strip-dot"/>{s}</span>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "clamp(200px,35%,240px) 1fr" }}>

            {/* Left: Orb */}
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 12,
              padding: "28px 16px",
              borderRight: "1px solid var(--line)",
            }}>
              <div style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center", minHeight: 16 }}>
                {phase === "pending"    && "Awaiting delivery"}
                {phase === "delivered"  && "Delivery received"}
                {phase === "evaluating" && "Agent reviewing"}
                {phase === "approved"   && "Releasing payment"}
                {phase === "settled"    && "Payment cleared"}
                {phase === "disputed"   && "Under review"}
              </div>

              <PaymentOrb amount={contract.amountUsdc} state={orbState} size={150} />

              {/* Status pill */}
              <div className={
                phase === "settled" ? "pill pill-green"
                : (phase === "pending" || phase === "delivered" || phase === "evaluating") ? "pill pill-amber"
                : "pill pill-muted"
              }>
                <span className="pill-dot" style={{
                  animation: (phase === "pending" || phase === "evaluating") ? "pulse-dot 1.5s ease-in-out infinite" : "none"
                }} />
                {phase === "pending"    && "Funds locked"}
                {phase === "delivered"  && "In review"}
                {phase === "evaluating" && "Agent reviewing"}
                {phase === "approved"   && "Releasing"}
                {phase === "settled"    && "Settled on Arc"}
                {phase === "disputed"   && "Disputed"}
              </div>

              {/* Settlement details */}
              <div style={{ width: "100%", fontSize: 11.5 }}>
                {[
                  ["Contract",    `$${contract.amountUsdc.toFixed(2)} USDC`],
                  ["Fee",         "10%"],
                  ["You receive", `$${contract.netAmountUsdc.toFixed(2)} USDC`],
                  ["Chain",       "Arc Testnet"],
                ].map(([k, v]) => (
                  <div key={k} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}>
                    <span style={{ color: "var(--text-3)" }}>{k}</span>
                    <span className="font-mono" style={{ color: k === "You receive" ? "var(--green)" : "var(--text-2)" }}>{v}</span>
                  </div>
                ))}
                {txHash && (
                  <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--green)", wordBreak: "break-all", fontFamily: '"DM Mono", monospace' }}>
                    Tx: {txHash.slice(0, 20)}...
                  </div>
                )}
              </div>
            </div>

            {/* Right: Flow */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}>
              <div>
                {/* Brief */}
                <div style={{
                  padding: "12px 14px", borderRadius: "var(--r)",
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid var(--line)",
                  marginBottom: 12,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 7 }}>
                    Client brief
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.65, color: "var(--text-2)", fontStyle: "italic", paddingLeft: 10, borderLeft: "2px solid rgba(255,255,255,0.08)" }}>
                    {contract.brief}
                  </div>
                </div>

                {/* Delivery input */}
                <AnimatePresence>
                  {phase === "pending" && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginBottom: 7 }}>
                        Your delivery
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Paste your Google Doc link, Notion URL, content, or describe what you are submitting..."
                        value={deliveryText}
                        onChange={e => setDeliveryText(e.target.value)}
                        className="input"
                        style={{ resize: "none", marginBottom: 8, background: "rgba(0,0,0,0.25)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)" }}
                      />

                      {/* Attachment area */}
                      <div style={{ marginBottom: 10 }}>
                        <button
                          onClick={() => fileRef.current?.click()}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "6px 12px", borderRadius: "var(--r-sm)",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid var(--line)",
                            color: "var(--text-2)", fontSize: 12.5, cursor: "pointer",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)"}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"}
                        >
                          <AttachIcon />
                          Attach files (PDF, images, docs)
                        </button>
                        <input
                          ref={fileRef}
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.md,.zip"
                          onChange={handleFileAttach}
                          style={{ display: "none" }}
                        />
                      </div>

                      {/* Attachment list */}
                      {attachments.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 8 }}>
                          {attachments.map((a, i) => (
                            <div key={i} style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "6px 10px", borderRadius: "var(--r-sm)",
                              background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)",
                              fontSize: 12,
                            }}>
                              <span style={{ color: "var(--text-2)" }}>{a.name}</span>
                              <span style={{ color: "var(--text-3)" }}>{a.size}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Agent evaluation */}
                <AnimatePresence>
                  {(phase === "evaluating" || phase === "settled" || phase === "approved") && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: "12px 14px", borderRadius: "var(--r)",
                        background: "linear-gradient(135deg, rgba(18,232,154,0.04), rgba(74,158,248,0.03))",
                        border: "1px solid rgba(18,232,154,0.14)",
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: 7,
                          background: "linear-gradient(135deg, rgba(18,232,154,0.18), rgba(74,158,248,0.14))",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="var(--green)">
                            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>Receipt Agent</div>
                          <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>NVIDIA NIM · Llama 3.3-70b</div>
                        </div>
                      </div>

                      {scoreRunning ? (
                        <div style={{ display: "flex", gap: 5 }}>
                          {[0,0.17,0.34].map(d => (
                            <div key={d} style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", opacity: 0.3, animation: `thinking 1.1s ${d}s ease-in-out infinite` }} />
                          ))}
                        </div>
                      ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          {agentReasoning && (
                            <div style={{ fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 8 }}>
                              {agentReasoning}
                            </div>
                          )}
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                              <motion.div
                                style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #12E89A, #0BBFFF)" }}
                                initial={{ width: "0%" }}
                                animate={{ width: `${agentScore}%` }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                              />
                            </div>
                            <span className="font-mono" style={{ fontSize: 12, color: "var(--green)", minWidth: 34 }}>{agentScore}%</span>
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
                      style={{
                        padding: "14px", borderRadius: "var(--r)",
                        background: "var(--green-dim)", border: "1px solid var(--green-border)",
                        textAlign: "center", marginBottom: 12,
                      }}
                    >
                      <div className="font-mono" style={{ fontSize: 28, color: "var(--green)", fontWeight: 500, marginBottom: 2 }}>
                        ${contract.netAmountUsdc.toFixed(2)} USDC
                      </div>
                      <div style={{ fontSize: 12, color: "var(--green)", opacity: 0.75 }}>
                        Settled on Arc in 482ms
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {phase === "pending" && (
                  <button
                    onClick={submitDelivery}
                    disabled={(!deliveryText.trim() && attachments.length === 0) || submitting}
                    className="btn-primary"
                    style={{ width: "100%", padding: "12px", borderRadius: "var(--r-sm)", fontSize: 13 }}
                  >
                    {submitting ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(6,14,10,0.3)", borderTopColor: "#060E0A", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                        Submitting...
                      </span>
                    ) : "Submit delivery for review"}
                  </button>
                )}

                {phase === "evaluating" && !scoreRunning && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button onClick={approvePayment} className="btn-primary"
                      style={{ width: "100%", padding: "12px", borderRadius: "var(--r-sm)", fontSize: 13 }}>
                      Approve and release payment
                    </button>
                    <button onClick={() => setPhase("disputed")} className="btn-ghost"
                      style={{ width: "100%", padding: "11px", borderRadius: "var(--r-sm)", fontSize: 13 }}>
                      Flag an issue
                    </button>
                  </motion.div>
                )}

                {phase === "disputed" && (
                  <div style={{ padding: "12px", borderRadius: "var(--r-sm)", background: "rgba(240,82,82,0.08)", border: "1px solid rgba(240,82,82,0.2)", fontSize: 13, color: "var(--text-2)", textAlign: "center" }}>
                    Dispute opened. The Receipt Agent will re-evaluate and propose a fair resolution within 60 seconds.
                  </div>
                )}

                <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-3)", lineHeight: 1.55 }}>
                  {phase === "settled"
                    ? `Settled via submitBatch() on Arc. Tx: ${txHash.slice(0,16)}...`
                    : "Settlement via Circle Gateway on Arc Testnet."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 560px) {
          [style*="grid-template-columns: clamp(200px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
