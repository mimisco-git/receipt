import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const { db } = await import("@/lib/db");

    const where: Record<string, unknown> = { isActive: true };
    if (type === "service" || type === "job") {
      where.type = type;
    }

    const services = await db.service.findMany({
      where,
      include: { freelancer: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // For job listings, check which ones have a funded (open) contract so the
    // marketplace can show a "Budget locked" badge to workers
    const jobIds = services.filter((s: { type: string | null }) => s.type === "job").map((s: { id: string }) => s.id);
    const fundedSet = new Set<string>();
    if (jobIds.length > 0) {
      const funded = await db.contract.findMany({
        where: { serviceId: { in: jobIds }, clientName: "open" },
        select: { serviceId: true },
      });
      funded.forEach((c: { serviceId: string }) => fundedSet.add(c.serviceId));
    }

    // Compute avg rating per freelancer from settled contracts (gracefully skip if column not yet migrated)
    const freelancerIds = Array.from(new Set(services.map((s: { freelancerId: string }) => s.freelancerId)));
    let ratingMap = new Map<string, { avg: number | null; count: number }>();
    try {
      const ratingRows = await db.contract.groupBy({
        by: ["freelancerId"],
        where: { freelancerId: { in: freelancerIds }, status: "SETTLED", rating: { not: null } },
        _avg: { rating: true },
        _count: { rating: true },
      });
      ratingMap = new Map(ratingRows.map((r: { freelancerId: string; _avg: { rating: number | null }; _count: { rating: number } }) => [r.freelancerId, { avg: r._avg.rating, count: r._count.rating }]));
    } catch {}

    const result = services.map((s: Record<string, unknown>) => {
      const fl = s.freelancer as Record<string, unknown> | null;
      const bio = (fl?.bio as string | null) || "";
      const verified = bio.trim().length >= 15;
      const quizPassed = !!(fl?.quizPassed as boolean | null);
      return {
        ...s,
        funded: s.type === "job" ? fundedSet.has(s.id as string) : undefined,
        avgRating: ratingMap.get(s.freelancerId as string)?.avg ?? null,
        ratingCount: ratingMap.get(s.freelancerId as string)?.count ?? 0,
        verified,
        quizPassed,
      };
    });

    return NextResponse.json({ services: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/service/list error:", message);
    return NextResponse.json({ services: [], error: message });
  }
}
