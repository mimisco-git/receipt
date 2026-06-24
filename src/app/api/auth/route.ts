import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { name, walletAddress } = await req.json();

    if (!name && !walletAddress) {
      return NextResponse.json({ error: "Name or wallet address required" }, { status: 400 });
    }

    const { db } = await import("@/lib/db");

    const freelancer = await db.freelancer.findFirst({
      where: walletAddress
        ? { walletAddress }
        : { name: { equals: name, mode: "insensitive" } },
      include: { services: true },
    });

    if (!freelancer) {
      return NextResponse.json({ error: "No account found. Please sign up first." }, { status: 404 });
    }

    const hasServices = freelancer.services.length > 0;
    const hasJobs = freelancer.services.some((s: { type: string | null }) => s.type === "job");
    const role = hasJobs && !hasServices ? "client" : "worker";

    return NextResponse.json({
      name: freelancer.name,
      bio: freelancer.bio || "",
      walletAddress: freelancer.walletAddress,
      role,
      avatarColor: freelancer.avatarColor || "#00D184",
      freelancerId: freelancer.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/auth error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
