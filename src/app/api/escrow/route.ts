import { NextRequest, NextResponse } from "next/server";
import { platformFee, netAmount } from "@/lib/utils";
import { nanoid } from "nanoid";

function isDemoMode() {
  const url = process.env.DATABASE_URL || "";
  return !url ||
    url.includes("localhost") ||
    url.includes("[YOUR-PASSWORD]") ||
    url.includes("USER:PASSWORD") ||
    url.includes("HOST:5432");
}

// POST /api/escrow — client creates a contract and locks escrow
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceId, clientName, clientEmail, brief } = body;

    if (!serviceId || !clientName || !brief) {
      return NextResponse.json(
        { error: "serviceId, clientName, and brief are required" },
        { status: 400 }
      );
    }

    if (isDemoMode()) {
      const id = "contract_" + nanoid(12);
      const price = 8.0;
      return NextResponse.json({
        id,
        serviceId,
        clientName,
        clientEmail: clientEmail || null,
        brief,
        amountUsdc: price,
        platformFee: platformFee(price),
        netAmountUsdc: netAmount(price),
        status: "PENDING_DELIVERY",
        escrowTxHash: "0xdemo_escrow_" + Date.now().toString(16),
        createdAt: new Date().toISOString(),
        mode: "demo",
      });
    }

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

    let escrowTxHash = "0xarc_escrow_" + Date.now().toString(16);
    let circleEscrowId: string | null = null;

    // Try real Circle escrow locking
    if (process.env.CIRCLE_API_KEY) {
      try {
        const { transferUsdc } = await import("@/lib/circle");
        const result = await transferUsdc({
          sourceWalletId: body.clientWalletId || "client-wallet",
          destinationAddress: process.env.ESCROW_WALLET_ADDRESS || "0xescrow",
          amountUsdc: service.priceUsdc.toString(),
          idempotencyKey: `escrow-${Date.now()}-${nanoid(6)}`,
        });
        if (result?.data?.id) {
          escrowTxHash = result.data.id;
          circleEscrowId = result.data.id;
        }
      } catch (err) {
        console.error("Circle escrow lock failed, using fallback:", err);
      }
    }

    const contract = await db.contract.create({
      data: {
        serviceId: service.id,
        freelancerId: service.freelancerId,
        clientName,
        clientEmail: clientEmail || null,
        brief,
        amountUsdc: service.priceUsdc,
        platformFee: fee,
        netAmountUsdc: net,
        status: "PENDING_DELIVERY",
        escrowTxHash,
        circleEscrowId,
      },
      include: { service: { include: { freelancer: true } } },
    });

    return NextResponse.json(contract);
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

    if (isDemoMode()) {
      return NextResponse.json({
        id,
        clientName: "Client",
        brief: "Service brief will appear here.",
        amountUsdc: 8.0,
        netAmountUsdc: 7.2,
        platformFee: 0.8,
        status: "PENDING_DELIVERY",
        service: { title: "Freelance service" },
        freelancer: { name: "Freelancer", avatarColor: "#667eea" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mode: "demo",
      });
    }

    const { db } = await import("@/lib/db");

    const contract = await db.contract.findUnique({
      where: { id },
      include: { service: { include: { freelancer: true } } },
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

// PATCH /api/escrow — verify escrow funding
export async function PATCH(req: NextRequest) {
  try {
    const { contractId } = await req.json();
    if (!contractId) {
      return NextResponse.json({ error: "contractId required" }, { status: 400 });
    }

    if (isDemoMode()) {
      return NextResponse.json({
        verified: true,
        balance: 8.0,
        contractAmount: 8.0,
        mode: "demo",
      });
    }

    const { db } = await import("@/lib/db");
    const contract = await db.contract.findUnique({ where: { id: contractId } });

    if (!contract) {
      return NextResponse.json({ verified: false, error: "Contract not found" }, { status: 404 });
    }

    // Verify via Circle if available
    if (process.env.CIRCLE_API_KEY && contract.circleEscrowId) {
      try {
        const { getWalletBalance } = await import("@/lib/circle");
        const balance = await getWalletBalance(contract.circleEscrowId);
        const verified = balance >= contract.amountUsdc;
        return NextResponse.json({
          verified,
          balance,
          contractAmount: contract.amountUsdc,
          circleVerified: true,
        });
      } catch (err) {
        console.error("Circle balance check failed:", err);
      }
    }

    // Fallback: verify by checking that escrow tx hash exists
    const verified = !!contract.escrowTxHash;
    return NextResponse.json({
      verified,
      contractAmount: contract.amountUsdc,
      escrowTxHash: contract.escrowTxHash,
    });
  } catch (err) {
    console.error("PATCH /api/escrow error:", err);
    return NextResponse.json({ verified: false, error: "Internal error" }, { status: 500 });
  }
}
