"use server";

const CIRCLE_API  = "https://api.circle.com/v1/w3s";
const API_KEY     = process.env.CIRCLE_API_KEY!;
const ENTITY_SECRET = process.env.CIRCLE_ENTITY_SECRET!;

async function circlePost(path: string, body: unknown) {
  const res = await fetch(`${CIRCLE_API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Circle API error ${res.status}: ${JSON.stringify(err)}`);
  }
  return res.json();
}

async function circleGet(path: string) {
  const res = await fetch(`${CIRCLE_API}${path}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Circle GET error ${res.status}`);
  return res.json();
}

export async function createUserWallet(idempotencyKey: string) {
  const data = await circlePost("/users", { idempotencyKey });
  return data.data as { id: string };
}

export async function getWalletBalance(walletId: string) {
  const data = await circleGet(`/wallets/${walletId}/balances`);
  const usdc = data.data?.tokenBalances?.find(
    (b: { token?: { symbol?: string }; amount?: string }) => b.token?.symbol === "USDC"
  );
  return parseFloat(usdc?.amount ?? "0");
}

export async function transferUsdc(params: {
  sourceWalletId: string;
  destinationAddress: string;
  amountUsdc: string;
  idempotencyKey: string;
}) {
  return circlePost("/transactions/transfer", {
    idempotencyKey: params.idempotencyKey,
    sourceWalletId: params.sourceWalletId,
    destinationAddress: params.destinationAddress,
    amounts: [params.amountUsdc],
    feeLevel: "MEDIUM",
  });
}

export { ENTITY_SECRET };
