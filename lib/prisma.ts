import { PrismaClient } from "@prisma/client";
import { join } from "node:path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const isLocalDevelopment = process.env.NODE_ENV !== "production" && !process.env.VERCEL;

if (!process.env.DATABASE_URL) {
  if (isLocalDevelopment) {
    process.env.DATABASE_URL = `file:${join(process.cwd(), "prisma", "dev.db")}`;
  } else {
    throw new Error("DATABASE_URL is required outside local development.");
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
