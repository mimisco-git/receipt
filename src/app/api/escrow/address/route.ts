import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const address = process.env.SELLER_ADDRESS || process.env.SELLER_WALLET_ADDRESS || "";
  if (!address) {
    return NextResponse.json({ error: "Escrow address not configured" }, { status: 500 });
  }
  return NextResponse.json({ escrowAddress: address });
}
