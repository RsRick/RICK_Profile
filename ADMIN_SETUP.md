# Admin Panel Setup Guide

## Authentication Setup (Required First!)

Before accessing the admin panel, you need to create an admin user in Appwrite:

### Create Admin User

1. Go to **Appwrite Console** → **Auth** → **Users**
2. Click **"Create User"**
3. Fill in:
   - **Email**: Your admin email (e.g., `admin@yourdomain.com`)
   - **Password**: Set a strong password
   - **Name**: Admin Name (optional)
4. Click **"Create"**

See `CREATE_ADMIN_USER.md` for detailed instructions.

### Login to Admin Panel

1. Navigate to: `http://localhost:5173/admin/login`
2. Enter your email and password
3. You'll be redirected to the admin dashboard

## Resource Setup

**Note:** The client SDK cannot create collections/buckets directly. You'll need to create them manually in the Appwrite Console.

## Manual Setup (Recommended)

### 1. Create Database Collection

1. Go to your Appwrite Console → Databases → Select your database (`portfolioreact`)
2. Click "Create Collection"
3. Collection ID: `menubar_settings`
4. Name: `Menubar Settings`
5. Add the following attributes:
   - `menuItems` (String, size: 10000, required: false)
   - `logoUrl` (String, size: 500, required: false)
   - `cvButton` (String, size: 500, required: false)

6. Set permissions:
   - **Read**: `any` (for public access to read menu settings)
   - **Write**: `users` (for admin panel access)

### 2. Create/Verify Storage Bucket

1. Go to Appwrite Console → Storage
2. Check if bucket `reactbucket` exists (from your .env)
3. If not, create a new bucket:
   - Bucket ID: `reactbucket` (or `logos`)
   - Name: `Logos`
4. Set permissions:
   - **Read**: `any` (for public access to view logos)
   - **Write**: `users` (for admin panel uploads)
5. File size limit: 2MB
6. Allowed file extensions: `png`, `jpg`, `jpeg`, `svg`, `webp`

### 3. Environment Variables

Make sure your `.env` file includes:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_STORAGE_ID=your_storage_bucket_id
```

### 4. Update Collection ID in Code

The admin panel uses the collection ID `menubar_settings`. Make sure this matches your Appwrite collection name.

## Admin Panel Features

### Menubar Management (`/admin/menubar`)

1. **Logo Upload**
   - Recommended size: 40x40px to 80x80px (Square)
   - Formats: PNG, JPG, SVG
   - Max size: 2MB
   - Logo is saved to Appwrite Storage

2. **Menu Items Management**
   - Edit menu item names
   - Edit menu item links (e.g., #home, #about)
   - Reorder items using up/down arrows
   - Toggle visibility on/off for each item

3. **CV Button Settings**
   - Edit button text
   - Edit button link (opens in new tab)

### Accessing Admin Panel

1. **First time**: Navigate to `http://localhost:5173/admin/login`
2. **After login**: You'll be redirected to `/admin`
3. **Protected routes**: All admin routes require authentication
4. **Logout**: Click the logout button in the sidebar

## Data Structure

The menubar settings are stored as a single document in the `menubar_settings` collection:

```json
{
  "menuItems": "[{\"id\":\"1\",\"name\":\"Home\",\"href\":\"#home\",\"enabled\":true,\"order\":0},...]",
  "logoUrl": "https://...",
  "cvButton": "{\"text\":\"Get My CV\",\"link\":\"https://...\"}"
}
```

## Notes

- The Header component automatically loads settings from Appwrite on page load
- Changes in the admin panel are saved immediately to Appwrite
- The logo URL is stored permanently in Appwrite Storage
- Menu items are filtered to show only enabled items on the frontend

