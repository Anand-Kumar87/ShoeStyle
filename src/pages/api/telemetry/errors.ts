import { NextApiRequest, NextApiResponse } from 'next';
import {
  recordTelemetry,
  getTelemetryLogs,
  resolveError,
  clearAllErrors,
  TelemetryPayload,
} from '@/lib/telemetry';
import { verifyAdminGateway } from '@/lib/gatewayAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS & Preflight handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ==========================================
  // 1. POST: Capture Error from Client or Server (Public beacon endpoint)
  // ==========================================
  if (req.method === 'POST') {
    try {
      let body: TelemetryPayload;

      // Support navigator.sendBeacon string payload or standard JSON
      if (typeof req.body === 'string') {
        try {
          body = JSON.parse(req.body);
        } catch {
          body = { message: req.body, source: 'client' };
        }
      } else {
        body = req.body || {};
      }

      if (!body.message) {
        return res.status(400).json({ success: false, error: 'Error message is required' });
      }

      // Add request IP & user agent if missing
      const forwarded = req.headers['x-forwarded-for'];
      const clientIp = typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress;

      const logged = await recordTelemetry({
        ...body,
        userAgent: body.userAgent || (req.headers['user-agent'] as string),
        metadata: {
          ...body.metadata,
          ip: clientIp,
        },
      });

      return res.status(200).json({ success: true, id: logged.id });
    } catch (err: any) {
      console.error('[TELEMETRY ENDPOINT ERROR]', err);
      // Always return 200/202 to avoid crashing error-reporting clients
      return res.status(202).json({ success: false, error: 'Logged with fallback' });
    }
  }

  // ==========================================
  // 2. GET: Fetch Telemetry Logs & Metrics (Admin Only)
  // ==========================================
  if (req.method === 'GET') {
    const admin = await verifyAdminGateway(req, res);
    if (!admin) return;

    try {
      const { limit, source, severity, resolved, search } = req.query;

      const data = await getTelemetryLogs({
        limit: limit ? parseInt(limit as string, 10) : 50,
        source: source as string,
        severity: severity as string,
        resolved: resolved !== undefined ? resolved === 'true' : undefined,
        search: search as string,
      });

      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(200).json({ success: true, ...data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // ==========================================
  // 3. PATCH: Mark Error as Resolved (Admin Only)
  // ==========================================
  if (req.method === 'PATCH') {
    const admin = await verifyAdminGateway(req, res);
    if (!admin) return;

    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Error ID is required' });
      }

      await resolveError(id);
      return res.status(200).json({ success: true, message: 'Error resolved successfully' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // ==========================================
  // 4. DELETE: Clear All Logs (Admin Only)
  // ==========================================
  if (req.method === 'DELETE') {
    const admin = await verifyAdminGateway(req, res);
    if (!admin) return;

    try {
      await clearAllErrors();
      return res.status(200).json({ success: true, message: 'All telemetry logs cleared' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
