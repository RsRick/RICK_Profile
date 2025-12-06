// OTP Email Function using Resend API

export default async ({ req, res, log, error }) => {
  log('=== Function Started ===');
  
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  const SITE_NAME = process.env.SITE_NAME || 'Portfolio Shop';

  log(`FROM_EMAIL: ${FROM_EMAIL}`);
  log(`SITE_NAME: ${SITE_NAME}`);
  log(`RESEND_API_KEY exists: ${!!RESEND_API_KEY}`);

  if (!RESEND_API_KEY) {
    error('RESEND_API_KEY is not configured');
    return res.json({ success: false, error: 'Email service not configured' }, 500);
  }

  try {
    log(`Request body type: ${typeof req.body}`);
    log(`Request body: ${JSON.stringify(req.body)}`);

    // Parse request body - handle multiple formats
    let data = {};
    
    if (typeof req.body === 'string') {
      try {
        data = JSON.parse(req.body);
      } catch (e) {
        log('Failed to parse body as string');
      }
    } else if (req.body?.data) {
      try {
        data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
      } catch (e) {
        log('Failed to parse body.data');
      }
    } else if (req.body) {
      data = req.body;
    }

    log(`Parsed data: ${JSON.stringify(data)}`);

    const { email, otp, name } = data;

    if (!email || !otp) {
      error(`Missing required fields - email: ${email}, otp: ${otp}`);
      return res.json({ success: false, error: 'Email and OTP are required' }, 400);
    }

    log(`Sending OTP ${otp} to: ${email}`);

    // Send email using Resend API
    const emailPayload = {
      from: `${SITE_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Your Verification Code: ${otp}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#105652,#1E8479);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;font-size:24px;">${SITE_NAME}</h1>
          </div>
          <div style="background:white;padding:40px 30px;text-align:center;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
            <h2 style="color:#1e293b;margin:0 0 10px;">Email Verification</h2>
            <p style="color:#64748b;margin:0 0 30px;">
              ${name ? `Hi ${name}, ` : ''}Enter this code to verify your email
            </p>
            <div style="background:#f0f4f8;border-radius:12px;padding:25px;display:inline-block;margin:0 0 30px;">
              <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#105652;">${otp}</span>
            </div>
            <p style="color:#94a3b8;font-size:12px;margin:0;">
              This code expires in 10 minutes.
            </p>
          </div>
        </div>
      `,
    };

    log(`Calling Resend API...`);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await response.json();
    
    log(`Resend response status: ${response.status}`);
    log(`Resend response: ${JSON.stringify(result)}`);

    if (!response.ok) {
      error(`Resend error: ${JSON.stringify(result)}`);
      return res.json({ success: false, error: result.message || 'Failed to send email' }, 500);
    }

    log(`Email sent successfully! ID: ${result.id}`);
    return res.json({ success: true, messageId: result.id });

  } catch (err) {
    error(`Exception: ${err.message}`);
    error(`Stack: ${err.stack}`);
    return res.json({ success: false, error: err.message }, 500);
  }
};
