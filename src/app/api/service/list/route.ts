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

    const result = services.map((s: Record<string, unknown>) => ({
      ...s,
      funded: s.type === "job" ? fundedSet.has(s.id as string) : undefined,
    }));

    return NextResponse.json({ services: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/service/list error:", message);
    return NextResponse.json({ services: [], error: message });
  }
}
