import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const luxuryEmailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to ShoeStyle VIP</title>
</head>
<body style="margin:0; padding:0; background-color:#0b0f17; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#ffffff;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0b0f17; padding:40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%; background-color:#111622; border:1px solid #232d3f; border-radius:24px; overflow:hidden; box-shadow:0 25px 60px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="padding:48px 40px 30px 40px; background:linear-gradient(180deg, #161d2d 0%, #111622 100%); border-bottom:1px solid #1e2638;">
              <span style="letter-spacing:0.35em; font-size:11px; font-weight:800; color:#c5a059; text-transform:uppercase; display:block; margin-bottom:12px;">
                HAUTE FOOTWEAR & LUXURY SNEAKERS
              </span>
              <h1 style="margin:0; font-size:36px; font-weight:900; letter-spacing:-0.04em; color:#ffffff; text-transform:uppercase;">
                SHOESTYLE
              </h1>
              <p style="margin:8px 0 0 0; font-size:11px; letter-spacing:0.2em; color:#788296; text-transform:uppercase;">
                New Delhi • Paris • Milan • New York
              </p>
            </td>
          </tr>

          <!-- Welcome Message -->
          <tr>
            <td style="padding:40px 40px 20px 40px;">
              <div style="background-color:rgba(197, 160, 89, 0.1); border:1px solid rgba(197, 160, 89, 0.3); border-radius:100px; display:inline-block; padding:6px 16px; margin-bottom:20px;">
                <span style="color:#e6ca85; font-size:11px; font-weight:800; letter-spacing:0.15em; text-transform:uppercase;">
                  ★ VIP Inner Circle Access Granted
                </span>
              </div>

              <h2 style="margin:0 0 16px 0; font-size:24px; font-weight:800; letter-spacing:-0.02em; color:#ffffff; line-height:1.3;">
                Welcome to the Inner Circle.
              </h2>
              <p style="margin:0 0 24px 0; font-size:14px; line-height:1.7; color:#9ca3af;">
                Thank you for joining the private roster of <strong>ShoeStyle</strong>. You now possess front-row access to our most anticipated drops, limited artisanal releases, private showroom reservations, and member-only curation.
              </p>

              <!-- Voucher Block -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg, #1a2333 0%, #111622 100%); border:1px dashed #c5a059; border-radius:16px; margin:20px 0 30px 0; padding:24px;">
                <tr>
                  <td align="center">
                    <span style="font-size:11px; font-weight:800; color:#c5a059; letter-spacing:0.2em; text-transform:uppercase; display:block; margin-bottom:8px;">
                      Your Exclusive Welcome Privilege
                    </span>
                    <div style="font-size:28px; font-weight:900; letter-spacing:0.15em; color:#ffffff; background:#0b0f17; padding:12px 28px; border-radius:12px; display:inline-block; border:1px solid #232d3f; font-family:monospace;">
                      WELCOME10
                    </div>
                    <span style="display:block; font-size:12px; color:#9ca3af; margin-top:10px; font-weight:600;">
                      Apply at checkout for 10% off your inaugural order.
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Exclusive Perks List -->
              <h3 style="margin:0 0 14px 0; font-size:12px; font-weight:800; letter-spacing:0.15em; color:#c5a059; text-transform:uppercase;">
                Your Inner Circle Privileges
              </h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:30px;">
                <tr>
                  <td style="padding:8px 0; font-size:13px; color:#d1d5db;">
                    <span style="color:#c5a059; font-weight:bold; margin-right:8px;">✓</span>
                    <strong>Priority Drop Access:</strong> 24-hour advance access before public releases.
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0; font-size:13px; color:#d1d5db;">
                    <span style="color:#c5a059; font-weight:bold; margin-right:8px;">✓</span>
                    <strong>Complimentary Express Logistics:</strong> Free door-to-door insured transit across India.
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0; font-size:13px; color:#d1d5db;">
                    <span style="color:#c5a059; font-weight:bold; margin-right:8px;">✓</span>
                    <strong>Concierge Support:</strong> Direct client advisor consultation for sizing & inquiries.
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:20px 0 10px 0;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/products" target="_blank" style="display:inline-block; background-color:#ffffff; color:#0b0f17; font-size:13px; font-weight:900; letter-spacing:0.15em; text-transform:uppercase; text-decoration:none; padding:16px 36px; border-radius:100px; box-shadow:0 10px 30px rgba(255,255,255,0.15);">
                      Explore The New Collection →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:30px 40px; background-color:#0e131d; border-top:1px solid #1e2638; text-align:center;">
              <p style="margin:0 0 8px 0; font-size:11px; color:#6b7280;">
                ShoeStyle Luxury Footwear • D95 Enclave Phase 2, Chattarpur, New Delhi 110074
              </p>
              <p style="margin:0; font-size:10px; color:#4b5563;">
                You received this transmission because you registered at ShoeStyle. You may manage your preferences or unsubscribe at any time.
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

    // Send real luxury email using ShoeStyle branding
    await sendEmail({
      to: cleanEmail,
      subject: 'Welcome to the Inner Circle | ShoeStyle VIP Access ✨',
      html: luxuryEmailHtml,
      fromName: 'ShoeStyle VIP',
    });

    return res.status(200).json({
      success: true,
      message: 'Welcome to the ShoeStyle VIP Circle! Please inspect your inbox for your welcome voucher.',
    });
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return res.status(500).json({ message: 'Could not complete subscription. Please try again.' });
  }
}
