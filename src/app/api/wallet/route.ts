import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { hasCircleKey } from "@/lib/utils";

// GET /api/wallet?walletId=xxx — check wallet balance
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const walletId = searchParams.get("walletId");

  if (!walletId) {
    return NextResponse.json({ error: "walletId required" }, { status: 400 });
  }

  if (!hasCircleKey()) {
    return NextResponse.json({ balance: 100.0, currency: "USDC", mode: "demo" });
  }

  try {
    const { getWalletBalance } = await import("@/lib/circle");
    const balance = await getWalletBalance(walletId);
    return NextResponse.json({ balance, currency: "USDC" });
  } catch (err) {
    console.error("GET /api/wallet error:", err);
    return NextResponse.json({ balance: 0, currency: "USDC", error: "Failed to fetch balance" });
  }
}

// POST /api/wallet — provisions a new Circle custodial wallet
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, role } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    if (!hasCircleKey()) {
      // Demo mode: return a fake wallet
      return NextResponse.json({
        walletId: "demo-wallet-" + nanoid(8),
        walletAddress: "0x" + nanoid(40).toLowerCase().replace(/[^a-f0-9]/g, "a"),
        userId,
        role: role || "freelancer",
        chain: "ARC-TESTNET",
        balance: 0,
      });
    }

    // Production: Create a Circle user wallet
    const { createUserWallet } = await import("@/lib/circle");

    const idempotencyKey = `receipt-wallet-${userId}-${Date.now()}`;
    const circleUser = await createUserWallet(idempotencyKey);

    return NextResponse.json({
      walletId: circleUser.id,
      userId,
      role: role || "freelancer",
      chain: "ARC-TESTNET",
    });
  } catch (err) {
    console.error("POST /api/wallet error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
