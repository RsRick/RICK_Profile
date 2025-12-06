# Quick Setup: Image Upload in Rich Text Editor

## ✅ Setup Checklist

### 1. Create Appwrite Storage Bucket (5 minutes)

1. Open **Appwrite Console** → **Storage**
2. Click **"Create Bucket"**
3. Fill in:
   ```
   Bucket ID: editor-images
   Bucket Name: Editor Images
   Max File Size: 10485760 (10 MB)
   File Extensions: (leave empty or add: jpg, jpeg, png, gif, webp, svg)
   ```
4. Click **"Create"**

### 2. Set Bucket Permissions (2 minutes)

1. Click on **`editor-images`** bucket
2. Go to **Settings** tab
3. Scroll to **Permissions**
4. Add two permissions:

   **Permission 1 - Upload:**
   ```
   Role: Users
   Permission: Create ✓
   ```

   **Permission 2 - View:**
   ```
   Role: Any
   Permission: Read ✓
   ```

5. Click **"Update"**

### 3. Verify Setup (1 minute)

1. Go to your app
2. Open Project Management
3. Click Image button in editor
4. Try both tabs:
   - ✅ URL: Paste an image URL
   - ✅ Upload: Select a file from computer
5. Verify image appears and is resizable

## 🎯 That's It!

Your Rich Text Editor now supports direct image uploads!

## 📋 Quick Reference

- **Bucket ID**: `editor-images`
- **Max Size**: 10 MB
- **Formats**: All image formats
- **Permissions**: Users can upload, Anyone can view

## ⚠️ Troubleshooting

**Upload fails?**
- Check bucket ID is exactly `editor-images`
- Verify Users have Create permission
- Check file size is under 10 MB

**Image doesn't display?**
- Verify Any role has Read permission
- Check browser console for errors
- Ensure you're logged in (for upload)

## 📚 Full Documentation

See `EDITOR_IMAGE_UPLOAD_SETUP.md` for detailed setup and security considerations.
