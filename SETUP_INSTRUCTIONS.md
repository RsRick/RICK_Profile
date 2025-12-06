# Appwrite Setup Instructions

## Quick Setup (Recommended)

Since you have Appwrite MCP server configured, you can run the automated setup script:

```bash
npm run setup:appwrite
```

This script will:
1. Read your `.env` file (or environment variables)
2. Use your Appwrite API key to create:
   - Database collection `menubar_settings`
   - Storage bucket `logos` (if not configured)
   - All required attributes and permissions

## Manual Setup

If the script doesn't work, you can create resources manually:

### 1. Create Database Collection

1. Go to Appwrite Console → Databases
2. Select your database
3. Create collection: `menubar_settings`
4. Add attributes:
   - `menuItems` (String, size: 10000)
   - `logoUrl` (String, size: 500)
   - `cvButton` (String, size: 500)
5. Set permissions:
   - Read: `any`
   - Write: `users`

### 2. Create Storage Bucket

1. Go to Appwrite Console → Storage
2. Create bucket: `logos` (or use existing)
3. Set permissions:
   - Read: `any`
   - Write: `users`
4. File size limit: 2MB
5. Allowed extensions: png, jpg, jpeg, svg, webp

## Environment Variables

Make sure your `.env` file has:

```env
VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=portfolioreact
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_STORAGE_ID=your_storage_bucket_id (optional)
APPWRITE_API_KEY=your_api_key
```

Note: The API key from your MCP config can be used in the setup script.




