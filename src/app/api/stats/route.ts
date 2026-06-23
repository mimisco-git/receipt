import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  try {
    const { db } = await import("@/lib/db");

    const [serviceCount, contractCount, settledContracts, totalVolume] = await Promise.all([
      db.service.count({ where: { isActive: true } }),
      db.contract.count(),
      db.contract.count({ where: { status: "SETTLED" } }),
      db.contract.aggregate({ _sum: { amountUsdc: true } }),
    ]);

    return NextResponse.json({
      services: serviceCount,
      contracts: contractCount,
      settled: settledContracts,
      volume: totalVolume._sum.amountUsdc || 0,
    });
  } catch {
    return NextResponse.json({
      services: 0,
      contracts: 0,
      settled: 0,
      volume: 0,
    });
  }
}
