import { NextRequest, NextResponse } from "next/server";
import { evaluateDelivery } from "@/lib/agent";
import { releaseEscrow } from "@/lib/x402";
import type { Currency } from "@/lib/x402";

// POST /api/agent — submit delivery for AI evaluation + auto-release if score >= 75
export async function POST(req: NextRequest) {
  try {
    // x402 payment header — $0.01 USDC per evaluation, paid by the client wallet
    const x402Header = req.headers.get("x-payment") || req.headers.get("payment");
    let x402Paid = false;
    let x402Payer = "";
    if (x402Header) {
      try {
        const decoded = JSON.parse(Buffer.from(x402Header, "base64").toString("utf8"));
        const auth = decoded.authorization || decoded.payload?.authorization;
        if (auth) { x402Paid = true; x402Payer = auth.from || ""; }
      } catch {
        try {
          const decoded = JSON.parse(x402Header);
          if (decoded.authorization || decoded.from) { x402Paid = true; x402Payer = decoded.from || ""; }
        } catch {}
      }
    }

    const body = await req.json();
    const { contractId, deliveryNote, brief, priceUsdc } = body;

    if (!contractId || !deliveryNote) {
      return NextResponse.json(
        { error: "contractId and deliveryNote required" },
        { status: 400 }
      );
    }

    const { db } = await import("@/lib/db");

    const contract = await db.contract.findUnique({
      where: { id: contractId },
      include: { service: true, freelancer: true },
    });

    const briefText = contract?.brief || brief || "Evaluate this delivery.";
    const price = contract?.amountUsdc || priceUsdc || 8.0;
    const currency = (contract?.currency || "USDC") as Currency;
    const freelancerAddress = contract?.freelancer?.walletAddress || "";

    // Update status to evaluating
    if (contract) {
      await db.contract.update({
        where: { id: contractId },
        data: { status: "AGENT_EVALUATING" },
      });
    }

    // Run AI evaluation
    const evaluation = await evaluateDelivery(briefText, deliveryNote, price);

    // Update contract with evaluation results
    if (contract) {
      await db.contract.update({
        where: { id: contractId },
        data: {
          agentScore: evaluation.score,
          agentReasoning: evaluation.reasoning,
          deliveryNote,
          deliveredAt: new Date(),
          status: evaluation.recommendation === "DISPUTE" ? "DISPUTED" : "DELIVERED",
        },
      });
    }

    // AUTO-RELEASE: if agent approves (score >= 75), release payment automatically
    let autoSettled = false;
    let txHash = "";
    let settlementMs = 0;

    if (evaluation.recommendation === "APPROVE" && freelancerAddress && !freelancerAddress.startsWith("pending")) {
      try {
        const netAmount = price * 0.9;
        const result = await releaseEscrow({
          toAddress: freelancerAddress,
          amount: netAmount,
          currency,
        });

        if (result.success && contract) {
          await db.contract.update({
            where: { id: contractId },
            data: {
              status: "SETTLED",
              settledAt: new Date(),
              settleTxHash: result.txHash || null,
            },
          });
          await db.transaction.create({
            data: {
              contractId,
              type: "AUTO_SETTLEMENT",
              amountUsdc: netAmount,
              txHash: result.txHash,
              status: "CONFIRMED",
              chain: "ARC-TESTNET",
            },
          });
          autoSettled = true;
          txHash = result.txHash;
          settlementMs = result.settlementMs;
        }
      } catch (err) {
        console.error("Auto-release failed:", err);
      }
    }

    return NextResponse.json({
      contractId,
      evaluation,
      autoSettled,
      txHash,
      settlementMs,
      x402: x402Paid ? { paid: true, payer: x402Payer, fee: "$0.01 USDC", protocol: "x402", network: "Arc Testnet (eip155:5042002)" } : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/agent error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/agent — manual approve or dispute
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractId, action, freelancerAddress, netAmountUsdc, currency } = body;

    if (!contractId || !action) {
      return NextResponse.json(
        { error: "contractId and action required" },
        { status: 400 }
      );
    }

    const cur: Currency = currency === "EURC" ? "EURC" : "USDC";

    if (action === "APPROVE") {
      // Get the real freelancer address from DB if not provided
      let toAddress = freelancerAddress;
      if (!toAddress || toAddress.startsWith("pending")) {
        try {
          const { db } = await import("@/lib/db");
          const contract = await db.contract.findUnique({
            where: { id: contractId },
            include: { freelancer: true },
          });
          toAddress = contract?.freelancer?.walletAddress;
        } catch {}
      }

      if (!toAddress || toAddress.startsWith("pending")) {
        toAddress = process.env.SELLER_ADDRESS || process.env.SELLER_WALLET_ADDRESS || "";
      }

      const amount = netAmountUsdc || 7.2;

      const result = await releaseEscrow({
        toAddress,
        amount,
        currency: cur,
      });

      try {
        const { db } = await import("@/lib/db");
        await db.contract.update({
          where: { id: contractId },
          data: {
            status: result.success ? "SETTLED" : "DISPUTED",
            settledAt: result.success ? new Date() : null,
            settleTxHash: result.txHash || null,
          },
        });

        if (result.success) {
          await db.transaction.create({
            data: {
              contractId,
              type: "MANUAL_SETTLEMENT",
              amountUsdc: amount,
              txHash: result.txHash,
              status: "CONFIRMED",
              chain: "ARC-TESTNET",
            },
          });
        }
      } catch (dbErr) {
        console.error("DB update after settlement:", dbErr);
      }

      return NextResponse.json({
        contractId,
        action: "APPROVE",
        settled: result.success,
        settlementMs: result.settlementMs,
        txHash: result.txHash,
        toAddress,
        currency: cur,
        chain: "Arc Testnet",
      });
    }

    if (action === "DISPUTE") {
      try {
        const { db } = await import("@/lib/db");
        await db.contract.update({
          where: { id: contractId },
          data: { status: "DISPUTED", disputedAt: new Date() },
        });
      } catch (dbErr) {
        console.error("DB update for dispute:", dbErr);
      }
      return NextResponse.json({
        contractId,
        action: "DISPUTE",
        settled: false,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("PUT /api/agent error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/agent — agent status
export async function GET() {
  const model = process.env.NVIDIA_API_KEY
    ? "nvidia/llama-3.3-70b-instruct"
    : process.env.GROQ_API_KEY
    ? "groq/llama-3.3-70b-versatile"
    : process.env.ANTHROPIC_API_KEY
    ? "claude-sonnet-4-6"
    : "receipt-local-eval";

  return NextResponse.json({
    status: "online",
    model,
    autoRelease: "score >= 75",
    currencies: ["USDC", "EURC"],
    chain: "Arc Testnet",
  });
}
