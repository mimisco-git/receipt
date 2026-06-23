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

      const existingProfile = JSON.parse(localStorage.getItem("receipt_profile") || "{}");
      localStorage.setItem("receipt_profile", JSON.stringify({
        ...existingProfile,
        name: form.name,
        bio: form.bio,
        walletAddress: form.walletAddress,
      }));

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

  const slow = { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    color: "#ffffff",
    fontSize: 15,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s cubic-bezier(0.16,1,0.3,1)",
  };

  const labelStyle = {
    display: "block" as const,
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(255,255,255,0.35)",
    marginBottom: 8,
  };

  const stepTitles = [
    { title: "Who are you?", sub: "Your identity appears on your service link." },
    { title: "What do you offer?", sub: "Describe the work your clients will pay for." },
    { title: "Set your price.", sub: "Choose how much you charge per delivery." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "#ffffff" }}>
      <Nav />
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "140px 24px 80px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={slow}>

          {step < 3 && (
            <>
              {/* Step indicator — minimal dots */}
              <div style={{ display: "flex", gap: 6, marginBottom: 48, justifyContent: "center" }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: i === step ? 24 : 6,
                      height: 6,
                      borderRadius: 999,
                      background: i <= step ? "var(--green)" : "rgba(255,255,255,0.08)",
                      opacity: i === step ? 1 : i < step ? 0.4 : 1,
                      transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  />
                ))}
              </div>

              <motion.div
                key={`header-${step}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={slow}
                style={{ textAlign: "center", marginBottom: 40 }}
              >
                <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 8 }}>
                  {stepTitles[step].title}
                </h1>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)" }}>
                  {stepTitles[step].sub}
                </p>
              </motion.div>
            </>
          )}

          <AnimatePresence mode="wait">
            {/* Step 0: Identity */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={slow}
                style={{ display: "grid", gap: 20 }}
              >
                <div>
                  <label style={labelStyle}>Full name</label>
                  <input
                    style={inputStyle}
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Emenike Johnson"
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(52,211,153,0.3)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52,211,153,0.06)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Short bio</label>
                  <textarea
                    style={{ ...inputStyle, resize: "vertical" as const, minHeight: 80 }}
                    value={form.bio}
                    onChange={(e) => update("bio", e.target.value)}
                    placeholder="I write SEO content for SaaS startups..."
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(52,211,153,0.3)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52,211,153,0.06)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>USDC wallet address</label>
                  <input
                    style={{ ...inputStyle, fontFamily: "'DM Mono', monospace", fontSize: 13 }}
                    value={form.walletAddress}
                    onChange={(e) => update("walletAddress", e.target.value)}
                    placeholder="0x4565..."
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(52,211,153,0.3)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52,211,153,0.06)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.18)", marginTop: 8 }}>
                    USDC lands here when clients approve your work.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 1: Service */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={slow}
                style={{ display: "grid", gap: 20 }}
              >
                <div>
                  <label style={labelStyle}>Service title</label>
                  <input
                    style={inputStyle}
                    value={form.serviceTitle}
                    onChange={(e) => update("serviceTitle", e.target.value)}
                    placeholder="SEO blog post, 1,000 words"
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(52,211,153,0.3)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52,211,153,0.06)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>What you deliver</label>
                  <textarea
                    style={{ ...inputStyle, resize: "vertical" as const, minHeight: 120 }}
                    value={form.serviceDescription}
                    onChange={(e) => update("serviceDescription", e.target.value)}
                    placeholder="Research-backed, keyword-optimised article. Delivered in 48 hours with 2 revisions. Includes title, meta description, and internal links."
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(52,211,153,0.3)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52,211,153,0.06)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Pricing */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={slow}
              >
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 56,
                    fontWeight: 700,
                    color: "var(--green)",
                    textAlign: "center",
                    padding: "32px 0",
                    letterSpacing: "-0.03em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  ${form.priceUsdc.toFixed(2)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
                  {CURRENCIES.map((p) => (
                    <button
                      key={p}
                      onClick={() => update("priceUsdc", p)}
                      style={{
                        padding: "11px 0",
                        borderRadius: 10,
                        border: "none",
                        background: form.priceUsdc === p ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.03)",
                        color: form.priceUsdc === p ? "var(--green)" : "rgba(255,255,255,0.4)",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "'DM Mono', monospace",
                        transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                      }}
                    >
                      ${p}
                    </button>
                  ))}
                </div>
                <div>
                  <label style={labelStyle}>Custom amount</label>
                  <input
                    type="number"
                    style={{ ...inputStyle, fontFamily: "'DM Mono', monospace" }}
                    value={form.priceUsdc}
                    onChange={(e) => update("priceUsdc", Number(e.target.value))}
                    min="1"
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(52,211,153,0.3)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52,211,153,0.06)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <div style={{ marginTop: 24, padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>
                    <span>Platform fee</span>
                    <span className="font-mono">10%</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 600, color: "var(--green)" }}>
                    <span>You receive</span>
                    <span className="font-mono">${(form.priceUsdc * 0.9).toFixed(2)} USDC</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Generated link */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ textAlign: "center" }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "rgba(52,211,153,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="4,12 9,17 20,7" />
                  </svg>
                </motion.div>
                <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-1)", marginBottom: 8 }}>
                  Your link is ready.
                </h2>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", marginBottom: 32, lineHeight: 1.6 }}>
                  Share it with clients. USDC lands in your wallet when they approve.
                </p>

                <div
                  style={{
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 12,
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 12,
                      color: "var(--green)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    {shareUrl}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                    className="btn-primary"
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    Copy
                  </button>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24 }}>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "12px 20px",
                      background: "rgba(255,255,255,0.04)",
                      color: "rgba(255,255,255,0.6)",
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 500,
                      textDecoration: "none",
                      transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  >
                    Preview
                  </a>
                  <a href="/worker-dashboard" style={{ textDecoration: "none" }}>
                    <button
                      style={{
                        padding: "12px 20px",
                        background: "rgba(255,255,255,0.04)",
                        border: "none",
                        color: "rgba(255,255,255,0.6)",
                        borderRadius: 12,
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                      }}
                    >
                      Dashboard
                    </button>
                  </a>
                  <button
                    onClick={() => { setStep(0); setGeneratedSlug(""); }}
                    className="btn-primary"
                    style={{
                      padding: "12px 20px",
                      borderRadius: 12,
                      fontSize: 14,
                    }}
                  >
                    Create another
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: "#F87171", fontSize: 13, marginTop: 12, textAlign: "center" }}
            >
              {error}
            </motion.p>
          )}

          {step < 3 && (
            <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
              {step > 0 && (
                <button
                  onClick={() => { setStep((s) => s - 1); setError(""); }}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "rgba(255,255,255,0.04)",
                    border: "none",
                    color: "rgba(255,255,255,0.5)",
                    borderRadius: 12,
                    fontSize: 15,
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                  }}
                >
                  Back
                </button>
              )}
              <motion.button
                onClick={step === 2 ? handleGenerate : handleNextStep}
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="btn-primary"
                style={{
                  flex: 2,
                  padding: "14px",
                  borderRadius: 12,
                  fontSize: 15,
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
                        border: "2px solid rgba(0,0,0,0.2)",
                        borderTopColor: "#0a0f1e",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
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
