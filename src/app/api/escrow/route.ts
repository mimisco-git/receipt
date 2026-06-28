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
// GET /api/escrow?serviceId=xxx — find open (pre-funded) contract for a job
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const serviceId = searchParams.get("serviceId");

    const { db } = await import("@/lib/db");

    if (serviceId) {
      const contract = await db.contract.findFirst({
        where: { serviceId, clientName: "open" },
        orderBy: { createdAt: "desc" },
        include: { service: { include: { freelancer: true } }, freelancer: true },
      });
      if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(contract);
    }

    if (!id) {
      return NextResponse.json({ error: "id or serviceId required" }, { status: 400 });
    }

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

// PATCH /api/escrow — worker accepts a pre-funded job contract
// Updates the clientName (worker) and brief (proposal) on the open contract
export async function PATCH(req: NextRequest) {
  try {
    const { serviceId, workerName, workerProposal } = await req.json();

    if (!serviceId || !workerName) {
      return NextResponse.json({ error: "serviceId and workerName required" }, { status: 400 });
    }

    const { db } = await import("@/lib/db");

    const contract = await db.contract.findFirst({
      where: { serviceId, clientName: "open" },
      orderBy: { createdAt: "desc" },
    });

    if (!contract) {
      return NextResponse.json({ error: "No funded contract found for this job. The client may not have locked funds yet." }, { status: 404 });
    }

    // Use updateMany with the "open" guard to prevent double-acceptance race condition
    const result = await db.contract.updateMany({
      where: { id: contract.id, clientName: "open" },
      data: {
        clientName: workerName,
        // brief stays as original job requirements so AI evaluates correctly
        // worker's acceptance note stored in clientEmail (reused field)
        clientEmail: workerProposal || null,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "This job has already been accepted by another worker." }, { status: 409 });
    }

    const updated = await db.contract.findUnique({
      where: { id: contract.id },
      include: { service: { include: { freelancer: true } } },
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("PATCH /api/escrow error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
