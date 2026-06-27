import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/escrow/authorize
// Relays an EIP-3009 transferWithAuthorization using the platform escrow wallet as gas payer.
// The client signs typed data off-chain (no gas, no chain-switching friction);
// this endpoint submits the on-chain call on their behalf.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, to, value, validAfter, validBefore, nonce, signature, currency } = body;

    if (!from || !to || !value || !nonce || !signature) {
      return NextResponse.json({ error: "Missing required authorization fields" }, { status: 400 });
    }

    const { relayAuthorization } = await import("@/lib/x402");
    const result = await relayAuthorization({
      from,
      to,
      value,
      validAfter: validAfter ?? 0,
      validBefore: validBefore ?? Math.floor(Date.now() / 1000) + 3600,
      nonce,
      signature,
      currency: currency === "EURC" ? "EURC" : "USDC",
    });

    return NextResponse.json({ txHash: result.txHash });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Relay failed";
    console.error("POST /api/escrow/authorize error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
