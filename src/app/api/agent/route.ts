import { NextRequest, NextResponse } from "next/server";
import { evaluateDelivery } from "@/lib/agent";
import { releaseEscrow } from "@/lib/x402";
import type { Currency } from "@/lib/x402";

function isDemoMode() {
  return !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.includes("localhost") ||
    process.env.DATABASE_URL.includes("[YOUR-PASSWORD]");
}

// POST /api/agent — submit delivery for AI evaluation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractId, deliveryNote, brief, priceUsdc } = body;

    if (!contractId || !deliveryNote) {
      return NextResponse.json(
        { error: "contractId and deliveryNote required" },
        { status: 400 }
      );
    }

    const briefText = brief ||
      "Write a 1000-word blog post about solar panel installation in Lagos, Nigeria.";
    const price = priceUsdc || 8.0;

    if (isDemoMode()) {
      const evaluation = await evaluateDelivery(briefText, deliveryNote, price);
      return NextResponse.json({
        contractId,
        evaluation,
        agentModel: process.env.NVIDIA_API_KEY
          ? "nvidia/llama-3.3-70b-instruct"
          : process.env.GROQ_API_KEY
          ? "groq/llama-3.3-70b-versatile"
          : process.env.ANTHROPIC_API_KEY
          ? "claude-sonnet-4-6"
          : "mock",
      });
    }

    const { db } = await import("@/lib/db");

    const contract = await db.contract.findUnique({
      where: { id: contractId },
      include: { service: true },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    await db.contract.update({
      where: { id: contractId },
      data: { status: "AGENT_EVALUATING" },
    });

    const evaluation = await evaluateDelivery(
      contract.brief,
      deliveryNote,
      contract.amountUsdc
    );

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

    return NextResponse.json({
      contractId,
      evaluation,
      agentModel: process.env.NVIDIA_API_KEY
        ? "nvidia/llama-3.3-70b-instruct"
        : process.env.GROQ_API_KEY
        ? "groq/llama-3.3-70b-versatile"
        : process.env.ANTHROPIC_API_KEY
        ? "claude-sonnet-4-6"
        : "mock",
    });
  } catch (err) {
    console.error("POST /api/agent error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// PUT /api/agent — approve or dispute, triggering real on-chain payment release
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
      const toAddress = freelancerAddress ||
        process.env.SELLER_ADDRESS ||
        "0x0000000000000000000000000000000000000000";
      const amount = netAmountUsdc || 7.2;

      // Real on-chain release: escrow wallet → freelancer
      const result = await releaseEscrow({
        toAddress,
        amount,
        currency: cur,
      });

      if (isDemoMode()) {
        return NextResponse.json({
          contractId,
          action: "APPROVE",
          settled: result.success,
          settlementMs: result.settlementMs,
          txHash: result.txHash,
          currency: cur,
          chain: "Arc Testnet",
        });
      }

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
            type: "SETTLEMENT",
            amountUsdc: amount,
            txHash: result.txHash,
            status: "CONFIRMED",
            chain: "ARC-TESTNET",
          },
        });
      }

      return NextResponse.json({
        contractId,
        action: "APPROVE",
        settled: result.success,
        settlementMs: result.settlementMs,
        txHash: result.txHash,
        currency: cur,
        chain: "Arc Testnet",
      });
    }

    if (action === "DISPUTE") {
      if (!isDemoMode()) {
        const { db } = await import("@/lib/db");
        await db.contract.update({
          where: { id: contractId },
          data: { status: "DISPUTED", disputedAt: new Date() },
        });
      }
      return NextResponse.json({
        contractId,
        action: "DISPUTE",
        settled: false,
        message: "Dispute opened. The Receipt Agent will re-evaluate within 60 seconds.",
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("PUT /api/agent error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// GET /api/agent — check agent model status
export async function GET() {
  return NextResponse.json({
    status: "online",
    model: process.env.NVIDIA_API_KEY
      ? "nvidia/llama-3.3-70b-instruct"
      : process.env.GROQ_API_KEY
      ? "groq/llama-3.3-70b-versatile"
      : process.env.ANTHROPIC_API_KEY
      ? "claude-sonnet-4-6"
      : "mock-evaluation",
    sellerAddress: process.env.SELLER_ADDRESS || "not-configured",
    buyerAddress: process.env.BUYER_ADDRESS || "not-configured",
    currencies: ["USDC", "EURC"],
    chain: "Arc Testnet",
  });
}
