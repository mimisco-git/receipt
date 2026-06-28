import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { contractId, rating, note } = await req.json();

    if (!contractId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "contractId and rating (1-5) required" }, { status: 400 });
    }

    const { db } = await import("@/lib/db");

    const contract = await db.contract.update({
      where: { id: contractId },
      data: { rating: Math.round(rating), ratingNote: note?.trim() || null },
      select: { id: true, rating: true },
    });

    return NextResponse.json({ ok: true, rating: contract.rating });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
