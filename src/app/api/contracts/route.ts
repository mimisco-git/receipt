import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const wallet = searchParams.get("wallet");
  const clientName = searchParams.get("clientName");

  try {
    const { db } = await import("@/lib/db");

    if (role === "worker" && wallet) {
      const freelancer = await db.freelancer.findFirst({
        where: { walletAddress: wallet },
      });
      if (!freelancer) return NextResponse.json({ contracts: [] });
      const contracts = await db.contract.findMany({
        where: { freelancerId: freelancer.id },
        include: { service: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ contracts });
    }

    if (role === "client" && clientName) {
      const contracts = await db.contract.findMany({
        where: { clientName },
        include: { service: { include: { freelancer: true } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ contracts });
    }

    if (role === "open") {
      const contracts = await db.contract.findMany({
        where: { status: "PENDING_DELIVERY" },
        include: { service: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return NextResponse.json({ contracts });
    }

    // Return all contracts (for general dashboard)
    if (role === "all") {
      const contracts = await db.contract.findMany({
        include: { service: { include: { freelancer: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return NextResponse.json({ contracts });
    }

    return NextResponse.json({ contracts: [] });
  } catch (err) {
    console.error("GET /api/contracts error:", err);
    return NextResponse.json({ contracts: [], error: "Internal error" });
  }
}
