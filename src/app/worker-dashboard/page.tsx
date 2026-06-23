"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import PaymentOrb from "@/components/shared/PaymentOrb";

interface Contract {
  id: string;
  serviceTitle: string;
  clientName: string;
  brief: string;
  amount: number;
  status: "pending" | "delivered" | "approved" | "disputed" | "settled";
  score?: number;
  txHash?: string;
  createdAt: string;
  settledAt?: string;
}

interface Profile {
  name: string;
  bio: string;
  walletAddress: string;
  avatarColor: string;
  avatarImage: string;
  availability: string;
  skills: string[];
  rate: string;
}

function StatusBadge({ status }: { status: Contract["status"] }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Awaiting delivery", color: "#f0a500", bg: "rgba(240,165,0,0.1)" },
    delivered: { label: "Under review", color: "#5090ff", bg: "rgba(80,144,255,0.1)" },
    approved: { label: "Approved", color: "#10d98a", bg: "rgba(16,217,138,0.1)" },
    disputed: { label: "Disputed", color: "#e74c3c", bg: "rgba(231,76,60,0.1)" },
    settled: { label: "Settled", color: "#10d98a", bg: "rgba(16,217,138,0.08)" },
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

export default function WorkerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Load profile
    try {
      const p = localStorage.getItem("receipt_profile");
      if (p) setProfile(JSON.parse(p));
    } catch {}

    // Load contracts where user is the worker
    try {
      const raw = localStorage.getItem("receipt_contracts");
      if (raw) {
        const all: Contract[] = JSON.parse(raw);
        setContracts(all.filter((c) => c.status !== undefined));
      }
    } catch {}
  }, []);

  // Animated counter
  useEffect(() => {
    const total = settled.reduce((sum, c) => sum + c.amount * 0.9, 0);
    let start = 0;
    const step = total / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= total) { setCount(total); clearInterval(timer); return; }
      setCount(start);
    }, 30);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contracts]);

  const settled = contracts.filter((c) => c.status === "settled" || c.status === "approved");
  const pending = contracts.filter((c) => c.status === "pending" || c.status === "delivered");
  const disputed = contracts.filter((c) => c.status === "disputed");

  const totalEarned = settled.reduce((s, c) => s + c.amount * 0.9, 0);
  const avgScore = settled.length
    ? Math.round(settled.reduce((s, c) => s + (c.score || 90), 0) / settled.length)
    : 0;

  const avatarInitials = profile?.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "W";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "#ffffff" }}>
      <Nav />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "100px 20px 60px" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: profile?.avatarImage ? "transparent" : (profile?.avatarColor || "#10d98a"),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
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
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 2 }}>
              {profile?.name || "Your Dashboard"}
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              Worker dashboard
              {profile?.availability && (
                <span
                  style={{
                    marginLeft: 10,
                    padding: "2px 8px",
                    borderRadius: 100,
                    fontSize: 11,
                    background: profile.availability === "available" ? "rgba(16,217,138,0.12)" : "rgba(240,165,0,0.12)",
                    color: profile.availability === "available" ? "#10d98a" : "#f0a500",
                  }}
                >
                  {profile.availability === "available" ? "Available" : profile.availability}
                </span>
              )}
            </p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <Link href="/setup">
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
                + New service
              </button>
            </Link>
            <Link href="/profile">
              <button
                style={{
                  padding: "9px 16px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Edit profile
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
          {[
            {
              label: "Total earned",
              value: `$${count.toFixed(2)}`,
              sub: `${settled.length} settled`,
              mono: true,
              accent: totalEarned > 0,
            },
            {
              label: "Avg agent score",
              value: avgScore > 0 ? `${avgScore}%` : "--",
              sub: "scope alignment",
              mono: true,
              accent: false,
            },
            {
              label: "Pending",
              value: String(pending.length),
              sub: "jobs in progress",
              mono: false,
              accent: pending.length > 0,
            },
            {
              label: "Disputes",
              value: String(disputed.length),
              sub: "under review",
              mono: false,
              accent: false,
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                padding: "18px 16px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.35)",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase" as const,
                  marginBottom: 8,
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontFamily: stat.mono ? "'DM Mono', monospace" : "'Inter', sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: stat.accent ? "#10d98a" : "#ffffff",
                  fontVariantNumeric: "tabular-nums lining-nums",
                  letterSpacing: "-0.02em",
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{stat.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
          {/* Contracts list */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>
                Active &amp; Recent Contracts
              </h2>
            </div>

            {contracts.length === 0 ? (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px dashed rgba(255,255,255,0.08)",
                  borderRadius: 14,
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" style={{ margin: "0 auto 12px" }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, marginBottom: 16 }}>
                  No contracts yet. Create your first service to get started.
                </p>
                <Link href="/setup">
                  <button
                    style={{
                      padding: "9px 18px",
                      background: "#10d98a",
                      color: "#0a0f1e",
                      border: "none",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Create a service
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
                          padding: "14px 16px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: 12,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>
                              {c.serviceTitle || "Contract"}
                            </span>
                            <StatusBadge status={c.status} />
                          </div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                            From {c.clientName} &middot; {new Date(c.createdAt).toLocaleDateString()}
                          </div>
                          {c.score && (
                            <div style={{ fontSize: 11, color: "#5090ff", marginTop: 3 }}>
                              Agent score: {c.score}%
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div
                            style={{
                              fontFamily: "'DM Mono', monospace",
                              fontSize: 14,
                              fontWeight: 700,
                              color: c.status === "settled" || c.status === "approved" ? "#10d98a" : "#ffffff",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            ${(c.amount * 0.9).toFixed(2)}
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>USDC</div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Orb */}
            <div
              style={{
                padding: "24px 16px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <PaymentOrb
                state={pending.length > 0 ? "locked" : totalEarned > 0 ? "settled" : "idle"}
                amount={totalEarned}
                size={140}
              />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>
                  TOTAL EARNED
                </div>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#10d98a",
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "-0.02em",
                  }}
                >
                  ${totalEarned.toFixed(2)}
                </div>
              </div>
              {profile?.walletAddress && (
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.2)",
                    fontFamily: "'DM Mono', monospace",
                    wordBreak: "break-all",
                    textAlign: "center",
                  }}
                >
                  {profile.walletAddress.slice(0, 8)}...{profile.walletAddress.slice(-6)}
                </div>
              )}
            </div>

            {/* Skills */}
            {profile?.skills && profile.skills.length > 0 && (
              <div
                style={{
                  padding: "16px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14,
                }}
              >
                <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 10 }}>
                  Skills
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {profile.skills.map((s) => (
                    <span
                      key={s}
                      style={{
                        padding: "4px 9px",
                        borderRadius: 100,
                        fontSize: 11,
                        background: "rgba(80,144,255,0.1)",
                        color: "#5090ff",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick links */}
            <div
              style={{
                padding: "16px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {[
                { href: "/setup", label: "Create new service" },
                { href: "/marketplace", label: "Browse job board" },
                { href: "/profile", label: "Edit profile" },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      padding: "9px 10px",
                      borderRadius: 8,
                      fontSize: 13,
                      color: "rgba(255,255,255,0.55)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.12s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      e.currentTarget.style.color = "#ffffff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                    }}
                  >
                    {l.label}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
