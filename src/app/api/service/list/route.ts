import { NextResponse } from "next/server";

function isDemoMode() {
  return !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.includes("localhost") ||
    process.env.DATABASE_URL.includes("[YOUR-PASSWORD]");
}

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json({ services: [] });
  }

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
