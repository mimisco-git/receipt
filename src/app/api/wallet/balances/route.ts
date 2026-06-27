import { NextResponse } from "next/server";
import { getTokenBalance, getBuyerAddress, getSellerAddress } from "@/lib/x402";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const buyerAddr = await getBuyerAddress();
    const sellerAddr = await getSellerAddress();

    const [buyerUsdc, buyerEurc, sellerUsdc, sellerEurc] = await Promise.all([
      buyerAddr ? getTokenBalance(buyerAddr, "USDC") : Promise.resolve(0),
      buyerAddr ? getTokenBalance(buyerAddr, "EURC") : Promise.resolve(0),
      sellerAddr ? getTokenBalance(sellerAddr, "USDC") : Promise.resolve(0),
      sellerAddr ? getTokenBalance(sellerAddr, "EURC") : Promise.resolve(0),
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
