import { NextRequest, NextResponse } from "next/server";
import { platformFee, netAmount } from "@/lib/utils";
import { nanoid } from "nanoid";

function isDemoMode() {
  return !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.includes("localhost") ||
    process.env.DATABASE_URL.includes("[YOUR-PASSWORD]");
}

// POST /api/escrow . client creates a contract and locks escrow
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
        escrowTxHash: "0xarc_escrow_" + Date.now().toString(16),
      },
      include: { service: { include: { freelancer: true } } },
    });

    return NextResponse.json(contract);
  } catch (err) {
    console.error("POST /api/escrow error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// GET /api/escrow?id=xxx . get contract details
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
        clientName: "James Adeyemi",
        brief:
          "Write a 1000-word blog post about the benefits of solar panel installation for homeowners in Lagos, Nigeria. Focus on cost savings and the new government incentive program.",
        amountUsdc: 8.0,
        netAmountUsdc: 7.2,
        platformFee: 0.8,
        status: "PENDING_DELIVERY",
        service: { title: "SEO blog post, 1000 words" },
        freelancer: { name: "Amara Nwosu", avatarColor: "#667eea" },
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
