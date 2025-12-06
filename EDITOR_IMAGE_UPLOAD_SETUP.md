# Rich Text Editor - Image Upload Setup Guide

## Overview
The Rich Text Editor now supports two methods for inserting images:
1. **URL Input**: Paste an image URL from the internet
2. **Direct Upload**: Upload images directly from your computer to Appwrite Storage

## Appwrite Storage Setup

### Step 1: Create Storage Bucket

1. **Go to Appwrite Console**
   - Navigate to your project
   - Click on **Storage** in the left sidebar

2. **Create New Bucket**
   - Click **"Create Bucket"** button
   - Enter the following details:
     - **Bucket ID**: `editor-images`
     - **Bucket Name**: `Editor Images` (or any name you prefer)
     - **Maximum File Size**: `10485760` (10 MB in bytes)
     - **Allowed File Extensions**: Leave empty or add: `jpg, jpeg, png, gif, webp, svg`
     - **Compression**: `none` (or choose based on your needs)
     - **Encryption**: Enable if needed
     - **Antivirus**: Enable if available

3. **Click "Create"**

### Step 2: Configure Bucket Permissions

After creating the bucket, you need to set permissions:

1. **Click on the `editor-images` bucket**
2. **Go to Settings tab**
3. **Scroll to Permissions section**
4. **Add the following permissions**:

   **For File Creation (Upload):**
   - Click **"Add Role"**
   - Select **"Users"** (authenticated users can upload)
   - Check **"Create"** permission
   - Click **"Add"**

   **For File Reading (View):**
   - Click **"Add Role"**
   - Select **"Any"** (anyone can view images)
   - Check **"Read"** permission
   - Click **"Add"**

   **Alternative (More Permissive):**
   If you want anyone to upload (not recommended for production):
   - Role: **"Any"**
   - Permissions: **"Create"** and **"Read"**

### Step 3: Verify Bucket Settings

Your bucket should have these settings:
```
Bucket ID: editor-images
Permissions:
  - Role: Users → Create ✓
  - Role: Any → Read ✓
Max File Size: 10 MB
File Extensions: jpg, jpeg, png, gif, webp, svg (or empty for all)
```

## Environment Variables

Make sure your `.env` file has the Appwrite configuration:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
```

No additional environment variables are needed for the storage bucket since we're using the hardcoded bucket ID `editor-images`.

## How It Works

### URL Mode
1. User clicks the Image button in the editor
2. Selects "URL" tab
3. Pastes an image URL
4. Clicks "Insert"
5. Image is inserted at cursor position

### Upload Mode
1. User clicks the Image button in the editor
2. Selects "Upload" tab
3. Clicks "Choose File" and selects an image
4. Clicks "Insert"
5. Image is uploaded to Appwrite Storage bucket `editor-images`
6. A unique file ID is generated
7. The file URL is retrieved from Appwrite
8. Image is inserted at cursor position with the Appwrite URL

## File Upload Details

- **Bucket ID**: `editor-images`
- **File ID**: Auto-generated using `ID.unique()`
- **Permissions**: Set to allow public read access
- **Max Size**: 10 MB (configurable in bucket settings)
- **Supported Formats**: All image formats (jpg, png, gif, webp, svg, etc.)

## Security Considerations

### Recommended Permissions for Production:

1. **Create Permission**: Only authenticated users
   - Prevents anonymous users from uploading
   - Reduces spam and abuse

2. **Read Permission**: Public (Any)
   - Allows images to be displayed on your website
   - Necessary for public-facing content

3. **Update/Delete Permissions**: Admin only
   - Prevents users from modifying or deleting images
   - Add specific user roles if needed

### Additional Security Measures:

1. **File Size Limits**: Set in bucket settings (default 10 MB)
2. **File Type Validation**: Restrict to image formats only
3. **Antivirus Scanning**: Enable if available in your Appwrite plan
4. **Rate Limiting**: Configure in Appwrite project settings
5. **Content Moderation**: Implement manual review for uploaded images

## Troubleshooting

### Issue: "Failed to upload image"

**Possible Causes:**
1. Bucket doesn't exist
2. Incorrect bucket ID (should be `editor-images`)
3. Missing permissions
4. File size exceeds limit
5. Network issues

**Solutions:**
1. Verify bucket exists in Appwrite Console
2. Check bucket ID matches `editor-images`
3. Add Create permission for Users role
4. Reduce image size or increase bucket limit
5. Check browser console for detailed error messages

### Issue: "Image uploaded but not displaying"

**Possible Causes:**
1. Missing Read permission
2. CORS issues
3. Incorrect file URL

**Solutions:**
1. Add Read permission for Any role
2. Add your domain to Appwrite Web Platform settings
3. Check browser console for 403/404 errors

### Issue: "Permission denied"

**Solution:**
- Ensure user is authenticated (logged in)
- Add Create permission for Users role in bucket settings
- Or change to Any role for testing (not recommended for production)

## Testing the Feature

1. **Open the Project Management page**
2. **Create or edit a project**
3. **In the Rich Text Editor**:
   - Click the Image button (camera icon)
   - Try URL mode: Paste an image URL and insert
   - Try Upload mode: Select a file from your computer and insert
4. **Verify**:
   - Image appears in the editor
   - Image is resizable
   - Image can be deleted
   - Image persists after saving

## Bucket Management

### Viewing Uploaded Files
1. Go to Appwrite Console → Storage
2. Click on `editor-images` bucket
3. View all uploaded files with details

### Deleting Files
- Files are NOT automatically deleted when removed from the editor
- Manual cleanup may be needed periodically
- Consider implementing a cleanup script for unused images

### Storage Limits
- Check your Appwrite plan for storage limits
- Monitor bucket size in Appwrite Console
- Implement image optimization if needed

## Future Enhancements

Potential improvements:
- Image compression before upload
- Automatic image optimization
- Image cropping/editing before insert
- Drag-and-drop file upload
- Paste image from clipboard
- Progress bar for large uploads
- Automatic cleanup of unused images
- Image gallery/library for reusing images
- CDN integration for faster loading
