# Quick Appwrite Setup for Projects

## ⚡ Fast Setup (5 Minutes)

### Step 1: Create Storage Bucket (REQUIRED)

1. Go to Appwrite Console: https://cloud.appwrite.io
2. Select your project
3. Click **Storage** in left sidebar
4. Click **"Create Bucket"** button
5. Fill in:
   - **Bucket ID**: `project_images` (exactly this!)
   - **Name**: Project Images
   - **Permissions**:
     - Click "Add Role"
     - Select "Any" 
     - Check "Read" permission
     - Click "Add"
6. Click **"Create"**
7. Go to bucket **Settings** tab
8. Under **File Security**:
   - Maximum File Size: `10485760` (10 MB)
   - Allowed File Extensions: `jpg,jpeg,png,webp,gif`
9. Click **"Update"**

### Step 2: Create Database Collection

1. Click **Databases** in left sidebar
2. Select your database (or create one named `portfolio_db`)
3. Click **"Create Collection"**
4. Fill in:
   - **Collection ID**: `projects` (exactly this!)
   - **Name**: Projects
5. Click **"Create"**

### Step 3: Add Collection Attributes

Click **"Create Attribute"** for each:

1. **title**
   - Type: String
   - Size: 255
   - Required: ✅

2. **category**
   - Type: String
   - Size: 50
   - Required: ✅

3. **description**
   - Type: String
   - Size: 500
   - Required: ✅

4. **thumbnailUrl**
   - Type: String
   - Size: 2000
   - Required: ✅

5. **galleryUrls**
   - Type: String
   - Size: 2000
   - Array: ✅ (Check this!)
   - Required: ❌

6. **likes**
   - Type: Integer
   - Min: 0
   - Max: 999999
   - Required: ❌
   - Default: 0

7. **featured**
   - Type: Boolean
   - Required: ❌
   - Default: false

8. **software**
   - Type: String
   - Size: 100
   - Required: ❌

9. **timeframe**
   - Type: String
   - Size: 100
   - Required: ❌

10. **dataSource**
    - Type: String
    - Size: 100
    - Required: ❌

11. **studyArea**
    - Type: String
    - Size: 100
    - Required: ❌

12. **projectLink**
    - Type: String
    - Size: 500
    - Required: ❌

13. **fullDescription**
    - Type: String
    - Size: 50000
    - Required: ✅

### Step 4: Set Collection Permissions

1. Go to collection **Settings** tab
2. Under **Permissions**:
   - Click "Add Role"
   - Select "Any"
   - Check "Read"
   - Click "Add"
   
3. For Create/Update/Delete:
   - Click "Add Role"
   - Select "Users"
   - Check "Create", "Update", "Delete"
   - Click "Add"

### Step 5: Verify Environment Variables

Check your `.env` file has:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=portfolio_db
```

**Get your Project ID:**
1. Go to Appwrite Console
2. Click on your project name at top
3. Go to **Settings**
4. Copy **Project ID**

### Step 6: Test Upload

1. Restart your dev server: `npm run dev`
2. Go to: `http://localhost:5173/admin/projects`
3. Click "Add Project"
4. Try uploading an image
5. Should work now! ✅

---

## 🐛 Troubleshooting

### "Failed to upload thumbnail"

**Cause**: Bucket doesn't exist or wrong ID

**Fix**:
1. Check bucket ID is exactly `project_images`
2. Check bucket has "Any" read permission
3. Check file size is under 10 MB
4. Check file extension is allowed (jpg, png, etc.)

### "Collection not found"

**Cause**: Collection doesn't exist or wrong ID

**Fix**:
1. Check collection ID is exactly `projects`
2. Check it's in the correct database
3. Check all 13 attributes are created

### "Permission denied"

**Cause**: Missing permissions

**Fix**:
1. Collection: Add "Any" read permission
2. Collection: Add "Users" create/update/delete permissions
3. Bucket: Add "Any" read permission
4. Make sure you're logged in to admin panel

### Images not displaying

**Cause**: Bucket read permission missing

**Fix**:
1. Go to bucket settings
2. Add "Any" role with "Read" permission
3. Refresh page

---

## ✅ Quick Checklist

- [ ] Created `project_images` bucket
- [ ] Set bucket max file size to 10 MB
- [ ] Set allowed extensions: jpg,jpeg,png,webp,gif
- [ ] Added "Any" read permission to bucket
- [ ] Created `projects` collection
- [ ] Added all 13 attributes
- [ ] Added "Any" read permission to collection
- [ ] Added "Users" create/update/delete to collection
- [ ] Updated `.env` with correct IDs
- [ ] Restarted dev server
- [ ] Tested image upload

---

## 🎉 Done!

Once all checkboxes are checked, you can:
- Upload project images ✅
- Create projects ✅
- View projects on homepage ✅
- View projects on projects page ✅

Need more help? Check `PROJECT_APPWRITE_SETUP_GUIDE.md` for detailed instructions.
