// Vercel Serverless Function for sending OTP emails via Resend
// Deploy this with your Vercel project

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  const SITE_NAME = process.env.SITE_NAME || 'Portfolio Shop';

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return res.status(500).json({ success: false, error: 'Email service not configured' });
  }

  try {
    const { email, otp, name } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required' });
    }

    console.log(`Sending OTP to: ${email}`);

    // Send email using Resend API directly
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${SITE_NAME} <${FROM_EMAIL}>`,
        to: email,
        subject: `Your Verification Code - ${otp}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #105652, #1E8479); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">${SITE_NAME}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px; text-align: center;">
                  <h2 style="color: #1e293b; margin: 0 0 10px; font-size: 22px;">Email Verification</h2>
                  <p style="color: #64748b; margin: 0 0 30px; font-size: 14px;">
                    ${name ? `Hi ${name}, ` : ''}Enter this code to verify your email address
                  </p>
                  
                  <div style="background: linear-gradient(135deg, #f8fafc, #e2e8f0); border-radius: 12px; padding: 25px; margin: 0 auto 30px; display: inline-block;">
                    <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #105652;">${otp}</span>
                  </div>
                  
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    This code expires in 10 minutes.<br>
                    If you didn't request this, please ignore this email.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                    © ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(500).json({ success: false, error: data.message || 'Failed to send email' });
    }

    console.log(`Email sent successfully: ${data.id}`);
    return res.status(200).json({ success: true, messageId: data.id });

  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
