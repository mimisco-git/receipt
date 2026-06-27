import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/profile — upsert a freelancer record by wallet address
// Called on every profile save so sign-in by wallet always finds the user
export async function POST(req: NextRequest) {
  try {
    const { name, bio, walletAddress, avatarColor } = await req.json();

    if (!name?.trim() || !walletAddress?.trim()) {
      return NextResponse.json({ error: "name and walletAddress required" }, { status: 400 });
    }

    if (walletAddress.startsWith("pending")) {
      return NextResponse.json({ error: "Real wallet address required" }, { status: 400 });
    }

    const { db } = await import("@/lib/db");

    const freelancer = await db.freelancer.upsert({
      where: { walletAddress: walletAddress.toLowerCase() },
      update: {
        name: name.trim(),
        bio: bio?.trim() || null,
        avatarColor: avatarColor || "#00E5C3",
      },
      create: {
        name: name.trim(),
        bio: bio?.trim() || null,
        walletAddress: walletAddress.toLowerCase(),
        avatarColor: avatarColor || "#00E5C3",
      },
    });

    return NextResponse.json({ id: freelancer.id, walletAddress: freelancer.walletAddress });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/profile error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
