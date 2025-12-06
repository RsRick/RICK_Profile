# Shortlink System Setup Guide

## Overview

The Shortlink System is a comprehensive URL shortening and management solution integrated into your admin dashboard. It allows you to create custom short URLs, track analytics, manage custom domains, and more.

## Features

✅ Create short URLs from long URLs
✅ Custom path support (e.g., yoursite.com/my-link)
✅ Preview images for social media sharing
✅ Detailed analytics (clicks, countries, devices, referrers)
✅ Collision detection with existing routes
✅ Custom domain support (e.g., link.parvej.me)
✅ DNS verification and setup guidance

## Database Setup

### Collections Created

The following Appwrite collections have been created in your `portfolio_db` database:

#### 1. `shortlinks` Collection
Stores all shortened URLs with their metadata.

**Columns:**
- `customPath` (string, required) - The short URL path
- `destinationUrl` (url, required) - The target URL
- `previewImageId` (string, optional) - Storage file ID for preview image
- `previewImageUrl` (url, optional) - Full URL to preview image
- `domainId` (string, optional) - Custom domain ID (null = main domain)
- `title` (string, optional) - Open Graph title
- `description` (string, optional) - Open Graph description
- `isActive` (boolean, default: true) - Whether link is active
- `clickCount` (integer, default: 0) - Total clicks
- `createdAt` (datetime, required) - Creation timestamp
- `updatedAt` (datetime, required) - Last update timestamp
- `createdBy` (string, required) - Admin user ID

**Indexes:**
- `customPath_idx` (unique) - For fast path lookups
- `domainId_idx` - For filtering by domain
- `createdAt_idx` (DESC) - For sorting by creation date

#### 2. `shortlink_analytics` Collection
Stores click analytics for each shortlink.

**Columns:**
- `shortlinkId` (string, required) - Reference to shortlink
- `timestamp` (datetime, required) - Click timestamp
- `ipAddress` (string, required) - Hashed visitor IP
- `country` (string, optional) - Country code (e.g., "US")
- `countryName` (string, optional) - Full country name
- `city` (string, optional) - City name
- `referrer` (url, optional) - Referrer URL
- `userAgent` (string, required) - Full user agent string
- `deviceType` (string, optional) - "desktop", "mobile", "tablet"
- `browser` (string, optional) - Browser name
- `os` (string, optional) - Operating system
- `customDomain` (boolean, default: false) - Whether accessed via custom domain

**Indexes:**
- `shortlinkId_idx` - For filtering by shortlink
- `timestamp_idx` (DESC) - For time-based queries
- `country_idx` - For geographic filtering

#### 3. `shortlink_domains` Collection
Stores custom domain configurations.

**Columns:**
- `domain` (string, required) - Domain name (e.g., "link.parvej.me")
- `isVerified` (boolean, default: false) - DNS verification status
- `verificationToken` (string, required) - Token for TXT record verification
- `dnsRecords` (string, optional) - Required DNS records (JSON)
- `lastVerifiedAt` (datetime, optional) - Last successful verification
- `isActive` (boolean, default: true) - Whether domain is active
- `createdAt` (datetime, required) - Creation timestamp
- `updatedBy` (string, required) - Admin user ID

**Indexes:**
- `domain_idx` (unique) - For fast domain lookups
- `isVerified_idx` - For filtering verified domains

### Storage Bucket

You'll need to create a storage bucket for preview images:

1. Go to Appwrite Console → Storage
2. Create a new bucket named `shortlink-previews`
3. Set permissions to allow admin read/write
4. Configure max file size: 5MB
5. Allowed file extensions: jpg, jpeg, png, webp, gif

## Environment Variables

Add these to your `.env` file (if not already present):

```env
VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=portfolioreact
VITE_APPWRITE_DATABASE_ID=portfolio_db
VITE_APPWRITE_STORAGE_ID=reactbucket
VITE_SHORTLINK_BUCKET_ID=shortlink-previews
```

## Custom Domain Setup

### Step 1: Add Domain in Admin Dashboard

1. Navigate to Admin → Shortlinks → Domains
2. Click "Add Domain"
3. Enter your subdomain (e.g., `link.parvej.me`)
4. Copy the verification token shown

### Step 2: Configure DNS in Cloudflare

Add the following DNS records in your Cloudflare dashboard:

