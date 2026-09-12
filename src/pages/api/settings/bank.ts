import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // GET Request - Checkout page aur Admin panel ke liye
        if (req.method === 'GET') {
            const banks = await prisma.bankDetail.findMany({
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(banks);
        }

        // Security: POST/DELETE ke liye Case-Insensitive Admin check with database fallback
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user?.email) {
            return res.status(401).json({ message: 'Unauthorized. Please log in.' });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true },
        });

        const isAdmin =
            user?.role?.toUpperCase() === 'ADMIN' ||
            session.user?.role?.toString().toUpperCase() === 'ADMIN';

        if (!isAdmin) {
            return res.status(401).json({ message: 'Unauthorized. Admin access required.' });
        }

        // POST Request - Naya Bank Add karne ke liye (With Verification)
        if (req.method === 'POST') {
            const { bankName, accountName, accountNumber, ifscCode } = req.body;
            if (!bankName || !accountName || !accountNumber || !ifscCode) {
                return res.status(400).json({ message: 'All fields (Bank Name, Account Holder Name, Account Number, IFSC Code) are required' });
            }

            const cleanIfsc = ifscCode.trim().toUpperCase();
            const cleanAcc = accountNumber.toString().trim();
            const cleanAccName = accountName.trim();
            let cleanBankName = bankName.trim();

            // 1. Validate Account Number
            if (!/^\d{9,18}$/.test(cleanAcc)) {
                return res.status(400).json({ message: 'Account number must be between 9 and 18 digits' });
            }

            // 2. Validate Account Name
            if (cleanAccName.length < 3) {
                return res.status(400).json({ message: 'Account holder name must be at least 3 characters' });
            }

            // 3. Validate & Verify IFSC Code
            const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
            if (!ifscRegex.test(cleanIfsc)) {
                return res.status(400).json({ message: 'Invalid IFSC format. Must be 11 characters (e.g. SBIN0001234, HDFC0000123)' });
            }

            try {
                const ifscRes = await fetch(`https://ifsc.razorpay.com/${cleanIfsc}`);
                if (!ifscRes.ok) {
                    return res.status(400).json({ message: `Invalid IFSC Code: "${cleanIfsc}". Bank branch does not exist.` });
                }
                const ifscData = await ifscRes.json();
                if (ifscData.BANK) {
                    cleanBankName = `${ifscData.BANK} (${ifscData.BRANCH || ''})`.trim();
                }
            } catch {
                // If external network lookup fails, proceed with validated format
            }

            const newBank = await prisma.bankDetail.create({
                data: {
                    bankName: cleanBankName,
                    accountName: cleanAccName,
                    accountNumber: cleanAcc,
                    ifscCode: cleanIfsc,
                },
            });
            return res.status(201).json({ message: 'Bank account verified and added successfully!', bank: newBank });
        }

        // DELETE Request - Bank Delete karne ke liye
        if (req.method === 'DELETE') {
            const { id } = req.body;
            if (!id) {
                return res.status(400).json({ message: 'Bank ID is required' });
            }
            await prisma.bankDetail.delete({ where: { id } });
            return res.status(200).json({ message: 'Bank removed successfully' });
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error: any) {
        console.error('Bank Settings API Error:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
    }
}