import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const ticketId = `SS-${Math.floor(100000 + Math.random() * 900000)}`;
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanName = String(name).trim();
  const submissionDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  try {
    // 1. Check if matching user exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    }).catch(() => null);

    // 2. Persist real inquiry in PostgreSQL database
    const savedRecord = await prisma.contactMessage.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: phone ? String(phone).trim() : null,
        subject: String(subject).trim(),
        message: String(message).trim(),
        status: 'NEW',
        userId: existingUser?.id || null,
      },
    });

    // 3. Create real admin notification in database
    await prisma.notification.create({
      data: {
        type: 'CONTACT_INQUIRY',
        title: `New Inquiry [${ticketId}]: ${cleanName}`,
        message: `Subject: ${subject}. ${message.substring(0, 80)}...`,
        link: '/admin',
        icon: 'Mail',
      },
    }).catch(() => null);

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // 1. Admin Alert Email HTML
    const adminAlertHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background: #f8f9fa; color: #111;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; padding: 32px;">
          <h2 style="color: #000; font-size: 20px; font-weight: 900; margin-top: 0; text-transform: uppercase; letter-spacing: 0.05em;">
            🚨 New Client Inquiry [Ticket #${ticketId}]
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #6b7280; width: 120px;">Client Name:</td><td style="padding: 8px 0; font-weight: bold; color: #111;">${cleanName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Email:</td><td style="padding: 8px 0; font-weight: bold; color: #111;"><a href="mailto:${cleanEmail}">${cleanEmail}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Phone:</td><td style="padding: 8px 0; font-weight: bold; color: #111;">${phone || 'Not Provided'}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Subject:</td><td style="padding: 8px 0; font-weight: bold; color: #111;">${subject}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Received:</td><td style="padding: 8px 0; color: #6b7280;">${submissionDate}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #374151;">Client Message:</h3>
          <div style="background: #f9fafb; padding: 18px; border-radius: 12px; border: 1px solid #f3f4f6; font-size: 14px; line-height: 1.6; color: #1f2937;">
            ${message.replace(/\n/g, '<br />')}
          </div>
        </div>
      </div>
    `;

    // 2. Client Luxury Auto-Responder Confirmation Email HTML
    const clientConfirmationHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ShoeStyle Client Relations Confirmation</title>
</head>
<body style="margin:0; padding:0; background-color:#0b0f17; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#ffffff;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0b0f17; padding:40px 10px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%; background-color:#111622; border:1px solid #232d3f; border-radius:24px; overflow:hidden; box-shadow:0 25px 60px rgba(0,0,0,0.6);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding:44px 40px 24px 40px; background:linear-gradient(180deg, #161d2d 0%, #111622 100%); border-bottom:1px solid #1e2638;">
              <span style="letter-spacing:0.3em; font-size:10px; font-weight:800; color:#c5a059; text-transform:uppercase; display:block; margin-bottom:10px;">
                SHOESTYLE CLIENT RELATIONS
              </span>
              <h1 style="margin:0; font-size:32px; font-weight:900; letter-spacing:-0.03em; color:#ffffff; text-transform:uppercase;">
                SHOESTYLE
              </h1>
              <p style="margin:6px 0 0 0; font-size:11px; letter-spacing:0.15em; color:#788296; text-transform:uppercase;">
                Concierge & Bespoke Client Support
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 20px 40px;">
              <div style="background-color:rgba(197, 160, 89, 0.1); border:1px solid rgba(197, 160, 89, 0.3); border-radius:100px; display:inline-block; padding:6px 16px; margin-bottom:20px;">
                <span style="color:#e6ca85; font-size:11px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase;">
                  ✓ Inquiry Logged • Ticket #${ticketId}
                </span>
              </div>

              <h2 style="margin:0 0 14px 0; font-size:22px; font-weight:800; letter-spacing:-0.02em; color:#ffffff;">
                Dear ${cleanName},
              </h2>
              <p style="margin:0 0 24px 0; font-size:14px; line-height:1.7; color:#9ca3af;">
                Thank you for contacting <strong>ShoeStyle Client Relations</strong>. We have successfully logged your inquiry regarding <strong>"${subject}"</strong> into our concierge dispatch system.
              </p>

              <!-- Ticket Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#0e131d; border:1px solid #1e2638; border-radius:16px; margin:20px 0 28px 0; padding:20px;">
                <tr>
                  <td style="padding:6px 0; font-size:12px; color:#6b7280; width:130px; text-transform:uppercase; letter-spacing:0.05em; font-weight:bold;">Ticket Reference:</td>
                  <td style="padding:6px 0; font-size:14px; font-weight:bold; color:#ffffff; font-family:monospace;">#${ticketId}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:0.05em; font-weight:bold;">Inquiry Subject:</td>
                  <td style="padding:6px 0; font-size:13px; font-weight:600; color:#d1d5db;">${subject}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:0.05em; font-weight:bold;">Date Logged:</td>
                  <td style="padding:6px 0; font-size:13px; color:#9ca3af;">${submissionDate}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:0.05em; font-weight:bold;">Expected Response:</td>
                  <td style="padding:6px 0; font-size:13px; font-weight:bold; color:#e6ca85;">Within 2–4 Business Hours</td>
                </tr>
              </table>

              <!-- Inquiry Copy -->
              <h3 style="margin:0 0 10px 0; font-size:11px; font-weight:800; letter-spacing:0.15em; color:#c5a059; text-transform:uppercase;">
                Summary of Your Inquiry
              </h3>
              <div style="background:#161d2d; border-left:3px solid #c5a059; padding:16px; border-radius:8px; font-size:13px; line-height:1.6; color:#9ca3af; margin-bottom:28px;">
                ${message.replace(/\n/g, '<br />')}
              </div>

              <!-- Assistance Info -->
              <p style="margin:0 0 24px 0; font-size:13px; line-height:1.7; color:#9ca3af;">
                A dedicated Client Advisor has been assigned to assist you. If your matter requires immediate priority attention, you may directly reach our concierge desk at <strong style="color:#ffffff;">+91 8726540277</strong>.
              </p>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:24px 0 10px 0;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/products" target="_blank" style="display:inline-block; background-color:#ffffff; color:#0b0f17; font-size:12px; font-weight:900; letter-spacing:0.15em; text-transform:uppercase; text-decoration:none; padding:15px 34px; border-radius:100px; box-shadow:0 10px 30px rgba(255,255,255,0.12);">
                      Explore ShoeStyle Footwear →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px; background-color:#0e131d; border-top:1px solid #1e2638; text-align:center;">
              <p style="margin:0 0 6px 0; font-size:11px; color:#6b7280;">
                ShoeStyle Client Relations • D95 Enclave Phase 2, Chattarpur, New Delhi 110074
              </p>
              <p style="margin:0; font-size:10px; color:#4b5563;">
                This is an automated concierge confirmation. Replies to this email are monitored by our Client Relations desk.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // 4. Send Alert to Store Owner & Confirmation to Customer (graceful error handling)
    try {
      await sendEmail({
        to: 'solestyle41@gmail.com',
        replyTo: cleanEmail,
        subject: `🚨 New Contact Query [Ticket #${ticketId}]: ${subject} (From: ${cleanName})`,
        html: adminAlertHtml,
        fromName: 'ShoeStyle Concierge Alert',
      });

      await sendEmail({
        to: cleanEmail,
        replyTo: 'solestyle41@gmail.com',
        subject: `Inquiry Received [Ticket #${ticketId}] - ShoeStyle Client Relations`,
        html: clientConfirmationHtml,
        fromName: 'ShoeStyle Client Relations',
      });
    } catch (mailErr) {
      console.warn('Email dispatch warning (message safely recorded in DB):', mailErr);
    }

    return res.status(200).json({
      success: true,
      ticketId,
      messageId: savedRecord.id,
      message: 'Inquiry received successfully! A luxury confirmation email has been dispatched to your inbox.',
    });
  } catch (error: any) {
    console.error('Contact error:', error);
    return res.status(500).json({ message: 'Failed to process inquiry. Please try again.' });
  }
}
