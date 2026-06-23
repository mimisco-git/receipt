"use server";

import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

const ARC_TESTNET_USDC = "0x3600000000000000000000000000000000000000";
const ARC_TESTNET_EURC = "0x3700000000000000000000000000000000000000";

function getClient() {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  if (!apiKey || !entitySecret) throw new Error("CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET required");
  return initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
}

// Create a wallet set (one per app, reuse)
export async function getOrCreateWalletSet(): Promise<string> {
  const client = getClient();

  // Try to list existing wallet sets
  const existing = await client.listWalletSets({ pageSize: 1 });
  if (existing.data?.walletSets?.[0]?.id) {
    return existing.data.walletSets[0].id;
  }

  const result = await client.createWalletSet({ name: "Receipt Escrow Platform" });
  return result.data?.walletSet?.id || "";
}

// Create a wallet for a user on Arc Testnet
export async function createWallet(walletSetId: string): Promise<{ walletId: string; address: string }> {
  const client = getClient();

  const result = await client.createWallets({
    walletSetId,
    blockchains: ["ARC-TESTNET"],
    count: 1,
    accountType: "EOA",
  });

  const wallet = result.data?.wallets?.[0];
  if (!wallet) throw new Error("Failed to create wallet");

  return {
    walletId: wallet.id || "",
    address: wallet.address || "",
  };
}

// Transfer USDC/EURC between Circle wallets
export async function transferToken(params: {
  sourceWalletId: string;
  destinationAddress: string;
  amount: string;
  currency: "USDC" | "EURC";
}): Promise<{ transactionId: string; status: string }> {
  const client = getClient();
  const tokenAddress = params.currency === "EURC" ? ARC_TESTNET_EURC : ARC_TESTNET_USDC;

  // Get wallet address from walletId
  const sourceAddress = await getWalletAddress(params.sourceWalletId);

  const result = await client.createTransaction({
    walletAddress: sourceAddress,
    blockchain: "ARC-TESTNET",
    tokenAddress,
    destinationAddress: params.destinationAddress,
    amount: [params.amount],
    fee: { type: "level", config: { feeLevel: "MEDIUM" } },
  });

  const txId = result.data?.id || "";

  // Poll for completion (max 30 seconds)
  let status = "PENDING";
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 3000));
    try {
      const tx = await client.getTransaction({ id: txId });
      status = tx.data?.transaction?.state || "PENDING";
      if (["COMPLETE", "FAILED", "CANCELLED", "DENIED"].includes(status)) break;
    } catch { break; }
  }

  return { transactionId: txId, status };
}

// Get wallet balance
export async function getWalletBalance(walletId: string): Promise<{ usdc: number; eurc: number }> {
  const client = getClient();

  try {
    const result = await client.getWalletTokenBalance({ id: walletId });
    const balances = result.data?.tokenBalances || [];

    let usdc = 0;
    let eurc = 0;
    for (const b of balances) {
      const tokenSymbol = (b.token as unknown as Record<string, unknown>)?.symbol as string || "";
      const tokenAddr = (b.token as unknown as Record<string, unknown>)?.address as string || (b.token as unknown as Record<string, unknown>)?.tokenAddress as string || "";
      if (tokenSymbol === "USDC" || tokenAddr.toLowerCase() === ARC_TESTNET_USDC.toLowerCase()) {
        usdc = parseFloat(b.amount || "0");
      }
      if (tokenSymbol === "EURC" || tokenAddr.toLowerCase() === ARC_TESTNET_EURC.toLowerCase()) {
        eurc = parseFloat(b.amount || "0");
      }
    }

    return { usdc, eurc };
  } catch {
    return { usdc: 0, eurc: 0 };
  }
}

// Get wallet address by ID
export async function getWalletAddress(walletId: string): Promise<string> {
  const client = getClient();
  const result = await client.getWallet({ id: walletId });
  return result.data?.wallet?.address || "";
}
