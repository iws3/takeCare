import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;
console.log("[Prisma Debug] DATABASE_URL present:", !!connectionString);

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

// In Prisma 7 with @prisma/adapter-neon, the constructor expects PoolConfig, not a Pool instance
const adapter = new PrismaNeon({ connectionString });



export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["query"],
  });


if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

