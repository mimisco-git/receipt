"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Nav from "@/components/layout/Nav";

interface Contract {
  id: string;
  serviceTitle: string;
  workerName: string;
  brief: string;
  amount: number;
  status: "pending" | "delivered" | "approved" | "disputed" | "settled";
  score?: number;
  txHash?: string;
  createdAt: string;
  workerWallet?: string;
}

function StatusBadge({ status }: { status: Contract["status"] }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Awaiting delivery", color: "#f0a500", bg: "rgba(240,165,0,0.1)" },
    delivered: { label: "Ready to review", color: "#5090ff", bg: "rgba(80,144,255,0.1)" },
    approved: { label: "Payment released", color: "#10d98a", bg: "rgba(16,217,138,0.1)" },
    disputed: { label: "In dispute", color: "#e74c3c", bg: "rgba(231,76,60,0.1)" },
    settled: { label: "Complete", color: "#10d98a", bg: "rgba(16,217,138,0.08)" },
  };
  const s = map[status] || map.pending;
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 100,
        fontSize: 11,
        fontWeight: 600,
        color: s.color,
        background: s.bg,
        letterSpacing: "0.04em",
        whiteSpace: "nowrap" as const,
      }}
    >
      {s.label}
    </span>
  );
}

export default function ClientDashboard() {
  const [profile, setProfile] = useState<{ name: string; avatarColor?: string; avatarImage?: string } | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    try {
      const p = localStorage.getItem("receipt_profile");
      if (p) setProfile(JSON.parse(p));
    } catch {}
    try {
      const raw = localStorage.getItem("receipt_client_contracts");
      if (raw) setContracts(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const total = contracts
      .filter((c) => c.status === "settled" || c.status === "approved")
      .reduce((s, c) => s + c.amount, 0);
    let cur = 0;
    const step = total / 40;
    if (total === 0) return;
    const timer = setInterval(() => {
      cur += step;
      if (cur >= total) { setTotalSpent(total); clearInterval(timer); return; }
      setTotalSpent(cur);
    }, 30);
    return () => clearInterval(timer);
  }, [contracts]);

  const completed = contracts.filter((c) => c.status === "settled" || c.status === "approved");
  const inProgress = contracts.filter((c) => c.status === "pending" || c.status === "delivered");
  const actionNeeded = contracts.filter((c) => c.status === "delivered");

  const avatarInitials = profile?.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "C";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "#ffffff" }}>
      <Nav />
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "100px 20px 60px" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: profile?.avatarImage ? "transparent" : (profile?.avatarColor || "#5090ff"),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {profile?.avatarImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarImage} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : avatarInitials}
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 2 }}>
              {profile?.name ? `${profile.name}&apos;s Contracts` : "Client Dashboard"}
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              All jobs you have commissioned
            </p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Link href="/marketplace">
              <button
                style={{
                  padding: "9px 16px",
                  borderRadius: 10,
                  background: "#10d98a",
                  border: "none",
                  color: "#0a0f1e",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + Hire someone
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Action needed alert */}
        {actionNeeded.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "14px 18px",
              background: "rgba(80,144,255,0.08)",
              border: "1px solid rgba(80,144,255,0.2)",
              borderRadius: 12,
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5090ff" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span style={{ fontSize: 13, color: "#5090ff", fontWeight: 600 }}>
                {actionNeeded.length} job{actionNeeded.length > 1 ? "s" : ""} waiting for your review
              </span>
            </div>
            <span style={{ fontSize: 12, color: "rgba(80,144,255,0.6)" }}>
              Review and release payment
            </span>
          </motion.div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
          {[
            {
              label: "Total spent",
              value: `$${totalSpent.toFixed(2)}`,
              sub: `${completed.length} completed`,
              color: "#ffffff",
            },
            {
              label: "In progress",
              value: String(inProgress.length),
              sub: "active contracts",
              color: inProgress.length > 0 ? "#f0a500" : "#ffffff",
            },
            {
              label: "Action needed",
              value: String(actionNeeded.length),
              sub: "awaiting your approval",
              color: actionNeeded.length > 0 ? "#5090ff" : "#ffffff",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                padding: "18px 16px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 8 }}>
                {stat.label}
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 24, fontWeight: 700, color: stat.color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em", marginBottom: 4 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{stat.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Contract list */}
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 14 }}>
          All Contracts
        </h2>

        {contracts.length === 0 ? (
          <div
            style={{
              padding: "56px 24px",
              textAlign: "center",
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.07)",
              borderRadius: 16,
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" style={{ margin: "0 auto 14px" }}>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, marginBottom: 18 }}>
              No contracts yet. Find a skilled worker to get started.
            </p>
            <Link href="/marketplace">
              <button
                style={{
                  padding: "10px 20px",
                  background: "#10d98a",
                  color: "#0a0f1e",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Browse workers
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {contracts.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={`/escrow/${c.id}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      padding: "16px 18px",
                      background: c.status === "delivered"
                        ? "rgba(80,144,255,0.04)"
                        : "rgba(255,255,255,0.025)",
                      border: c.status === "delivered"
                        ? "1px solid rgba(80,144,255,0.15)"
                        : "1px solid rgba(255,255,255,0.05)",
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.045)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = c.status === "delivered" ? "rgba(80,144,255,0.04)" : "rgba(255,255,255,0.025)"; }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>
                          {c.serviceTitle || "Contract"}
                        </span>
                        <StatusBadge status={c.status} />
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                        Worker: {c.workerName || "Unknown"} &middot; {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                        {c.brief}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 700, color: c.status === "settled" ? "#10d98a" : "#ffffff", fontVariantNumeric: "tabular-nums" }}>
                        ${c.amount.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>USDC</div>
                    </div>
                    {c.status === "delivered" && (
                      <div
                        style={{
                          padding: "6px 12px",
                          background: "#5090ff",
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#ffffff",
                          flexShrink: 0,
                        }}
                      >
                        Review
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
