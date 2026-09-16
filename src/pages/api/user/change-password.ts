import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authLimiter } from '@/lib/rateLimit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Rate limiting (max 5 password change attempts per minute per IP)
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'anonymous';
    const isAllowed = await authLimiter.check(res, 5, clientIp);
    if (!isAllowed) {
        return res.status(429).json({ message: 'Too many attempts. Please try again in a minute.' });
    }

    // User session check using getServerSession
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !session.user.email) {
        return res.status(401).json({ message: 'Please login to change your password' });
    }

    // Security: Admin password modification guarded
    if ((session.user as any).role?.toLowerCase() === 'admin') {
        return res.status(403).json({ message: 'Access Denied: Admin passwords cannot be modified from this interface.' });
    }

    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both current and new passwords' });
        }

        if (typeof newPassword !== 'string' || newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters long' });
        }

        // 4. Database se user ki details nikalo
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        // Agar user nahi mila, ya wo Google/Github se login karta hai (jiska password DB mein nahi hota)
        if (!user || !user.hashedPassword) {
            return res.status(404).json({ message: 'User not found or uses external provider (Google/Github) for login.' });
        }

        // 5. Purana password verify karo
        const isPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Incorrect current password! Please try again.' });
        }

        // 6. Naya password encrypt (Hash) karo
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // 7. Database mein naya password update karo
        await prisma.user.update({
            where: { email: session.user.email },
            data: { hashedPassword: hashedNewPassword }
        });

        return res.status(200).json({ message: 'Password updated successfully!' });

    } catch (error) {
        console.error('Change Password API Error:', error);
        return res.status(500).json({ message: 'Internal Server Error while changing password' });
    }
}

