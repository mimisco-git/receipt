import { NextRequest, NextResponse } from "next/server";
import { platformFee, netAmount } from "@/lib/utils";

// POST /api/escrow — client creates a contract and locks escrow with real on-chain deposit
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceId, clientName, clientEmail, brief, currency } = body;

    if (!serviceId || !clientName || !brief) {
      return NextResponse.json(
        { error: "serviceId, clientName, and brief are required" },
        { status: 400 }
      );
    }

    const cur = currency === "EURC" ? "EURC" : "USDC";

    const { db } = await import("@/lib/db");
    const { depositEscrow } = await import("@/lib/x402");

    const service = await db.service.findUnique({
      where: { id: serviceId },
      include: { freelancer: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const fee = platformFee(service.priceUsdc);
    const net = netAmount(service.priceUsdc);

    // Execute real on-chain deposit: buyer → escrow wallet
    const deposit = await depositEscrow({
      amount: service.priceUsdc,
      currency: cur,
    });

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
        escrowTxHash: deposit.txHash || null,
      },
      include: { service: { include: { freelancer: true } } },
    });

    return NextResponse.json({
      ...contract,
      escrowDeposited: deposit.success,
      chain: "Arc Testnet",
    });
  } catch (err) {
    console.error("POST /api/escrow error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
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
  } catch (err) {
    console.error("GET /api/escrow error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
