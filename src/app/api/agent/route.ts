import { NextRequest, NextResponse } from "next/server";
import { evaluateDelivery } from "@/lib/agent";
import { releaseEscrow } from "@/lib/x402";
import type { Currency } from "@/lib/x402";

function getAgentModel(): string {
  if (process.env.NVIDIA_API_KEY) return "nvidia/llama-3.3-70b-instruct";
  if (process.env.GROQ_API_KEY) return "groq/llama-3.3-70b-versatile";
  if (process.env.ANTHROPIC_API_KEY) return "claude-sonnet-4-6";
  return "mock";
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

    const { db } = await import("@/lib/db");

    const contract = await db.contract.findUnique({
      where: { id: contractId },
      include: { service: true },
    });

    if (!contract) {
      // Fallback for contracts not in DB (e.g. localStorage-only)
      const briefText = brief || "Evaluate this delivery.";
      const price = priceUsdc || 8.0;
      const evaluation = await evaluateDelivery(briefText, deliveryNote, price);
      return NextResponse.json({ contractId, evaluation, agentModel: getAgentModel() });
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

    return NextResponse.json({ contractId, evaluation, agentModel: getAgentModel() });
  } catch (err) {
    console.error("POST /api/agent error:", err);
    // Still try to evaluate even if DB fails
    try {
      const body = await req.clone().json().catch(() => ({}));
      const evaluation = await evaluateDelivery(
        body.brief || "Evaluate this delivery.",
        body.deliveryNote || "",
        body.priceUsdc || 8.0
      );
      return NextResponse.json({ contractId: body.contractId, evaluation, agentModel: getAgentModel() });
    } catch {
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
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

      // Update DB
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
              type: "SETTLEMENT",
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
    model: getAgentModel(),
    sellerAddress: process.env.SELLER_ADDRESS || "not-configured",
    buyerAddress: process.env.BUYER_ADDRESS || "not-configured",
    currencies: ["USDC", "EURC"],
    chain: "Arc Testnet",
  });
}
