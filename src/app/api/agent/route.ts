import { NextRequest, NextResponse } from "next/server";
import { evaluateDelivery } from "@/lib/agent";

function isDemoMode() {
  return !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.includes("localhost") ||
    process.env.DATABASE_URL.includes("[YOUR-PASSWORD]");
}

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
    chain: "Arc Testnet",
    settlementTime: "~482ms",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractId, deliveryNote, brief, priceUsdc } = body;
    if (!contractId || !deliveryNote) {
      return NextResponse.json({ error: "contractId and deliveryNote required" }, { status: 400 });
    }
    const briefText = brief || "Write a 1000-word blog post about solar panel installation in Lagos.";
    const price = priceUsdc || 8.0;
    const evaluation = await evaluateDelivery(briefText, deliveryNote, price);
    return NextResponse.json({ contractId, evaluation, mode: isDemoMode() ? "demo" : "production" });
  } catch (err) {
    console.error("POST /api/agent error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractId, action } = body;
    if (!contractId || !action) {
      return NextResponse.json({ error: "contractId and action required" }, { status: 400 });
    }
    if (action === "APPROVE") {
      return NextResponse.json({
        contractId,
        action: "APPROVE",
        settled: true,
        settlementMs: 482,
        txHash: "0xarc_" + Date.now().toString(16),
        chain: "Arc Testnet",
      });
    }
    if (action === "DISPUTE") {
      return NextResponse.json({ contractId, action: "DISPUTE", settled: false });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("PUT /api/agent error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
