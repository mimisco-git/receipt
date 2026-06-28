import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "viem";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, walletAddress, address, message, signature } = body;

    const { db } = await import("@/lib/db");

    // Wallet signature path — cryptographically verified identity
    if (address && message && signature) {
      let valid = false;
      try {
        valid = await verifyMessage({ address, message, signature });
      } catch {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
      if (!valid) {
        return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
      }

      const freelancer = await db.freelancer.findFirst({
        where: { walletAddress: address.toLowerCase() },
        include: { services: true },
      });

      if (!freelancer) {
        return NextResponse.json({ error: "No account found." }, { status: 404 });
      }

      const hasJobs = freelancer.services.some((s: { type: string | null }) => s.type === "job");
      const hasServices = freelancer.services.some((s: { type: string | null }) => s.type === "service");
      // If they have any services → worker; if only jobs → client
      const role = hasServices ? "worker" : hasJobs ? "client" : "worker";

      return NextResponse.json({
        name: freelancer.name,
        bio: freelancer.bio || "",
        walletAddress: freelancer.walletAddress,
        role,
        avatarColor: freelancer.avatarColor || "#00E5C3",
        freelancerId: freelancer.id,
      });
    }

    // Legacy name / address path
    if (!name && !walletAddress) {
      return NextResponse.json({ error: "Name or wallet address required" }, { status: 400 });
    }

    const freelancer = await db.freelancer.findFirst({
      where: walletAddress
        ? { walletAddress: walletAddress.toLowerCase() }
        : { name: { equals: name, mode: "insensitive" } },
      include: { services: true },
    });

    if (!freelancer) {
      return NextResponse.json({ error: "No account found. Please sign up first." }, { status: 404 });
    }

    const hasJobs2 = freelancer.services.some((s: { type: string | null }) => s.type === "job");
    const hasServices2 = freelancer.services.some((s: { type: string | null }) => s.type === "service");
    const role2 = hasServices2 ? "worker" : hasJobs2 ? "client" : "worker";

    return NextResponse.json({
      name: freelancer.name,
      bio: freelancer.bio || "",
      walletAddress: freelancer.walletAddress,
      role: role2,
      avatarColor: freelancer.avatarColor || "#00E5C3",
      freelancerId: freelancer.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/auth error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
