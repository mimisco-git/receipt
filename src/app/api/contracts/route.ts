import { NextRequest, NextResponse } from "next/server";

function isDemoMode() {
  const url = process.env.DATABASE_URL || "";
  return !url ||
    url.includes("localhost") ||
    url.includes("[YOUR-PASSWORD]") ||
    url.includes("USER:PASSWORD") ||
    url.includes("HOST:5432");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const wallet = searchParams.get("wallet");
  const clientName = searchParams.get("clientName");

  if (isDemoMode()) {
    return NextResponse.json({ contracts: [], mode: "demo" });
  }

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

    return NextResponse.json({ contracts: [] });
  } catch (err) {
    console.error("GET /api/contracts error:", err);
    return NextResponse.json({ contracts: [], error: "Internal error" });
  }
}
