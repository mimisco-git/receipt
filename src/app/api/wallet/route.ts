import { NextRequest, NextResponse } from "next/server";

// POST /api/wallet — provisions a Circle custodial wallet for a user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, role } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

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
    return NextResponse.json({ error: "Wallet provisioning failed" }, { status: 500 });
  }
}
