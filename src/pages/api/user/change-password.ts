import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // 1. Sirf POST requests allow karenge
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 2. User ka session check karo
    const session = await getSession({ req });
    if (!session || !session.user || !session.user.email) {
        return res.status(401).json({ message: 'Please login to change your password' });
    }

    // 3. Security: Admin password se chhed-chhad block karo
    if (session.user.role === 'admin') {
        return res.status(403).json({ message: 'Access Denied: Admin passwords cannot be modified from this interface.' });
    }

    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both current and new passwords' });
        }

        // 4. Database se user ki details nikalo
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        // Agar user nahi mila, ya wo Google/Github se login karta hai (jiska password DB mein nahi hota)
        if (!user || !user.password) {
            return res.status(404).json({ message: 'User not found or uses external provider (Google/Github) for login.' });
        }

        // 5. Purana password verify karo
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Incorrect current password! Please try again.' });
        }

        // 6. Naya password encrypt (Hash) karo
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // 7. Database mein naya password update karo
        await prisma.user.update({
            where: { email: session.user.email },
            data: { password: hashedNewPassword }
        });

        return res.status(200).json({ message: 'Password updated successfully!' });

    } catch (error) {
        console.error('Change Password API Error:', error);
        return res.status(500).json({ message: 'Internal Server Error while changing password' });
    }
}

