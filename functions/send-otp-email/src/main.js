// OTP Email Function using Resend API

export default async ({ req, res, log, error }) => {
  log('=== OTP Email Function Started ===');
  
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  const SITE_NAME = process.env.SITE_NAME || 'Portfolio Shop';

  log(`FROM_EMAIL: ${FROM_EMAIL}`);
  log(`RESEND_API_KEY exists: ${!!RESEND_API_KEY}`);

  if (!RESEND_API_KEY) {
    error('RESEND_API_KEY is not configured');
    return res.json({ success: false, error: 'Email service not configured' }, 500);
  }

  try {
    log(`Raw body: ${req.body}`);
    log(`Body type: ${typeof req.body}`);
    log(`Payload: ${req.payload}`);
    log(`Headers: ${JSON.stringify(req.headers)}`);

    // Try multiple ways to get the data
    let data = {};
    
    // Method 1: Direct body parsing
    if (req.body && typeof req.body === 'string' && req.body.length > 0) {
      try {
        const parsed = JSON.parse(req.body);
        if (parsed.data) {
          data = typeof parsed.data === 'string' ? JSON.parse(parsed.data) : parsed.data;
        } else {
          data = parsed;
        }
        log('Parsed from body string');
      } catch (e) {
        log(`Body parse error: ${e.message}`);
      }
    }
    
    // Method 2: Body as object
    if (Object.keys(data).length === 0 && req.body && typeof req.body === 'object') {
      if (req.body.data) {
        data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
      } else {
        data = req.body;
      }
      log('Parsed from body object');
    }

    // Method 3: Payload (Appwrite sometimes uses this)
    if (Object.keys(data).length === 0 && req.payload) {
      try {
        const parsed = typeof req.payload === 'string' ? JSON.parse(req.payload) : req.payload;
        if (parsed.data) {
          data = typeof parsed.data === 'string' ? JSON.parse(parsed.data) : parsed.data;
        } else {
          data = parsed;
        }
        log('Parsed from payload');
      } catch (e) {
        log(`Payload parse error: ${e.message}`);
      }
    }

    log(`Final parsed data: ${JSON.stringify(data)}`);

    const { email, otp, name } = data;

    if (!email || !otp) {
      error(`Missing fields - email: ${email}, otp: ${otp}`);
      return res.json({ success: false, error: 'Email and OTP are required' }, 400);
    }

    log(`Sending OTP ${otp} to: ${email}`);

    const emailPayload = {
      from: `${SITE_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Verify Your Email Address - ${SITE_NAME}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#105652,#1E8479);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;font-size:24px;">${SITE_NAME}</h1>
          </div>
          <div style="background:white;padding:40px 30px;text-align:center;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
            <h2 style="color:#1e293b;margin:0 0 10px;">Email Verification</h2>
            <p style="color:#64748b;margin:0 0 30px;font-size:15px;">
              ${name ? `Hi ${name}, ` : ''}Welcome! Please use the verification code below to complete your registration.
            </p>
            <div style="background:#f0f4f8;border-radius:12px;padding:25px;display:inline-block;margin:0 0 30px;">
              <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#105652;">${otp}</span>
            </div>
            <p style="color:#94a3b8;font-size:13px;margin:0 0 10px;">This code expires in 10 minutes.</p>
            <p style="color:#94a3b8;font-size:12px;margin:0;">If you didn't request this code, please ignore this email.</p>
          </div>
          <div style="text-align:center;padding:20px;color:#94a3b8;font-size:11px;">
            <p style="margin:0;">© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    log('Calling Resend API...');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await response.json();
    log(`Resend status: ${response.status}, response: ${JSON.stringify(result)}`);

    if (!response.ok) {
      error(`Resend error: ${JSON.stringify(result)}`);
      return res.json({ success: false, error: result.message || 'Failed to send' }, 500);
    }

    log(`Email sent! ID: ${result.id}`);
    return res.json({ success: true, messageId: result.id });

  } catch (err) {
    error(`Exception: ${err.message}`);
    return res.json({ success: false, error: err.message }, 500);
  }
};
