import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { db } = await import("@/lib/db");

    const services = await db.service.findMany({
      where: { isActive: true },
      include: { freelancer: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ services });
  } catch (err) {
    console.error("GET /api/service/list error:", err);
    return NextResponse.json({ services: [] });
  }
}
