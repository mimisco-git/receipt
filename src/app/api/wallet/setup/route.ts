import { NextResponse } from "next/server";
import {
  registerEntitySecretCiphertext,
} from "@circle-fin/developer-controlled-wallets";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const apiKey = process.env.CIRCLE_API_KEY;
    const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

    if (!apiKey || !entitySecret) {
      return NextResponse.json({
        error: "CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET must be set",
      }, { status: 400 });
    }

    if (!/^[0-9a-fA-F]{64}$/.test(entitySecret)) {
      return NextResponse.json({
        error: `Entity secret must be exactly 64 hex characters. Yours is ${entitySecret.length} chars. No 0x prefix, no spaces.`,
      }, { status: 400 });
    }

    const result = await registerEntitySecretCiphertext({
      apiKey,
      entitySecret,
    });

    return NextResponse.json({
      success: true,
      message: "Entity secret registered with Circle",
      hasRecoveryFile: !!result.data?.recoveryFile,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Entity secret registration error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET || "";
  const apiKey = process.env.CIRCLE_API_KEY || "";

  return NextResponse.json({
    apiKeySet: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.slice(0, 8) + "..." : "NOT SET",
    entitySecretSet: !!entitySecret,
    entitySecretLength: entitySecret.length,
    entitySecretValid: /^[0-9a-fA-F]{64}$/.test(entitySecret),
    hint: "POST to this endpoint to register the entity secret with Circle",
  });
}
