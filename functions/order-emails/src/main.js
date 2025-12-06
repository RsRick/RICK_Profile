// Order Email Notification Function using Resend API
// Handles: Order Placed, Processing, Cancelled, Completed

export default async ({ req, res, log, error }) => {
  log('=== Order Email Function Started ===');
  
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  const SITE_NAME = process.env.SITE_NAME || 'Portfolio of Parvej';
  const SITE_URL = process.env.SITE_URL || 'https://yoursite.com';

  if (!RESEND_API_KEY) {
    error('RESEND_API_KEY is not configured');
    return res.json({ success: false, error: 'Email service not configured' }, 500);
  }

  try {
    // Parse request data
    let data = {};
    
    if (req.body && typeof req.body === 'string' && req.body.length > 0) {
      try {
        const parsed = JSON.parse(req.body);
        data = parsed.data ? (typeof parsed.data === 'string' ? JSON.parse(parsed.data) : parsed.data) : parsed;
      } catch (e) {
        log(`Body parse error: ${e.message}`);
      }
    }
    
    if (Object.keys(data).length === 0 && req.body && typeof req.body === 'object') {
      data = req.body.data ? (typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data) : req.body;
    }

    if (Object.keys(data).length === 0 && req.payload) {
      try {
        const parsed = typeof req.payload === 'string' ? JSON.parse(req.payload) : req.payload;
        data = parsed.data ? (typeof parsed.data === 'string' ? JSON.parse(parsed.data) : parsed.data) : parsed;
      } catch (e) {
        log(`Payload parse error: ${e.message}`);
      }
    }

    log(`Parsed data: ${JSON.stringify(data)}`);

    const { 
      type,           // 'placed' | 'processing' | 'cancelled' | 'completed'
      email,          // Customer email
      customerName,   // Customer name
      orderId,        // Order ID (PayPal or display ID)
      dbOrderId,      // Database document ID for direct link
      items,          // Array of order items
      subtotal,       // Subtotal amount
      discount,       // Discount amount
      total,          // Total amount
      customMessage,  // Custom message from admin (for processing/cancelled)
      deliveryFiles,  // Array of {displayName, name} for completed orders
      orderDate,      // Order date
    } = data;

    if (!type || !email || !orderId) {
      error('Missing required fields');
      return res.json({ success: false, error: 'type, email, and orderId are required' }, 400);
    }

    // Generate email based on type
    const emailContent = generateEmail(type, {
      customerName,
      orderId,
      dbOrderId: dbOrderId || orderId, // Use dbOrderId for links, fallback to orderId
      items: typeof items === 'string' ? JSON.parse(items) : items,
      subtotal,
      discount,
      total,
      customMessage,
      deliveryFiles: typeof deliveryFiles === 'string' ? JSON.parse(deliveryFiles) : deliveryFiles,
      orderDate,
      siteName: SITE_NAME,
      siteUrl: SITE_URL,
    });

    const emailPayload = {
      from: `${SITE_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    log('Sending email via Resend...');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await response.json();
    log(`Resend response: ${response.status} - ${JSON.stringify(result)}`);

    if (!response.ok) {
      error(`Resend error: ${JSON.stringify(result)}`);
      return res.json({ success: false, error: result.message || 'Failed to send email' }, 500);
    }

    log(`Email sent successfully! ID: ${result.id}`);
    return res.json({ success: true, messageId: result.id, type });

  } catch (err) {
    error(`Exception: ${err.message}`);
    return res.json({ success: false, error: err.message }, 500);
  }
};

// Generate email content based on type
function generateEmail(type, data) {
  const { customerName, orderId, dbOrderId, items, subtotal, discount, total, customMessage, deliveryFiles, orderDate, siteName, siteUrl } = data;
  
  const shortOrderId = orderId?.slice(-8) || orderId;
  const name = customerName || 'Valued Customer';
  const orderLink = `${siteUrl}/dashboard/order/${dbOrderId}`; // Direct link to order page
  
  // Common styles
  const styles = {
    wrapper: `font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;`,
    header: `background: linear-gradient(135deg, #105652 0%, #1E8479 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;`,
    logo: `color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;`,
    body: `padding: 40px 30px; background: #ffffff;`,
    footer: `background: #f8fafc; padding: 30px; text-align: center; border-radius: 0 0 16px 16px; border-top: 1px solid #e2e8f0;`,
    button: `display: inline-block; background: linear-gradient(135deg, #105652 0%, #1E8479 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 14px rgba(16, 86, 82, 0.3);`,
    card: `background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;`,
    itemRow: `display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0;`,
    badge: `display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;`,
  };

  // Generate items HTML
  const itemsHtml = items?.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
        <div style="display: flex; align-items: center;">
          ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; margin-right: 12px;">` : ''}
          <div>
            <p style="margin: 0; font-weight: 500; color: #1e293b; font-size: 14px;">${item.name}</p>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 12px;">Qty: ${item.quantity}</p>
          </div>
        </div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600; color: #1e293b;">
        $${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
      </td>
    </tr>
  `).join('') || '';

  // Generate delivery files HTML for completed orders
  const filesHtml = deliveryFiles?.map(file => `
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px 16px; margin: 8px 0; display: flex; align-items: center;">
      <div style="width: 40px; height: 40px; background: #105652; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
        <span style="color: white; font-size: 18px;">📄</span>
      </div>
      <div>
        <p style="margin: 0; font-weight: 600; color: #166534; font-size: 14px;">${file.displayName || file.name}</p>
        <p style="margin: 2px 0 0; color: #15803d; font-size: 11px;">Ready for download</p>
      </div>
    </div>
  `).join('') || '';

  switch (type) {
    case 'placed':
      return {
        subject: `🎉 Order Confirmed! #${shortOrderId}`,
        html: generatePlacedEmail(name, shortOrderId, itemsHtml, subtotal, discount, total, orderDate, siteName, orderLink, styles),
      };
    
    case 'processing':
      return {
        subject: `⚡ Your Order is Being Processed #${shortOrderId}`,
        html: generateProcessingEmail(name, shortOrderId, customMessage, itemsHtml, total, siteName, orderLink, styles),
      };
    
    case 'cancelled':
      return {
        subject: `❌ Order Cancelled #${shortOrderId}`,
        html: generateCancelledEmail(name, shortOrderId, customMessage, itemsHtml, total, siteName, siteUrl, styles),
      };
    
    case 'completed':
      return {
        subject: `✅ Your Order is Complete! #${shortOrderId}`,
        html: generateCompletedEmail(name, shortOrderId, itemsHtml, subtotal, discount, total, filesHtml, deliveryFiles, siteName, orderLink, styles),
      };
    
    default:
      return {
        subject: `Order Update #${shortOrderId}`,
        html: `<p>Your order status has been updated.</p>`,
      };
  }
}


// Order Placed Email Template
function generatePlacedEmail(name, orderId, itemsHtml, subtotal, discount, total, orderDate, siteName, orderLink, styles) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f1f5f9;">
  <div style="${styles.wrapper}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="${styles.header}">
      <h1 style="${styles.logo}">${siteName}</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Thank you for your order!</p>
    </div>

    <!-- Body -->
    <div style="${styles.body}">
      <!-- Success Icon -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px;">🎉</span>
        </div>
        <h2 style="color: #166534; margin: 0; font-size: 22px; font-weight: 700;">Order Confirmed!</h2>
        <p style="color: #64748b; margin: 8px 0 0; font-size: 14px;">We've received your order and it's being prepared.</p>
      </div>

      <!-- Greeting -->
      <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
        Hi <strong>${name}</strong>,<br><br>
        Thank you for shopping with us! Your order has been successfully placed and we're getting it ready for you.
      </p>

      <!-- Order Info Card -->
      <div style="${styles.card}">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</p>
            <p style="margin: 4px 0 0; color: #105652; font-size: 18px; font-weight: 700; font-family: monospace;">#${orderId}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order Date</p>
            <p style="margin: 4px 0 0; color: #334155; font-size: 14px; font-weight: 500;">${orderDate || new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div style="background: #dbeafe; color: #1d4ed8; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; display: inline-block;">
          📦 Status: Order Placed
        </div>
      </div>

      <!-- Order Items -->
      <h3 style="color: #1e293b; font-size: 16px; margin: 30px 0 16px; font-weight: 600;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Order Summary -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #64748b; font-size: 14px;">Subtotal</span>
          <span style="color: #334155; font-size: 14px;">$${(subtotal || total || 0).toFixed(2)}</span>
        </div>
        ${discount > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #16a34a; font-size: 14px;">Discount</span>
          <span style="color: #16a34a; font-size: 14px;">-$${discount.toFixed(2)}</span>
        </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #64748b; font-size: 14px;">Shipping</span>
          <span style="color: #16a34a; font-size: 14px;">Free</span>
        </div>
        <div style="border-top: 2px solid #e2e8f0; padding-top: 12px; margin-top: 12px; display: flex; justify-content: space-between;">
          <span style="color: #1e293b; font-size: 16px; font-weight: 700;">Total</span>
          <span style="color: #105652; font-size: 18px; font-weight: 700;">$${(total || 0).toFixed(2)}</span>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 30px;">
        <a href="${orderLink}" style="${styles.button}">
          Track Your Order →
        </a>
      </div>

      <!-- What's Next -->
      <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px;">
        <h4 style="margin: 0 0 12px; color: #92400e; font-size: 14px; font-weight: 600;">📋 What's Next?</h4>
        <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 13px; line-height: 1.8;">
          <li>We'll process your order shortly</li>
          <li>You'll receive an email when it's ready</li>
          <li>Download files from your dashboard</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div style="${styles.footer}">
      <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">Need help? Reply to this email or contact us.</p>
      <p style="margin: 0; color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}


// Processing Email Template
function generateProcessingEmail(name, orderId, customMessage, itemsHtml, total, siteName, orderLink, styles) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f1f5f9;">
  <div style="${styles.wrapper}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="${styles.header}">
      <h1 style="${styles.logo}">${siteName}</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Order Update</p>
    </div>

    <!-- Body -->
    <div style="${styles.body}">
      <!-- Processing Icon -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px;">⚡</span>
        </div>
        <h2 style="color: #1d4ed8; margin: 0; font-size: 22px; font-weight: 700;">Order Processing!</h2>
        <p style="color: #64748b; margin: 8px 0 0; font-size: 14px;">Great news! We're working on your order.</p>
      </div>

      <!-- Greeting -->
      <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
        Hi <strong>${name}</strong>,<br><br>
        Your order <strong style="color: #105652;">#${orderId}</strong> is now being processed. We're preparing everything for you!
      </p>

      <!-- Status Badge -->
      <div style="${styles.card}; border-left: 4px solid #3b82f6;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; background: #dbeafe; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 24px;">🔄</span>
          </div>
          <div>
            <p style="margin: 0; color: #1e293b; font-weight: 600; font-size: 15px;">Status: Processing</p>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Order #${orderId}</p>
          </div>
        </div>
      </div>

      ${customMessage ? `
      <!-- Custom Message from Admin -->
      <div style="margin-top: 24px; padding: 20px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; border: 1px solid #bae6fd;">
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <div style="width: 36px; height: 36px; background: #0ea5e9; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <span style="color: white; font-size: 16px;">💬</span>
          </div>
          <div>
            <p style="margin: 0 0 8px; color: #0369a1; font-weight: 600; font-size: 13px;">Message from our team:</p>
            <p style="margin: 0; color: #0c4a6e; font-size: 14px; line-height: 1.6;">${customMessage}</p>
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Progress Steps -->
      <div style="margin-top: 30px;">
        <h3 style="color: #1e293b; font-size: 14px; margin: 0 0 16px; font-weight: 600;">Order Progress</h3>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 32px; height: 32px; background: #105652; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: 600;">✓</div>
          <div style="flex: 1; height: 4px; background: #105652; border-radius: 2px;"></div>
          <div style="width: 32px; height: 32px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: 600;">2</div>
          <div style="flex: 1; height: 4px; background: #e2e8f0; border-radius: 2px;"></div>
          <div style="width: 32px; height: 32px; background: #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 14px; font-weight: 600;">3</div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 8px;">
          <span style="font-size: 11px; color: #105652; font-weight: 500;">Placed</span>
          <span style="font-size: 11px; color: #3b82f6; font-weight: 600;">Processing</span>
          <span style="font-size: 11px; color: #94a3b8;">Completed</span>
        </div>
      </div>

      <!-- Order Summary -->
      <div style="${styles.card}; margin-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #64748b; font-size: 14px;">Order Total</span>
          <span style="color: #105652; font-size: 18px; font-weight: 700;">$${(total || 0).toFixed(2)}</span>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 30px;">
        <a href="${orderLink}" style="${styles.button}">
          View Order Details →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="${styles.footer}">
      <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">Questions? Reply to this email anytime.</p>
      <p style="margin: 0; color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}


// Cancelled Email Template
function generateCancelledEmail(name, orderId, customMessage, itemsHtml, total, siteName, siteUrl, styles) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f1f5f9;">
  <div style="${styles.wrapper}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    
    <!-- Header - Red Theme for Cancelled -->
    <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
      <h1 style="${styles.logo}">${siteName}</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Order Cancellation Notice</p>
    </div>

    <!-- Body -->
    <div style="${styles.body}">
      <!-- Cancelled Icon -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px;">❌</span>
        </div>
        <h2 style="color: #dc2626; margin: 0; font-size: 22px; font-weight: 700;">Order Cancelled</h2>
        <p style="color: #64748b; margin: 8px 0 0; font-size: 14px;">We're sorry to inform you about this update.</p>
      </div>

      <!-- Greeting -->
      <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
        Hi <strong>${name}</strong>,<br><br>
        Your order <strong style="color: #dc2626;">#${orderId}</strong> has been cancelled. We apologize for any inconvenience this may cause.
      </p>

      <!-- Status Badge -->
      <div style="background: #fef2f2; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #fecaca; border-left: 4px solid #dc2626;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; background: #fee2e2; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 24px;">🚫</span>
          </div>
          <div>
            <p style="margin: 0; color: #991b1b; font-weight: 600; font-size: 15px;">Status: Cancelled</p>
            <p style="margin: 4px 0 0; color: #b91c1c; font-size: 13px;">Order #${orderId}</p>
          </div>
        </div>
      </div>

      ${customMessage ? `
      <!-- Cancellation Reason -->
      <div style="margin-top: 24px; padding: 20px; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; border: 1px solid #fecaca;">
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <div style="width: 36px; height: 36px; background: #dc2626; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <span style="color: white; font-size: 16px;">📝</span>
          </div>
          <div>
            <p style="margin: 0 0 8px; color: #991b1b; font-weight: 600; font-size: 13px;">Reason for cancellation:</p>
            <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">${customMessage}</p>
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Refund Info -->
      <div style="${styles.card}; margin-top: 24px; border-left: 4px solid #f59e0b;">
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <div style="width: 40px; height: 40px; background: #fef3c7; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <span style="font-size: 20px;">💰</span>
          </div>
          <div>
            <p style="margin: 0 0 4px; color: #92400e; font-weight: 600; font-size: 14px;">Refund Information</p>
            <p style="margin: 0; color: #78350f; font-size: 13px; line-height: 1.5;">If you made a payment, your refund will be processed within 5-7 business days. The amount of <strong>$${(total || 0).toFixed(2)}</strong> will be returned to your original payment method.</p>
          </div>
        </div>
      </div>

      <!-- Help Section -->
      <div style="margin-top: 30px; padding: 24px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; text-align: center;">
        <h4 style="margin: 0 0 12px; color: #166534; font-size: 16px; font-weight: 600;">Need Help?</h4>
        <p style="margin: 0 0 16px; color: #15803d; font-size: 13px;">We're here to assist you with any questions or concerns.</p>
        <a href="${siteUrl}/shop" style="${styles.button}; background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);">
          Continue Shopping →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="${styles.footer}">
      <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">Questions about your cancellation? Reply to this email.</p>
      <p style="margin: 0; color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}


// Completed Email Template
function generateCompletedEmail(name, orderId, itemsHtml, subtotal, discount, total, filesHtml, deliveryFiles, siteName, orderLink, styles) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f1f5f9;">
  <div style="${styles.wrapper}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    
    <!-- Header - Green Theme for Completed -->
    <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
      <h1 style="${styles.logo}">${siteName}</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Your order is ready!</p>
    </div>

    <!-- Body -->
    <div style="${styles.body}">
      <!-- Success Icon -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px;">✅</span>
        </div>
        <h2 style="color: #059669; margin: 0; font-size: 22px; font-weight: 700;">Order Complete!</h2>
        <p style="color: #64748b; margin: 8px 0 0; font-size: 14px;">Your files are ready for download.</p>
      </div>

      <!-- Greeting -->
      <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
        Hi <strong>${name}</strong>,<br><br>
        Great news! Your order <strong style="color: #059669;">#${orderId}</strong> has been completed. Your files are now available for download in your dashboard.
      </p>

      <!-- Status Badge -->
      <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #bbf7d0; border-left: 4px solid #059669;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; background: #dcfce7; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 24px;">🎊</span>
          </div>
          <div>
            <p style="margin: 0; color: #166534; font-weight: 600; font-size: 15px;">Status: Completed</p>
            <p style="margin: 4px 0 0; color: #15803d; font-size: 13px;">Order #${orderId}</p>
          </div>
        </div>
      </div>

      <!-- Progress Steps - All Complete -->
      <div style="margin-top: 30px;">
        <h3 style="color: #1e293b; font-size: 14px; margin: 0 0 16px; font-weight: 600;">Order Progress</h3>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 32px; height: 32px; background: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: 600;">✓</div>
          <div style="flex: 1; height: 4px; background: #059669; border-radius: 2px;"></div>
          <div style="width: 32px; height: 32px; background: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: 600;">✓</div>
          <div style="flex: 1; height: 4px; background: #059669; border-radius: 2px;"></div>
          <div style="width: 32px; height: 32px; background: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: 600;">✓</div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 8px;">
          <span style="font-size: 11px; color: #059669; font-weight: 500;">Placed</span>
          <span style="font-size: 11px; color: #059669; font-weight: 500;">Processing</span>
          <span style="font-size: 11px; color: #059669; font-weight: 600;">Completed</span>
        </div>
      </div>

      <!-- Your Files Section -->
      ${deliveryFiles && deliveryFiles.length > 0 ? `
      <div style="margin-top: 30px;">
        <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 16px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">📁</span> Your Files (${deliveryFiles.length})
        </h3>
        ${filesHtml}
        
        <!-- Important Notice -->
        <div style="margin-top: 16px; padding: 16px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 10px; border: 1px solid #fcd34d;">
          <div style="display: flex; align-items: flex-start; gap: 10px;">
            <span style="font-size: 18px;">🔐</span>
            <div>
              <p style="margin: 0 0 4px; color: #92400e; font-weight: 600; font-size: 13px;">Secure Download</p>
              <p style="margin: 0; color: #78350f; font-size: 12px; line-height: 1.5;">For security reasons, please <strong>log in to your dashboard</strong> to download your files. Direct download links are not included in emails.</p>
            </div>
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Order Items -->
      <h3 style="color: #1e293b; font-size: 16px; margin: 30px 0 16px; font-weight: 600;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Order Summary -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #64748b; font-size: 14px;">Subtotal</span>
          <span style="color: #334155; font-size: 14px;">$${(subtotal || total || 0).toFixed(2)}</span>
        </div>
        ${discount > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #16a34a; font-size: 14px;">Discount</span>
          <span style="color: #16a34a; font-size: 14px;">-$${discount.toFixed(2)}</span>
        </div>
        ` : ''}
        <div style="border-top: 2px solid #e2e8f0; padding-top: 12px; margin-top: 12px; display: flex; justify-content: space-between;">
          <span style="color: #1e293b; font-size: 16px; font-weight: 700;">Total Paid</span>
          <span style="color: #059669; font-size: 18px; font-weight: 700;">$${(total || 0).toFixed(2)}</span>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 30px;">
        <a href="${orderLink}" style="${styles.button}; background: linear-gradient(135deg, #059669 0%, #10b981 100%); font-size: 16px; padding: 16px 40px;">
          🔓 Login to Download Files
        </a>
        <p style="margin: 12px 0 0; color: #64748b; font-size: 12px;">Access your dashboard to download your files securely</p>
      </div>

      <!-- Thank You Message -->
      <div style="margin-top: 30px; padding: 24px; background: linear-gradient(135deg, #105652 0%, #1E8479 100%); border-radius: 12px; text-align: center;">
        <h4 style="margin: 0 0 8px; color: #ffffff; font-size: 18px; font-weight: 600;">Thank You! 🙏</h4>
        <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 13px; line-height: 1.6;">We appreciate your business and hope you enjoy your purchase. If you have any questions, feel free to reach out!</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="${styles.footer}">
      <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">Need help? Reply to this email anytime.</p>
      <p style="margin: 0; color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
