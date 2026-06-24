"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Nav from "@/components/layout/Nav";
import { loadProfile } from "@/lib/profile";
import { timeAgo } from "@/lib/utils";

export default function WorkerDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: "Freelancer", walletAddress: "" });
  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    const p = loadProfile();
    if (p.name) setProfile({ name: p.name, walletAddress: p.walletAddress });

    if (!p.walletAddress) return;

    fetch(`/api/contracts?role=worker&wallet=${encodeURIComponent(p.walletAddress)}`)
      .then(r => r.ok ? r.json() : { contracts: [] })
      .then(data => {
        const apiContracts = (data.contracts || []).map((c: any) => ({
          id: c.id,
          clientName: c.clientName,
          brief: c.brief,
          amountUsdc: c.amountUsdc,
          netAmountUsdc: c.netAmountUsdc,
          currency: c.currency || "USDC",
          serviceTitle: c.service?.title || "Service",
          status: (c.status || "").toLowerCase().replace("pending_delivery", "pending").replace("agent_evaluating", "evaluating"),
          agentScore: c.agentScore,
          createdAt: c.createdAt,
        }));
        setContracts(apiContracts);
      })
      .catch(() => {});
  }, []);

  const totalEarned = contracts.filter(c => c.status === "settled").reduce((s, c) => s + (c.netAmountUsdc || 0), 0);
  const pending     = contracts.filter(c => c.status === "pending" || c.status === "delivered");
  const settled     = contracts.filter(c => c.status === "settled");

  const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
    pending:    { label: "Awaiting delivery", color: "var(--amber)", bg: "var(--amber-dim)" },
    delivered:  { label: "Submitted",         color: "var(--blue)",  bg: "var(--blue-dim)" },
    evaluating: { label: "Agent reviewing",   color: "var(--blue)",  bg: "var(--blue-dim)" },
    settled:    { label: "Paid",              color: "var(--green)", bg: "var(--green-dim)" },
    disputed:   { label: "Disputed",          color: "var(--red)",   bg: "rgba(240,82,82,0.1)" },
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "clamp(80px,12vw,100px) 20px 60px" }}>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 8 }}>
              Freelancer dashboard
            </div>
            <h1 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 4 }}>
              Good day, {profile.name.split(" ")[0]}.
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-2)" }}>
              Your earnings and contract history.
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 10, marginBottom: 28 }}>
            {[
              { label: "Total earned",      value: `$${totalEarned.toFixed(2)}`, color: "var(--green)" },
              { label: "Contracts settled", value: String(settled.length),        color: "var(--text-1)" },
              { label: "Pending payment",   value: String(pending.length),        color: "var(--amber)" },
              { label: "Total contracts",   value: String(contracts.length),      color: "var(--text-1)" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "18px 20px", background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)" }}>
                <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{s.label}</div>
                <div className="font-mono" style={{ fontSize: 24, fontWeight: 500, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            <button onClick={() => router.push("/setup")} className="btn-primary"
              style={{ padding: "10px 20px", borderRadius: "var(--r-sm)", fontSize: 13 }}>
              Create new service
            </button>
            <button onClick={() => router.push("/profile")} className="btn-ghost"
              style={{ padding: "10px 20px", borderRadius: "var(--r-sm)", fontSize: 13 }}>
              Edit profile
            </button>
          </div>

          {/* Wallet info */}
          {profile.walletAddress && (
            <div style={{ padding: "12px 16px", borderRadius: "var(--r-lg)", background: "var(--green-dim)", border: "1px solid var(--green-border)", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 600, marginBottom: 3 }}>Your payment wallet</div>
                <div className="font-mono" style={{ fontSize: 12, color: "var(--text-2)", wordBreak: "break-all" }}>{profile.walletAddress}</div>
              </div>
              <div className="font-mono" style={{ fontSize: 24, fontWeight: 500, color: "var(--green)", flexShrink: 0 }}>
                ${totalEarned.toFixed(2)}
              </div>
            </div>
          )}

          {/* Contract history */}
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Contract history</div>

          {contracts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>📭</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No contracts yet</div>
              <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24 }}>
                Create a service link and share it with clients to start getting paid.
              </p>
              <button onClick={() => router.push("/setup")} className="btn-primary"
                style={{ padding: "12px 24px", borderRadius: "var(--r-sm)" }}>
                Create service link
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {contracts.map((c, i) => {
                const st = STATUS_CFG[c.status] || STATUS_CFG.pending;
                return (
                  <motion.div
                    key={c.id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => router.push(`/escrow/${c.id}`)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 16px", borderRadius: "var(--r-lg)",
                      background: "var(--card)", border: "1px solid var(--line)",
                      cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "var(--line-2)";
                      (e.currentTarget as HTMLDivElement).style.background = "var(--card-2)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "var(--line)";
                      (e.currentTarget as HTMLDivElement).style.background = "var(--card)";
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: st.bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: st.color, fontSize: 16 }}>
                      {c.status === "settled" ? "✓" : "·"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.serviceTitle || "Freelance service"}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}>
                        Client: {c.clientName || "Unknown"} · {timeAgo(new Date(c.createdAt || Date.now()))}
                      </div>
                    </div>
                    <div style={{ padding: "2px 9px", borderRadius: 999, background: st.bg, color: st.color, fontSize: 10.5, fontWeight: 600, flexShrink: 0 }}>
                      {st.label}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, minWidth: 72 }}>
                      <div className="font-mono" style={{ fontSize: 13, color: c.status === "settled" ? "var(--green)" : "var(--amber)" }}>
                        {c.status === "settled" ? "+" : ""}${(c.netAmountUsdc || 0).toFixed(2)}
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
