import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Query over a plain pg connection instead of Prisma's native query engine binary,
// which otherwise has to match the exact OS/libc of wherever the app is deployed
// (a recurring source of "could not locate the Query Engine" failures on serverless).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
