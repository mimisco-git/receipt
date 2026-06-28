"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, Zap, Clock } from "lucide-react";
import Nav from "@/components/layout/Nav";
import { formatUsdc, netAmount, getInitials } from "@/lib/utils";
import { loadProfile } from "@/lib/profile";

const TOKEN_ADDRESSES: Record<string, `0x${string}`> = {
  USDC: "0x3600000000000000000000000000000000000000",
  EURC: "0x3700000000000000000000000000000000000000",
};
const TOKEN_NAMES: Record<string, string> = { USDC: "USD Coin", EURC: "Euro Coin" };
const ARC_CHAIN_ID_DEC = 5042002;
const ARC_CHAIN_ID_HEX = "0x4CEF52";

type WalletStep = "idle" | "connecting" | "signing" | "relaying" | "confirmed";

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
  const [escrowDeposited, setEscrowDeposited] = useState(false);
  const [walletStep, setWalletStep] = useState<WalletStep>("idle");
  const [walletError, setWalletError] = useState<string | null>(null);
  const [clientWalletAddress, setClientWalletAddress] = useState("");

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

  async function connectAndAuthorize(escrowAddress: string, amount: number, currency: "USDC" | "EURC") {
    const eth = (window as unknown as { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
    if (!eth) throw new Error("No wallet detected. Install MetaMask or Rabby.");

    setWalletStep("connecting");
    const accounts = await eth.request({ method: "eth_requestAccounts" }) as string[];
    const from = accounts[0];
    setClientWalletAddress(from);

    setWalletStep("signing");

    // Random bytes32 nonce — EIP-3009 requires a unique nonce per authorization
    const nonceBytes = crypto.getRandomValues(new Uint8Array(32));
    const nonce = `0x${Array.from(nonceBytes).map(b => b.toString(16).padStart(2, "0")).join("")}`;
    const validAfter  = 0;
    const validBefore = Math.floor(Date.now() / 1000) + 3600;
    const atomicValue = Math.round(amount * 1e6).toString();

    const typedData = {
      domain: {
        name: TOKEN_NAMES[currency] || "USD Coin",
        version: "2",
        chainId: ARC_CHAIN_ID_DEC,
        verifyingContract: TOKEN_ADDRESSES[currency],
      },
      types: {
        EIP712Domain: [
          { name: "name",              type: "string"  },
          { name: "version",           type: "string"  },
          { name: "chainId",           type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        TransferWithAuthorization: [
          { name: "from",        type: "address" },
          { name: "to",         type: "address" },
          { name: "value",      type: "uint256" },
          { name: "validAfter", type: "uint256" },
          { name: "validBefore",type: "uint256" },
          { name: "nonce",      type: "bytes32" },
        ],
      },
      primaryType: "TransferWithAuthorization",
      message: {
        from,
        to:          escrowAddress,
        value:       atomicValue,
        validAfter:  validAfter.toString(),
        validBefore: validBefore.toString(),
        nonce,
      },
    };

    const signature = await eth.request({
      method: "eth_signTypedData_v4",
      params: [from, JSON.stringify(typedData)],
    }) as string;

    setWalletStep("relaying");

    // Platform relays the tx — client pays zero gas
    const res = await fetch("/api/escrow/authorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: escrowAddress, value: atomicValue, validAfter, validBefore, nonce, signature, currency }),
    });

    if (!res.ok) {
      const err = await res.json();
      // 422 with fallback:true means EIP-3009 unsupported — let the caller retry with direct transfer
      if (res.status === 422 && err.fallback) throw new Error("EIP3009_UNSUPPORTED");
      throw new Error(err.error || "Authorization relay failed. Check your USDC balance on Arc Testnet.");
    }

    const { txHash } = await res.json();
    setWalletStep("confirmed");
    return { txHash, from };
  }

  // Fallback: direct ERC20 transfer if EIP-3009 is not supported by the token contract
  async function connectAndTransferDirect(escrowAddress: string, amount: number, currency: "USDC" | "EURC") {
    const { createWalletClient, createPublicClient, custom, http, erc20Abi, parseUnits } = await import("viem");
    const { arcTestnet } = await import("viem/chains");
    const eth = (window as unknown as { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
    if (!eth) throw new Error("No wallet detected.");

    setWalletStep("connecting");
    const accounts = await eth.request({ method: "eth_requestAccounts" }) as string[];
    const from = accounts[0];
    setClientWalletAddress(from);

    // Switch to Arc Testnet
    const currentChain = await eth.request({ method: "eth_chainId" }) as string;
    if (currentChain.toLowerCase() !== ARC_CHAIN_ID_HEX.toLowerCase()) {
      try {
        await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: ARC_CHAIN_ID_HEX }] });
      } catch (e: unknown) {
        const switchErr = e as { code?: number };
        if (switchErr?.code === 4902) {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [{ chainId: ARC_CHAIN_ID_HEX, chainName: "Arc Testnet", nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 }, rpcUrls: ["https://rpc.testnet.arc.network"], blockExplorerUrls: ["https://testnet.arcscan.app"] }],
          });
        } else throw new Error("Switch your wallet to Arc Testnet.");
      }
    }

    setWalletStep("signing");
    const walletClient = createWalletClient({ account: from as `0x${string}`, chain: arcTestnet, transport: custom(eth as Parameters<typeof custom>[0]) });
    const txHash = await walletClient.writeContract({
      address: TOKEN_ADDRESSES[currency],
      abi: erc20Abi,
      functionName: "transfer",
      args: [escrowAddress as `0x${string}`, parseUnits(amount.toFixed(6), 6)],
    });

    setWalletStep("relaying");
    const publicClient = createPublicClient({ chain: arcTestnet, transport: http("https://rpc.testnet.arc.network") });
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    setWalletStep("confirmed");
    return { txHash, from };
  }

  async function submitBrief() {
    if (!service) return;
    if (!form.clientName.trim()) return;

    setSubmitting(true);
    setWalletError(null);

    // JOB FLOW: client already locked funds when posting — worker just accepts
    if (isJob) {
      try {
        const res = await fetch("/api/escrow", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceId: service.id,
            workerName: form.clientName,
            workerProposal: form.brief || `Accepting job: ${service.title}`,
          }),
        });
        const data = await res.json();
        if (!data.id) throw new Error(data.error || "No funded contract found. The client may not have locked funds yet.");

        setContractId(data.id);
        setEscrowDeposited(true);
        setPhase("success");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        setWalletError(msg);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // SERVICE FLOW: client pays escrow now
    if (!form.brief.trim()) { setSubmitting(false); return; }

    setWalletStep("idle");
    setPhase("funding");

    try {
      const addrRes = await fetch("/api/escrow/address");
      const { escrowAddress } = await addrRes.json();
      if (!escrowAddress) throw new Error("Escrow address unavailable. Try again later.");

      let txHash: string, from: string;
      try {
        ({ txHash, from } = await connectAndAuthorize(escrowAddress, service.priceUsdc, (service.currency || "USDC") as "USDC" | "EURC"));
      } catch (eip3009Err) {
        console.warn("EIP-3009 relay failed, falling back to direct transfer:", eip3009Err);
        ({ txHash, from } = await connectAndTransferDirect(escrowAddress, service.priceUsdc, (service.currency || "USDC") as "USDC" | "EURC"));
      }

      const res = await fetch("/api/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          currency: service.currency || "USDC",
          clientTxHash: txHash,
          clientWalletAddress: from,
          ...form,
        }),
      });
      const data = await res.json();
      if (!data.id) throw new Error(data.error || "Failed to create contract");

      setContractId(data.id);
      setEscrowDeposited(true);
      localStorage.setItem(`receipt_contract_${data.id}`, JSON.stringify({
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
        escrowTxHash: txHash,
        createdAt: new Date().toISOString(),
      }));
      setPhase("success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setWalletError(msg);
      setWalletStep("idle");
      setPhase("brief");
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
          className="w-full max-w-lg overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,.05) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.040) 0%, rgba(255,255,255,.016) 100%)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(255,255,255,.10)",
            borderRadius: 28,
            boxShadow: "0 32px 72px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.12)",
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
                  <h1 className="text-xl font-bold mb-3" style={{ letterSpacing: "-0.04em" }}>
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
                        style={{
                          background: "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.030) 0%, rgba(255,255,255,.012) 100%)",
                          border: "1px solid rgba(255,255,255,.08)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,.06)",
                        }}
                      >
                        <div style={{ color: "rgba(255,255,255,.45)" }}>{t.icon}</div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,.45)" }}>
                          {t.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setPhase("brief")}
                    className="w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(180deg, #23FFE0, #00D7C2)", color: "#000000", boxShadow: "0 8px 30px rgba(0,229,195,.15)" }}
                  >
                    {isJob ? "Accept this job" : "Submit brief and fund escrow"}
                    <ArrowRight size={14} />
                  </button>

                  <div
                    className="text-center text-xs mt-4 leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {isJob
                      ? `${sym}${formatUsdc(price)} ${cur} is already locked in escrow by the client. Deliver the work and get paid when approved.`
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
                <h2 className="text-xl font-bold mb-2" style={{ letterSpacing: "-0.04em" }}>
                  {isJob ? "Accept this job" : "Describe what you need"}
                </h2>
                <p className="text-sm mb-7" style={{ color: "var(--text-secondary)" }}>
                  {isJob
                    ? "The client already locked the budget in escrow. Accept and you can start work immediately."
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
                          background: "rgba(255,255,255,.025)",
                          border: "1px solid rgba(255,255,255,.08)",
                          color: "#FFFFFF",
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,229,195,0.4)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,.08)")}
                      />
                      <div className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                        {form.brief.length} characters. More detail gives the agent more to verify.
                      </div>
                    </div>
                  )}

                  {isJob && (
                    <div className="p-4 rounded-xl text-sm" style={{ background: "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.025) 0%, rgba(255,255,255,.010) 100%)", border: "1px solid rgba(255,255,255,.08)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.06)" }}>
                      <div className="font-semibold mb-2">Job requirements</div>
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,.72)" }}>
                        {service.description}
                      </p>
                    </div>
                  )}

                  {/* Escrow summary */}
                  <div
                    className="p-4 rounded-xl text-sm space-y-2"
                    style={{ background: "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.025) 0%, rgba(255,255,255,.010) 100%)", border: "1px solid rgba(255,255,255,.08)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.06)" }}
                  >
                    <div className="font-semibold mb-3">{isJob ? "Your earnings" : "Escrow summary"}</div>
                    {[
                      [isJob ? "Locked by client" : "You deposit",  `${sym}${formatUsdc(price)} ${cur}`],
                      [isJob ? "You receive (worker)" : "Freelancer receives", `${sym}${formatUsdc(netAmount(price))} ${cur}`],
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

                {walletError && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-5 px-4 py-3 rounded-xl text-xs text-center"
                    style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.2)", color: "#ff6b6b" }}>
                    {walletError}
                  </motion.div>
                )}

                <div className="flex gap-3 mt-7">
                  <button
                    onClick={() => { setPhase("browse"); setWalletError(null); }}
                    className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                  >
                    Back
                  </button>
                  <button
                    onClick={submitBrief}
                    disabled={!form.clientName.trim() || (!isJob && !form.brief.trim()) || submitting}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(180deg, #23FFE0, #00D7C2)", color: "#000000", boxShadow: "0 8px 30px rgba(0,229,195,.15)" }}
                  >
                    {submitting
                      ? (isJob ? "Accepting..." : "Opening wallet...")
                      : isJob
                      ? "Accept job · no payment needed"
                      : `Pay ${sym}${formatUsdc(price)} ${cur} · fund escrow`
                    }
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* FUNDING — wallet signing steps */}
            {phase === "funding" && (
              <motion.div
                key="funding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-10 flex flex-col items-center text-center"
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
                  <span style={{ fontSize: 32 }}>🔐</span>
                </motion.div>

                <h2 className="text-xl font-bold mb-1">Gasless escrow payment</h2>
                <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
                  Sign once — no gas fees. Platform relays {sym}{formatUsdc(price)} {cur} to escrow on your behalf.
                </p>

                <div className="w-full space-y-3 text-left mb-6">
                  {([
                    ["connecting", "Connect wallet",          "Approve wallet access"],
                    ["signing",    "Sign authorization",      `Gasless EIP-3009 signature — no ${cur} gas needed`],
                    ["relaying",   "Platform relays",         "Submitting your authorization on-chain"],
                    ["confirmed",  "Escrow confirmed",        "Funds locked on Arc Testnet"],
                  ] as [WalletStep, string, string][]).map(([step, label, sub], i) => {
                    const steps: WalletStep[] = ["connecting", "signing", "relaying", "confirmed"];
                    const currentIdx = steps.indexOf(walletStep);
                    const thisIdx = i;
                    const done = currentIdx > thisIdx;
                    const active = currentIdx === thisIdx;
                    return (
                      <div key={step} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{
                          background: active ? "rgba(0,229,195,0.06)" : "rgba(255,255,255,0.025)",
                          border: active ? "1px solid rgba(0,229,195,0.2)" : "1px solid rgba(255,255,255,0.06)",
                        }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                          style={{
                            background: done ? "var(--green)" : active ? "rgba(0,229,195,0.15)" : "rgba(255,255,255,0.06)",
                            color: done ? "#060E0A" : active ? "var(--green)" : "rgba(255,255,255,0.3)",
                            border: active ? "1px solid rgba(0,229,195,0.3)" : "none",
                          }}>
                          {done ? "✓" : i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium" style={{ color: active ? "#fff" : done ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)" }}>
                            {label}
                          </div>
                          <div className="text-xs" style={{ color: active ? "var(--text-secondary)" : "rgba(255,255,255,0.2)" }}>
                            {sub}
                          </div>
                        </div>
                        {active && (
                          <div className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ border: "2px solid rgba(0,229,195,0.3)", borderTopColor: "var(--green)", animation: "spin 0.8s linear infinite" }} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {clientWalletAddress && (
                  <div className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {clientWalletAddress.slice(0, 10)}...{clientWalletAddress.slice(-6)}
                  </div>
                )}
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
                    background: escrowDeposited
                      ? "radial-gradient(circle at 35% 35%, rgba(0,229,195,0.4), rgba(0,229,195,0.1) 50%, transparent)"
                      : "radial-gradient(circle at 35% 35%, rgba(254,188,46,0.3), rgba(254,188,46,0.08) 50%, transparent)",
                    border: escrowDeposited ? "1px solid rgba(0,229,195,0.4)" : "1px solid rgba(254,188,46,0.4)",
                    boxShadow: escrowDeposited ? "0 0 40px rgba(0,229,195,0.15)" : "0 0 40px rgba(254,188,46,0.12)",
                  }}
                >
                  {escrowDeposited ? "✓" : "⚠"}
                </motion.div>

                <h2 className="text-2xl font-bold mb-2" style={{ letterSpacing: "-0.04em" }}>
                  {escrowDeposited
                    ? (isJob ? "Job accepted." : "Escrow funded.")
                    : "Contract created."}
                </h2>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {escrowDeposited
                    ? (isJob
                        ? `Budget confirmed. ${sym}${formatUsdc(price)} ${cur} is locked and waiting for your delivery. Complete the work and submit.`
                        : `${sym}${formatUsdc(price)} ${cur} is locked in escrow. ${service.freelancer.name} can now start your work.`)
                    : `Contract is active but the escrow wallet has insufficient funds. Top up the platform wallet with ${cur} on Arc Testnet and retry.`
                  }
                </p>

                <div
                  className="w-full p-4 rounded-xl mb-6 text-left space-y-2 text-xs"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.025) 0%, rgba(255,255,255,.010) 100%)", border: "1px solid rgba(255,255,255,.08)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.06)" }}
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
                  style={{ background: "linear-gradient(180deg, #23FFE0, #00D7C2)", color: "#000000", boxShadow: "0 8px 30px rgba(0,229,195,.15)" }}
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
        style={{ background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.08)", color: "#FFFFFF" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,229,195,0.4)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,.08)")}
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
