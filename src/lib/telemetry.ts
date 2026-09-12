import { NextApiRequest } from 'next';
import prisma from './prisma';

export type ErrorSource = 'client' | 'server' | 'gateway';
export type ErrorSeverity = 'fatal' | 'error' | 'warn';

export interface TelemetryPayload {
  id?: string;
  message: string;
  stack?: string | null;
  source: ErrorSource;
  severity?: ErrorSeverity;
  url?: string | null;
  route?: string | null;
  userId?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any>;
  resolved?: boolean;
  createdAt?: string;
  occurrences?: number;
}

// ==========================================
// 🚀 In-Memory High-Speed Ring Buffer (Latest 200 errors)
// Provides 0ms instant retrieval on Admin Dashboard without hitting database
// ==========================================
const MAX_RING_BUFFER_SIZE = 200;
const memoryLogBuffer: TelemetryPayload[] = [];
const deduplicationCache = new Map<string, { id: string; lastSeen: number }>();
const DEDUP_WINDOW_MS = 10 * 1000; // 10 seconds deduplication window

/**
 * Record an error into in-memory ring buffer & database
 */
export async function recordTelemetry(payload: TelemetryPayload): Promise<TelemetryPayload> {
  const now = new Date();
  const id = payload.id || `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const message = payload.message || 'Unknown application error';
  const source = payload.source || 'server';
  const severity = payload.severity || 'error';

  // 1. Deduplication Check (Storm Protection)
  const dedupKey = `${source}:${payload.route || ''}:${message.substring(0, 100)}`;
  const existing = deduplicationCache.get(dedupKey);

  if (existing && Date.now() - existing.lastSeen < DEDUP_WINDOW_MS) {
    // Increment occurrence in memory buffer
    const target = memoryLogBuffer.find((e) => e.id === existing.id);
    if (target) {
      target.occurrences = (target.occurrences || 1) + 1;
      existing.lastSeen = Date.now();
      return target;
    }
  }

  const logEntry: TelemetryPayload = {
    id,
    message,
    stack: payload.stack || null,
    source,
    severity,
    url: payload.url || null,
    route: payload.route || null,
    userId: payload.userId || null,
    userAgent: payload.userAgent || null,
    metadata: payload.metadata || {},
    resolved: false,
    createdAt: now.toISOString(),
    occurrences: 1,
  };

  // Add to in-memory ring buffer
  memoryLogBuffer.unshift(logEntry);
  if (memoryLogBuffer.length > MAX_RING_BUFFER_SIZE) {
    memoryLogBuffer.pop();
  }

  deduplicationCache.set(dedupKey, { id, lastSeen: Date.now() });

  // 2. Asynchronous Database Persistence (Non-blocking for high concurrency)
  prisma.errorLog
    .create({
      data: {
        id,
        message,
        stack: payload.stack || null,
        source,
        severity,
        url: payload.url || null,
        route: payload.route || null,
        userId: payload.userId || null,
        userAgent: payload.userAgent || null,
        metadata: payload.metadata || {},
        resolved: false,
        createdAt: now,
      },
    })
    .catch((dbErr) => {
      // Gracefully handle DB logging errors to ensure server never crashes
      console.error('[TELEMETRY DB PERSIST ERROR]', dbErr.message);
    });

  return logEntry;
}

/**
 * Server-side helper to report unhandled errors
 */
export async function reportServerError(
  err: any,
  reqOrContext?: NextApiRequest | Record<string, any>,
  additionalContext?: Record<string, any>
) {
  const isReq = reqOrContext && typeof reqOrContext === 'object' && 'headers' in reqOrContext;
  const req = isReq ? (reqOrContext as NextApiRequest) : undefined;
  const context = isReq ? additionalContext : (reqOrContext as Record<string, any> | undefined);

  const message = err?.message || String(err) || 'Unhandled server error';
  const stack = err?.stack || null;
  const route = req?.url || context?.route || context?.endpoint || null;
  const userAgent = req?.headers ? (req.headers['user-agent'] as string) : null;

  return recordTelemetry({
    message,
    stack,
    source: context?.source || 'server',
    severity: context?.severity || 'error',
    route,
    url: req ? `${req.headers.host || ''}${req.url || ''}` : null,
    userId: context?.userId || null,
    userAgent,
    metadata: {
      method: req?.method || context?.method,
      query: req?.query,
      ...context,
    },
  });
}

/**
 * Fetch combined memory & database telemetry logs for Admin Observability
 */
export async function getTelemetryLogs(params: {
  limit?: number;
  source?: string;
  severity?: string;
  resolved?: boolean;
  search?: string;
}) {
  const { limit = 50, source, severity, resolved, search } = params;

  try {
    const where: any = {};
    if (source && source !== 'ALL') where.source = source.toLowerCase();
    if (severity && severity !== 'ALL') where.severity = severity.toLowerCase();
    if (resolved !== undefined) where.resolved = resolved;
    if (search) {
      where.OR = [
        { message: { contains: search, mode: 'insensitive' } },
        { route: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [dbLogs, totalCount, unresolvedCount, fatalCount] = await Promise.all([
      prisma.errorLog.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.errorLog.count(),
      prisma.errorLog.count({ where: { resolved: false } }),
      prisma.errorLog.count({ where: { severity: 'fatal' } }),
    ]);

    // Fast stats computation
    const metrics = {
      totalErrors: totalCount,
      unresolvedErrors: unresolvedCount,
      fatalErrors: fatalCount,
      clientErrors: await prisma.errorLog.count({ where: { source: 'client' } }),
      serverErrors: await prisma.errorLog.count({ where: { source: 'server' } }),
      gatewayBlocked: await prisma.errorLog.count({ where: { source: 'gateway' } }),
    };

    return {
      logs: dbLogs.map((log) => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      })),
      metrics,
    };
  } catch (err: any) {
    console.error('[TELEMETRY QUERY ERROR]', err);
    // Fallback to memory buffer if database is under heavy load
    return {
      logs: memoryLogBuffer.slice(0, limit),
      metrics: {
        totalErrors: memoryLogBuffer.length,
        unresolvedErrors: memoryLogBuffer.filter((l) => !l.resolved).length,
        fatalErrors: memoryLogBuffer.filter((l) => l.severity === 'fatal').length,
        clientErrors: memoryLogBuffer.filter((l) => l.source === 'client').length,
        serverErrors: memoryLogBuffer.filter((l) => l.source === 'server').length,
        gatewayBlocked: memoryLogBuffer.filter((l) => l.source === 'gateway').length,
      },
    };
  }
}

/**
 * Mark an error as resolved
 */
export async function resolveError(id: string) {
  // Update memory
  const memoryItem = memoryLogBuffer.find((e) => e.id === id);
  if (memoryItem) memoryItem.resolved = true;

  return prisma.errorLog.update({
    where: { id },
    data: { resolved: true },
  });
}

/**
 * Clear all error logs
 */
export async function clearAllErrors() {
  memoryLogBuffer.length = 0;
  deduplicationCache.clear();
  return prisma.errorLog.deleteMany({});
}
