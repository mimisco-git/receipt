import { NextRequest, NextResponse } from "next/server";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, bio, walletAddress, title, description, priceUsdc, currency } = body;
    const cur = currency === "EURC" ? "EURC" : "USDC";

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

    let freelancer = await db.freelancer.findFirst({
      where: { walletAddress: walletAddress || "pending" },
    });

    if (!freelancer) {
      freelancer = await db.freelancer.create({
        data: {
          name,
          bio: bio || null,
          walletAddress: walletAddress || "pending-" + Date.now(),
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
        freelancerId: freelancer.id,
      },
      include: { freelancer: true },
    });

    return NextResponse.json(service);
  } catch (err) {
    console.error("POST /api/service error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
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
  } catch (err) {
    console.error("GET /api/service error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
