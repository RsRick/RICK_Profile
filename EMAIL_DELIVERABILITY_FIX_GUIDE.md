# Email Deliverability & Spam Prevention Guide

## Current Issues Summary

| Email Type | Current Status | Target |
|------------|---------------|--------|
| OTP emails | Promotions tab | ✅ Acceptable |
| Order confirmation | Inbox | ✅ Perfect |
| Order updates | Spam folder | ❌ Needs fix |
| Newsletter campaigns | Spam folder | ❌ Needs fix |

---

## Root Causes

### 1. Domain Authentication (CRITICAL)
- ❌ Using `onboarding@resend.dev` (shared domain)
- ❌ No SPF/DKIM/DMARC for your domain
- ❌ Low sender reputation

### 2. Missing Required Headers
- ❌ No List-Unsubscribe header (required for bulk emails)
- ❌ No plain text version
- ❌ Inconsistent From addresses

### 3. Content Issues
- ⚠️ Too many promotional words
- ⚠️ Poor text-to-image ratio
- ⚠️ Missing engagement elements

---

## Complete Solution (Step-by-Step)

### PHASE 1: Domain Authentication (Do This First!)

#### Step 1: Add Domain to Resend

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Resend will show DNS records to add

#### Step 2: Add DNS Records

Go to your DNS provider (Cloudflare, Namecheap, GoDaddy, etc.) and add:

**A. SPF Record**
```
Type: TXT
Name: @ (or yourdomain.com)
Value: v=spf1 include:resend.com ~all
TTL: 3600
```

**B. DKIM Records** (Resend provides 3)
```
Type: CNAME
Name: resend._domainkey
Value: [copy from Resend]
TTL: 3600

Type: CNAME
Name: resend2._domainkey
Value: [copy from Resend]
TTL: 3600

Type: CNAME
Name: resend3._domainkey
Value: [copy from Resend]
TTL: 3600
```

