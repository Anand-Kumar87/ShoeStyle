import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Gmail SMTP transporter setup
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Tumhari Gmail ID
                pass: process.env.EMAIL_PASS, // Gmail ka App Password
            },
        });

        // Email jo tumhe aayegi
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'solestyle41@gmail.com', // 👈 Yahan tumhara mail aayega
            replyTo: email, // Jisse tum direct reply kar sako customer ko
            subject: `🚨 New Contact Query: ${subject} (From: ${name})`,
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #059669;">New Customer Query - ShoeStyle</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not Provided'}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <h3 style="color: #333;">Message:</h3>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 5px; color: #555;">
            ${message.replace(/\n/g, '<br>')}
          </p>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, message: 'Email sent successfully!' });

    } catch (error) {
        console.error('Email sending error:', error);
        return res.status(500).json({ message: 'Failed to send email' });
    }
}