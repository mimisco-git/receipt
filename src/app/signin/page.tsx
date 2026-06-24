"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Nav from "@/components/layout/Nav";
import { saveProfile, type ProfileData } from "@/lib/profile";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"name" | "wallet">("name");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const body = mode === "wallet"
        ? { walletAddress: value.trim() }
        : { name: value.trim() };

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sign in failed");
        return;
      }

      const profile: ProfileData = {
        role: data.role || "",
        name: data.name || "",
        bio: data.bio || "",
        walletAddress: data.walletAddress || "",
        website: "",
        twitter: "",
        skills: "",
        avatarColor: data.avatarColor || "#00D184",
        avatarUrl: null,
        hourlyRate: "",
        availability: "available",
      };

      saveProfile(profile);
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <main style={{ maxWidth: 420, margin: "0 auto", padding: "clamp(100px, 15vw, 140px) 20px 60px" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

          <h1 style={{ fontSize: "clamp(22px,4vw,28px)", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 28 }}>
            Sign in with your name or wallet address to restore your profile.
          </p>

          {/* Toggle */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
            {([
              { key: "name" as const, label: "Name" },
              { key: "wallet" as const, label: "Wallet address" },
            ]).map(opt => {
              const active = mode === opt.key;
              return (
                <button key={opt.key} onClick={() => { setMode(opt.key); setError(null); }}
                  style={{
                    padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500,
                    cursor: "pointer", transition: "all 0.2s ease",
                    border: active ? "1.5px solid var(--green)" : "1.5px solid var(--line)",
                    background: active ? "var(--green-dim)" : "rgba(255,255,255,0.02)",
                    color: active ? "var(--green)" : "var(--text-2)",
                  }}>
                  {opt.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSignIn}>
            <div style={{
              background: "var(--card)", border: "1px solid var(--line)",
              borderRadius: "var(--r-lg)", padding: 24, marginBottom: 16,
            }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginBottom: 7 }}>
                {mode === "wallet" ? "Your wallet address on Arc" : "Your full name"}
              </label>
              <input
                type="text"
                placeholder={mode === "wallet" ? "0x..." : "Enter your full name"}
                value={value}
                onChange={e => setValue(e.target.value)}
                className="input"
                autoFocus
                style={{
                  fontFamily: mode === "wallet" ? '"DM Mono", monospace' : "inherit",
                  fontSize: mode === "wallet" ? 13 : 14,
                  background: "rgba(0,0,0,0.25)",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
                }}
              />
            </div>

            <button type="submit" disabled={loading || !value.trim()} className="btn-primary"
              style={{
                width: "100%", padding: "13px", borderRadius: "var(--r-sm)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
              {loading ? (
                <>
                  <span style={{
                    width: 14, height: 14, borderRadius: "50%",
                    border: "2px solid rgba(6,14,10,0.3)", borderTopColor: "#060E0A",
                    display: "inline-block", animation: "spin 0.7s linear infinite",
                  }} />
                  Signing in...
                </>
              ) : "Sign in"}
            </button>
          </form>

          {error && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 14, padding: "11px 14px",
                background: "rgba(240,82,82,0.1)", border: "1px solid rgba(240,82,82,0.2)",
                borderRadius: "var(--r-sm)", fontSize: 13, color: "#F05252", textAlign: "center",
              }}>
              {error}
            </motion.div>
          )}

          <p style={{ marginTop: 24, fontSize: 13, color: "var(--text-3)", textAlign: "center" }}>
            Don&apos;t have an account?{" "}
            <button onClick={() => router.push("/profile")}
              style={{ background: "none", border: "none", color: "var(--green)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              Sign up
            </button>
          </p>

        </motion.div>
      </main>
    </div>
  );
}
