import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function authHandler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, authOptions);
}