"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/layout/Nav";
import PaymentOrb from "@/components/shared/PaymentOrb";
import Confetti from "@/components/shared/Confetti";
import { loadProfile } from "@/lib/profile";
import { toast } from "sonner";

type Phase = "pending" | "delivered" | "evaluating" | "approved" | "settled" | "disputed";
type ViewerRole = "worker" | "client" | "unknown";

interface ContractData {
  id: string;
  serviceId: string;
  brief: string;
  workerProposal: string;
  amountUsdc: number;
  netAmountUsdc: number;
  currency: "USDC" | "EURC";
  serviceTitle: string;
  serviceType: "service" | "job";
  workerName: string;
  workerAddress: string;
  payerName: string;
  deliveryNote: string;
  status: Phase;
  workerVerified?: boolean;
}

export default function EscrowPage() {
  const { id } = useParams<{ id: string }>();
  const fileRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase]               = useState<Phase>("pending");
  const [viewerRole, setViewerRole]     = useState<ViewerRole>("unknown");
  const [agentScore, setAgentScore]     = useState(0);
  const [scoreRunning, setScoreRunning] = useState(false);
  const [deliveryText, setDeliveryText] = useState("");
  const [attachments, setAttachments]   = useState<{ name: string; size: string }[]>([]);
  const [submitting, setSubmitting]     = useState(false);
  const [txHash, setTxHash]             = useState("");
  const [settlementMs, setSettlementMs] = useState(0);
  const [agentReasoning, setAgentReasoning] = useState("");
  const [agentModel, setAgentModel]     = useState("");
  const [x402Info, setX402Info]         = useState<{ paid: boolean; fee: string; payer: string } | null>(null);
  const [linkCopied, setLinkCopied]     = useState(false);
  const [refundMsg, setRefundMsg]       = useState("");
  const [displayReasoning, setDisplayReasoning] = useState("");
  const [typingDone, setTypingDone]     = useState(true);
  const [myRating, setMyRating]         = useState(0);
  const [hoverRating, setHoverRating]   = useState(0);
  const [ratingNote, setRatingNote]     = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [contractDates, setContractDates] = useState<{ created?: string; delivered?: string; settled?: string }>({});
  const [matches, setMatches]           = useState<{ name: string; title: string; slug: string; reason: string; jobsDone: number }[]>([]);
  const [matchesLoaded, setMatchesLoaded] = useState(false);
  const [showConfetti, setShowConfetti]   = useState(false);

  const [contract, setContract] = useState<ContractData>({
    id: id as string,
    serviceId: "",
    brief: "",
    workerProposal: "",
    amountUsdc: 0,
    netAmountUsdc: 0,
    currency: "USDC",
    serviceTitle: "Loading...",
    serviceType: "service",
    workerName: "",
    workerAddress: "",
    payerName: "",
    deliveryNote: "",
    status: "pending",
  });

  useEffect(() => {
    const profile = loadProfile();

    fetch(`/api/escrow?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data.clientName) return;

        const rawStatus = (data.status || "")
          .toLowerCase()
          .replace("pending_delivery", "pending")
          .replace("agent_evaluating", "evaluating") as Phase;

        const serviceType = data.service?.type || "service";
        const freelancerAddr = data.freelancer?.walletAddress || data.service?.freelancer?.walletAddress || "";
        const freelancerName = data.freelancer?.name || data.service?.freelancer?.name || "";

        // For SERVICE flow: freelancer = worker, clientName = payer
        // For JOB flow: freelancer = payer (posted the job), clientName = worker (accepted it)
        const isJob = serviceType === "job";
        const jobPending = isJob && (!data.clientName || data.clientName === "open");
        const workerName = isJob
          ? (jobPending ? "Awaiting acceptance" : data.clientName)
          : freelancerName;
        const workerAddress = isJob ? "" : freelancerAddr;
        const payerName = isJob ? freelancerName : data.clientName;

        const freelancerVerified = data.freelancer?.verified ?? data.service?.freelancer?.verified ?? false;
        const c: ContractData = {
          id: id as string,
          serviceId: data.serviceId || "",
          brief: data.brief,
          // For jobs, worker acceptance note is stored in clientEmail
          workerProposal: isJob ? (data.clientEmail || "") : "",
          amountUsdc: data.amountUsdc || 0,
          netAmountUsdc: data.netAmountUsdc || 0,
          currency: data.currency || "USDC",
          serviceTitle: data.service?.title || "Service",
          serviceType: isJob ? "job" : "service",
          workerName,
          workerAddress: workerAddress || freelancerAddr,
          payerName,
          deliveryNote: data.deliveryNote || "",
          status: rawStatus || "pending",
          workerVerified: isJob ? false : freelancerVerified,
        };
        setContract(c);
        if (rawStatus) setPhase(rawStatus);
        if (data.escrowTxHash) setTxHash(data.escrowTxHash);
        if (data.settleTxHash) setTxHash(data.settleTxHash);
        if (data.agentScore) setAgentScore(data.agentScore);
        if (data.agentReasoning) {
          setAgentReasoning(data.agentReasoning);
          setDisplayReasoning(data.agentReasoning);
          setTypingDone(true);
        }
        if (data.deliveryNote) setDeliveryText(data.deliveryNote);
        if (data.rating) { setMyRating(data.rating); setRatingSubmitted(true); }
        setContractDates({
          created: data.createdAt,
          delivered: data.deliveredAt || undefined,
          settled: data.settledAt || undefined,
        });

        // Determine viewer role based on service type
        const profileName = (profile.name || "").toLowerCase();
        const profileWallet = profile.walletAddress || "";

        if (isJob) {
          // JOB: clientName = worker (accepter), freelancer = client (poster)
          // When clientName is "open" (pre-acceptance), treat poster as client
          if (profileWallet && profileWallet === freelancerAddr) {
            setViewerRole("client");
          } else if (profileName && profileName === freelancerName?.toLowerCase()) {
            setViewerRole("client");
          } else if (!jobPending && profileName && profileName === data.clientName?.toLowerCase()) {
            setViewerRole("worker");
          } else {
            setViewerRole(profile.role === "worker" ? "worker" : profile.role === "client" ? "client" : "unknown");
          }
        } else {
          // SERVICE: freelancer = worker, clientName = client
          if (profileWallet && profileWallet === freelancerAddr) {
            setViewerRole("worker");
          } else if (profileName && profileName === freelancerName?.toLowerCase()) {
            setViewerRole("worker");
          } else if (profileName && profileName === data.clientName?.toLowerCase()) {
            setViewerRole("client");
          } else {
            setViewerRole(profile.role === "worker" ? "worker" : profile.role === "client" ? "client" : "unknown");
          }
        }
      })
      .catch(() => {});
  }, [id]);

  function handleFileAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files.map(f => ({
      name: f.name,
      size: f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`,
    }))]);
  }

  async function submitDelivery() {
    if (!deliveryText.trim() && attachments.length === 0) return;
    setSubmitting(true);
    setPhase("delivered");

    toast("Delivery submitted — agent is reviewing...", { icon: "🤖" });

    setTimeout(async () => {
      setPhase("evaluating");
      setScoreRunning(true);

      try {
        // Build x402 payment proof header ($0.01 USDC evaluation fee)
        const profile = loadProfile();
        const x402Payload = btoa(JSON.stringify({
          authorization: {
            from: profile.walletAddress || "client",
            asset: contract.currency === "EURC"
              ? "0x3700000000000000000000000000000000000000"
              : "0x3600000000000000000000000000000000000000",
            amount: "10000",
            network: "eip155:5042002",
            protocol: "x402",
          },
        }));

        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Payment": x402Payload },
          body: JSON.stringify({
            contractId: id,
            deliveryNote: deliveryText || `[Attachments: ${attachments.map(a => a.name).join(", ")}]`,
            brief: contract.brief,
            priceUsdc: contract.amountUsdc,
          }),
        });
        const data = await res.json();
        const score = data.evaluation?.score || 50;
        const reasoning = data.evaluation?.reasoning || "Delivery reviewed.";
        const model = data.evaluation?.model || "";

        setAgentReasoning(reasoning);
        if (model) setAgentModel(model);
        if (data.x402?.paid) setX402Info({ paid: true, fee: data.x402.fee, payer: data.x402.payer });

        // Typewriter: reveal reasoning char-by-char, then animate the score bar
        setDisplayReasoning("");
        setTypingDone(false);
        let charIdx = 0;
        const typingTimer = setInterval(() => {
          charIdx++;
          setDisplayReasoning(reasoning.slice(0, charIdx));
          if (charIdx >= reasoning.length) {
            clearInterval(typingTimer);
            setTypingDone(true);
            let s = 0;
            const scoreTimer = setInterval(() => {
              s = Math.min(s + 1.5, score);
              setAgentScore(Math.round(s));
              if (s >= score) {
                clearInterval(scoreTimer);
                setScoreRunning(false);
                if (data.autoSettled) {
                  if (data.txHash) setTxHash(data.txHash);
                  if (data.settlementMs) setSettlementMs(data.settlementMs);
                  setPhase("settled");
                  setShowConfetti(true);
                  toast.success(`Payment settled in ${data.settlementMs || 0}ms on Arc`, { duration: 5000 });
                  setTimeout(() => setShowConfetti(false), 4000);
                } else {
                  setPhase("delivered");
                }
              }
            }, 22);
          }
        }, 16);
      } catch (err) {
        console.error("Agent evaluation failed:", err);
        const errMsg = "Evaluation encountered an error. Client can manually approve or flag the delivery.";
        setAgentReasoning(errMsg);
        setDisplayReasoning(errMsg);
        setTypingDone(true);
        setAgentScore(50);
        setScoreRunning(false);
      }

      setSubmitting(false);
    }, 1000);
  }

  async function approvePayment() {
    setPhase("approved");
    try {
      const res = await fetch("/api/agent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: id,
          action: "APPROVE",
          freelancerAddress: contract.workerAddress,
          netAmountUsdc: contract.netAmountUsdc,
          currency: contract.currency,
        }),
      });
      const data = await res.json();
      if (data.txHash) setTxHash(data.txHash);
      if (data.settlementMs) setSettlementMs(data.settlementMs);
      setTimeout(() => {
        const settled = data.settled !== false;
        setPhase(settled ? "settled" : "disputed");
        if (settled) {
          setShowConfetti(true);
          toast.success(`Payment released in ${data.settlementMs || 0}ms`, { duration: 5000 });
          setTimeout(() => setShowConfetti(false), 4000);
        }
      }, 600);
    } catch (err) {
      console.error("Settlement failed:", err);
      setTimeout(() => setPhase("disputed"), 600);
    }
  }

  async function disputeContract() {
    try {
      await fetch("/api/agent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: id, action: "DISPUTE" }),
      });
    } catch {}
    setPhase("disputed");
  }

  async function requestRefund() {
    try {
      const res = await fetch("/api/agent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: id, action: "REFUND", currency: contract.currency }),
      });
      const data = await res.json();
      if (data.settled) {
        if (data.txHash) setTxHash(data.txHash);
        if (data.settlementMs) setSettlementMs(data.settlementMs);
        setPhase("settled");
      } else {
        setRefundMsg(data.message || "Refund request submitted. Platform team will follow up.");
      }
    } catch {
      setRefundMsg("Refund request submitted. Platform team will follow up.");
    }
  }

  async function submitRating() {
    if (!myRating) return;
    try {
      await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: id, rating: myRating, note: ratingNote }),
      });
      setRatingSubmitted(true);
      toast.success("Rating submitted");
    } catch {}
  }

  // Fetch AI-suggested workers when a job is pending and client is viewing
  useEffect(() => {
    if (matchesLoaded || contract.serviceType !== "job" || contract.workerName !== "Awaiting acceptance" || viewerRole !== "client" || !contract.brief || !contract.serviceId) return;
    setMatchesLoaded(true);
    fetch("/api/agent/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief: contract.brief, serviceId: contract.serviceId }),
    })
      .then(r => r.json())
      .then(d => { if (d.matches?.length) setMatches(d.matches); })
      .catch(() => {});
  }, [contract.brief, contract.workerName, contract.serviceType, contract.serviceId, viewerRole, matchesLoaded]);

  function copyContractLink() {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setLinkCopied(true);
    toast("Contract link copied");
    setTimeout(() => setLinkCopied(false), 2200);
  }

  const orbState = phase === "settled" || phase === "approved" ? "released"
    : (phase === "pending" || phase === "delivered" || phase === "evaluating") ? "locked"
    : "idle";

  const sym = contract.currency === "EURC" ? "€" : "$";
  const isWorker = viewerRole === "worker";
  const isClient = viewerRole === "client";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {showConfetti && <Confetti />}
      <Nav />

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(80px,12vw,100px) 20px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "3px 10px", borderRadius: 999,
              background: "rgba(255,255,255,.025)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,.08)",
              fontSize: 11, fontFamily: '"DM Mono", monospace', color: "var(--text-3)",
            }}>
              Contract #{(id as string)?.slice(0, 8)}
            </div>
            <button onClick={copyContractLink} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 10px", borderRadius: 999, cursor: "pointer",
              background: linkCopied ? "rgba(0,229,195,0.1)" : "rgba(255,255,255,.025)",
              border: `1px solid ${linkCopied ? "rgba(0,229,195,0.3)" : "rgba(255,255,255,.08)"}`,
              color: linkCopied ? "var(--green)" : "var(--text-3)",
              fontSize: 11, transition: "all 0.2s ease",
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {linkCopied
                  ? <polyline points="20 6 9 17 4 12" />
                  : <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>}
              </svg>
              {linkCopied ? "Copied" : "Share"}
            </button>
          </div>
          <h1 style={{ fontSize: "clamp(18px,3vw,24px)", fontWeight: 700, letterSpacing: "-0.04em", marginBottom: 4 }}>
            {contract.serviceTitle}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 14, color: "var(--text-2)" }}>
            <span>
              {isWorker ? `Client: ${contract.payerName}` : `Worker: ${contract.workerName}`}
            </span>
            {!isWorker && contract.workerVerified && contract.workerName !== "Awaiting acceptance" && (
              <span title="Verified worker" style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
                background: "rgba(0,229,195,0.12)", color: "var(--green)",
                border: "1px solid rgba(0,229,195,0.25)", letterSpacing: "0.05em",
              }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                VERIFIED
              </span>
            )}
          </div>
          {viewerRole !== "unknown" && (
            <div style={{
              display: "inline-block", marginTop: 6,
              padding: "2px 10px", borderRadius: 999, fontSize: 10.5, fontWeight: 600,
              background: isWorker ? "var(--green-dim)" : "rgba(0,229,195,0.06)",
              color: isWorker ? "var(--green)" : "var(--accent)",
              border: `1px solid ${isWorker ? "var(--green-border)" : "var(--green-border)"}`,
            }}>
              Viewing as {isWorker ? "Worker" : "Client"}
            </div>
          )}
        </div>

        {/* Main card */}
        <div style={{
          background: "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.030) 0%, rgba(255,255,255,.012) 100%)",
          backdropFilter: "blur(30px) saturate(180%)",
          WebkitBackdropFilter: "blur(30px) saturate(180%)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 28,
          boxShadow: "0 16px 40px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08)",
          overflow: "hidden",
        }}>
          <div className="strip">
            {["Circle Gateway","Arc Testnet","USDC · EURC","x402 Protocol"].map(s => (
              <span key={s}><span className="strip-dot"/>{s}</span>
            ))}
          </div>

          <div className="escrow-grid" style={{ display: "grid", gridTemplateColumns: "clamp(200px,35%,240px) 1fr" }}>

            {/* Left: Orb + details */}
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 12,
              padding: "28px 16px",
              borderRight: "1px solid var(--line)",
            }}>
              <div style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center", minHeight: 16 }}>
                {phase === "pending"    && (isWorker ? "Submit your work" : "Awaiting delivery")}
                {phase === "delivered"  && (isClient ? "Review delivery" : "Delivery submitted")}
                {phase === "evaluating" && "Agent reviewing"}
                {phase === "approved"   && "Releasing payment"}
                {phase === "settled"    && "Payment cleared"}
                {phase === "disputed"   && "Under review"}
              </div>

              <PaymentOrb amount={contract.amountUsdc} state={orbState} size={150} currency={contract.currency} />

              <div className={
                phase === "settled" ? "pill pill-green"
                : (phase === "pending" || phase === "delivered" || phase === "evaluating") ? "pill pill-amber"
                : "pill pill-muted"
              }>
                <span className="pill-dot" style={{
                  animation: (phase === "pending" || phase === "evaluating") ? "pulse-dot 1.5s ease-in-out infinite" : "none"
                }} />
                {phase === "pending"    && "Funds locked"}
                {phase === "delivered"  && (isClient ? "Needs your review" : "Awaiting client review")}
                {phase === "evaluating" && "Agent reviewing"}
                {phase === "approved"   && "Releasing"}
                {phase === "settled"    && "Settled on Arc"}
                {phase === "disputed"   && "Disputed"}
              </div>

              <div style={{ width: "100%", fontSize: 11.5 }}>
                {[
                  ["Contract",    `${sym}${contract.amountUsdc.toFixed(2)} ${contract.currency}`],
                  ["Fee",         "10%"],
                  [isWorker ? "You receive" : "Worker receives", `${sym}${contract.netAmountUsdc.toFixed(2)} ${contract.currency}`],
                  ["Chain",       "Arc Testnet"],
                ].map(([k, v]) => (
                  <div key={k} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}>
                    <span style={{ color: "var(--text-3)" }}>{k}</span>
                    <span className="font-mono" style={{ color: (k as string).includes("receive") ? "var(--green)" : "var(--text-2)" }}>{v}</span>
                  </div>
                ))}
                {txHash && (
                  <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noreferrer"
                    style={{ display: "block", marginTop: 6, fontSize: 10.5, color: "var(--green)", wordBreak: "break-all", fontFamily: '"DM Mono", monospace', textDecoration: "underline" }}>
                    Tx: {txHash.slice(0, 20)}... ↗
                  </a>
                )}
                {settlementMs > 0 && (
                  <div style={{ marginTop: 4, fontSize: 10.5, color: "var(--green)", fontFamily: '"DM Mono", monospace' }}>
                    Settled in {settlementMs}ms
                  </div>
                )}
              </div>
            </div>

            {/* Right: Flow */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}>
              <div>
                {/* Brief / Job requirements */}
                <div style={{
                  padding: "12px 14px", borderRadius: "var(--r)",
                  background: "rgba(0,0,0,0.2)", border: "1px solid var(--line)",
                  marginBottom: contract.workerProposal ? 8 : 12,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 7 }}>
                    {isWorker ? "Job requirements" : "Your brief"}
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.65, color: "var(--text-2)", fontStyle: "italic", paddingLeft: 10, borderLeft: "2px solid rgba(255,255,255,0.08)" }}>
                    {contract.brief}
                  </div>
                </div>

                {/* Worker acceptance note (job flow only) */}
                {contract.workerProposal && (
                  <div style={{
                    padding: "12px 14px", borderRadius: "var(--r)",
                    background: "rgba(0,229,195,0.03)", border: "1px solid rgba(0,229,195,0.1)",
                    marginBottom: 12,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "var(--green)", textTransform: "uppercase", marginBottom: 7 }}>
                      Worker acceptance note
                    </div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.65, color: "var(--text-2)", fontStyle: "italic", paddingLeft: 10, borderLeft: "2px solid rgba(0,229,195,0.2)" }}>
                      {contract.workerProposal}
                    </div>
                  </div>
                )}

                {/* WORKER: Delivery input (only in pending phase) */}
                <AnimatePresence>
                  {phase === "pending" && isWorker && (
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
                      <div style={{ marginBottom: 10 }}>
                        <button onClick={() => fileRef.current?.click()}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "6px 12px", borderRadius: "var(--r-sm)",
                            background: "rgba(255,255,255,0.05)", border: "1px solid var(--line)",
                            color: "var(--text-2)", fontSize: 12.5, cursor: "pointer",
                          }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                          </svg>
                          Attach files
                        </button>
                        <input ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.md,.zip" onChange={handleFileAttach} style={{ display: "none" }} />
                      </div>
                      {attachments.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 8 }}>
                          {attachments.map((a, i) => (
                            <div key={i} style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "6px 10px", borderRadius: "var(--r-sm)",
                              background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)", fontSize: 12,
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

                {/* CLIENT: Waiting for worker to deliver */}
                {phase === "pending" && isClient && (
                  <div style={{
                    padding: "16px", borderRadius: "var(--r)",
                    background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 4 }}>
                      {contract.workerName === "Awaiting acceptance" ? "Waiting for a worker" : "Waiting for delivery"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                      {contract.workerName === "Awaiting acceptance"
                        ? "Budget is locked. Share the job link so workers can accept and start."
                        : `${contract.workerName} is working on your job. You'll be able to review and approve once they submit.`}
                    </div>
                  </div>
                )}

                {/* CLIENT: See worker's delivery for review */}
                {(phase === "delivered" || phase === "evaluating" || phase === "settled" || phase === "approved") && isClient && deliveryText && (
                  <div style={{
                    padding: "12px 14px", borderRadius: "var(--r)",
                    background: "rgba(0,0,0,0.2)", border: "1px solid var(--line)",
                    marginBottom: 12,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 7 }}>
                      Worker&apos;s delivery
                    </div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.65, color: "var(--text-2)", paddingLeft: 10, borderLeft: "2px solid rgba(0,229,195,0.2)" }}>
                      {deliveryText}
                    </div>
                  </div>
                )}

                {/* WORKER: delivery submitted, waiting for client */}
                {(phase === "delivered" || phase === "evaluating") && isWorker && !scoreRunning && (
                  <div style={{
                    padding: "12px 14px", borderRadius: "var(--r)",
                    background: "rgba(0,229,195,0.04)", border: "1px solid var(--green-border)",
                    marginBottom: 12, textAlign: "center",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 4 }}>
                      Delivery submitted
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                      Waiting for {contract.payerName} to review and approve your work.
                    </div>
                  </div>
                )}

                {/* Agent evaluation (visible to both) */}
                <AnimatePresence>
                  {(phase === "evaluating" || phase === "delivered" || phase === "settled" || phase === "approved") && (agentScore > 0 || displayReasoning) && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: "12px 14px", borderRadius: "var(--r)",
                        background: "rgba(0,229,195,0.04)",
                        border: "1px solid rgba(0,229,195,0.14)",
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: 7,
                          background: "rgba(0,229,195,0.12)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="var(--green)">
                            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                          </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>Receipt Agent</div>
                          <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>
                            {agentModel ? `Model: ${agentModel}` : "AI Escrow Arbiter"}
                          </div>
                        </div>
                        {x402Info?.paid && (
                          <div style={{
                            display: "flex", alignItems: "center", gap: 4,
                            padding: "3px 8px", borderRadius: 999,
                            background: "rgba(0,229,195,0.08)",
                            border: "1px solid rgba(0,229,195,0.2)",
                            fontSize: 9.5, fontWeight: 600,
                            color: "var(--green)", letterSpacing: "0.04em",
                            fontFamily: '"DM Mono", monospace',
                          }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
                            x402 · {x402Info.fee}
                          </div>
                        )}
                      </div>

                      {!typingDone ? (
                        <div style={{ fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 4 }}>
                          {displayReasoning}
                          <span style={{
                            display: "inline-block", width: 1.5, height: "1em",
                            verticalAlign: "text-bottom", background: "var(--green)",
                            marginLeft: 2, animation: "cursor-blink 0.65s step-end infinite",
                          }} />
                        </div>
                      ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          {agentReasoning && (
                            <div style={{ fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 8 }}>
                              {agentReasoning}
                            </div>
                          )}
                          {agentScore > 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                                <motion.div
                                  style={{ height: "100%", borderRadius: 999, background: "#00E5C3" }}
                                  initial={{ width: "0%" }}
                                  animate={{ width: `${agentScore}%` }}
                                  transition={{ duration: 0.7, ease: "easeOut" }}
                                />
                              </div>
                              <span className="font-mono" style={{ fontSize: 12, color: "var(--green)", minWidth: 34 }}>{agentScore}%</span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* AI-suggested workers (pending job, client view) */}
                {phase === "pending" && isClient && contract.workerName === "Awaiting acceptance" && matches.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "var(--green)", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>
                      Receipt AI suggests
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {matches.map((m, i) => (
                        <a key={i} href={`/hire/${m.slug}`}
                          style={{
                            display: "block", padding: "10px 12px", borderRadius: "var(--r-sm)",
                            background: "rgba(0,229,195,0.03)", border: "1px solid rgba(0,229,195,0.1)",
                            textDecoration: "none", transition: "border-color 0.2s ease",
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(0,229,195,0.25)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(0,229,195,0.1)"; }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>{m.name}</span>
                            <span style={{ fontSize: 10, color: "var(--green)", fontFamily: '"DM Mono", monospace' }}>Match {i + 1}</span>
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 3 }}>{m.title}</div>
                          <div style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.5, fontStyle: "italic" }}>{m.reason}</div>
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Rating (after settled, client only) */}
                {phase === "settled" && isClient && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: "12px 14px", borderRadius: "var(--r)",
                      background: "rgba(255,255,255,0.025)", border: "1px solid var(--line)",
                      marginBottom: 12,
                    }}>
                    {ratingSubmitted ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-2)" }}>
                        <div style={{ display: "flex", gap: 2 }}>
                          {[1,2,3,4,5].map(s => (
                            <span key={s} style={{ fontSize: 14, color: s <= myRating ? "#FFB800" : "rgba(255,255,255,0.12)" }}>★</span>
                          ))}
                        </div>
                        Rating submitted
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 8 }}>
                          Rate this work
                        </div>
                        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                          {[1,2,3,4,5].map(star => (
                            <button key={star}
                              onClick={() => setMyRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              style={{
                                fontSize: 22, background: "none", border: "none", cursor: "pointer",
                                padding: "0 2px", lineHeight: 1,
                                color: star <= (hoverRating || myRating) ? "#FFB800" : "rgba(255,255,255,0.15)",
                                transition: "color 0.1s ease",
                              }}>★</button>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Add a note (optional)"
                          value={ratingNote}
                          onChange={e => setRatingNote(e.target.value)}
                          className="input"
                          style={{ fontSize: 12, padding: "8px 10px", marginBottom: 8, background: "rgba(0,0,0,0.2)" }}
                        />
                        <button
                          onClick={submitRating}
                          disabled={!myRating}
                          style={{
                            padding: "7px 14px", borderRadius: "var(--r-sm)", fontSize: 12, fontWeight: 600,
                            background: myRating ? "var(--green-dim)" : "rgba(255,255,255,0.04)",
                            border: `1px solid ${myRating ? "var(--green-border)" : "var(--line)"}`,
                            color: myRating ? "var(--green)" : "var(--text-3)",
                            cursor: myRating ? "pointer" : "default",
                          }}>
                          Submit rating
                        </button>
                      </>
                    )}
                  </motion.div>
                )}

                {/* Settled */}
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
                        {sym}{contract.netAmountUsdc.toFixed(2)} {contract.currency}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--green)", opacity: 0.75 }}>
                        {isWorker ? "Payment received" : "Payment released to worker"}
                        {settlementMs > 0 && ` in ${settlementMs}ms`}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Contract timeline */}
              {contractDates.created && (
                <div style={{ marginTop: 8, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 10 }}>
                    Timeline
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {([
                      { label: "Funded",    date: contractDates.created, done: true },
                      { label: "Delivered", date: contractDates.delivered, done: !!contractDates.delivered },
                      { label: "Settled",   date: contractDates.settled,  done: !!contractDates.settled },
                    ] as { label: string; date?: string; done: boolean }[]).map((ev, i, arr) => (
                      <div key={i} style={{ display: "flex", gap: 10 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 14 }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                            background: ev.done ? "var(--green)" : "rgba(255,255,255,0.1)",
                            border: `1px solid ${ev.done ? "var(--green)" : "var(--line)"}`,
                            boxShadow: ev.done ? "0 0 6px rgba(0,229,195,0.35)" : "none",
                          }} />
                          {i < arr.length - 1 && (
                            <div style={{ width: 1, flex: 1, minHeight: 12, background: ev.done ? "rgba(0,229,195,0.25)" : "var(--line)", margin: "2px 0" }} />
                          )}
                        </div>
                        <div style={{ paddingBottom: 10, paddingTop: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 500, color: ev.done ? "var(--text-2)" : "var(--text-3)" }}>{ev.label}</div>
                          {ev.date && (
                            <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: '"DM Mono", monospace' }}>
                              {new Date(ev.date).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* WORKER: Submit delivery */}
                {phase === "pending" && isWorker && (
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

                {/* CLIENT: Approve / Dispute (after delivery submitted) */}
                {(phase === "evaluating" || phase === "delivered") && isClient && !scoreRunning && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button onClick={approvePayment} className="btn-primary"
                      style={{ width: "100%", padding: "12px", borderRadius: "var(--r-sm)", fontSize: 13 }}>
                      Approve and release {sym}{contract.netAmountUsdc.toFixed(2)} {contract.currency}
                    </button>
                    <button onClick={disputeContract} className="btn-ghost"
                      style={{ width: "100%", padding: "11px", borderRadius: "var(--r-sm)", fontSize: 13 }}>
                      Flag an issue
                    </button>
                  </motion.div>
                )}

                {phase === "disputed" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ padding: "12px", borderRadius: "var(--r-sm)", background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)", fontSize: 13, color: "var(--text-2)", textAlign: "center" }}>
                      {refundMsg || "Dispute opened. Both parties can review the contract details and reach a resolution."}
                    </div>
                    {isClient && !refundMsg && (
                      <button onClick={requestRefund} className="btn-ghost"
                        style={{ width: "100%", padding: "11px", borderRadius: "var(--r-sm)", fontSize: 13, borderColor: "rgba(255,68,68,0.3)", color: "var(--red)" }}>
                        Request refund
                      </button>
                    )}
                  </div>
                )}

                <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-3)", lineHeight: 1.55 }}>
                  {phase === "settled" && txHash
                    ? <span>Settled on Arc. <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noreferrer" style={{ color: "var(--green)", textDecoration: "underline" }}>View on ArcScan ↗</a></span>
                    : "Settlement via Circle Gateway on Arc Testnet."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
}
