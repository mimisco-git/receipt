"use server";

import { createWalletClient, createPublicClient, http, erc20Abi, parseUnits } from "viem";
import { arcTestnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

export type Currency = "USDC" | "EURC";

const TOKEN_ADDRESSES: Record<Currency, `0x${string}`> = {
  USDC: "0x3600000000000000000000000000000000000000",
  EURC: "0x3700000000000000000000000000000000000000",
};

const TOKEN_DECIMALS: Record<Currency, number> = {
  USDC: 6,
  EURC: 6,
};

const ARC_RPC = "https://rpc.testnet.arc.network";

function getTokenAddress(currency: Currency): `0x${string}` {
  return TOKEN_ADDRESSES[currency] || TOKEN_ADDRESSES.USDC;
}

function getDecimals(currency: Currency): number {
  return TOKEN_DECIMALS[currency] || 6;
}

export async function getSellerAddress(): Promise<string> {
  return process.env.SELLER_ADDRESS ?? "";
}

export async function getBuyerAddress(): Promise<string> {
  return process.env.BUYER_ADDRESS ?? "";
}

// Deposit: buyer wallet → seller/escrow wallet (locks funds)
export async function depositEscrow(params: {
  amount: number;
  currency: Currency;
}): Promise<{ txHash: string; success: boolean; from: string; to: string }> {
  const buyerKey = process.env.BUYER_PRIVATE_KEY as `0x${string}`;
  const sellerAddress = process.env.SELLER_ADDRESS as `0x${string}`;

  if (!buyerKey || !sellerAddress) {
    return {
      txHash: "0xdemo_deposit_" + Date.now().toString(16),
      success: true,
      from: "0xdemo_buyer",
      to: "0xdemo_escrow",
    };
  }

  try {
    const account = privateKeyToAccount(buyerKey);
    const walletClient = createWalletClient({
      account,
      chain: arcTestnet,
      transport: http(ARC_RPC),
    });
    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http(ARC_RPC),
    });

    const tokenAddress = getTokenAddress(params.currency);
    const decimals = getDecimals(params.currency);
    const atomicAmount = parseUnits(params.amount.toFixed(decimals), decimals);

    const txHash = await walletClient.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "transfer",
      args: [sellerAddress, atomicAmount],
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    return {
      txHash,
      success: true,
      from: account.address,
      to: sellerAddress,
    };
  } catch (err) {
    console.error("depositEscrow error:", err);
    return { txHash: "", success: false, from: "", to: "" };
  }
}

// Release: seller/escrow wallet → freelancer wallet (settles payment)
export async function releaseEscrow(params: {
  toAddress: string;
  amount: number;
  currency: Currency;
}): Promise<{ txHash: string; success: boolean; settlementMs: number }> {
  const sellerKey = process.env.SELLER_PRIVATE_KEY as `0x${string}`;
  const start = Date.now();

  if (!sellerKey) {
    return {
      txHash: "0xdemo_release_" + Date.now().toString(16),
      success: true,
      settlementMs: 482,
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

    const tokenAddress = getTokenAddress(params.currency);
    const decimals = getDecimals(params.currency);
    const atomicAmount = parseUnits(params.amount.toFixed(decimals), decimals);

    const txHash = await walletClient.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "transfer",
      args: [params.toAddress as `0x${string}`, atomicAmount],
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });
    const settlementMs = Date.now() - start;

    return { txHash, success: true, settlementMs };
  } catch (err) {
    console.error("releaseEscrow error:", err);
    return { txHash: "", success: false, settlementMs: 0 };
  }
}

// Get token balance of an address on Arc testnet
export async function getTokenBalance(address: string, currency: Currency = "USDC"): Promise<number> {
  try {
    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http(ARC_RPC),
    });

    const tokenAddress = getTokenAddress(currency);
    const decimals = getDecimals(currency);

    const balance = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
    });

    return Number(balance) / Math.pow(10, decimals);
  } catch {
    return 0;
  }
}

// Build x402 payment required response header
export async function buildPaymentRequiredResponse(
  price: number,
  currency: Currency,
  resourcePath: string
) {
  const sellerAddress = await getSellerAddress();
  const tokenAddress = getTokenAddress(currency);
  const decimals = getDecimals(currency);
  const priceInAtomicUnits = Math.round(price * Math.pow(10, decimals)).toString();

  return {
    status: 402,
    headers: {
      "X-Payment-Required": JSON.stringify({
        scheme: "exact",
        network: "arcTestnet",
        maxAmountRequired: priceInAtomicUnits,
        resource: resourcePath,
        description: `Payment required: ${price} ${currency}`,
        mimeType: "application/json",
        payTo: sellerAddress,
        maxTimeoutSeconds: 60,
        asset: tokenAddress,
        extra: {
          name: currency === "EURC" ? "Euro Coin" : "USD Coin",
          version: "2",
        },
      }),
    },
  };
}
