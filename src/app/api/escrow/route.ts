import { NextRequest, NextResponse } from "next/server";
import { platformFee, netAmount } from "@/lib/utils";

function isDemoMode() {
  return !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("localhost");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceId, clientName, clientEmail, brief } = body;

    if (!serviceId || !clientName || !brief) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (isDemoMode()) {
      const id = "demo-contract-" + Date.now().toString(36);
      return NextResponse.json({
        id,
        serviceId,
        clientName,
        clientEmail: clientEmail || null,
        brief,
        amountUsdc: 8.0,
        platformFee: 0.8,
        netAmountUsdc: 7.2,
        status: "PENDING_DELIVERY",
        createdAt: new Date().toISOString(),
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
      },
      include: { service: { include: { freelancer: true } } },
    });

    return NextResponse.json(contract);
  } catch (err) {
    console.error("POST /api/escrow error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

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
          "Write a 1000-word blog post about the benefits of solar panel installation for homeowners in Lagos, Nigeria.",
        amountUsdc: 8.0,
        netAmountUsdc: 7.2,
        platformFee: 0.8,
        status: "PENDING_DELIVERY",
        service: { title: "SEO blog post, 1000 words" },
        freelancer: { name: "Amara Nwosu", avatarColor: "#667eea" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
