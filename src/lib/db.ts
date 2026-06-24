import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildUrl() {
  const base = process.env.DATABASE_URL || "";
  const sep = base.includes("?") ? "&" : "?";
  const params = [];
  if (!base.includes("pgbouncer=true")) params.push("pgbouncer=true");
  if (!base.includes("connection_limit=")) params.push("connection_limit=1");
  if (!base.includes("statement_cache_size=")) params.push("statement_cache_size=0");
  return params.length ? `${base}${sep}${params.join("&")}` : base;
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
    datasources: { db: { url: buildUrl() } },
  });

globalForPrisma.prisma = db;
