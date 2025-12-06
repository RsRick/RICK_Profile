// Newsletter Email Function with Tracking using Resend API
// Supports: Plain text, HTML, Custom HTML templates (Canva, etc.)

import { Client, Databases, ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  log('=== Newsletter Email Function Started ===');
  
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  const SITE_URL = process.env.SITE_URL || 'https://yoursite.com';
  const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT;
  const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
  const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
  const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;

  if (!RESEND_API_KEY) {
    error('RESEND_API_KEY is not configured');
    return res.json({ success: false, error: 'Email service not configured' }, 500);
  }

  // Initialize Appwrite client for tracking
  let databases = null;
  if (APPWRITE_ENDPOINT && APPWRITE_PROJECT_ID && APPWRITE_API_KEY && DATABASE_ID) {
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setKey(APPWRITE_API_KEY);
    databases = new Databases(client);
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

    log(`Parsed data keys: ${Object.keys(data).join(', ')}`);

    const { 
      campaignId,      // Campaign ID for tracking
      fromName,        // Sender name
      fromEmail,       // Sender email (optional, uses default)
      subject,         // Email subject
      contentType,     // 'text' | 'html' | 'custom'
      textContent,     // Plain text content
      htmlContent,     // HTML content (for html or custom type)
      recipients,      // Array of { email, subscriberId }
      trackOpens,      // Enable open tracking
      trackClicks,     // Enable click tracking
    } = data;

    if (!subject || !recipients || recipients.length === 0) {
      error('Missing required fields');
      return res.json({ success: false, error: 'subject and recipients are required' }, 400);
    }

    const results = {
      sent: 0,
      failed: 0,
      errors: [],
      messageIds: []
    };

    // Process each recipient
    for (const recipient of recipients) {
      try {
        let finalHtml = htmlContent || '';
        let finalText = textContent || '';

        // Add tracking pixel for open tracking
        if (trackOpens && databases && campaignId) {
          const trackingId = ID.unique();
          const trackingPixel = `<img src="${SITE_URL}/api/track/open/${campaignId}/${trackingId}" width="1" height="1" style="display:none;" alt="" />`;
          
          // Store tracking record
          try {
            await databases.createDocument(DATABASE_ID, 'email_tracking', trackingId, {
              campaignId,
              subscriberId: recipient.subscriberId || '',
              email: recipient.email,
              type: 'sent',
              sentAt: new Date().toISOString(),
              opened: false,
              clicked: false
            });
          } catch (e) {
            log(`Tracking record error: ${e.message}`);
          }

          // Inject tracking pixel before </body> or at end
          if (finalHtml) {
            if (finalHtml.includes('</body>')) {
              finalHtml = finalHtml.replace('</body>', `${trackingPixel}</body>`);
            } else {
              finalHtml += trackingPixel;
            }
          }
        }

        // Add click tracking to links
        if (trackClicks && finalHtml && databases && campaignId) {
          finalHtml = finalHtml.replace(
            /href="(https?:\/\/[^"]+)"/g,
            (match, url) => {
              const encodedUrl = encodeURIComponent(url);
              return `href="${SITE_URL}/api/track/click/${campaignId}/${recipient.subscriberId || 'unknown'}?url=${encodedUrl}"`;
            }
          );
        }

        // Build email payload
        const emailPayload = {
          from: `${fromName || 'Newsletter'} <${fromEmail || FROM_EMAIL}>`,
          to: recipient.email,
          subject: subject,
        };

        // Set content based on type
        if (contentType === 'text' || (!htmlContent && textContent)) {
          emailPayload.text = finalText;
        } else {
          emailPayload.html = finalHtml;
          if (finalText) {
            emailPayload.text = finalText; // Fallback text version
          }
        }

        // Send via Resend
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailPayload),
        });

        const result = await response.json();

        if (response.ok) {
          results.sent++;
          results.messageIds.push({ email: recipient.email, messageId: result.id });
          log(`✓ Sent to ${recipient.email}`);
        } else {
          results.failed++;
          results.errors.push({ email: recipient.email, error: result.message });
          log(`✗ Failed ${recipient.email}: ${result.message}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 100));

      } catch (err) {
        results.failed++;
        results.errors.push({ email: recipient.email, error: err.message });
        log(`✗ Error ${recipient.email}: ${err.message}`);
      }
    }

    // Update campaign stats if tracking enabled
    if (databases && campaignId) {
      try {
        await databases.updateDocument(DATABASE_ID, 'newsletter_campaigns', campaignId, {
          sentCount: results.sent,
          failedCount: results.failed,
          status: 'sent',
          sentAt: new Date().toISOString()
        });
      } catch (e) {
        log(`Campaign update error: ${e.message}`);
      }
    }

    log(`=== Newsletter Complete: ${results.sent} sent, ${results.failed} failed ===`);
    return res.json({ 
      success: true, 
      sent: results.sent, 
      failed: results.failed,
      messageIds: results.messageIds,
      errors: results.errors 
    });

  } catch (err) {
    error(`Exception: ${err.message}`);
    return res.json({ success: false, error: err.message }, 500);
  }
};