#### A Record (Recommended)
```
Type: A
Name: link (or your subdomain)
Content: [Your server IP]
Proxy status: Proxied (orange cloud)
TTL: Auto
```

#### CNAME Record (Alternative)
```
Type: CNAME
Name: link (or your subdomain)
Content: yourdomain.com
Proxy status: Proxied (orange cloud)
TTL: Auto
```

#### TXT Record (For Verification)
```
Type: TXT
Name: _shortlink-verify.link
Content: [Your verification token]
TTL: Auto
```

### Step 3: Verify Domain

1. Wait 5-10 minutes for DNS propagation
2. Click "Verify DNS" in the admin dashboard
3. Check the status - it should show "Verified" with a green badge
4. If verification fails, check the DNS instructions shown

### Step 4: Use Custom Domain

Once verified, you can select the custom domain when creating new shortlinks.

## Usage Guide

### Creating a Shortlink

1. Navigate to Admin → Shortlinks
2. Click "Create Shortlink"
3. Enter the destination URL (long URL)
4. Choose one of:
   - **Auto-generate**: System creates a random short path
   - **Custom path**: Enter your own path (3-50 characters, alphanumeric, hyphens, underscores)
5. Select domain (main domain or custom domain)
6. (Optional) Upload a preview image for social media
7. (Optional) Add Open Graph title and description
8. Click "Create"

The system will check for collisions with existing routes (blogs, projects, certificates) and warn you if there's a conflict.

### Managing Shortlinks

- **View all links**: See list with click counts and status
- **Search**: Filter by path or destination URL
- **Edit**: Update destination URL, path, or preview image
- **Delete**: Remove shortlink (with confirmation)
- **Copy**: Click copy icon to copy short URL to clipboard
- **View analytics**: Click analytics icon to see detailed stats

### Viewing Analytics

Click on any shortlink to view:

- **Total clicks** with trend indicator
- **Click trends** over time (chart)
- **Geographic distribution** by country
- **Top referrers** (where clicks came from)
- **Device breakdown** (desktop, mobile, tablet)
- **Browser and OS** statistics

Export analytics to CSV for further analysis.

## Testing

### Test Shortlink Creation

1. Create a shortlink with path `test-link`
2. Visit `yourdomain.com/test-link`
3. Should redirect to destination URL
4. Check analytics to see the click recorded

### Test Preview Images

1. Create a shortlink with a preview image
2. Share the short URL in WhatsApp or Messenger
3. Preview should show your uploaded image

### Test Custom Domain

1. Add and verify a custom domain
2. Create a shortlink using that domain
3. Visit `link.parvej.me/your-path`
4. Should redirect correctly

## Troubleshooting

### Shortlink Not Redirecting

- Check if shortlink is marked as "Active"
- Verify the path doesn't have typos
- Clear browser cache and try again

### Preview Image Not Showing

- Ensure image is under 5MB
- Check file format (jpg, png, webp, gif)
- Verify storage bucket permissions
- Test with Open Graph debugger tools

### Custom Domain Not Verifying

- Wait 10-15 minutes for DNS propagation
- Check DNS records in Cloudflare
- Ensure TXT record name includes subdomain
- Try manual verification again

### Collision Detected

- The path conflicts with an existing route
- Try a different custom path
- Check which resource is conflicting (shown in warning)

## API Integration (Optional)

If you want to create shortlinks programmatically, you can use the Appwrite SDK:

```javascript
import { databases, ID } from './appwrite';

const createShortlink = async (customPath, destinationUrl) => {
  return await databases.createDocument(
    'portfolio_db',
    'shortlinks',
    ID.unique(),
    {
      customPath: customPath.toLowerCase(),
      destinationUrl,
      isActive: true,
      clickCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin-user-id'
    }
  );
};
```

## Security Notes

- IP addresses are hashed before storage for privacy
- Only admin users can create/manage shortlinks
- Preview images are validated for type and size
- Custom paths are sanitized to prevent injection
- DNS verification required for custom domains

## Next Steps

1. ✅ Database collections created
2. ⏳ Create storage bucket for preview images
3. ⏳ Implement collision detection service
4. ⏳ Build admin UI components
5. ⏳ Implement redirect handler
6. ⏳ Add analytics tracking
7. ⏳ Test with real URLs and domains

## Support

For issues or questions:
- Check the troubleshooting section above
- Review Appwrite console for errors
- Check browser console for client-side errors
- Verify all environment variables are set correctly
