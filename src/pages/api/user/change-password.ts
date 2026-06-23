import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });

    if (!session || !session.user?.email) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // 🔥 FIX: Changed 'user.password' to 'user.hashedPassword'
    if (!user || !user.hashedPassword) {
      return res.status(404).json({ message: 'User not found or uses external provider (Google)' });
    }

    // 🔥 FIX: Changed 'user.password' to 'user.hashedPassword' for comparison
    const isPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        hashedPassword: newHashedPassword,
      },
    });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
