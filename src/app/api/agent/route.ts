import { NextRequest, NextResponse } from "next/server";
import { evaluateDelivery } from "@/lib/agent";

function isDemoMode() {
  return !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("localhost");
}

// POST /api/agent
// Body: { contractId, deliveryNote }
// Returns: { score, reasoning, recommendation, partialPercent }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractId, deliveryNote } = body;

    if (!contractId || !deliveryNote) {
      return NextResponse.json({ error: "contractId and deliveryNote required" }, { status: 400 });
    }

    if (isDemoMode()) {
      // Demo: use Claude if ANTHROPIC_API_KEY is set, otherwise mock
      const evaluation = await evaluateDelivery(
        "Write a 1000-word blog post about solar panel installation in Lagos, Nigeria.",
        deliveryNote,
        8.0
      );
      return NextResponse.json({ contractId, evaluation });
    }

    const { db } = await import("@/lib/db");

    const contract = await db.contract.findUnique({
      where: { id: contractId },
      include: { service: true },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Mark as evaluating
    await db.contract.update({
      where: { id: contractId },
      data: { status: "AGENT_EVALUATING" },
    });

    const evaluation = await evaluateDelivery(
      contract.brief,
      deliveryNote,
      contract.amountUsdc
    );

    // Save agent verdict
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

    return NextResponse.json({ contractId, evaluation });
  } catch (err) {
    console.error("POST /api/agent error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// PUT /api/agent
// Body: { contractId, action: "APPROVE" | "DISPUTE" }
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractId, action } = body;

    if (!contractId || !action) {
      return NextResponse.json({ error: "contractId and action required" }, { status: 400 });
    }

    if (isDemoMode()) {
      return NextResponse.json({
        contractId,
        action,
        settled: action === "APPROVE",
        settlementMs: 482,
        txHash: "0xdemo" + Date.now().toString(16),
      });
    }

    const { db } = await import("@/lib/db");

    if (action === "APPROVE") {
      const contract = await db.contract.findUnique({ where: { id: contractId } });
      if (!contract) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      // In production: call Circle API to release escrow here
      // const txHash = await releaseEscrow(contract);

      const settled = await db.contract.update({
        where: { id: contractId },
        data: {
          status: "SETTLED",
          settledAt: new Date(),
          settleTxHash: "0xarc" + Date.now().toString(16),
        },
      });

      await db.transaction.create({
        data: {
          contractId,
          type: "SETTLEMENT",
          amountUsdc: settled.netAmountUsdc,
          txHash: settled.settleTxHash,
          status: "CONFIRMED",
          chain: "ARC-TESTNET",
        },
      });

      return NextResponse.json({
        contractId,
        action: "APPROVE",
        settled: true,
        settlementMs: 482,
        txHash: settled.settleTxHash,
      });
    }

    if (action === "DISPUTE") {
      await db.contract.update({
        where: { id: contractId },
        data: { status: "DISPUTED", disputedAt: new Date() },
      });
      return NextResponse.json({ contractId, action: "DISPUTE", settled: false });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("PUT /api/agent error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
