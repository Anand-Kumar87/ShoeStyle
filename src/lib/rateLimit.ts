import type { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitOptions {
  interval: number; // in milliseconds
  uniqueTokenPerInterval: number; // max users tracked
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitStore>();

export function rateLimit(options: RateLimitOptions) {
  const { interval, uniqueTokenPerInterval } = options;

  return {
    check: async (res: NextApiResponse, limit: number, token: string): Promise<boolean> => {
      const now = Date.now();

      // Clean up old tokens if store gets too large
      if (memoryStore.size > uniqueTokenPerInterval) {
        for (const [key, record] of memoryStore.entries()) {
          if (now > record.resetTime) {
            memoryStore.delete(key);
          }
        }
      }

      const clientRecord = memoryStore.get(token);

      if (!clientRecord || now > clientRecord.resetTime) {
        memoryStore.set(token, {
          count: 1,
          resetTime: now + interval,
        });
        res.setHeader('X-RateLimit-Limit', limit.toString());
        res.setHeader('X-RateLimit-Remaining', (limit - 1).toString());
        return true;
      }

      if (clientRecord.count >= limit) {
        res.setHeader('X-RateLimit-Limit', limit.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('Retry-After', Math.ceil((clientRecord.resetTime - now) / 1000).toString());
        return false;
      }

      clientRecord.count += 1;
      res.setHeader('X-RateLimit-Limit', limit.toString());
      res.setHeader('X-RateLimit-Remaining', (limit - clientRecord.count).toString());
      return true;
    },
  };
}

export const authLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});
