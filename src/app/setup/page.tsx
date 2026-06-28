"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/layout/Nav";
import { netAmount } from "@/lib/utils";
import { loadProfile } from "@/lib/profile";
import { toast } from "sonner";

type Mode = "service" | "job";
type Step = "profile" | "details" | "done";
type FundStep = "idle" | "connecting" | "signing" | "relaying" | "funded";

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

const MODE_CONFIG = {
  service: {
    stepLabels: ["Your profile", "Your service", "Your link"],
    detailsTitle: "Describe your service",
    detailsSub: "Be specific. The AI agent uses this to evaluate client briefs.",
    titleLabel: "Service title",
    titlePlaceholder: "e.g. SEO blog post, 1000 words",
    descLabel: "What you deliver",
    descPlaceholder: "Describe exactly what the client receives. Word count, format, revision policy, turnaround time...",
    priceLabel: "Your price",
    priceSub: (cur: string, net: string) => `You receive ${net} after 10% platform fee.`,
    btnLabel: "Generate my link",
    successTitle: "Your service link is live.",
    successSub: "Share it with clients. They submit a brief, fund escrow, and payment arrives the moment they approve your work.",
  },
  job: {
    stepLabels: ["Your profile", "Your job", "Posted"],
    detailsTitle: "Post a job",
    detailsSub: "Describe what you need done. Workers on the marketplace will see this.",
    titleLabel: "Job title",
    titlePlaceholder: "e.g. Build a landing page for my SaaS",
    descLabel: "Job requirements",
    descPlaceholder: "Describe what you need: deliverables, timeline, quality standards, any references...",
    priceLabel: "Your budget",
    priceSub: (cur: string, net: string) => `Worker receives ${net} after 10% platform fee.`,
    btnLabel: "Post my job",
    successTitle: "Your job is posted.",
    successSub: "Workers can find it on the marketplace. You can also share the link directly with someone you want to hire.",
  },
};

