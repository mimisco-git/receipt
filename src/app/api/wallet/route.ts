import { NextRequest, NextResponse } from "next/server";
import { getOrCreateWalletSet, createWallet, getWalletBalance } from "@/lib/circle-wallets";

// POST /api/wallet — provisions a real Circle developer-controlled wallet for a user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, role } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const walletSetId = await getOrCreateWalletSet();
    const wallet = await createWallet(walletSetId);

    try {
      const { db } = await import("@/lib/db");
      await db.freelancer.updateMany({
        where: { name: userId },
        data: {
          circleWalletId: wallet.walletId,
          walletAddress: wallet.address,
        },
      });
    } catch (dbErr) {
      console.error("DB update after wallet creation:", dbErr);
    }

    return NextResponse.json({
      walletId: wallet.walletId,
      walletAddress: wallet.address,
      userId,
      role: role || "freelancer",
      chain: "ARC-TESTNET",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/wallet error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/wallet?id=xxx — get wallet balance
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletId = searchParams.get("id");

    if (!walletId) {
      return NextResponse.json({ error: "wallet id required" }, { status: 400 });
    }

    const balance = await getWalletBalance(walletId);
    return NextResponse.json({ walletId, ...balance });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
