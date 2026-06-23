"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/layout/Nav";
import { slugify, netAmount } from "@/lib/utils";
import { loadProfile } from "@/lib/profile";

type Step = "profile" | "service" | "link";

function CheckIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep]     = useState<Step>("profile");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const [form, setForm] = useState({
    name: "",
    bio: "",
    walletAddress: "",
    title: "",
    description: "",
    priceUsdc: "8.00",
  });

  // Load saved profile on mount so freelancer name/wallet pre-populate
  useEffect(() => {
    const profile = loadProfile();
    if (profile.name) {
      setForm(prev => ({
        ...prev,
        name: profile.name || prev.name,
        bio: profile.bio || prev.bio,
        walletAddress: profile.walletAddress || prev.walletAddress,
      }));
    }
  }, []);

  const [slug, setSlug] = useState("");

  const origin = typeof window !== "undefined" ? window.location.origin : "https://receipt-nine-kohl.vercel.app";
  const link = `${origin}/hire/${slug}`;

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const stepOrder: Step[] = ["profile", "service", "link"];
  const stepIdx = stepOrder.indexOf(step);

  async function handleNext() {
    setError("");
    if (step === "profile") {
      if (!form.name.trim()) { setError("Please enter your name."); return; }
      setStep("service");
    } else if (step === "service") {
      if (!form.title.trim())       { setError("Please add a service title."); return; }
      if (!form.description.trim()) { setError("Please describe your service."); return; }
      await handleGenerate();
    }
  }

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, priceUsdc: parseFloat(form.priceUsdc) || 8 }),
      });
      const data = await res.json();
      if (data.slug) {
        setSlug(data.slug);
        setStep("link");
      } else {
        throw new Error("No slug returned");
      }
    } catch {
      // Demo fallback
      const s = slugify(form.name || "freelancer") + "-" + Date.now().toString(36).slice(-4);
      setSlug(s);
      setStep("link");
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  const priceNum = parseFloat(form.priceUsdc) || 0;

  const stepLabels = ["Your profile", "Your service", "Your link"];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />

      <main style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        minHeight: "100vh", padding: "100px 24px 60px",
      }}>

        {/* Step progress */}
        <div style={{
          display: "flex", alignItems: "center", gap: 0,
          marginBottom: 40,
        }}>
          {stepLabels.map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Circle */}
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 600,
                  transition: "all 0.3s ease",
                  background: i < stepIdx
                    ? "var(--green)"
                    : i === stepIdx
                    ? "var(--green-dim)"
                    : "rgba(255,255,255,0.04)",
                  color: i < stepIdx
                    ? "#060E0A"
                    : i === stepIdx
                    ? "var(--green)"
                    : "var(--text-3)",
                  border: i === stepIdx
                    ? "1px solid var(--green-border)"
                    : i < stepIdx
                    ? "none"
                    : "1px solid var(--line)",
                }}>
                  {i < stepIdx ? <CheckIcon /> : i + 1}
                </div>
                {/* Label */}
                <span style={{
                  fontSize: 13, fontWeight: i === stepIdx ? 500 : 400,
                  color: i === stepIdx ? "var(--text-1)" : "var(--text-3)",
                  transition: "color 0.3s ease",
                }}>
                  {label}
                </span>
              </div>
              {/* Connector */}
              {i < stepLabels.length - 1 && (
                <div style={{
                  width: 48, height: 1, margin: "0 12px",
                  background: i < stepIdx ? "var(--green)" : "var(--line)",
                  transition: "background 0.5s ease",
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{
          width: "100%", maxWidth: 480,
          background: "var(--card)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-xl)",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}>
          <AnimatePresence mode="wait">

            {/* STEP 1: PROFILE */}
            {step === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28 }}
                style={{ padding: 36 }}
              >
                <h1 style={{
                  fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em",
                  marginBottom: 6, color: "var(--text-1)",
                }}>
                  Set up your profile
                </h1>
                <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 28, lineHeight: 1.6 }}>
                  This is what clients see when they open your link.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Field label="Your full name" placeholder="e.g. Amara Nwosu"
                    value={form.name} onChange={v => update("name", v)} />
                  <Field label="Short bio (optional)" placeholder="e.g. SEO writer, 5 years in fintech"
                    value={form.bio} onChange={v => update("bio", v)} />
                  <Field label="Your USDC wallet address" placeholder="0x..."
                    value={form.walletAddress} onChange={v => update("walletAddress", v)} mono />
                  <div style={{
                    padding: "11px 14px", borderRadius: "var(--r-sm)",
                    background: "var(--green-dim)",
                    border: "1px solid var(--green-border)",
                    fontSize: 12.5, color: "var(--green)", lineHeight: 1.55,
                  }}>
                    No wallet? Receipt will auto-provision a Circle custodial wallet for you on the next step.
                  </div>
                </div>

                {error && <p style={{ fontSize: 12.5, color: "var(--red)", marginTop: 12 }}>{error}</p>}

                <button
                  onClick={handleNext}
                  disabled={!form.name.trim()}
                  className="btn-primary"
                  style={{
                    width: "100%", marginTop: 24, padding: "13px",
                    borderRadius: "var(--r-sm)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  Continue
                  <ArrowRight />
                </button>
              </motion.div>
            )}

            {/* STEP 2: SERVICE */}
            {step === "service" && (
              <motion.div
                key="service"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28 }}
                style={{ padding: 36 }}
              >
                <h1 style={{
                  fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em",
                  marginBottom: 6, color: "var(--text-1)",
                }}>
                  Describe your service
                </h1>
                <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 28, lineHeight: 1.6 }}>
                  Be specific. The AI agent uses this to evaluate client briefs.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Field label="Service title" placeholder="e.g. SEO blog post, 1000 words"
                    value={form.title} onChange={v => update("title", v)} />
                  <Field label="What you deliver" placeholder="Describe exactly what the client receives. Word count, format, revision policy, turnaround time..."
                    value={form.description} onChange={v => update("description", v)} as="textarea" rows={4} />

                  {/* Price field */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginBottom: 7 }}>
                      Your price (USDC)
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{
                        padding: "12px 14px", borderRadius: "var(--r-sm)",
                        background: "var(--card-2)", border: "1px solid var(--line)",
                        fontSize: 13, fontWeight: 600, color: "var(--green)",
                        fontFamily: '"DM Mono", monospace', whiteSpace: "nowrap",
                      }}>
                        USDC
                      </div>
                      <input
                        type="number" step="0.01" min="0.01"
                        value={form.priceUsdc}
                        onChange={e => update("priceUsdc", e.target.value)}
                        className="input font-mono"
                        style={{ fontSize: 16, fontWeight: 500 }}
                      />
                    </div>
                    {priceNum > 0 && (
                      <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>
                        You receive{" "}
                        <span className="font-mono" style={{ color: "var(--green)" }}>
                          ${netAmount(priceNum).toFixed(2)} USDC
                        </span>{" "}
                        after 10% platform fee.
                      </p>
                    )}
                  </div>
                </div>

                {error && <p style={{ fontSize: 12.5, color: "var(--red)", marginTop: 12 }}>{error}</p>}

                <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
                  <button
                    onClick={() => setStep("profile")}
                    className="btn-ghost"
                    style={{ padding: "13px 18px", borderRadius: "var(--r-sm)", fontSize: 14 }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!form.title.trim() || !form.description.trim() || loading}
                    className="btn-primary"
                    style={{
                      flex: 1, padding: "13px", borderRadius: "var(--r-sm)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    {loading ? (
                      <>
                        <span style={{
                          width: 14, height: 14, borderRadius: "50%",
                          border: "2px solid rgba(6,14,10,0.4)", borderTopColor: "#060E0A",
                          display: "inline-block", animation: "spin 0.7s linear infinite",
                        }} />
                        Generating...
                      </>
                    ) : (
                      <>Generate my link <ArrowRight /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: LINK */}
            {step === "link" && (
              <motion.div
                key="link"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ padding: 36, textAlign: "center" }}
              >
                {/* Success orb */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                  style={{
                    width: 64, height: 64, borderRadius: "50%", margin: "0 auto 20px",
                    background: "radial-gradient(circle at 35% 30%, rgba(18,232,154,0.5), rgba(18,232,154,0.15) 50%, transparent)",
                    border: "1px solid var(--green-border)",
                    boxShadow: "0 0 40px rgba(18,232,154,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" stroke="#12E89A">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </motion.div>

                <h1 style={{
                  fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em",
                  marginBottom: 8, color: "var(--text-1)",
                }}>
                  Your link is live.
                </h1>
                <p style={{
                  fontSize: 14, color: "var(--text-2)", marginBottom: 24, lineHeight: 1.65,
                }}>
                  Share it with clients. They submit a brief, fund escrow, and your USDC
                  arrives the moment they approve your work.
                </p>

                {/* Link box */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 14px", borderRadius: "var(--r-sm)",
                  background: "var(--card-2)", border: "1px solid var(--line)",
                  marginBottom: 10, textAlign: "left",
                }}>
                  <span className="font-mono" style={{
                    flex: 1, fontSize: 12, color: "var(--green)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {link}
                  </span>
                  <button
                    onClick={copyLink}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "5px 10px", borderRadius: 6,
                      background: copied ? "var(--green-dim)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${copied ? "var(--green-border)" : "var(--line)"}`,
                      color: copied ? "var(--green)" : "var(--text-2)",
                      fontSize: 11.5, fontWeight: 500, cursor: "pointer",
                      transition: "all 0.2s ease", whiteSpace: "nowrap",
                    }}
                  >
                    <CopyIcon />
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                {/* Earnings preview */}
                <div style={{
                  padding: "12px 14px", borderRadius: "var(--r-sm)",
                  background: "var(--green-dim)", border: "1px solid var(--green-border)",
                  fontSize: 13, color: "var(--text-2)", textAlign: "left", marginBottom: 20,
                }}>
                  <span style={{ color: "var(--green)", fontWeight: 600 }}>
                    Each client pays ${form.priceUsdc} USDC.
                  </span>{" "}
                  You receive{" "}
                  <span className="font-mono" style={{ color: "var(--green)" }}>
                    ${netAmount(priceNum).toFixed(2)} USDC
                  </span>{" "}
                  per approved delivery. Settlement on Arc: under 500ms.
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    onClick={() => router.push(`/hire/${slug}`)}
                    className="btn-primary"
                    style={{
                      width: "100%", padding: "13px", borderRadius: "var(--r-sm)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    Preview as client
                    <ArrowRight />
                  </button>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="btn-ghost"
                    style={{ width: "100%", padding: "13px", borderRadius: "var(--r-sm)" }}
                  >
                    Go to dashboard
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function Field({
  label, placeholder, value, onChange, as = "input", rows = 3, mono = false,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; as?: "input" | "textarea"; rows?: number; mono?: boolean;
}) {
  return (
    <div>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 500,
        color: "var(--text-2)", marginBottom: 7,
      }}>
        {label}
      </label>
      {as === "textarea" ? (
        <textarea
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="input"
          style={{ resize: "none", fontFamily: mono ? '"DM Mono", monospace' : "inherit" }}
        />
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="input"
          style={{ fontFamily: mono ? '"DM Mono", monospace' : "inherit", fontSize: mono ? 13 : 14 }}
        />
      )}
    </div>
  );
}
