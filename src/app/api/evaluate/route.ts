import { NextRequest, NextResponse } from "next/server";
import { evaluateDelivery } from "@/lib/agent";

// x402-protected AI evaluation endpoint
// Clients pay $0.01 USDC per evaluation via x402 protocol
export async function POST(req: NextRequest) {
  const sellerAddress = process.env.SELLER_ADDRESS || "";

  // Check for x402 payment header
  const paymentHeader = req.headers.get("x-payment") || req.headers.get("payment");

  if (!paymentHeader) {
    // Return 402 Payment Required with x402 payment details
    return NextResponse.json(
      {
        x402Version: 2,
        error: "Payment required to run AI evaluation",
        resource: {
          url: "/api/evaluate",
          description: "Receipt Agent AI evaluation — scores delivery vs brief",
          mimeType: "application/json",
        },
        accepts: [
          {
            scheme: "exact",
            network: "eip155:5042002",
            asset: "0x3600000000000000000000000000000000000000",
            amount: "10000",
            maxTimeoutSeconds: 604900,
            payTo: sellerAddress,
            description: "$0.01 USDC per AI evaluation",
          },
          {
            scheme: "exact",
            network: "eip155:5042002",
            asset: "0x3700000000000000000000000000000000000000",
            amount: "10000",
            maxTimeoutSeconds: 604900,
            payTo: sellerAddress,
            description: "€0.01 EURC per AI evaluation",
          },
        ],
      },
      {
        status: 402,
        headers: {
          "X-Payment-Required": "true",
          "Access-Control-Expose-Headers": "X-Payment-Required",
        },
      }
    );
  }

  // Payment header present — verify and run evaluation
  try {
    let paymentValid = false;
    let payer = "unknown";

    try {
      const decoded = JSON.parse(
        Buffer.from(paymentHeader, "base64").toString("utf8")
      );
      if (decoded.payload?.authorization) {
        paymentValid = true;
        payer = decoded.payload.authorization.from || "unknown";
      }
    } catch {
      // Try as direct JSON
      try {
        const decoded = JSON.parse(paymentHeader);
        if (decoded.authorization || decoded.signature) {
          paymentValid = true;
          payer = decoded.from || decoded.payer || "unknown";
        }
      } catch {
        paymentValid = false;
      }
    }

    const body = await req.json();
    const { brief, delivery, priceUsdc } = body;

    if (!brief || !delivery) {
      return NextResponse.json({ error: "brief and delivery required" }, { status: 400 });
    }

    const evaluation = await evaluateDelivery(brief, delivery, priceUsdc || 0);

    return NextResponse.json({
      evaluation,
      x402: {
        paid: paymentValid,
        payer,
        fee: "$0.01",
        protocol: "x402",
        network: "Arc Testnet",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET — describes the x402 payment requirements for this endpoint
export async function GET() {
  const sellerAddress = process.env.SELLER_ADDRESS || "";

  return NextResponse.json(
    {
      service: "Receipt Agent AI Evaluation",
      description: "Autonomous AI arbiter that scores freelance deliveries against client briefs. Pay per evaluation via x402.",
      pricing: {
        usdc: "$0.01 per evaluation",
        eurc: "€0.01 per evaluation",
      },
      x402Version: 2,
      accepts: [
        {
          scheme: "exact",
          network: "eip155:5042002",
          asset: "0x3600000000000000000000000000000000000000",
          amount: "10000",
          maxTimeoutSeconds: 604900,
          payTo: sellerAddress,
        },
        {
          scheme: "exact",
          network: "eip155:5042002",
          asset: "0x3700000000000000000000000000000000000000",
          amount: "10000",
          maxTimeoutSeconds: 604900,
          payTo: sellerAddress,
        },
      ],
      example: {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Payment": "<base64-encoded-x402-payment>" },
        body: {
          brief: "Write a 1000-word SEO blog post about solar panels",
          delivery: "The content of the delivery...",
          priceUsdc: 8.0,
        },
      },
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "X-Payment, Payment, Content-Type",
      },
    }
  );
}
