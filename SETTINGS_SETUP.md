# Site Settings Setup Guide

## Database Collection Setup

To use the Settings page, you need to create a database collection in Appwrite:

### 1. Create Database Collection

1. Go to **Appwrite Console** → **Databases** → Select your database
2. Click **"Create Collection"**
3. Collection ID: `site_settings`
4. Name: `Site Settings`
5. Add the following attributes:
   - `siteTitle` (String, size: 200, required: false)
   - `faviconUrl` (String, size: 500, required: false)

### 2. Set Permissions

1. Go to **Settings** → **Permissions**
2. Add permissions:
   - **Read**: `any` (for public access to read site settings)
   - **Write**: `users` (for admin panel access)

### 3. Storage Bucket

The favicon will be uploaded to the same storage bucket used for logos:
- Bucket ID: `reactbucket` (or whatever is set in `VITE_APPWRITE_STORAGE_ID`)
- Make sure the bucket has:
  - **Read**: `any` (for public access to view favicon)
  - **Write**: `users` (for admin panel uploads)
  - File size limit: 2MB
  - Allowed file extensions: `png`, `jpg`, `jpeg`, `svg`, `ico`, `webp`

## Usage

1. Navigate to `/admin/settings` in the admin panel
2. Enter your site title (will appear in browser tab)
3. Upload a favicon image (recommended: 32x32px or 16x16px)
4. Click "Save Settings"
5. The site title and favicon will be applied immediately to the portfolio site

## Notes

- The favicon is stored in Appwrite Storage
- The site title and favicon URL are stored in the `site_settings` collection
- Changes take effect immediately after saving
- The portfolio site automatically loads these settings on page load


