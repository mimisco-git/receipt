"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Nav from "@/components/layout/Nav";
import { saveProfile, type ProfileData } from "@/lib/profile";

type ConnectStep = "idle" | "connecting" | "signing" | "verifying" | "done";

const STEPS: { key: ConnectStep; label: string }[] = [
  { key: "connecting", label: "Connect" },
  { key: "signing",    label: "Sign" },
  { key: "verifying",  label: "Verify" },
];

function WalletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      <circle cx="16" cy="13" r="1" fill="currentColor"/>
    </svg>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const [connectStep, setConnectStep] = useState<ConnectStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [nameLoading, setNameLoading] = useState(false);

  async function connectWallet() {
    const eth = (window as unknown as { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
    if (!eth) {
      setError("No wallet detected. Install MetaMask or Rabby.");
      return;
    }
    setError(null);
    setConnectStep("connecting");
    try {
      const accounts = await eth.request({ method: "eth_requestAccounts" }) as string[];
      const address = accounts[0];
      const nonce = Date.now().toString();
      const message = `Sign in to Receipt\n\nWallet: ${address}\nNonce: ${nonce}`;

      setConnectStep("signing");
      const signature = await eth.request({
        method: "personal_sign",
        params: [message, address],
      }) as string;

      setConnectStep("verifying");
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, message, signature }),
      });
      const data = await res.json();

      if (res.status === 404) {
        router.push(`/profile?wallet=${address}`);
        return;
      }
      if (!res.ok) {
        setError(data.error || "Sign in failed");
        setConnectStep("idle");
        return;
      }

      const profile: ProfileData = {
        role: data.role || "",
        name: data.name || "",
        bio: data.bio || "",
        walletAddress: data.walletAddress || address,
        website: "",
        twitter: "",
        skills: "",
        avatarColor: data.avatarColor || "#00E5C3",
        avatarUrl: null,
        hourlyRate: "",
        availability: "available",
        quizPassed: data.quizPassed || false,
        quizScore: data.quizScore ?? undefined,
      };
      saveProfile(profile);
      setConnectStep("done");
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (e: unknown) {
      const err = e as { message?: string };
      const msg = err?.message?.toLowerCase().includes("user rejected")
        ? "Signature cancelled."
        : err?.message || "Wallet connection failed.";
      setError(msg);
      setConnectStep("idle");
    }
  }

  async function signInWithName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setNameLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Sign in failed"); return; }
      const profile: ProfileData = {
        role: data.role || "", name: data.name || "", bio: data.bio || "",
        walletAddress: data.walletAddress || "", website: "", twitter: "", skills: "",
        avatarColor: data.avatarColor || "#00E5C3", avatarUrl: null,
        hourlyRate: "", availability: "available",
        quizPassed: data.quizPassed || false,
        quizScore: data.quizScore ?? undefined,
      };
      saveProfile(profile);
      router.push("/dashboard");
    } catch { setError("Network error. Please try again."); }
    finally { setNameLoading(false); }
  }

  const stepIdx = STEPS.findIndex(s => s.key === connectStep);
  const active = stepIdx !== -1;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <main style={{ maxWidth: 400, margin: "0 auto", padding: "clamp(100px,15vw,140px) 20px 60px" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

          <h1 style={{ fontSize: "clamp(22px,4vw,28px)", fontWeight: 800, letterSpacing: "-0.05em", marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 32 }}>
            Connect your wallet to sign in — one tap, no password.
          </p>

          {/* Wallet connect card */}
          <div style={{
            background: "linear-gradient(135deg, rgba(255,255,255,.045) 0%, transparent 38%), linear-gradient(180deg, rgba(255,255,255,.032) 0%, rgba(255,255,255,.010) 100%)",
            backdropFilter: "blur(32px) saturate(200%)",
            WebkitBackdropFilter: "blur(32px) saturate(200%)",
            border: "1px solid rgba(255,255,255,.09)",
            borderRadius: 24, padding: 24, marginBottom: 16,
            boxShadow: "0 20px 48px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.10)",
          }}>
            {connectStep === "done" ? (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", background: "var(--green)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 10px",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" stroke="#060E0A">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div style={{ fontSize: 14, color: "var(--green)", fontWeight: 600 }}>Signed in</div>
              </div>
            ) : active ? (
              <div>
                {/* Step indicators */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                  {STEPS.map((s, i) => {
                    const done = i < stepIdx;
                    const curr = i === stepIdx;
                    return (
                      <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : undefined }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: done ? "var(--green)" : curr ? "rgba(0,229,195,.12)" : "rgba(255,255,255,.04)",
                            border: curr ? "1.5px solid var(--green)" : done ? "none" : "1.5px solid rgba(255,255,255,.10)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.3s ease",
                          }}>
                            {done ? (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" strokeWidth="3"
                                strokeLinecap="round" strokeLinejoin="round" stroke="#060E0A">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            ) : curr ? (
                              <div style={{
                                width: 10, height: 10, borderRadius: "50%",
                                border: "2px solid transparent", borderTopColor: "var(--green)",
                                animation: "spin 0.7s linear infinite",
                              }} />
                            ) : (
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,.2)" }} />
                            )}
                          </div>
                          <div style={{
                            fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase",
                            color: curr ? "var(--green)" : done ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.22)",
                          }}>
                            {s.label}
                          </div>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div style={{
                            flex: 1, height: 1, margin: "0 8px",
                            marginBottom: 16,
                            background: done ? "var(--green)" : "rgba(255,255,255,.08)",
                            transition: "background 0.4s ease",
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>
                  {connectStep === "connecting" && "Opening your wallet..."}
                  {connectStep === "signing"    && "Sign the message in your wallet to confirm it's you."}
                  {connectStep === "verifying"  && "Verifying your signature..."}
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn-primary"
                style={{
                  width: "100%", padding: "14px", borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 10, fontSize: 14.5, fontWeight: 600,
                }}
              >
                <WalletIcon />
                Connect Wallet
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            )}
          </div>

          {error && (
            <motion.div
              key={error}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              style={{
                marginBottom: 16, padding: "11px 14px",
                background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.18)",
                borderRadius: 12, fontSize: 13, color: "#ff5555", textAlign: "center",
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 16px" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.07)" }} />
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.22)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
              or sign in with name
            </div>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.07)" }} />
          </div>

          {/* Name fallback */}
          <form onSubmit={signInWithName} style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input"
              style={{
                flex: 1, fontSize: 13,
                background: "rgba(0,0,0,0.25)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
              }}
            />
            <button
              type="submit"
              disabled={nameLoading || !name.trim()}
              style={{
                padding: "0 18px", borderRadius: "var(--r-sm)", fontSize: 13, fontWeight: 600,
                background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.09)",
                color: "var(--text-1)", cursor: "pointer",
                opacity: nameLoading || !name.trim() ? 0.38 : 1,
                transition: "opacity 0.15s ease",
              }}
            >
              {nameLoading ? "..." : "Go"}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 13, color: "var(--text-3)", textAlign: "center" }}>
            New here?{" "}
            <button
              onClick={() => router.push("/profile")}
              style={{ background: "none", border: "none", color: "var(--green)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
            >
              Create your profile
            </button>
          </p>

        </motion.div>
      </main>
    </div>
  );
}
