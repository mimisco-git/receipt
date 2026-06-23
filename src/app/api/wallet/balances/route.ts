import { NextResponse } from "next/server";
import { getTokenBalance, getBuyerAddress, getSellerAddress } from "@/lib/x402";
import type { Currency } from "@/lib/x402";

export async function GET() {
  try {
    const buyerAddr = await getBuyerAddress();
    const sellerAddr = await getSellerAddress();

    const [buyerUsdc, buyerEurc, sellerUsdc, sellerEurc] = await Promise.all([
      getTokenBalance(buyerAddr, "USDC"),
      getTokenBalance(buyerAddr, "EURC"),
      getTokenBalance(sellerAddr, "USDC"),
      getTokenBalance(sellerAddr, "EURC"),
    ]);

    return NextResponse.json({
      buyer: {
        address: buyerAddr,
        usdc: buyerUsdc,
        eurc: buyerEurc,
      },
      seller: {
        address: sellerAddr,
        usdc: sellerUsdc,
        eurc: sellerEurc,
      },
      chain: "Arc Testnet",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
