# Newsletter System Setup Guide

## Overview
Complete email marketing system with campaign management, HTML email support, and tracking.

## Quick Setup with Appwrite CLI

### Option 1: Deploy Everything Automatically
```bash
# Login to Appwrite (if not already)
appwrite login

# Deploy database and collections
appwrite deploy database

# Deploy collections
appwrite deploy collection

# Deploy the newsletter function
appwrite deploy function --functionId=newsletter-emails
```

### Option 2: Deploy Collections Only
```bash
appwrite deploy collection --all
```

The `appwrite.json` file already contains all collection definitions with proper attributes and indexes.

---

## Manual Setup (if not using CLI)

## Appwrite Collections Required

### 1. `newsletter` (already created)
- `email` (string, required)
- `subscribedAt` (string/datetime)
- `isActive` (boolean, default: true)

### 2. `newsletter_folders`
- `name` (string, required)
- `description` (string)
- `createdAt` (string/datetime)

### 3. `newsletter_campaigns`
- `name` (string)
- `folderId` (string) - reference to folder
- `fromName` (string)
- `fromEmail` (string)
- `subject` (string, required)
- `contentType` (string) - text/html/custom
- `textContent` (string, size: 100000)
- `htmlContent` (string, size: 500000)
- `trackOpens` (boolean, default: true)
- `trackClicks` (boolean, default: true)
- `status` (string) - draft/sending/sent
- `recipientCount` (integer)
- `sentCount` (integer)
- `failedCount` (integer)
- `openCount` (integer)
- `clickCount` (integer)
- `createdAt` (string/datetime)
- `sentAt` (string/datetime)

### 4. `email_tracking`
- `campaignId` (string, required)
- `subscriberId` (string)
- `email` (string, required)
- `type` (string) - sent
- `sentAt` (string/datetime)
- `opened` (boolean, default: false)
- `openedAt` (string/datetime)
- `clicked` (boolean, default: false)
- `clickedAt` (string/datetime)

## Appwrite Function Setup

### Deploy the newsletter-emails function:
```bash
appwrite functions createDeployment \
  --functionId=newsletter-emails \
  --entrypoint="src/main.js" \
  --commands="npm install" \
  --code="./functions/newsletter-emails"
```

### Function Environment Variables:
- `RESEND_API_KEY` - Your Resend API key
- `FROM_EMAIL` - Default sender email
- `SITE_URL` - Your website URL (for tracking)
- `APPWRITE_ENDPOINT` - Appwrite endpoint
- `APPWRITE_PROJECT_ID` - Project ID
- `APPWRITE_API_KEY` - API key with database write access
- `APPWRITE_DATABASE_ID` - Database ID

## Features

### Subscriber Management
- View all subscribers with stats
- Toggle active/inactive status
- Search and filter
- Export to CSV
- Select subscribers for campaigns

### Campaign Management
- Create folders to organize campaigns
- Draft and send campaigns
- Track sent/open/click stats
- View detailed reports

### Email Composer
- Plain text support
- HTML editor with syntax highlighting
- Upload custom HTML (Canva, Mailchimp exports)
- Built-in templates
- Live preview
- Tracking options

### Email Tracking
- Open tracking via pixel
- Click tracking via link rewriting
- Per-recipient tracking data
- Export reports to CSV

## Email Content Support

### Plain Text
Simple text emails for maximum compatibility.

### HTML
Write or paste HTML directly. Supports:
- Inline CSS
- Tables for layout
- Images (external URLs)
- Links

### Custom HTML (Canva, etc.)
1. Design your email in Canva or any email builder
2. Export as HTML
3. Upload the HTML file or paste the code
4. Preview and send

## Tracking API Endpoints (Optional)

For tracking to work, you need API endpoints:

### Open Tracking
```
GET /api/track/open/:campaignId/:trackingId
```
Returns a 1x1 transparent pixel and updates the tracking record.

### Click Tracking
```
GET /api/track/click/:campaignId/:subscriberId?url=<encoded_url>
```
Updates click tracking and redirects to the original URL.

## Usage

1. Go to Admin > Newsletter
2. View/manage subscribers in the Subscribers tab
3. Create folders to organize campaigns
4. Click "New Campaign" to compose
5. Select recipients (all active or custom selection)
6. Write content or upload HTML
7. Preview and send
8. View reports after sending
