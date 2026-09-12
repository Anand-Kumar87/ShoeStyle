import { PrismaClient } from '@prisma/client';

// Sanitize connection URLs (strip surrounding quotes or whitespace if pasted with quotes into Vercel)
if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.trim().replace(/^["']|["']$/g, '');
}
if (process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DIRECT_URL.trim().replace(/^["']|["']$/g, '');
}

const cleanDbUrl = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.trim().replace(/^["']|["']$/g, '')
  : undefined;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(cleanDbUrl && (cleanDbUrl.startsWith('postgresql://') || cleanDbUrl.startsWith('postgres://'))
      ? {
          datasources: {
            db: {
              url: cleanDbUrl,
            },
          },
        }
      : {}),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

globalForPrisma.prisma = prisma;

export default prisma;
  