export default function SetupPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("service");
  const [step, setStep] = useState<Step>("profile");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    bio: "",
    walletAddress: "",
    title: "",
    description: "",
    priceUsdc: "8.00",
    currency: "USDC" as "USDC" | "EURC",
  });

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
    if (profile.role === "client") setMode("job");
    if (profile.role === "worker") setMode("service");
  }, []);

  const [enhancing, setEnhancing] = useState(false);
  const [slug, setSlug] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [fundStep, setFundStep] = useState<FundStep>("idle");
  const [fundError, setFundError] = useState("");
  const [jobContractId, setJobContractId] = useState("");

  const TOKEN_ADDRESSES: Record<string, string> = {
    USDC: "0x3600000000000000000000000000000000000000",
    EURC: "0x3700000000000000000000000000000000000000",
  };
  const TOKEN_NAMES: Record<string, string> = { USDC: "USD Coin", EURC: "Euro Coin" };
  const ARC_CHAIN_ID_DEC = 5042002;
  const ARC_CHAIN_ID_HEX = "0x4CEF52";

  async function fundJobEscrow() {
    setFundError("");
    const eth = (window as unknown as { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
    if (!eth) { setFundError("No wallet detected. Install MetaMask or Rabby."); return; }

    try {
      const addrRes = await fetch("/api/escrow/address");
      const { escrowAddress } = await addrRes.json();
      if (!escrowAddress) throw new Error("Escrow address unavailable.");

      const amount = parseFloat(form.priceUsdc) || 8;
      const currency = form.currency as "USDC" | "EURC";

      let txHash = "";
      let from = "";

      // Try EIP-3009 gasless first
      try {
        setFundStep("connecting");
        const accounts = await eth.request({ method: "eth_requestAccounts" }) as string[];
        from = accounts[0];

        setFundStep("signing");
        const nonceBytes = crypto.getRandomValues(new Uint8Array(32));
        const nonce = `0x${Array.from(nonceBytes).map(b => b.toString(16).padStart(2, "0")).join("")}`;
        const validAfter = 0;
        const validBefore = Math.floor(Date.now() / 1000) + 3600;
        const atomicValue = Math.round(amount * 1e6).toString();

        const typedData = {
          domain: { name: TOKEN_NAMES[currency], version: "2", chainId: ARC_CHAIN_ID_DEC, verifyingContract: TOKEN_ADDRESSES[currency] },
          types: {
            EIP712Domain: [{ name: "name", type: "string" }, { name: "version", type: "string" }, { name: "chainId", type: "uint256" }, { name: "verifyingContract", type: "address" }],
            TransferWithAuthorization: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "value", type: "uint256" }, { name: "validAfter", type: "uint256" }, { name: "validBefore", type: "uint256" }, { name: "nonce", type: "bytes32" }],
          },
          primaryType: "TransferWithAuthorization",
          message: { from, to: escrowAddress, value: atomicValue, validAfter: validAfter.toString(), validBefore: validBefore.toString(), nonce },
        };

        const signature = await eth.request({ method: "eth_signTypedData_v4", params: [from, JSON.stringify(typedData)] }) as string;
        setFundStep("relaying");

        const relayRes = await fetch("/api/escrow/authorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ from, to: escrowAddress, value: atomicValue, validAfter, validBefore, nonce, signature, currency }),
        });

        if (!relayRes.ok) {
          const err = await relayRes.json();
          if (relayRes.status === 422 && err.fallback) throw new Error("EIP3009_UNSUPPORTED");
          throw new Error(err.error || "Relay failed");
        }
        txHash = (await relayRes.json()).txHash;
      } catch (eip3009Err) {
        // Fallback: direct ERC20 transfer via MetaMask
        setFundStep("connecting");
        const { createWalletClient, createPublicClient, custom, http, erc20Abi, parseUnits } = await import("viem");
        const { arcTestnet } = await import("viem/chains");

        if (!eth) throw new Error("No wallet detected.");
        const accounts = await eth.request({ method: "eth_requestAccounts" }) as string[];
        from = accounts[0];

        const currentChain = await eth.request({ method: "eth_chainId" }) as string;
        if (currentChain.toLowerCase() !== ARC_CHAIN_ID_HEX.toLowerCase()) {
          try {
            await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: ARC_CHAIN_ID_HEX }] });
          } catch (e: unknown) {
            const se = e as { code?: number };
            if (se?.code === 4902) {
              await eth.request({ method: "wallet_addEthereumChain", params: [{ chainId: ARC_CHAIN_ID_HEX, chainName: "Arc Testnet", nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 }, rpcUrls: ["https://rpc.testnet.arc.network"], blockExplorerUrls: ["https://testnet.arcscan.app"] }] });
            } else throw new Error("Switch your wallet to Arc Testnet.");
          }
        }

        setFundStep("signing");
        const walletClient = createWalletClient({ account: from as `0x${string}`, chain: arcTestnet, transport: custom(eth as Parameters<typeof custom>[0]) });
        const hash = await walletClient.writeContract({ address: TOKEN_ADDRESSES[currency] as `0x${string}`, abi: erc20Abi, functionName: "transfer", args: [escrowAddress as `0x${string}`, parseUnits(amount.toFixed(6), 6)] });
        setFundStep("relaying");
        const publicClient = createPublicClient({ chain: arcTestnet, transport: http("https://rpc.testnet.arc.network") });
        await publicClient.waitForTransactionReceipt({ hash });
        txHash = hash;
      }

      // Create the pre-funded contract with sentinel worker name "open"
      const contractRes = await fetch("/api/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, clientName: "open", brief: form.description, currency, clientTxHash: txHash, clientWalletAddress: from }),
      });
      const contractData = await contractRes.json();
      if (!contractData.id) throw new Error(contractData.error || "Failed to create contract");

      setJobContractId(contractData.id);
      setFundStep("funded");
    } catch (err) {
      setFundError(err instanceof Error ? err.message : "Something went wrong");
      setFundStep("idle");
    }
  }

  async function connectWallet() {
    const eth = (window as unknown as { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
    if (!eth) { setError("No wallet detected. Install MetaMask or Rabby."); return; }
    try {
      const accounts = await eth.request({ method: "eth_requestAccounts" }) as string[];
      update("walletAddress", accounts[0]);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message || "Wallet connection failed");
    }
  }
  const origin = typeof window !== "undefined" ? window.location.origin : "https://receipt-nine-kohl.vercel.app";
  const link = `${origin}/hire/${slug}`;
  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const cfg = MODE_CONFIG[mode];
  const stepOrder: Step[] = ["profile", "details", "done"];
  const stepIdx = stepOrder.indexOf(step);
  const priceNum = parseFloat(form.priceUsdc) || 0;
  const sym = form.currency === "EURC" ? "€" : "$";

  async function handleNext() {
    setError("");
    if (step === "profile") {
      if (!form.name.trim()) { setError("Please enter your name."); return; }
      setStep("details");
    } else if (step === "details") {
      if (!form.title.trim()) { setError("Please add a title."); return; }
      if (!form.description.trim()) { setError("Please add a description."); return; }
      await handleCreate();
    }
  }

  async function handleCreate() {
    setLoading(true);
    try {
      const res = await fetch("/api/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          priceUsdc: parseFloat(form.priceUsdc) || 8,
          currency: form.currency,
          type: mode,
        }),
      });
      const data = await res.json();
      if (data.slug) {
        setSlug(data.slug);
        setServiceId(data.id || "");
        setStep("done");
        toast.success(mode === "job" ? "Job posted!" : "Service link is live!");
      } else {
        setError(data.error || "Failed to create. Please try again.");
      }
    } catch (err) {
      console.error("Creation failed:", err);
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function enhanceDescription() {
    if (!form.description.trim() || enhancing) return;
    setEnhancing(true);
    try {
      const res = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: form.description, context: mode === "job" ? "job requirements" : "service description" }),
      });
      const data = await res.json();
      if (data.enhanced) {
        update("description", data.enhanced);
        toast.success("Description enhanced with AI");
      }
    } catch {}
    setEnhancing(false);
  }

  function copyLink() {
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <main style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        minHeight: "100vh", padding: "100px 24px 60px",
      }}>

        {/* Mode toggle */}
        {step !== "done" && (
          <div style={{
            display: "flex", gap: 4, marginBottom: 28,
            padding: 4, borderRadius: 999,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--line)",
          }}>
            {(["service", "job"] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); if (step === "details") setError(""); }}
                style={{
                  padding: "8px 20px", borderRadius: 999, border: "none",
                  fontSize: 13, fontWeight: mode === m ? 600 : 400,
                  background: mode === m ? "var(--green-dim)" : "transparent",
                  color: mode === m ? "var(--green)" : "var(--text-3)",
                  cursor: "pointer", transition: "all 0.2s ease",
                }}
              >
                {m === "service" ? "Offer a service" : "Post a job"}
              </button>
            ))}
          </div>
        )}

        {/* Step progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40 }}>
          {cfg.stepLabels.map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 600, transition: "all 0.3s ease",
                  background: i < stepIdx ? "var(--green)" : i === stepIdx ? "var(--green-dim)" : "rgba(255,255,255,0.04)",
                  color: i < stepIdx ? "#060E0A" : i === stepIdx ? "var(--green)" : "var(--text-3)",
                  border: i === stepIdx ? "1px solid var(--green-border)" : i < stepIdx ? "none" : "1px solid var(--line)",
                }}>
                  {i < stepIdx ? <CheckIcon /> : i + 1}
                </div>
                <span style={{
                  fontSize: 13, fontWeight: i === stepIdx ? 500 : 400,
                  color: i === stepIdx ? "var(--text-1)" : "var(--text-3)",
                }}>
                  {label}
                </span>
              </div>
              {i < cfg.stepLabels.length - 1 && (
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
          background: "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.030) 0%, rgba(255,255,255,.012) 100%)",
          backdropFilter: "blur(30px) saturate(180%)",
          WebkitBackdropFilter: "blur(30px) saturate(180%)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 28, overflow: "hidden",
          boxShadow: "0 16px 40px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08)",
        }}>
          <AnimatePresence mode="wait">

            {/* STEP 1: PROFILE */}
            {step === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.28 }} style={{ padding: 36 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: '"Geist", "Inter", sans-serif', letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 6 }}>
                  Set up your profile
                </h1>
                <p style={{ fontSize: 14, opacity: 0.72, color: "inherit", marginBottom: 28, lineHeight: 1.6 }}>
                  {mode === "service" ? "This is what clients see when they open your link." : "This is how workers will know who you are."}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Field label="Your full name" placeholder="Your full name" value={form.name} onChange={v => update("name", v)} />
                  <Field label={mode === "service" ? "Short bio (optional)" : "Company or about (optional)"}
                    placeholder={mode === "service" ? "e.g. SEO writer, 5 years in fintech" : "e.g. Fintech startup, building in DeFi"}
                    value={form.bio} onChange={v => update("bio", v)} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)" }}>Wallet address on Arc</label>
                      <button
                        type="button"
                        onClick={connectWallet}
                        style={{
                          fontSize: 11, fontWeight: 600, color: "var(--green)", background: "none",
                          border: "1px solid var(--green-border)", borderRadius: 6, padding: "3px 9px",
                          cursor: "pointer", transition: "background 0.15s ease",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "var(--green-dim)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                      >
                        Connect wallet
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="0x... or click Connect wallet"
                      value={form.walletAddress}
                      onChange={e => update("walletAddress", e.target.value)}
                      className="input"
                      style={{ fontFamily: '"DM Mono", monospace', fontSize: 13, background: "rgba(0,0,0,0.25)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)" }}
                    />
                  </div>
                </div>
                {error && <p style={{ fontSize: 12.5, color: "var(--red)", marginTop: 12 }}>{error}</p>}
                <button onClick={handleNext} disabled={!form.name.trim()} className="btn-primary"
                  style={{ width: "100%", marginTop: 24, padding: "13px", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  Continue <ArrowRight />
                </button>
              </motion.div>
            )}

            {/* STEP 2: DETAILS (service or job) */}
            {step === "details" && (
              <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.28 }} style={{ padding: 36 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: '"Geist", "Inter", sans-serif', letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 6 }}>
                  {cfg.detailsTitle}
                </h1>
                <p style={{ fontSize: 14, opacity: 0.72, color: "inherit", marginBottom: 28, lineHeight: 1.6 }}>
                  {cfg.detailsSub}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Field label={cfg.titleLabel} placeholder={cfg.titlePlaceholder} value={form.title} onChange={v => update("title", v)} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)" }}>{cfg.descLabel}</label>
                      <button
                        type="button"
                        onClick={enhanceDescription}
                        disabled={!form.description.trim() || enhancing}
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          fontSize: 11, fontWeight: 600,
                          color: enhancing ? "var(--text-3)" : "var(--green)",
                          background: "none",
                          border: "1px solid var(--green-border)", borderRadius: 6,
                          padding: "3px 9px", cursor: !form.description.trim() || enhancing ? "default" : "pointer",
                          opacity: !form.description.trim() ? 0.4 : 1,
                          transition: "opacity 0.2s ease",
                        }}
                      >
                        {enhancing ? (
                          <><span style={{ width: 9, height: 9, borderRadius: "50%", border: "1.5px solid rgba(0,229,195,0.3)", borderTopColor: "var(--green)", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Enhancing...</>
                        ) : (
                          <>✦ Enhance with AI</>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      placeholder={cfg.descPlaceholder}
                      value={form.description}
                      onChange={e => update("description", e.target.value)}
                      className="input"
                      style={{ resize: "none" }}
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginBottom: 7 }}>Currency</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      {(["USDC", "EURC"] as const).map(c => (
                        <button key={c} type="button" onClick={() => setForm(p => ({ ...p, currency: c }))}
                          style={{
                            padding: "10px 18px", borderRadius: "var(--r-sm)",
                            background: form.currency === c ? "var(--green-dim)" : "var(--card-2)",
                            border: `1px solid ${form.currency === c ? "var(--green-border)" : "var(--line)"}`,
                            color: form.currency === c ? "var(--green)" : "var(--text-2)",
                            fontSize: 13, fontWeight: 600, cursor: "pointer",
                            fontFamily: '"DM Mono", monospace', transition: "all 0.15s ease",
                          }}>
                          {c === "USDC" ? "$ USDC" : "€ EURC"}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>
                      {form.currency === "USDC" ? "USD Coin" : "Euro Coin"} by Circle on Arc Testnet
                    </p>
                  </div>

                  {/* Price */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginBottom: 7 }}>
                      {cfg.priceLabel} ({form.currency})
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{
                        padding: "12px 14px", borderRadius: "var(--r-sm)",
                        background: "var(--card-2)", border: "1px solid var(--line)",
                        fontSize: 13, fontWeight: 600, color: "var(--green)",
                        fontFamily: '"DM Mono", monospace', whiteSpace: "nowrap",
                      }}>
                        {form.currency}
                      </div>
                      <input type="number" step="0.01" min="0.01" value={form.priceUsdc}
                        onChange={e => update("priceUsdc", e.target.value)}
                        className="input font-mono" style={{ fontSize: 16, fontWeight: 500 }} />
                    </div>
                    {priceNum > 0 && (
                      <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>
                        {cfg.priceSub(form.currency, `${sym}${netAmount(priceNum).toFixed(2)} ${form.currency}`)}
                      </p>
                    )}
                  </div>
                </div>

                {error && <p style={{ fontSize: 12.5, color: "var(--red)", marginTop: 12 }}>{error}</p>}

                <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
                  <button onClick={() => setStep("profile")} className="btn-ghost"
                    style={{ padding: "13px 18px", borderRadius: "var(--r-sm)", fontSize: 14 }}>Back</button>
                  <button onClick={handleNext} disabled={!form.title.trim() || !form.description.trim() || loading} className="btn-primary"
                    style={{ flex: 1, padding: "13px", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {loading ? (
                      <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(6,14,10,0.4)", borderTopColor: "#060E0A", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Creating...</>
                    ) : (
                      <>{cfg.btnLabel} <ArrowRight /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: DONE — service mode or job mode after funding */}
            {step === "done" && (mode === "service" || fundStep === "funded") && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }} style={{ padding: 36, textAlign: "center" }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                  style={{
                    width: 64, height: 64, borderRadius: "50%", margin: "0 auto 20px",
                    background: "radial-gradient(circle at 35% 30%, rgba(0,229,195,0.4), rgba(0,229,195,0.1) 50%, transparent)",
                    border: "1px solid var(--green-border)", boxShadow: "0 0 40px rgba(0,229,195,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" stroke="#00E5C3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </motion.div>

                <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: '"Geist", "Inter", sans-serif', letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 8 }}>
                  {mode === "job" ? "Budget locked. Job is live." : cfg.successTitle}
                </h1>
                <p style={{ fontSize: 14, opacity: 0.72, color: "inherit", marginBottom: 24, lineHeight: 1.65 }}>
                  {mode === "job"
                    ? "Your budget is in escrow. Workers can now accept this job — payment releases automatically when you approve their delivery."
                    : cfg.successSub}
                </p>

                {/* Link box */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 14px", borderRadius: "var(--r-sm)",
                  background: "var(--card-2)", border: "1px solid var(--line)",
                  marginBottom: 10, textAlign: "left",
                }}>
                  <span className="font-mono" style={{ flex: 1, fontSize: 12, color: "var(--green)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {link}
                  </span>
                  <button onClick={copyLink} style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "5px 10px", borderRadius: 6,
                    background: copied ? "var(--green-dim)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${copied ? "var(--green-border)" : "var(--line)"}`,
                    color: copied ? "var(--green)" : "var(--text-2)",
                    fontSize: 11.5, fontWeight: 500, cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap",
                  }}>
                    <CopyIcon /> {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                {/* Price info */}
                <div style={{
                  padding: "12px 14px", borderRadius: "var(--r-sm)",
                  background: "var(--green-dim)", border: "1px solid var(--green-border)",
                  fontSize: 13, color: "var(--text-2)", textAlign: "left", marginBottom: 20,
                }}>
                  <span style={{ color: "var(--green)", fontWeight: 600 }}>
                    {mode === "service" ? "Each client pays" : "Budget:"} {sym}{form.priceUsdc} {form.currency}.
                  </span>{" "}
                  {mode === "service" ? "You receive" : "Worker receives"}{" "}
                  <span className="font-mono" style={{ color: "var(--green)" }}>
                    {sym}{netAmount(priceNum).toFixed(2)} {form.currency}
                  </span>{" "}
                  after 10% fee. Settlement on Arc: under 500ms.
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={() => router.push(mode === "job" && jobContractId ? `/escrow/${jobContractId}` : `/hire/${slug}`)} className="btn-primary"
                    style={{ width: "100%", padding: "13px", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {mode === "service" ? "Preview as client" : "View contract"} <ArrowRight />
                  </button>
                  <button onClick={() => router.push("/marketplace")} className="btn-ghost"
                    style={{ width: "100%", padding: "13px", borderRadius: "var(--r-sm)" }}>
                    Browse marketplace
                  </button>
                  <button onClick={() => router.push("/dashboard")} className="btn-ghost"
                    style={{ width: "100%", padding: "13px", borderRadius: "var(--r-sm)" }}>
                    Go to dashboard
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: DONE — job mode, escrow not yet funded */}
            {step === "done" && mode === "job" && fundStep !== "funded" && (
              <motion.div key="fund-job" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }} style={{ padding: 36 }}>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%", margin: "0 auto 16px",
                    background: "radial-gradient(circle at 35% 30%, rgba(0,229,195,0.25), rgba(0,229,195,0.06) 50%, transparent)",
                    border: "1px solid var(--green-border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="#00E5C3">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 3H8l-2 4h12l-2-4z" />
                    </svg>
                  </div>
                  <h1 style={{ fontSize: 21, fontWeight: 700, fontFamily: '"Geist", "Inter", sans-serif', letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 6 }}>
                    Lock budget to activate job
                  </h1>
                  <p style={{ fontSize: 13.5, opacity: 0.7, lineHeight: 1.6 }}>
                    Your job listing is created. Lock {sym}{form.priceUsdc} {form.currency} in escrow so workers know funds are guaranteed — no one accepts unpaid jobs.
                  </p>
                </div>

                {/* Steps */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {([
                    ["connecting", "Connect wallet",     "Approve wallet access"],
                    ["signing",    "Sign authorization", "Gasless EIP-3009 signature"],
                    ["relaying",   "Platform relays",    "Submitting on-chain"],
                  ] as [FundStep, string, string][]).map(([s, label, sub], i) => {
                    const order: FundStep[] = ["connecting", "signing", "relaying"];
                    const curIdx = order.indexOf(fundStep === "idle" ? "connecting" : fundStep);
                    const thisIdx = i;
                    const done = fundStep !== "idle" && curIdx > thisIdx;
                    const active = fundStep !== "idle" && curIdx === thisIdx;
                    return (
                      <div key={s} style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: "var(--r-sm)",
                        background: active ? "rgba(0,229,195,0.06)" : "rgba(255,255,255,0.025)",
                        border: `1px solid ${active ? "rgba(0,229,195,0.2)" : "rgba(255,255,255,0.06)"}`,
                      }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700,
                          background: done ? "var(--green)" : active ? "rgba(0,229,195,0.15)" : "rgba(255,255,255,0.06)",
                          color: done ? "#060E0A" : active ? "var(--green)" : "rgba(255,255,255,0.3)",
                          border: active ? "1px solid rgba(0,229,195,0.3)" : "none",
                        }}>
                          {done ? <CheckIcon size={10} /> : i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: active ? "#fff" : done ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)" }}>{label}</div>
                          <div style={{ fontSize: 11, color: active ? "var(--text-2)" : "rgba(255,255,255,0.2)" }}>{sub}</div>
                        </div>
                        {active && (
                          <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(0,229,195,0.3)", borderTopColor: "var(--green)", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {fundError && (
                  <p style={{ fontSize: 12.5, color: "var(--red)", textAlign: "center", marginBottom: 12 }}>{fundError}</p>
                )}

                <button
                  onClick={fundJobEscrow}
                  disabled={fundStep !== "idle"}
                  className="btn-primary"
                  style={{ width: "100%", padding: "13px", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: fundStep !== "idle" ? 0.7 : 1 }}>
                  {fundStep === "idle"
                    ? <>{`Lock ${sym}${form.priceUsdc} ${form.currency} in escrow`} <ArrowRight /></>
                    : <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(6,14,10,0.4)", borderTopColor: "#060E0A", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Locking...</>}
                </button>
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
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginBottom: 7 }}>
        {label}
      </label>
      {as === "textarea" ? (
        <textarea rows={rows} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
          className="input" style={{ resize: "none", fontFamily: mono ? '"DM Mono", monospace' : "inherit" }} />
      ) : (
        <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
          className="input" style={{ fontFamily: mono ? '"DM Mono", monospace' : "inherit", fontSize: mono ? 13 : 14 }} />
      )}
    </div>
  );
}
