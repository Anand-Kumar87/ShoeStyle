import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // 1. Check if user exists in database
    const user = await prisma.user.findUnique({ where: { email } });

    // For security reasons, we don't want to reveal if an email exists or not.
    // So if user is not found, we still return a success message to the frontend.
    if (!user) {
      return res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });
    }

    // 2. Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // Token valid for 1 Hour

    // 3. Save token to Database
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // 4. Create the Reset URL
    // NEXTAUTH_URL should be your localhost or live domain (e.g., http://localhost:3000)
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    // 5. Setup Nodemailer (Using Gmail as an example)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // e.g., your_email@gmail.com
        pass: process.env.EMAIL_PASS, // Your Gmail App Password
      },
    });

    // 6. Send the Email
    await transporter.sendMail({
      from: `"ShoeStyle Premium" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - ShoeStyle',
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #111;">Password Reset Request</h2>
          <p style="color: #555; font-size: 16px;">We received a request to reset your password. Click the button below to choose a new password.</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #111; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">Reset Password</a>
          <p style="color: #777; font-size: 14px; margin-top: 30px;">If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.</p>
        </div>
      `,
    });

    res.status(200).json({ message: 'Reset link sent successfully' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process request' });
  }
}