"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/layout/Nav";

const CURRENCIES = [8, 15, 25, 35, 50, 75, 100];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function SetupPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatedSlug, setGeneratedSlug] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    bio: "",
    walletAddress: "",
    serviceTitle: "",
    serviceDescription: "",
    priceUsdc: 8,
  });

  // Pre-populate from saved profile
  useEffect(() => {
    try {
      const stored = localStorage.getItem("receipt_profile");
      if (stored) {
        const p = JSON.parse(stored);
        setForm((prev) => ({
          ...prev,
          name: p.name || prev.name,
          bio: p.bio || prev.bio,
          walletAddress: p.walletAddress || prev.walletAddress,
        }));
      }
    } catch {}
  }, []);

  const update = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleNextStep = () => {
    if (step === 0) {
      if (!form.name.trim()) { setError("Please enter your name."); return; }
      if (!form.walletAddress.trim()) { setError("Please enter your USDC wallet address."); return; }
    }
    if (step === 1) {
      if (!form.serviceTitle.trim()) { setError("Please describe your service."); return; }
      if (!form.serviceDescription.trim()) { setError("Please add more detail."); return; }
    }
    setError("");
    setStep((s) => s + 1);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const slug = slugify(form.name) + "-" + slugify(form.serviceTitle).slice(0, 20) + "-" + Math.random().toString(36).slice(2, 6);
      const service = {
        id: Date.now().toString(),
        slug,
        title: form.serviceTitle,
        description: form.serviceDescription,
        priceUsdc: form.priceUsdc,
        freelancerName: form.name,
        freelancerBio: form.bio,
        walletAddress: form.walletAddress,
        createdAt: new Date().toISOString(),
      };

      // Save profile
      const existingProfile = JSON.parse(localStorage.getItem("receipt_profile") || "{}");
      localStorage.setItem("receipt_profile", JSON.stringify({
        ...existingProfile,
        name: form.name,
        bio: form.bio,
        walletAddress: form.walletAddress,
      }));

      // Save service
      const existingServices = JSON.parse(localStorage.getItem("receipt_services") || "[]");
      existingServices.unshift(service);
      localStorage.setItem("receipt_services", JSON.stringify(existingServices));

      await new Promise((r) => setTimeout(r, 800));
      setGeneratedSlug(slug);
      setStep(3);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/hire/${generatedSlug}`;

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    boxSizing: "border-box" as const,
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
    transition: "border-color 0.15s ease",
  };

  const labelStyle = {
    display: "block" as const,
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    marginBottom: 7,
  };

  const steps = [
    { label: "Identity", icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    )},
    { label: "Service", icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      </svg>
    )},
    { label: "Pricing", icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )},
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "#ffffff" }}>
      <Nav />
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "100px 20px 60px" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

          {step < 3 && (
            <>
              <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 6 }}>
                Create your service link
              </h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>
                Share it with clients. Get paid the moment they approve your work.
              </p>

              {/* Step progress */}
              <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
                {steps.map((s, i) => (
                  <div
                    key={s.label}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: i === step ? "rgba(16,217,138,0.1)" : i < step ? "rgba(16,217,138,0.05)" : "rgba(255,255,255,0.03)",
                      border: i === step ? "1px solid rgba(16,217,138,0.25)" : "1px solid rgba(255,255,255,0.05)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{ color: i <= step ? "#10d98a" : "rgba(255,255,255,0.25)" }}>
                      {s.icon}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: i === step ? "#10d98a" : i < step ? "rgba(16,217,138,0.6)" : "rgba(255,255,255,0.25)" }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          <AnimatePresence mode="wait">
            {/* Step 0: Identity */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16,
                  padding: 24,
                  display: "grid",
                  gap: 16,
                }}
              >
                <div>
                  <label style={labelStyle}>Your name *</label>
                  <input
                    style={inputStyle}
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Emenike Johnson"
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,217,138,0.4)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Short bio (optional)</label>
                  <textarea
                    style={{ ...inputStyle, resize: "vertical" as const, minHeight: 70 }}
                    value={form.bio}
                    onChange={(e) => update("bio", e.target.value)}
                    placeholder="I write SEO content for SaaS startups..."
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,217,138,0.4)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>USDC Wallet Address *</label>
                  <input
                    style={{ ...inputStyle, fontFamily: "'DM Mono', monospace", fontSize: 12 }}
                    value={form.walletAddress}
                    onChange={(e) => update("walletAddress", e.target.value)}
                    placeholder="0x4565..."
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,217,138,0.4)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  />
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>
                    USDC will be sent here on Arc testnet when clients approve your work.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 1: Service */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16,
                  padding: 24,
                  display: "grid",
                  gap: 16,
                }}
              >
                <div>
                  <label style={labelStyle}>Service title *</label>
                  <input
                    style={inputStyle}
                    value={form.serviceTitle}
                    onChange={(e) => update("serviceTitle", e.target.value)}
                    placeholder="SEO blog post, 1,000 words"
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,217,138,0.4)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>What you deliver *</label>
                  <textarea
                    style={{ ...inputStyle, resize: "vertical" as const, minHeight: 100 }}
                    value={form.serviceDescription}
                    onChange={(e) => update("serviceDescription", e.target.value)}
                    placeholder="Research-backed, keyword-optimised article. Delivered in 48 hours with 2 revisions. Includes title, meta description, and internal links."
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,217,138,0.4)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Pricing */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <label style={labelStyle}>Price (USDC)</label>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 48,
                    fontWeight: 700,
                    color: "#10d98a",
                    textAlign: "center",
                    padding: "20px 0",
                    letterSpacing: "-0.02em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  ${form.priceUsdc.toFixed(2)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
                  {CURRENCIES.map((p) => (
                    <button
                      key={p}
                      onClick={() => update("priceUsdc", p)}
                      style={{
                        padding: "9px 0",
                        borderRadius: 8,
                        border: form.priceUsdc === p ? "1px solid #10d98a" : "1px solid rgba(255,255,255,0.08)",
                        background: form.priceUsdc === p ? "rgba(16,217,138,0.1)" : "rgba(255,255,255,0.03)",
                        color: form.priceUsdc === p ? "#10d98a" : "rgba(255,255,255,0.5)",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "'DM Mono', monospace",
                        transition: "all 0.12s ease",
                      }}
                    >
                      ${p}
                    </button>
                  ))}
                </div>
                <div>
                  <label style={labelStyle}>Or enter custom amount</label>
                  <input
                    type="number"
                    style={{ ...inputStyle, fontFamily: "'DM Mono', monospace" }}
                    value={form.priceUsdc}
                    onChange={(e) => update("priceUsdc", Number(e.target.value))}
                    min="1"
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,217,138,0.4)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  />
                </div>
                <div
                  style={{
                    marginTop: 16,
                    padding: "12px 14px",
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  <span>Platform fee (10%)</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>-${(form.priceUsdc * 0.1).toFixed(2)}</span>
                </div>
                <div
                  style={{
                    padding: "12px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#10d98a",
                  }}
                >
                  <span>You receive</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>${(form.priceUsdc * 0.9).toFixed(2)} USDC</span>
                </div>
              </motion.div>
            )}

            {/* Step 3: Generated link */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: "rgba(16,217,138,0.04)",
                  border: "1px solid rgba(16,217,138,0.2)",
                  borderRadius: 16,
                  padding: 28,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "rgba(16,217,138,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10d98a" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="4,12 9,17 20,7" />
                  </svg>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#10d98a", marginBottom: 6 }}>
                  Your link is ready
                </h2>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>
                  Share it with clients. When they approve your work, USDC lands in your wallet on Arc in under 500ms.
                </p>

                {/* Link display */}
                <div
                  style={{
                    padding: "12px 14px",
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: 10,
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      color: "#10d98a",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    {shareUrl}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                    style={{
                      padding: "5px 10px",
                      background: "#10d98a",
                      color: "#0a0f1e",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    Copy
                  </button>
                </div>

                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 18px",
                    background: "rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.7)",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                    marginBottom: 20,
                  }}
                >
                  Preview client view
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>

                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <a href="/worker-dashboard">
                    <button
                      style={{
                        padding: "9px 16px",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.6)",
                        borderRadius: 10,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      My dashboard
                    </button>
                  </a>
                  <button
                    onClick={() => { setStep(0); setGeneratedSlug(""); }}
                    style={{
                      padding: "9px 16px",
                      background: "#10d98a",
                      color: "#0a0f1e",
                      border: "none",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Create another
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <p style={{ color: "#e74c3c", fontSize: 13, marginTop: 10, textAlign: "center" }}>{error}</p>
          )}

          {/* Navigation */}
          {step < 3 && (
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              {step > 0 && (
                <button
                  onClick={() => { setStep((s) => s - 1); setError(""); }}
                  style={{
                    flex: 1,
                    padding: "13px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.6)",
                    borderRadius: 10,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
              )}
              <motion.button
                onClick={step === 2 ? handleGenerate : handleNextStep}
                disabled={loading}
                whileTap={{ scale: 0.97, y: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{
                  flex: 2,
                  padding: "13px",
                  background: loading ? "rgba(16,217,138,0.5)" : "rgba(255,255,255,0.92)",
                  color: "#0a0f1e",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: loading ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(0,0,0,0.3)",
                        borderTopColor: "#0a0f1e",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Generating...
                  </>
                ) : step === 2 ? "Generate my link" : "Continue"}
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
