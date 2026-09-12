import { NextApiRequest, NextApiResponse } from 'next';
import { validateSessionWithDatabase, AuthenticatedUser } from './gatewayAuth';
import { reportServerError } from './telemetry';

export interface GatewayRequest extends NextApiRequest {
  user?: AuthenticatedUser;
}

export type GatewayHandler = (
  req: GatewayRequest,
  res: NextApiResponse
) => Promise<any> | any;

export interface GatewayOptions {
  requireAuth?: boolean;
  requiredRole?: 'ADMIN' | 'USER';
  timeoutMs?: number; // Request timeout in ms (default 8000ms)
}

// In-memory sliding window rate-limiter at the API Gateway level
const ipRateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 200; // 200 requests per min per IP

/**
 * Enterprise API Gateway Wrapper for Next.js API Routes
 * Enforces:
 * 1. Database-backed Token Validation
 * 2. Role-Based Access Control (RBAC)
 * 3. 8-Second Anti-Hang Timeout Protection
 * 4. Automatic Error Logging & Stack Trace Capture
 * 5. High-Scale Concurrency Protection
 */
export function withGateway(handler: GatewayHandler, options: GatewayOptions = {}) {
  const { requireAuth = false, requiredRole, timeoutMs = 8000 } = options;

  return async (req: GatewayRequest, res: NextApiResponse) => {
    // 1. Sliding Window Anti-DDoS & Rate Limiting
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress) || 'unknown';
    const now = Date.now();
    const record = ipRateLimitStore.get(ip);

    if (!record || now > record.resetTime) {
      ipRateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_MINUTE.toString());
      res.setHeader('X-RateLimit-Remaining', (MAX_REQUESTS_PER_MINUTE - 1).toString());
    } else {
      record.count += 1;
      res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_MINUTE.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS_PER_MINUTE - record.count).toString());

      if (record.count > MAX_REQUESTS_PER_MINUTE) {
        res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000).toString());
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded. Too many requests, please slow down.',
        });
      }
    }

    // 2. Gateway Database-Backed Authentication Verification
    if (requireAuth || requiredRole) {
      const authResult = await validateSessionWithDatabase(req);

      if (!authResult.authenticated || !authResult.user) {
        return res.status(authResult.status || 401).json({
          success: false,
          error: authResult.error || 'Authentication required.',
          gatewayProtected: true,
        });
      }

      // Check Role Privileges
      if (requiredRole && authResult.user.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          error: `Forbidden. ${requiredRole} access privileges required.`,
          gatewayProtected: true,
        });
      }

      req.user = authResult.user;
    }

    // 3. Execution with Timeout & Circuit-Breaker Protection (Prevents server hang)
    let isTimedOut = false;
    const timeoutPromise = new Promise((_, reject) => {
      const timer = setTimeout(() => {
        isTimedOut = true;
        reject(new Error(`API Gateway Timeout: Request exceeded ${timeoutMs}ms limit.`));
      }, timeoutMs);
      timer.unref?.();
    });

    try {
      await Promise.race([handler(req, res), timeoutPromise]);
    } catch (err: any) {
      if (isTimedOut) {
        if (!res.headersSent) {
          res.status(504).json({
            success: false,
            error: 'Gateway Timeout: Request took too long to complete.',
          });
        }
        await reportServerError(err, req, { severity: 'fatal', source: 'gateway' });
        return;
      }

      // Log full stack trace to centralized telemetry
      await reportServerError(err, req, {
        severity: 'error',
        source: 'server',
        userId: req.user?.id,
      });

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
        });
      }
    }
  };
}
