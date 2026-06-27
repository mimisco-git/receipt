import { NextRequest, NextResponse } from "next/server";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, bio, walletAddress, title, description, priceUsdc, currency, type } = body;
    const cur = currency === "EURC" ? "EURC" : "USDC";
    const listingType = type === "job" ? "job" : "service";

    if (!name || !title || !description || !priceUsdc) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slug =
      slugify(name) +
      "-" +
      slugify(title).slice(0, 12) +
      "-" +
      Date.now().toString(36).slice(-4);

    const { db } = await import("@/lib/db");

    // Upsert freelancer — wallet address is the canonical identity
    const wallet = (walletAddress?.trim() || "").toLowerCase();
    let freelancer = null;

    if (wallet && !wallet.startsWith("pending")) {
      freelancer = await db.freelancer.upsert({
        where: { walletAddress: wallet },
        update: { name, bio: bio || null },
        create: { name, bio: bio || null, walletAddress: wallet, avatarColor: "#00E5C3" },
      });
    } else {
      // No wallet — create anonymous record
      freelancer = await db.freelancer.create({
        data: {
          name,
          bio: bio || null,
          walletAddress: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          avatarColor: "#667eea",
        },
      });
    }

    const service = await db.service.create({
      data: {
        slug,
        title,
        description,
        priceUsdc: parseFloat(priceUsdc),
        currency: cur,
        type: listingType,
        freelancerId: freelancer.id,
      },
      include: { freelancer: true },
    });

    return NextResponse.json(service);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/service error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }

    const { db } = await import("@/lib/db");

    const service = await db.service.findUnique({
      where: { slug },
      include: { freelancer: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/service error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
