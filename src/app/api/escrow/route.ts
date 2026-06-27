import { NextRequest, NextResponse } from "next/server";
import { platformFee, netAmount } from "@/lib/utils";

export const dynamic = "force-dynamic";

// POST /api/escrow — client creates a contract and locks escrow
// Uses Circle developer-controlled wallets for real fund transfers
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceId, clientName, clientEmail, brief, currency, clientTxHash, clientWalletAddress } = body;

    if (!serviceId || !clientName || !brief) {
      return NextResponse.json(
        { error: "serviceId, clientName, and brief are required" },
        { status: 400 }
      );
    }

    const cur = currency === "EURC" ? "EURC" : "USDC";
    const { db } = await import("@/lib/db");

    const service = await db.service.findUnique({
      where: { id: serviceId },
      include: { freelancer: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const fee = platformFee(service.priceUsdc);
    const net = netAmount(service.priceUsdc);

    // If the client signed and sent the tx themselves, use their txHash directly
    let escrowTxHash = clientTxHash || "";
    let depositSuccess = !!clientTxHash;

    // Fallback: platform wallet deposit (only if client did not sign)
    if (!clientTxHash) {
      try {
        const { depositEscrow } = await import("@/lib/x402");
        const deposit = await depositEscrow({
          amount: service.priceUsdc,
          currency: cur,
        });
        escrowTxHash = deposit.txHash;
        depositSuccess = deposit.success;
      } catch (err) {
        console.error("Escrow deposit error:", err);
      }
    }

    const contract = await db.contract.create({
      data: {
        serviceId: service.id,
        freelancerId: service.freelancerId,
        clientName,
        clientEmail: clientEmail || null,
        brief,
        currency: cur,
        amountUsdc: service.priceUsdc,
        platformFee: fee,
        netAmountUsdc: net,
        status: "PENDING_DELIVERY",
        escrowTxHash: escrowTxHash || null,
      },
      include: { service: { include: { freelancer: true } } },
    });

    return NextResponse.json({
      ...contract,
      escrowDeposited: depositSuccess,
      escrowTxHash,
      clientWalletAddress: clientWalletAddress || null,
      chain: "Arc Testnet",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/escrow error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/escrow?id=xxx — get contract details
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const { db } = await import("@/lib/db");

    const contract = await db.contract.findUnique({
      where: { id },
      include: {
        service: { include: { freelancer: true } },
        freelancer: true,
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(contract);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/escrow error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
