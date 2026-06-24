import { NextResponse } from "next/server";
import { generateEntitySecretCiphertext } from "@circle-fin/developer-controlled-wallets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.CIRCLE_API_KEY;
    const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

    if (!apiKey || !entitySecret) {
      return NextResponse.json({ error: "CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET must be set" }, { status: 400 });
    }

    const ciphertext = await generateEntitySecretCiphertext({
      apiKey,
      entitySecret,
    });

    return NextResponse.json({
      ciphertext,
      instruction: "Copy this ciphertext and paste it into the Circle Console entity secret rotation form",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
