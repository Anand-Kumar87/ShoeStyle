import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  database: {
    connected: boolean;
    latencyMs: number;
    error?: string;
  };
  memory: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  // Only accept GET and HEAD
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', ['GET', 'HEAD']);
    return res.status(405).end();
  }

  const startTime = Date.now();
  let dbConnected = false;
  let dbLatency = 0;
  let dbError: string | undefined;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
    dbConnected = true;
  } catch (err: any) {
    dbConnected = false;
    dbError = err.message || 'Database ping failed';
  }

  const mem = process.memoryUsage();
  const isHealthy = dbConnected;

  const responsePayload: HealthResponse = {
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'production',
    database: {
      connected: dbConnected,
      latencyMs: dbLatency,
      ...(dbError ? { error: dbError } : {}),
    },
    memory: {
      rssMb: Math.round(mem.rss / 1024 / 1024),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
    },
  };

  // Cache-Control: no cache for accurate health checking
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  return res.status(isHealthy ? 200 : 503).json(responsePayload);
}
