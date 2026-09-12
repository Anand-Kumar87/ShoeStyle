import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  fromName?: string;
}

export async function sendEmail({ to, subject, html, replyTo, fromName = 'ShoeStyle' }: SendEmailOptions) {
  const user = (process.env.EMAIL_USER || process.env.GMAIL_USER || 'solestyle41@gmail.com').trim();
  const pass = (process.env.EMAIL_PASS || process.env.GMAIL_PASS || 'fiyi ihhv wnfy pmeu').trim();

  if (!user || !pass) {
    console.warn('[EMAIL WARNING] No email credentials available.');
    return { success: false, error: 'Email provider credentials not configured' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"${fromName}" <${user}>`,
      to,
      replyTo: replyTo || user,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.info(`[SHOESTYLE EMAIL DELIVERED] Dispatched to: ${to} | Subject: "${subject}" | MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('[EMAIL ERROR] Failed to deliver email:', error);
    return { success: false, error: error?.message || 'Email delivery failed' };
  }
}
