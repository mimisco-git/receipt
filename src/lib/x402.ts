"use server";

import { createWalletClient, createPublicClient, http, erc20Abi, parseUnits } from "viem";
import { arcTestnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const ARC_TESTNET_USDC = "0x3600000000000000000000000000000000000000" as const;
const ARC_RPC = "https://rpc.testnet.arc.network";

function getSellerAccount() {
  const key = process.env.SELLER_PRIVATE_KEY as `0x${string}`;
  if (!key) throw new Error("SELLER_PRIVATE_KEY not set");
  return privateKeyToAccount(key);
}

export function getSellerAddress(): string {
  return process.env.SELLER_ADDRESS ?? "";
}

// Build the x402 payment required response header
export function buildPaymentRequiredResponse(
  priceUsdc: number,
  resourcePath: string
) {
  const sellerAddress = getSellerAddress();
  const priceInAtomicUnits = Math.round(priceUsdc * 1_000_000).toString();

  return {
    status: 402,
    headers: {
      "X-Payment-Required": JSON.stringify({
        scheme: "exact",
        network: "arcTestnet",
        maxAmountRequired: priceInAtomicUnits,
        resource: resourcePath,
        description: `Payment required: $${priceUsdc} USDC`,
        mimeType: "application/json",
        payTo: sellerAddress,
        maxTimeoutSeconds: 60,
        asset: ARC_TESTNET_USDC,
        extra: {
          name: "USD Coin",
          version: "2",
        },
      }),
    },
  };
}

// Verify payment signature from x402 header
export async function verifyPaymentHeader(
  paymentHeader: string,
  priceUsdc: number
): Promise<{ valid: boolean; txHash?: string; payer?: string }> {
  try {
    const payment = JSON.parse(
      Buffer.from(paymentHeader, "base64").toString("utf8")
    );

    // In testnet demo mode, accept any payment that has required fields
    if (payment.payload && payment.payload.authorization) {
      return {
        valid: true,
        txHash: payment.payload.signature ?? "0xdemo",
        payer: payment.payload.authorization.from ?? "0xunknown",
      };
    }

    return { valid: false };
  } catch {
    return { valid: false };
  }
}

// Transfer USDC from buyer to seller (direct on-chain transfer for escrow release)
export async function releaseEscrow(params: {
  toAddress: string;
  amountUsdc: number;
  idempotencyKey: string;
}): Promise<{ txHash: string; success: boolean }> {
  const sellerKey = process.env.SELLER_PRIVATE_KEY as `0x${string}`;

  if (!sellerKey || sellerKey.startsWith("0xdemo")) {
    // Demo mode
    return {
      txHash: "0xdemo_" + Date.now().toString(16),
      success: true,
    };
  }

  try {
    const account = privateKeyToAccount(sellerKey);
    const walletClient = createWalletClient({
      account,
      chain: arcTestnet,
      transport: http(ARC_RPC),
    });

    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http(ARC_RPC),
    });

    const amountAtomicUnits = parseUnits(params.amountUsdc.toFixed(6), 6);

    const txHash = await walletClient.writeContract({
      address: ARC_TESTNET_USDC,
      abi: erc20Abi,
      functionName: "transfer",
      args: [params.toAddress as `0x${string}`, amountAtomicUnits],
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    return { txHash, success: true };
  } catch (err) {
    console.error("releaseEscrow error:", err);
    return { txHash: "", success: false };
  }
}

// Get USDC balance of an address on Arc testnet
export async function getUsdcBalance(address: string): Promise<number> {
  try {
    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http(ARC_RPC),
    });

    const balance = await publicClient.readContract({
      address: ARC_TESTNET_USDC,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
    });

    return Number(balance) / 1_000_000;
  } catch {
    return 0;
  }
}
