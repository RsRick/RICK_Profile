# Order Email Notification System Setup

This guide explains how to set up the automatic order email notification system.

## Overview

The system sends beautiful, branded emails at 4 key order phases:
1. **Order Placed** - Sent automatically when customer completes checkout
2. **Processing** - Sent when admin changes status to "Processing" with custom message
3. **Cancelled** - Sent when admin cancels the order with reason
4. **Completed** - Sent when order is complete with download instructions

## Step 1: Deploy the Appwrite Function

### Using Appwrite CLI

```bash
# Install Appwrite CLI if not already installed
npm install -g appwrite-cli

# Login to Appwrite
appwrite login

# Deploy the function
appwrite deploy function --functionId order-emails
```

### Manual Deployment (Appwrite Console)

1. Go to your Appwrite Console → Functions
2. Click "Create Function"
3. Settings:
   - Name: `order-emails`
   - Runtime: `Node.js 18.0`
   - Entrypoint: `src/main.js`
   - Build Commands: `npm install`
4. Upload the `functions/order-emails` folder
5. Deploy

## Step 2: Configure Environment Variables

In Appwrite Console → Functions → order-emails → Settings → Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `RESEND_API_KEY` | `re_xxxxx` | Your Resend API key |
| `FROM_EMAIL` | `noreply@yourdomain.com` | Sender email (must be verified in Resend) |
| `SITE_NAME` | `Portfolio of Parvej` | Your site name for branding |
| `SITE_URL` | `https://yoursite.com` | Your site URL for links |

## Step 3: Set Function Permissions

In Appwrite Console → Functions → order-emails → Settings:
- Execute Access: `Any` (allows frontend to call it)

## Email Templates

### 1. Order Placed Email
- Sent automatically on successful checkout
- Includes: Order confirmation, items list, pricing breakdown, tracking link
- Theme: Green success with teal branding

### 2. Processing Email  
- Sent when admin clicks "Save & Send Email" with status = Processing
- Includes: Progress indicator, custom message from admin
- Theme: Blue processing with progress steps

### 3. Cancelled Email
- Sent when admin clicks "Save & Send Email" with status = Cancelled
- Includes: Cancellation notice, reason, refund info
- Theme: Red alert with support options

### 4. Completed Email
- Sent when admin clicks "Save & Send Email" with status = Completed
- Includes: Success message, file list (names only), login instructions
- Theme: Green success with download CTA
- **Note**: No direct download links for security - customers must login

## Admin Usage

### In Order Management:

1. Open an order
2. Change the status (Processing/Cancelled/Completed)
3. Add custom message in the notes field (optional)
4. For completed orders: Upload delivery files
5. Click **"Save & Send Email to Customer"**

### Two Save Options:
- **Save Only**: Updates order without sending email
- **Save & Send Email**: Updates order AND sends notification email

## Testing

### Test the function directly:

```javascript
// In browser console or test file
import { sendOrderEmail } from './src/lib/orderEmailService';

// Test order placed email
await sendOrderEmail('placed', {
  customerEmail: 'test@example.com',
  customerName: 'Test User',
  orderId: 'TEST-123',
  items: [{ name: 'Test Product', price: 29.99, quantity: 1 }],
  subtotal: 29.99,
  discount: 0,
  total: 29.99,
});
```

## Troubleshooting

### Email not sending?
1. Check Appwrite Function logs for errors
2. Verify RESEND_API_KEY is correct
3. Ensure FROM_EMAIL is verified in Resend
4. Check function has "Any" execute permission

### Email going to spam?
1. Set up proper DNS records (SPF, DKIM, DMARC) for your domain
2. Use a verified domain in Resend instead of @resend.dev

## File Structure

```
functions/
└── order-emails/
    ├── src/
    │   └── main.js      # Main function with all email templates
    └── package.json
```

## Security Notes

- Download links are NOT included in emails for security
- Customers must login to their dashboard to download files
- Each email includes order verification details
- Emails are sent via Resend's secure API
