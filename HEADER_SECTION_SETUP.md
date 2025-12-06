# Header Section Setup Guide

## Database Collection Setup

To use the Header Section admin page, you need to create a database collection in Appwrite:

### 1. Create Database Collection

1. Go to **Appwrite Console** → **Databases** → Select your database
2. Click **"Create Collection"**
3. Collection ID: `header_section`
4. Name: `Header Section`
5. Add the following attributes:
   - `heroName` (String, size: 200, required: false)
   - `roles` (String, size: 5000, required: false) - JSON array of role objects
   - `description` (String, size: 2000, required: false)
   - `photoUrl` (String, size: 500, required: false)
   - `yearsExperience` (String, size: 200, required: false) - JSON object with `number` and `text`
   - `projectsCompleted` (String, size: 200, required: false) - JSON object with `number` and `text`
   - `socialLinks` (String, size: 5000, required: false) - JSON array of social link objects

### 2. Set Permissions

1. Go to **Settings** → **Permissions**
2. Add permissions:
   - **Read**: `any` (for public access to read header settings)
   - **Write**: `users` (for admin panel access)

### 3. Storage Bucket

The professional photo will be uploaded to the same storage bucket used for logos:
- Bucket ID: `reactbucket` (or whatever is set in `VITE_APPWRITE_STORAGE_ID`)
- Make sure the bucket has:
  - **Read**: `any` (for public access to view photos)
  - **Write**: `users` (for admin panel uploads)
  - File size limit: 5MB
  - Allowed file extensions: `png`, `jpg`, `jpeg`, `webp`

## Professional Photo Size Guide

**Recommended dimensions:**
- **Optimal**: 800x960px (5:6 aspect ratio)
- **Alternative**: 600x720px (same aspect ratio)
- **Maximum file size**: 5MB
- **Formats**: PNG, JPG, JPEG, WebP

The photo will be displayed in a container that's approximately 320px wide and 384px tall (w-80 h-96 in Tailwind), so a 5:6 aspect ratio works best.

## Available Social Icons

You can select from these icon types:
- GitHub
- LinkedIn
- Mail
- MapPin
- Code
- Twitter
- Facebook
- Instagram
- Youtube
- Globe
- ExternalLink

## Performance Impact

**Will this make the site slower?**

**Short answer: No, it won't significantly impact performance.**

Here's why:

1. **Single Database Query**: The Hero component loads all header data in one database query when the page loads, not multiple queries.

2. **Caching**: Modern browsers cache API responses, so subsequent page loads will be faster.

3. **Lazy Loading**: Images are loaded only when needed, and Appwrite CDN serves them efficiently.

4. **Optimized Data Structure**: All data is stored as JSON strings in the database, which is efficient to parse.

5. **No Real-Time Updates**: The data is loaded once on page load, not continuously polled.

6. **Small Data Size**: The header section data is relatively small (text + one image URL), so it loads quickly.

**Performance Tips:**
- Keep the professional photo under 5MB (recommended: 200-500KB for web)
- Optimize images before uploading (use tools like TinyPNG or ImageOptim)
- The site will load at the same speed as before, with just one additional API call on initial load

## Usage

1. Navigate to `/admin/header-section` in the admin panel
2. Edit any field you want to change
3. Upload your professional photo (follow size guidelines above)
4. Add/reorder roles, social links, etc.
5. Click "Save Settings"
6. Refresh the portfolio page to see changes


