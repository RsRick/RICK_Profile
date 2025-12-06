# How to Create Admin User in Appwrite

## Step 1: Create User in Appwrite Console

1. Go to your Appwrite Console: https://cloud.appwrite.io
2. Navigate to **Auth** → **Users**
3. Click **"Create User"**
4. Fill in the form:
   - **User ID**: Leave empty (auto-generated) or set custom
   - **Email**: Your admin email (e.g., `admin@yourdomain.com`)
   - **Password**: Set a strong password
   - **Name**: Admin Name (optional)
5. Click **"Create"**

## Step 2: Set User as Admin (Optional)

To give the user admin privileges:

1. Go to **Auth** → **Users**
2. Click on the user you created
3. Go to **Labels** tab
4. Add label: `admin` or `super-admin`
5. Save

## Step 3: Configure Permissions

### For Database Collection (`menubar_settings`):

1. Go to **Databases** → Select your database → `menubar_settings` collection
2. Go to **Settings** → **Permissions**
3. Add permission:
   - **Role**: Select your user or use `users` role
   - **Access**: **Write** (for admin panel access)
4. Keep **Read** permission as `any` (for public access)

### For Storage Bucket (`reactbucket`):

1. Go to **Storage** → Select `reactbucket`
2. Go to **Settings** → **Permissions**
3. Add permission:
   - **Role**: Select your user or use `users` role
   - **Access**: **Write** (for logo uploads)
4. Keep **Read** permission as `any` (for public access)

## Step 4: Login to Admin Panel

1. Navigate to: `http://localhost:5173/admin/login`
2. Enter your email and password
3. Click **Sign In**

## Alternative: Create User Programmatically

You can also create a user using Appwrite Functions or the Server SDK, but the Console method above is the easiest.

## Notes

- The admin panel uses Appwrite's built-in authentication
- Users need to have **Write** permissions on the collection and bucket
- The `users` role automatically applies to all authenticated users
- You can create multiple admin users with the same process




