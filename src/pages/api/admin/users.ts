import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withGateway, GatewayRequest } from '@/lib/apiGateway';
import { invalidateGatewayCache } from '@/lib/gatewayAuth';

async function handler(req: GatewayRequest, res: NextApiResponse) {
  // GET: List all users
  if (req.method === 'GET') {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(users);
  }

  // PATCH: Update user role (e.g. promote to admin or demote to user)
  if (req.method === 'PATCH') {
    const { userId, role } = req.body;
    if (!userId || !role) {
      return res.status(400).json({ error: 'User ID and role are required' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: role.toLowerCase() },
      select: { id: true, email: true, role: true },
    });

    // ⚡ Invalidate Gateway Cache immediately so changes take effect in < 1ms
    invalidateGatewayCache(userId);

    return res.status(200).json({ success: true, user: updated });
  }

  // DELETE: Delete a user
  if (req.method === 'DELETE') {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Prevent self-deletion
    if (req.user?.id === userId) {
      return res.status(400).json({ error: 'Cannot delete your own admin account.' });
    }

    await prisma.user.delete({ where: { id: userId } });

    // ⚡ Invalidate Gateway Cache immediately
    invalidateGatewayCache(userId);

    return res.status(200).json({ success: true, message: 'User deleted and gateway sessions revoked.' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withGateway(handler, {
  requireAuth: true,
  requiredRole: 'ADMIN',
});