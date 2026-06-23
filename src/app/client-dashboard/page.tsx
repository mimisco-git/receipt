"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { timeAgo } from "@/lib/utils";

interface ClientContract {
  id: string;
  serviceTitle: string;
  freelancerName: string;
  brief: string;
  amountUsdc: number;
  status: string;
  createdAt: string;
  agentScore?: number;
  txHash?: string;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: "Awaiting delivery", color: "var(--amber)", bg: "var(--amber-dim)" },
  delivered:  { label: "Under review",      color: "var(--blue)",  bg: "var(--blue-dim)" },
  evaluating: { label: "Agent reviewing",   color: "var(--blue)",  bg: "var(--blue-dim)" },
  settled:    { label: "Completed",         color: "var(--green)", bg: "var(--green-dim)" },
  disputed:   { label: "Disputed",          color: "var(--red)",   bg: "rgba(240,82,82,0.1)" },
};

export default function ClientDashboardPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<ClientContract[]>([]);
  const [name, setName] = useState("Client");

  useEffect(() => {
    // Load all contracts from localStorage where client submitted briefs
    const stored: ClientContract[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("receipt_contract_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || "{}");
          if (data.clientName) {
            stored.push(data);
            if (data.clientName && data.clientName !== "Client") setName(data.clientName);
          }
        } catch {}
      }
    }
    // Sort newest first
    stored.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    setContracts(stored);
  }, []);

  const total    = contracts.reduce((s, c) => s + (c.amountUsdc || 0), 0);
  const settled  = contracts.filter(c => c.status === "settled");
  const pending  = contracts.filter(c => c.status === "pending" || c.status === "delivered" || c.status === "evaluating");

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "clamp(80px,12vw,100px) 20px 60px" }}>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 8 }}>
              Client portal
            </div>
            <h1 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 4 }}>
              Your contracts
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-2)" }}>
              Track every job you have commissioned on Receipt.
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 28 }}>
            {[
              { label: "Total spent",    value: `$${total.toFixed(2)}`, color: "var(--text-1)" },
              { label: "Jobs completed", value: settled.length,          color: "var(--green)" },
              { label: "In progress",    value: pending.length,          color: "var(--amber)" },
              { label: "Total jobs",     value: contracts.length,        color: "var(--text-1)" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "18px 20px", background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)" }}>
                <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{s.label}</div>
                <div className="font-mono" style={{ fontSize: 24, fontWeight: 500, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Contract list */}
          {contracts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>📋</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No contracts yet</div>
              <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24 }}>
                When you fund escrow for a freelancer service, your contracts will appear here.
              </p>
              <button onClick={() => router.push("/")} className="btn-primary"
                style={{ padding: "12px 24px", borderRadius: "var(--r-sm)" }}>
                Browse services
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
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: st.bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                      {c.status === "settled" ? "✓" : "·"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.serviceTitle || "Freelance service"}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}>
                        {c.freelancerName}{c.agentScore ? ` · Agent: ${c.agentScore}%` : ""} · {timeAgo(new Date(c.createdAt || Date.now()))}
                      </div>
                    </div>
                    <div style={{ padding: "2px 9px", borderRadius: 999, background: st.bg, color: st.color, fontSize: 10.5, fontWeight: 600, flexShrink: 0 }}>
                      {st.label}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div className="font-mono" style={{ fontSize: 13, color: "var(--text-1)" }}>${c.amountUsdc?.toFixed(2)} USDC</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
