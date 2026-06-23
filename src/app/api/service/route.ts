import { NextRequest, NextResponse } from "next/server";
import { slugify } from "@/lib/utils";

// In production, this uses Prisma/Supabase.
// For demo mode (no DATABASE_URL), it returns mock data.

function isDemoMode() {
  return !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.includes("localhost") ||
    process.env.DATABASE_URL.includes("[YOUR-PASSWORD]");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, bio, walletAddress, title, description, priceUsdc } = body;

    if (!name || !title || !description || !priceUsdc) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slug =
      slugify(name) +
      "-" +
      slugify(title).slice(0, 12) +
      "-" +
      Date.now().toString(36).slice(-4);

    if (isDemoMode()) {
      return NextResponse.json({
        id: "demo-" + Date.now().toString(36),
        slug,
        title,
        description,
        priceUsdc,
        freelancer: { name, bio, walletAddress, avatarColor: "#667eea" },
      });
    }

    // Production: use Prisma
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

    if (isDemoMode()) {
      // Return demo data
      return NextResponse.json({
        id: "demo",
        slug,
        title: "SEO blog post, 1000 words",
        description:
          "Original, well-researched article optimized for search. Includes keyword strategy, meta description, and one revision within 48 hours.",
        priceUsdc: 8.0,
        freelancer: {
          id: "demo-freelancer",
          name: "Amara Nwosu",
          walletAddress: "0xdemo",
          avatarColor: "#667eea",
          bio: "SEO writer with 5 years in fintech and sustainability sectors.",
        },
        isActive: true,
        createdAt: new Date().toISOString(),
      });
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
