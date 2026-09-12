import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Admin session verification
  const session = await getServerSession(req, res, authOptions);
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true },
      })
    : null;

  const isAdmin =
    user?.role?.toUpperCase() === 'ADMIN' ||
    session?.user?.role?.toString().toUpperCase() === 'ADMIN';

  if (!session || !isAdmin) {
    return res.status(401).json({ message: 'Unauthorized. Admin access required.' });
  }

  const ifscQuery = req.method === 'GET' ? req.query.ifsc : req.body.ifsc;
  if (!ifscQuery || typeof ifscQuery !== 'string') {
    return res.status(400).json({ message: 'Please provide an IFSC code to verify' });
  }

  const cleanIfsc = ifscQuery.trim().toUpperCase();

  // Indian IFSC format regex: 4 alphabetic, followed by 0, followed by 6 alphanumeric
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  if (!ifscRegex.test(cleanIfsc)) {
    return res.status(400).json({
      valid: false,
      message: 'Invalid IFSC format. Must be 11 characters (e.g., SBIN0001234, HDFC0000123)',
    });
  }

  try {
    const response = await fetch(`https://ifsc.razorpay.com/${cleanIfsc}`);
    if (!response.ok) {
      return res.status(404).json({
        valid: false,
        message: `No official bank branch found for IFSC: "${cleanIfsc}". Please verify the code.`,
      });
    }

    const data = await response.json();
    return res.status(200).json({
      valid: true,
      bank: data.BANK || '',
      ifsc: data.IFSC || cleanIfsc,
      branch: data.BRANCH || '',
      city: data.CITY || '',
      state: data.STATE || '',
      address: data.ADDRESS || '',
      message: `Verified: ${data.BANK} (${data.BRANCH})`,
    });
  } catch (error) {
    return res.status(500).json({
      valid: false,
      message: 'Unable to verify IFSC at this time. Please try again.',
    });
  }
}