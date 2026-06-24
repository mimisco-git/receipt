import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const wallet = searchParams.get("wallet");
  const name = searchParams.get("clientName") || searchParams.get("name");

  try {
    const { db } = await import("@/lib/db");

    if (role === "worker" && (wallet || name)) {
      // Worker sees:
      // 1. Service flow: contracts where they are the freelancer (by wallet)
      // 2. Job flow: contracts where they are the clientName (they accepted a job)
      const conditions: any[] = [];

      if (wallet) {
        const freelancer = await db.freelancer.findFirst({ where: { walletAddress: wallet } });
        if (freelancer) {
          // Service contracts where they're the worker
          conditions.push({ freelancerId: freelancer.id, service: { type: "service" } });
        }
      }

      if (name) {
        // Job contracts where they accepted (their name is clientName, service type is job)
        conditions.push({ clientName: name, service: { type: "job" } });
      }

      if (conditions.length === 0) return NextResponse.json({ contracts: [] });

      const contracts = await db.contract.findMany({
        where: conditions.length === 1 ? conditions[0] : { OR: conditions },
        include: { service: { include: { freelancer: true } }, freelancer: true },
        orderBy: { createdAt: "desc" },
      });

      const seen = new Set<string>();
      const unique = contracts.filter((c: { id: string }) => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });

      return NextResponse.json({ contracts: unique });
    }

    if (role === "client" && (name || wallet)) {
      // Client sees:
      // 1. Service flow: contracts where they are the clientName
      // 2. Job flow: contracts where they posted the job (they are the freelancer, service type is job)
      const conditions: any[] = [];

      if (name) {
        // Service contracts where they hired someone
        conditions.push({ clientName: name, service: { type: "service" } });
      }

      if (wallet) {
        const freelancer = await db.freelancer.findFirst({ where: { walletAddress: wallet } });
        if (freelancer) {
          // Job contracts where they posted (their freelancer record, service type is job)
          conditions.push({ freelancerId: freelancer.id, service: { type: "job" } });
        }
      }

      if (name) {
        // Also check freelancer name for job posters without wallet match
        const freelancerByName = await db.freelancer.findFirst({ where: { name } });
        if (freelancerByName) {
          conditions.push({ freelancerId: freelancerByName.id, service: { type: "job" } });
        }
      }

      if (conditions.length === 0) return NextResponse.json({ contracts: [] });

      const contracts = await db.contract.findMany({
        where: conditions.length === 1 ? conditions[0] : { OR: conditions },
        include: { service: { include: { freelancer: true } }, freelancer: true },
        orderBy: { createdAt: "desc" },
      });

      // Deduplicate by id
      const seen = new Set<string>();
      const unique = contracts.filter((c: { id: string }) => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });

      return NextResponse.json({ contracts: unique });
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

    return NextResponse.json({ contracts: [] });
  } catch (err) {
    console.error("GET /api/contracts error:", err);
    return NextResponse.json({ contracts: [], error: "Internal error" });
  }
}
