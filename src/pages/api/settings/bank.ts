import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // GET Request - Checkout page aur Admin panel ke liye
        if (req.method === 'GET') {
            const banks = await prisma.bankDetail.findMany({
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(banks);
        }

        // Security: POST/DELETE ke liye Admin session check
        const session = await getServerSession(req, res, authOptions);
        if (!session || session.user?.role !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized. Admin only.' });
        }

        // POST Request - Naya Bank Add karne ke liye
        if (req.method === 'POST') {
            const { bankName, accountName, accountNumber, ifscCode } = req.body;
            if (!bankName || !accountName || !accountNumber || !ifscCode) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const newBank = await prisma.bankDetail.create({
                data: { bankName, accountName, accountNumber, ifscCode }
            });
            return res.status(201).json({ message: 'Bank added successfully', bank: newBank });
        }

        // DELETE Request - Bank Delete karne ke liye
        if (req.method === 'DELETE') {
            const { id } = req.body;
            await prisma.bankDetail.delete({ where: { id } });
            return res.status(200).json({ message: 'Bank removed successfully' });
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error: any) {
        console.error('Bank Settings API Error:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
    }
}