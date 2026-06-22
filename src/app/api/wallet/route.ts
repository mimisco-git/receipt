import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

// POST /api/wallet
// Provisions a new Circle custodial wallet for a user (freelancer or client)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, role } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const circleApiKey = process.env.CIRCLE_API_KEY;

    if (!circleApiKey) {
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
