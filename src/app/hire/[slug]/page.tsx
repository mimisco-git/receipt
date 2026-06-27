"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, Zap, Clock } from "lucide-react";
import Nav from "@/components/layout/Nav";
import { formatUsdc, netAmount, getInitials } from "@/lib/utils";
import { loadProfile } from "@/lib/profile";

type Phase = "browse" | "brief" | "funding" | "success";

interface ServiceData {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceUsdc: number;
  currency: "USDC" | "EURC";
  type: "service" | "job";
  freelancer: {
    id: string;
    name: string;
    walletAddress: string;
    avatarColor: string;
    bio: string;
  };
  isActive: boolean;
  createdAt: string;
}

export default function HirePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [service, setService] = useState<ServiceData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>("browse");

  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    brief: "",
  });

  const [contractId, setContractId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/service?slug=${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.id) {
            setService(data);
            // For jobs, pre-fill the brief with the job description and the worker's name
            if (data.type === "job") {
              const profile = loadProfile();
              setForm(f => ({
                ...f,
                clientName: profile.name || f.clientName,
                brief: data.description,
              }));
            }
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  async function submitBrief() {
    if (!service) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          currency: service.currency || "USDC",
          ...form,
        }),
      });
      const data = await res.json();
      if (data.id) {
        setContractId(data.id);
        const contractData = {
          id: data.id,
          clientName: form.clientName,
          brief: form.brief,
          amountUsdc: service.priceUsdc,
          netAmountUsdc: data.netAmountUsdc || service.priceUsdc * 0.9,
          currency: service.currency || "USDC",
          serviceTitle: service.title,
          freelancerName: service.freelancer.name,
          freelancerAddress: service.freelancer.walletAddress,
          status: "pending",
          escrowTxHash: data.escrowTxHash || "",
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(`receipt_contract_${data.id}`, JSON.stringify(contractData));
        setPhase("funding");
        setTimeout(() => setPhase("success"), 2000);
      } else {
        throw new Error(data.error || "No contract ID");
      }
    } catch (err) {
      console.error("Failed to create contract:", err);
      alert("Failed to create contract. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingScreen />;
  if (notFound || !service) return <NotFound />;

  const price = service.priceUsdc;
  const cur = service.currency || "USDC";
  const sym = cur === "EURC" ? "€" : "$";
  const initials = getInitials(service.freelancer.name);
  const isJob = service.type === "job";

  return (
    <div className="min-h-screen" style={{ background: "var(--space)" }}>
      <Nav />

      <main className="flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-16">
        <div
          className="w-full max-w-lg rounded-2xl overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
          }}
        >
          <AnimatePresence mode="wait">
            {/* BROWSE */}
            {phase === "browse" && (
              <motion.div
                key="browse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
              >
                {/* Header */}
                <div className="p-7 pb-5" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between mb-0">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                        style={{ background: service.freelancer.avatarColor }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div className="font-semibold text-base">
                          {service.freelancer.name}
                        </div>
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {isJob ? "Posted this job" : (service.freelancer.bio || "Freelancer on Receipt")}
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: isJob ? "var(--blue-dim)" : "var(--mint-dim)",
                        color: isJob ? "var(--blue)" : "var(--mint)",
                        border: `1px solid rgba(0,229,195,0.2)`,
                      }}
                    >
                      {isJob ? "Job posting" : "Service"}
                    </div>
                  </div>
                </div>

                <div className="p-7">
                  <h1 className="text-xl font-bold mb-3" style={{ letterSpacing: "-0.02em" }}>
                    {service.title}
                  </h1>
                  <p
                    className="text-sm leading-relaxed mb-6"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {service.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-6">
                    <span
                      className="font-mono font-semibold"
                      style={{ fontSize: 40, letterSpacing: "-0.03em" }}
                    >
                      {sym}{formatUsdc(price)}
                    </span>
                    <span
                      className="font-mono font-semibold text-sm"
                      style={{ color: "var(--mint)" }}
                    >
                      {cur}
                    </span>
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {isJob ? "budget" : "per delivery"}
                    </span>
                  </div>

                  {/* Trust signals */}
                  <div className="grid grid-cols-3 gap-3 mb-7">
                    {[
                      { icon: <Shield size={14} />, label: "Escrow protected" },
                      { icon: <Zap size={14} />,    label: "Sub-500ms payout" },
                      { icon: <Clock size={14} />,  label: "No invoice chasing" },
                    ].map((t) => (
                      <div
                        key={t.label}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center"
                        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                      >
                        <div style={{ color: "var(--text-muted)" }}>{t.icon}</div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {t.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setPhase("brief")}
                    className="w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                    style={{ background: "var(--accent)", color: "#000000" }}
                  >
                    {isJob ? "Accept this job" : "Submit brief and fund escrow"}
                    <ArrowRight size={14} />
                  </button>

                  <div
                    className="text-center text-xs mt-4 leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {isJob
                      ? `${sym}${formatUsdc(price)} ${cur} will be locked in escrow. You deliver the work, get paid when approved.`
                      : `Your ${cur} is locked in Circle escrow until you approve the delivery. Payment settles on Arc in under 500ms.`
                    }
                  </div>
                </div>
              </motion.div>
            )}

            {/* BRIEF */}
            {phase === "brief" && (
              <motion.div
                key="brief"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <h2 className="text-xl font-bold mb-2" style={{ letterSpacing: "-0.02em" }}>
                  {isJob ? "Confirm your details" : "Describe what you need"}
                </h2>
                <p className="text-sm mb-7" style={{ color: "var(--text-secondary)" }}>
                  {isJob
                    ? "Confirm your name and the job will be assigned to you."
                    : "Be specific. The AI agent reads this against the delivery to validate the work."
                  }
                </p>

                <div className="space-y-5">
                  <div className={isJob ? "" : "grid grid-cols-2 gap-4"}>
                    <BriefField
                      label={isJob ? "Your name (worker)" : "Your name"}
                      placeholder="Your name"
                      value={form.clientName}
                      onChange={(v) => setForm((f) => ({ ...f, clientName: v }))}
                    />
                    {!isJob && (
                      <BriefField
                        label="Email (optional)"
                        placeholder="you@company.com"
                        value={form.clientEmail}
                        onChange={(v) => setForm((f) => ({ ...f, clientEmail: v }))}
                        type="email"
                      />
                    )}
                  </div>

                  {!isJob && (
                    <div>
                      <label
                        className="block text-xs font-medium mb-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Your brief
                      </label>
                      <textarea
                        rows={6}
                        placeholder="Describe exactly what you want. Include: topic, tone, target audience, word count, specific requirements, references..."
                        value={form.brief}
                        onChange={(e) => setForm((f) => ({ ...f, brief: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none transition-all duration-200"
                        style={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          color: "var(--text-primary)",
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,229,195,0.4)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                      />
                      <div className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                        {form.brief.length} characters. More detail gives the agent more to verify.
                      </div>
                    </div>
                  )}

                  {isJob && (
                    <div className="p-4 rounded-xl text-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                      <div className="font-semibold mb-2">Job requirements</div>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {service.description}
                      </p>
                    </div>
                  )}

                  {/* Escrow summary */}
                  <div
                    className="p-4 rounded-xl text-sm space-y-2"
                    style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                  >
                    <div className="font-semibold mb-3">{isJob ? "Payment summary" : "Escrow summary"}</div>
                    {[
                      [isJob ? "Job budget" : "You deposit",  `${sym}${formatUsdc(price)} ${cur}`],
                      [isJob ? "You receive" : "Freelancer receives", `${sym}${formatUsdc(netAmount(price))} ${cur}`],
                      ["Platform fee",       "10%"],
                      ["Settlement",         "Arc, under 500ms"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span style={{ color: "var(--text-muted)" }}>{k}</span>
                        <span
                          className="font-mono font-semibold"
                          style={{
                            color: (k as string).includes("receive") ? "var(--mint)" : "var(--text-primary)",
                          }}
                        >
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-7">
                  <button
                    onClick={() => setPhase("browse")}
                    className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                  >
                    Back
                  </button>
                  <button
                    onClick={submitBrief}
                    disabled={!form.clientName.trim() || (!isJob && !form.brief.trim()) || submitting}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "var(--accent)", color: "#000000" }}
                  >
                    {submitting
                      ? "Locking escrow..."
                      : isJob
                      ? "Accept and lock escrow"
                      : `Confirm and deposit ${sym}${formatUsdc(price)} ${cur}`
                    }
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* FUNDING */}
            {phase === "funding" && (
              <motion.div
                key="funding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 flex flex-col items-center text-center"
              >
                <motion.div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                  style={{
                    background: "radial-gradient(circle at 35% 35%, rgba(0,229,195,0.3), rgba(0,229,195,0.1) 50%, transparent)",
                    border: "1px solid rgba(0,229,195,0.3)",
                  }}
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span style={{ fontSize: 32 }}>&#128274;</span>
                </motion.div>
                <h2 className="text-xl font-bold mb-2">Locking funds in escrow...</h2>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Depositing {sym}{formatUsdc(price)} {cur} to Circle smart escrow on Arc.
                </p>
              </motion.div>
            )}

            {/* SUCCESS */}
            {phase === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="p-10 flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6"
                  style={{
                    background: "radial-gradient(circle at 35% 35%, rgba(0,229,195,0.4), rgba(0,229,195,0.1) 50%, transparent)",
                    border: "1px solid rgba(0,229,195,0.4)",
                    boxShadow: "0 0 40px rgba(0,229,195,0.15)",
                  }}
                >
                  &#10003;
                </motion.div>

                <h2 className="text-2xl font-bold mb-2" style={{ letterSpacing: "-0.02em" }}>
                  {isJob ? "Job accepted." : "Escrow funded."}
                </h2>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {isJob
                    ? `${sym}${formatUsdc(price)} ${cur} is locked in escrow. Start working on the job and submit your delivery when ready.`
                    : `${sym}${formatUsdc(price)} ${cur} is locked in escrow. ${service.freelancer.name} can now start your work.`
                  }
                </p>

                <div
                  className="w-full p-4 rounded-xl mb-6 text-left space-y-2 text-xs"
                  style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                >
                  <div className="font-semibold mb-3 text-sm">What happens next</div>
                  {isJob ? (
                    <>
                      {[
                        ["Start working",     "Complete the job based on the requirements above."],
                        ["Submit delivery",   "Upload or paste your work on the contract page."],
                        ["Agent validates",   "The AI reads requirements vs delivery and scores the match."],
                        ["Get paid",          `${cur} settles to your wallet in under 500ms.`],
                      ].map(([title, desc]) => (
                        <div key={title} className="flex gap-3 py-1">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--blue)" }} />
                          <div><span className="font-semibold">{title}.</span>{" "}<span style={{ color: "var(--text-secondary)" }}>{desc}</span></div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {[
                        ["Freelancer notified", "They begin work on your brief immediately."],
                        ["Delivery submitted",  "You review the work and approve or flag issues."],
                        ["Agent validates",     "The AI reads brief vs delivery and scores the match."],
                        ["Payment released",    `${cur} settles to the freelancer in under 500ms.`],
                      ].map(([title, desc]) => (
                        <div key={title} className="flex gap-3 py-1">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--mint)" }} />
                          <div><span className="font-semibold">{title}.</span>{" "}<span style={{ color: "var(--text-secondary)" }}>{desc}</span></div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <button
                  onClick={() => router.push(`/escrow/${contractId}`)}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90"
                  style={{ background: "var(--accent)", color: "#000000" }}
                >
                  {isJob ? "Go to contract" : "Track this contract"}
                  <ArrowRight size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function BriefField({ label, placeholder, value, onChange, type = "text" }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200"
        style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,229,195,0.4)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--space)" }}>
      <div className="flex gap-1.5">
        {[0, 0.2, 0.4].map((d) => (
          <div key={d} className="w-2 h-2 rounded-full" style={{ background: "var(--mint)", opacity: 0.4, animation: `thinking 1.2s ${d}s ease-in-out infinite` }} />
        ))}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--space)" }}>
      <div className="text-4xl">404</div>
      <div style={{ color: "var(--text-secondary)" }}>Service not found.</div>
    </div>
  );
}