**C. DMARC Record**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; pct=100; adkim=s; aspf=s
TTL: 3600
```

#### Step 3: Verify Domain
- Wait 15-30 minutes for DNS propagation
- Click **Verify** in Resend Dashboard
- Status should change to "Verified"

#### Step 4: Update Environment Variables

Update these in all 3 functions:

```bash
FROM_EMAIL=noreply@yourdomain.com
SITE_NAME=Your Company Name
```

**Expected Impact:** 50-70% improvement in deliverability

---

### PHASE 2: Add Required Email Headers

#### Update All Email Functions

Add these headers to email payload:

```javascript
const emailPayload = {
  from: `${SITE_NAME} <${FROM_EMAIL}>`,
  to: email,
  subject: subject,
  html: htmlContent,
  text: textContent, // REQUIRED: Plain text version
  headers: {
    'X-Entity-Ref-ID': orderId || campaignId,
    'List-Unsubscribe': `<mailto:unsubscribe@yourdomain.com?subject=Unsubscribe>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  },
  tags: [
    { name: 'category', value: 'transactional' } // or 'marketing'
  ]
};
```

**For Newsletter Campaigns - Add Unsubscribe Link:**

```javascript
// Add to email footer
const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}&id=${subscriberId}`;

const footer = `
  <div style="text-align: center; padding: 20px; background: #f5f5f5; margin-top: 30px;">
    <p style="color: #666; font-size: 12px;">
      You're receiving this because you subscribed to our newsletter.
    </p>
    <p style="color: #666; font-size: 12px;">
      <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">
        Unsubscribe
      </a> | 
      <a href="${SITE_URL}" style="color: #666; text-decoration: underline;">
        Visit Website
      </a>
    </p>
    <p style="color: #999; font-size: 11px;">
      Your Company Name<br>
      123 Street Address, City, State 12345
    </p>
  </div>
`;
```

**Expected Impact:** 20-30% improvement

---

### PHASE 3: Content Optimization

#### A. Avoid Spam Trigger Words

**Remove or replace:**
- ❌ "Click here", "Act now", "Limited time"
- ❌ "Free", "Winner", "Congratulations"
- ❌ ALL CAPS text
- ❌ Multiple exclamation marks!!!

**Use instead:**
- ✅ "View order details"
- ✅ "See your order"
- ✅ Descriptive, specific text

#### B. Improve HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Title</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <!-- Content here -->
</body>
</html>
```

#### C. Text-to-Image Ratio
- Keep images under 30% of email
- Always include alt text for images
- Provide plain text version

#### D. Add Engagement Elements

```html
<!-- Add these to order update emails -->
<div style="text-align: center; margin: 30px 0;">
  <p style="color: #666; font-size: 14px;">Was this email helpful?</p>
  <a href="${SITE_URL}/feedback?helpful=yes" style="color: #105652; margin: 0 10px;">👍 Yes</a>
  <a href="${SITE_URL}/feedback?helpful=no" style="color: #105652; margin: 0 10px;">👎 No</a>
</div>
```

**Expected Impact:** 10-15% improvement

---

### PHASE 4: Sender Reputation Building

#### A. Warm Up Your Domain

**Week 1:** Send 50-100 emails/day
**Week 2:** Send 200-500 emails/day  
**Week 3:** Send 1,000-2,000 emails/day
**Week 4+:** Normal volume

#### B. Monitor Metrics

Track in Resend Dashboard:
- **Delivery rate** (should be >95%)
- **Open rate** (should be >15%)
- **Bounce rate** (should be <5%)
- **Spam complaints** (should be <0.1%)

#### C. Clean Your List

- Remove bounced emails immediately
- Remove inactive subscribers (no opens in 6 months)
- Honor unsubscribe requests instantly

**Expected Impact:** Long-term 30-40% improvement

---

### PHASE 5: Technical Improvements

#### A. Implement Unsubscribe Endpoint

Create API endpoint: `/api/unsubscribe`

```javascript
// Handle unsubscribe
app.get('/unsubscribe', async (req, res) => {
  const { email, id } = req.query;
  
  // Update subscriber status
  await newsletterService.updateSubscriber(id, { isActive: false });
  
  res.send('You have been unsubscribed successfully.');
});
```

#### B. Add Email Preferences

Let users choose:
- Newsletter frequency
- Email types (updates, promotions, etc.)
- Preferred format (HTML vs plain text)

#### C. Implement Double Opt-In

For newsletter subscriptions:
1. User submits email
2. Send confirmation email
3. User clicks confirm link
4. Subscription activated

**Expected Impact:** 15-20% improvement + legal compliance

---

## Quick Wins (Do These Today)

### 1. Update FROM_EMAIL
Change from `onboarding@resend.dev` to `noreply@yourdomain.com` (after domain verification)

### 2. Add Plain Text Version
Every email should have both HTML and plain text:

```javascript
emailPayload.text = stripHtml(htmlContent); // Simple text version
```

### 3. Add Unsubscribe Link
Add to all newsletter emails (required by law)

### 4. Fix Subject Lines

**Bad:**
- "🎉 AMAZING OFFER - CLICK NOW!!!"
- "You won't believe this..."

**Good:**
- "Your order #12345 has been updated"
- "December newsletter: New features"

### 5. Consistent Sender Info

Always use:
- Same FROM name
- Same FROM email
- Same reply-to address

---

## Testing Checklist

Before sending to real users:

- [ ] Domain verified in Resend
- [ ] SPF/DKIM/DMARC records added
- [ ] Plain text version included
- [ ] Unsubscribe link present (newsletters)
- [ ] No spam trigger words
- [ ] Proper HTML structure
- [ ] Images have alt text
- [ ] Links are descriptive
- [ ] Test with [Mail-Tester.com](https://www.mail-tester.com) (aim for 8+/10)
- [ ] Test with real Gmail/Outlook accounts
- [ ] Check spam folder

---

## Expected Results Timeline

| Timeframe | Expected Improvement |
|-----------|---------------------|
| Immediate (after domain setup) | 50-60% |
| Week 1 | 70-75% |
| Week 2-4 | 80-85% |
| Month 2+ | 90-95% |

---

## Monitoring & Maintenance

### Daily
- Check Resend Dashboard for bounces
- Monitor spam complaints

### Weekly
- Review open/click rates
- Clean bounced emails
- Check spam folder placement

### Monthly
- Analyze engagement trends
- Update content based on performance
- Review and clean inactive subscribers

---

## Emergency: If Emails Still Go to Spam

### 1. Use Mail-Tester
- Send test email to address provided by [Mail-Tester.com](https://www.mail-tester.com)
- Get detailed spam score report
- Fix issues one by one

### 2. Check Blacklists
- Visit [MXToolbox Blacklist Check](https://mxtoolbox.com/blacklists.aspx)
- Enter your domain
- Request removal if blacklisted

### 3. Contact Resend Support
- Provide email examples
- Ask for deliverability review
- Request IP reputation check

### 4. Consider Dedicated IP
- For high volume (10,000+ emails/month)
- Better reputation control
- Costs extra but worth it

---

## Legal Requirements (CAN-SPAM Act)

All commercial emails MUST include:

1. ✅ Accurate FROM information
2. ✅ Clear subject line (no deception)
3. ✅ Physical mailing address
4. ✅ Unsubscribe link (must work for 30 days)
5. ✅ Honor unsubscribe within 10 business days
6. ✅ Label as advertisement (if promotional)

**Penalty:** Up to $46,517 per violation

---

## Resources

- [Resend Deliverability Guide](https://resend.com/docs/knowledge-base/deliverability)
- [Mail-Tester](https://www.mail-tester.com) - Test spam score
- [MXToolbox](https://mxtoolbox.com) - DNS/blacklist checker
- [Can I Email](https://www.caniemail.com) - HTML/CSS support
- [Really Good Emails](https://reallygoodemails.com) - Email design inspiration

---

## Summary Action Plan

**Priority 1 (Do Now):**
1. Verify domain in Resend
2. Add SPF/DKIM/DMARC records
3. Update FROM_EMAIL to your domain

**Priority 2 (This Week):**
1. Add plain text versions
2. Add unsubscribe links
3. Fix spam trigger words
4. Test with Mail-Tester

**Priority 3 (This Month):**
1. Implement unsubscribe endpoint
2. Add email preferences
3. Start domain warm-up
4. Monitor metrics

**Result:** 90%+ inbox delivery rate within 4-6 weeks
