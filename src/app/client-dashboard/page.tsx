"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Nav from "@/components/layout/Nav";
import { loadProfile, getInitials } from "@/lib/profile";
import { timeAgo } from "@/lib/utils";

interface ClientContract {
  id: string;
  serviceTitle: string;
  freelancerName: string;
  brief: string;
  amountUsdc: number;
  currency: string;
  status: string;
  createdAt: string;
  agentScore?: number;
  txHash?: string;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; action?: string }> = {
  pending:    { label: "Awaiting delivery", color: "var(--amber)", bg: "var(--amber-dim)" },
  delivered:  { label: "Needs your review", color: "var(--blue)",  bg: "var(--blue-dim)", action: "Review now" },
  evaluating: { label: "Agent reviewing",   color: "var(--blue)",  bg: "var(--blue-dim)" },
  settled:    { label: "Completed",         color: "var(--green)", bg: "var(--green-dim)" },
  disputed:   { label: "Disputed",          color: "var(--red)",   bg: "rgba(255,68,68,0.1)" },
};

export default function ClientDashboardPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<ClientContract[]>([]);
  const [profile, setProfile] = useState({ name: "Client", walletAddress: "", bio: "", avatarColor: "#00E5C3", avatarUrl: null as string | null });

  useEffect(() => {
    const p = loadProfile();
    if (p.name) setProfile({ name: p.name, walletAddress: p.walletAddress, bio: p.bio, avatarColor: p.avatarColor, avatarUrl: p.avatarUrl });

    if (!p.name) return;

    const params = new URLSearchParams({ role: "client", clientName: p.name });
    if (p.walletAddress) params.set("wallet", p.walletAddress);

    fetch(`/api/contracts?${params}`)
      .then(r => r.ok ? r.json() : { contracts: [] })
      .then(data => {
        const apiContracts: ClientContract[] = (data.contracts || []).map((c: any) => {
          const isJob = c.service?.type === "job";
          return {
            id: c.id,
            serviceTitle: c.service?.title || "Service",
            freelancerName: isJob ? c.clientName : (c.service?.freelancer?.name || "Worker"),
            brief: c.brief,
            amountUsdc: c.amountUsdc,
            currency: c.currency || "USDC",
            status: (c.status || "").toLowerCase().replace("pending_delivery", "pending").replace("agent_evaluating", "evaluating"),
            createdAt: c.createdAt,
            agentScore: c.agentScore,
            txHash: c.settleTxHash,
          };
        });
        setContracts(apiContracts);
      })
      .catch(() => {});
  }, []);

  const total    = contracts.reduce((s, c) => s + (c.amountUsdc || 0), 0);
  const settled  = contracts.filter(c => c.status === "settled");
  const needsReview = contracts.filter(c => c.status === "delivered" || c.status === "evaluating");
  const pending  = contracts.filter(c => c.status === "pending");
  const initials = getInitials(profile.name);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "clamp(80px,12vw,100px) 20px 60px" }}>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

          {/* Profile card */}
          <div style={{
            display: "flex", alignItems: "center", gap: 16, padding: "20px 24px",
            background: "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.030) 0%, rgba(255,255,255,.012) 100%)",
            backdropFilter: "blur(30px) saturate(180%)",
            WebkitBackdropFilter: "blur(30px) saturate(180%)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 28,
            boxShadow: "0 16px 40px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08)",
            marginBottom: 20,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
              background: profile.avatarUrl ? "transparent" : profile.avatarColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 700, color: "#060E0A",
              border: "2px solid var(--line)", overflow: "hidden",
            }}>
              {profile.avatarUrl
                ? <img src={profile.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em" }}>{profile.name}</h1>
                <span className="pill pill-blue" style={{ fontSize: 10 }}><span className="pill-dot" />Client</span>
              </div>
              {profile.bio && <div style={{ fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.bio}</div>}
              {profile.walletAddress && (
                <div className="font-mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                  {profile.walletAddress.slice(0, 10)}...{profile.walletAddress.slice(-6)}
                </div>
              )}
            </div>
            <button onClick={() => router.push("/profile")} className="btn-ghost"
              style={{ padding: "8px 14px", borderRadius: "var(--r-sm)", fontSize: 12, flexShrink: 0 }}>
              Edit
            </button>
          </div>

          {/* Needs review alert */}
          {needsReview.length > 0 && (
            <div style={{
              padding: "14px 18px", borderRadius: "var(--r-lg)", marginBottom: 16,
              background: "rgba(0,229,195,0.04)", border: "1px solid var(--green-border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
                  {needsReview.length} delivery{needsReview.length > 1 ? "ies" : ""} ready for review
                </div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                  Workers have submitted — review and approve to release payment.
                </div>
              </div>
              <button onClick={() => router.push(`/escrow/${needsReview[0].id}`)} className="btn-primary"
                style={{ padding: "8px 16px", borderRadius: "var(--r-sm)", fontSize: 12, flexShrink: 0 }}>
                Review
              </button>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Total spent",      value: `$${total.toFixed(2)}`, color: "var(--text-1)" },
              { label: "Jobs completed",   value: String(settled.length),   color: "var(--green)" },
              { label: "Needs review",     value: String(needsReview.length), color: "var(--accent)" },
              { label: "In progress",      value: String(pending.length),  color: "var(--amber)" },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "18px 20px",
                background: "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.030) 0%, rgba(255,255,255,.012) 100%)",
                backdropFilter: "blur(30px) saturate(180%)",
                WebkitBackdropFilter: "blur(30px) saturate(180%)",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 16,
                boxShadow: "0 16px 40px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08)",
              }}>
                <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{s.label}</div>
                <div className="font-mono" style={{ fontSize: 24, fontWeight: 500, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            <button onClick={() => router.push("/setup")} className="btn-primary"
              style={{ padding: "10px 20px", borderRadius: "var(--r-sm)", fontSize: 13 }}>
              Post a job
            </button>
            <button onClick={() => router.push("/marketplace")} className="btn-ghost"
              style={{ padding: "10px 20px", borderRadius: "var(--r-sm)", fontSize: 13 }}>
              Browse workers
            </button>
          </div>

          {/* Contract list */}
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Your contracts</div>

          {contracts.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              background: "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.030) 0%, rgba(255,255,255,.012) 100%)",
              backdropFilter: "blur(30px) saturate(180%)",
              WebkitBackdropFilter: "blur(30px) saturate(180%)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 28,
              boxShadow: "0 16px 40px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08)",
            }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "rgba(255,255,255,.3)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="15" /><line x1="10.5" y1="13.5" x2="13.5" y2="13.5" />
                </svg>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No contracts yet</div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", marginBottom: 24, lineHeight: 1.65 }}>
                Hire a worker or post a job to start.
              </p>
              <button onClick={() => router.push("/marketplace")} className="btn-primary"
                style={{ padding: "12px 24px", borderRadius: "var(--r-sm)" }}>
                Browse marketplace
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {contracts.map((c, i) => {
                const st = STATUS_CFG[c.status] || STATUS_CFG.pending;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => router.push(`/escrow/${c.id}`)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 16px", borderRadius: 20,
                      background: "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.030) 0%, rgba(255,255,255,.012) 100%)",
                      backdropFilter: "blur(30px) saturate(180%)",
                      WebkitBackdropFilter: "blur(30px) saturate(180%)",
                      border: `1px solid ${st.action ? "rgba(0,229,195,0.22)" : "rgba(255,255,255,.08)"}`,
                      boxShadow: "0 12px 32px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.08)",
                      cursor: "pointer",
                      transition: "transform 500ms cubic-bezier(0.34,1.4,0.64,1), border-color 280ms ease, background 280ms ease, box-shadow 400ms ease",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,.13)";
                      (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(135deg, rgba(255,255,255,.06) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.050) 0%, rgba(255,255,255,.025) 100%)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 24px 56px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.12)";
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = st.action ? "rgba(0,229,195,0.22)" : "rgba(255,255,255,.08)";
                      (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.030) 0%, rgba(255,255,255,.012) 100%)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.08)";
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: st.bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: st.color }}>
                      {c.status === "settled" ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      ) : c.status === "disputed" ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" /></svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.serviceTitle}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}>
                        {c.freelancerName}{c.agentScore ? ` · Agent: ${c.agentScore}%` : ""} · {timeAgo(new Date(c.createdAt || Date.now()))}
                      </div>
                    </div>
                    <div style={{ padding: "2px 9px", borderRadius: 999, background: st.bg, color: st.color, fontSize: 10.5, fontWeight: 600, flexShrink: 0 }}>
                      {st.action || st.label}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div className="font-mono" style={{ fontSize: 13, color: "var(--text-1)" }}>
                        {c.currency === "EURC" ? "€" : "$"}{c.amountUsdc?.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-3)" }}>{c.currency || "USDC"}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
