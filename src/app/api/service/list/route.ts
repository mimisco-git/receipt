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

    return NextResponse.json({ services });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/service/list error:", message);
    return NextResponse.json({ services: [], error: message });
  }
}
