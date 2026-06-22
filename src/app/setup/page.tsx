"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ArrowRight, ArrowLeft } from "lucide-react";
import Nav from "@/components/layout/Nav";
import { slugify, netAmount } from "@/lib/utils";

type Step = "profile" | "service" | "link";

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("profile");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    bio: "",
    walletAddress: "",
    title: "",
    description: "",
    priceUsdc: "8.00",
  });

  const [slug, setSlug] = useState("");
  const [serviceId, setServiceId] = useState("");

  const link = `${typeof window !== "undefined" ? window.location.origin : "https://receipt.so"}/hire/${slug}`;

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function nextStep() {
    if (step === "profile") setStep("service");
    else if (step === "service") handleGenerate();
  }

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          priceUsdc: parseFloat(form.priceUsdc) || 8,
        }),
      });
      const data = await res.json();
      if (data.slug) {
        setSlug(data.slug);
        setServiceId(data.id);
        setStep("link");
      }
    } catch {
      // In demo mode, generate a local slug
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
    setTimeout(() => setCopied(false), 2000);
  }

  const steps: Step[] = ["profile", "service", "link"];
  const stepIdx = steps.indexOf(step);

  const priceNum = parseFloat(form.priceUsdc) || 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--space)" }}>
      <Nav />

      <main className="flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-16">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-12">
          {["Your profile", "Your service", "Your link"].map((label, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={
                    i < stepIdx
                      ? { background: "var(--mint)", color: "#0A0E1A" }
                      : i === stepIdx
                      ? { background: "rgba(0,245,160,0.15)", color: "var(--mint)", border: "1px solid rgba(0,245,160,0.4)" }
                      : { background: "var(--card)", color: "var(--text-muted)", border: "1px solid var(--border)" }
                  }
                >
                  {i < stepIdx ? <Check size={12} /> : i + 1}
                </div>
                <span
                  className="text-sm font-medium hidden md:inline transition-colors duration-300"
                  style={{ color: i === stepIdx ? "var(--text-primary)" : "var(--text-muted)" }}
                >
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className="w-12 h-px transition-all duration-500"
                  style={{ background: i < stepIdx ? "var(--mint)" : "var(--border)" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div
          className="w-full max-w-lg rounded-2xl overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
          }}
        >
          <AnimatePresence mode="wait">
            {/* STEP 1: PROFILE */}
            {step === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <h1 className="text-2xl font-bold mb-2" style={{ letterSpacing: "-0.02em" }}>
                  Set up your profile
                </h1>
                <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
                  This is what clients see when they open your link.
                </p>

                <div className="space-y-5">
                  <Field
                    label="Your full name"
                    placeholder="e.g. Amara Nwosu"
                    value={form.name}
                    onChange={(v) => update("name", v)}
                  />
                  <Field
                    label="Short bio (optional)"
                    placeholder="e.g. SEO writer with 5 years in fintech"
                    value={form.bio}
                    onChange={(v) => update("bio", v)}
                    as="textarea"
                  />
                  <Field
                    label="Your USDC wallet address"
                    placeholder="0x..."
                    value={form.walletAddress}
                    onChange={(v) => update("walletAddress", v)}
                    mono
                  />
                  <div
                    className="text-xs p-3 rounded-lg"
                    style={{
                      background: "var(--mint-dim)",
                      color: "var(--mint)",
                      border: "1px solid rgba(0,245,160,0.15)",
                    }}
                  >
                    No wallet? Receipt will auto-provision a Circle custodial wallet for you on the next step.
                  </div>
                </div>

                <ActionButtons
                  onNext={nextStep}
                  nextLabel="Continue"
                  nextDisabled={!form.name.trim()}
                />
              </motion.div>
            )}

            {/* STEP 2: SERVICE */}
            {step === "service" && (
              <motion.div
                key="service"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <h1 className="text-2xl font-bold mb-2" style={{ letterSpacing: "-0.02em" }}>
                  Describe your service
                </h1>
                <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
                  Be specific. The AI agent uses this to evaluate client briefs.
                </p>

                <div className="space-y-5">
                  <Field
                    label="Service title"
                    placeholder="e.g. SEO blog post, 1000 words"
                    value={form.title}
                    onChange={(v) => update("title", v)}
                  />
                  <Field
                    label="What you deliver"
                    placeholder="Describe exactly what the client receives. Include word count, deliverable format, revision policy, turnaround time..."
                    value={form.description}
                    onChange={(v) => update("description", v)}
                    as="textarea"
                    rows={4}
                  />
                  <div>
                    <label
                      className="block text-xs font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Your price (USDC)
                    </label>
                    <div className="flex gap-2">
                      <div
                        className="px-4 py-3 rounded-lg font-mono font-semibold text-sm flex items-center"
                        style={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          color: "var(--mint)",
                        }}
                      >
                        USDC
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={form.priceUsdc}
                        onChange={(e) => update("priceUsdc", e.target.value)}
                        className="flex-1 px-4 py-3 rounded-lg font-mono font-semibold text-base outline-none transition-all duration-200"
                        style={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          color: "var(--text-primary)",
                        }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor = "rgba(0,245,160,0.4)")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor = "var(--border)")
                        }
                      />
                    </div>
                    {priceNum > 0 && (
                      <div
                        className="text-xs mt-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        You receive{" "}
                        <span className="font-mono font-semibold" style={{ color: "var(--mint)" }}>
                          ${netAmount(priceNum).toFixed(2)} USDC
                        </span>{" "}
                        after 10% platform fee.
                      </div>
                    )}
                  </div>
                </div>

                <ActionButtons
                  onBack={() => setStep("profile")}
                  onNext={nextStep}
                  nextLabel={loading ? "Generating..." : "Generate my link"}
                  nextDisabled={!form.title.trim() || !form.description.trim() || loading}
                />
              </motion.div>
            )}

            {/* STEP 3: LINK */}
            {step === "link" && (
              <motion.div
                key="link"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                className="p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
                  style={{
                    background: "radial-gradient(circle at 35% 35%, rgba(0,245,160,0.5), rgba(0,200,130,0.2) 50%, transparent)",
                    border: "1px solid rgba(0,245,160,0.4)",
                    boxShadow: "0 0 60px rgba(0,245,160,0.25)",
                  }}
                >
                  🔗
                </motion.div>

                <h1 className="text-2xl font-bold mb-2" style={{ letterSpacing: "-0.02em" }}>
                  Your link is live.
                </h1>
                <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
                  Share this with clients. They will submit a brief, fund escrow,
                  and your USDC arrives the moment they approve your work.
                </p>

                {/* Link box */}
                <div
                  className="flex items-center gap-3 p-4 rounded-xl mb-3 text-left"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span
                    className="flex-1 font-mono text-sm truncate"
                    style={{ color: "var(--mint)" }}
                  >
                    {link}
                  </span>
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={{
                      background: copied ? "var(--mint-dim)" : "var(--card-hover)",
                      color: copied ? "var(--mint)" : "var(--text-secondary)",
                      border: `1px solid ${copied ? "rgba(0,245,160,0.3)" : "var(--border)"}`,
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                {/* Earnings preview */}
                <div
                  className="p-4 rounded-xl mb-6 text-sm"
                  style={{
                    background: "var(--mint-dim)",
                    border: "1px solid rgba(0,245,160,0.15)",
                  }}
                >
                  <div className="font-semibold mb-1" style={{ color: "var(--mint)" }}>
                    Each client pays ${form.priceUsdc} USDC
                  </div>
                  <div style={{ color: "var(--text-secondary)" }}>
                    You receive{" "}
                    <span className="font-mono font-semibold" style={{ color: "var(--mint)" }}>
                      ${netAmount(priceNum).toFixed(2)} USDC
                    </span>{" "}
                    per approved delivery.
                    Settlement on Arc takes under 500ms.
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => router.push(`/hire/${slug}`)}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90"
                    style={{ background: "var(--mint)", color: "#0A0E1A" }}
                  >
                    Preview as client
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{
                      background: "transparent",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(255,255,255,0.04)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
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
  label,
  placeholder,
  value,
  onChange,
  as = "input",
  rows = 3,
  mono = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  as?: "input" | "textarea";
  rows?: number;
  mono?: boolean;
}) {
  const style = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    fontFamily: mono ? '"JetBrains Mono", monospace' : undefined,
    fontSize: mono ? 13 : undefined,
  };

  const cls =
    "w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200 placeholder:text-[color:var(--text-muted)] resize-none";

  return (
    <div>
      <label
        className="block text-xs font-medium mb-2"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </label>
      {as === "textarea" ? (
        <textarea
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
          style={style}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "rgba(0,245,160,0.4)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "var(--border)")
          }
        />
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
          style={style}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "rgba(0,245,160,0.4)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "var(--border)")
          }
        />
      )}
    </div>
  );
}

function ActionButtons({
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex gap-3 mt-8">
      {onBack && (
        <button
          onClick={onBack}
          className="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all duration-200"
          style={{
            background: "transparent",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.04)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <ArrowLeft size={14} />
          Back
        </button>
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: "var(--mint)", color: "#0A0E1A" }}
      >
        {nextLabel}
        {!nextDisabled && <ArrowRight size={14} />}
      </button>
    </div>
  );
}
