# Appwrite Photo Grid Bucket Setup Guide

## Required Bucket

The photo grid feature requires a storage bucket in Appwrite to store uploaded images.

---

## Bucket Configuration

### Bucket ID
```
photo_grid_images
```

**Important**: The bucket ID must be exactly `photo_grid_images` as it's hardcoded in the PhotoGridInput component.

---

## Setup Steps

### 1. Login to Appwrite Console
- Go to your Appwrite console
- Navigate to your project

### 2. Create Storage Bucket
1. Click on **Storage** in the left sidebar
2. Click **Create Bucket** button
3. Enter the following details:

**Bucket Configuration**:
- **Bucket ID**: `photo_grid_images`
- **Bucket Name**: Photo Grid Images (or any name you prefer)
- **Permissions**: Configure based on your needs (see below)
- **File Size Limit**: 10MB (recommended)
- **Allowed File Extensions**: jpg, jpeg, png, gif, webp
- **Compression**: Optional (recommended for better performance)
- **Encryption**: Optional (recommended for security)

### 3. Set Permissions

**Recommended Permissions**:

**For Authenticated Users**:
- ✅ Create (allow users to upload)
- ✅ Read (allow users to view)
- ✅ Update (allow users to modify)
- ✅ Delete (allow users to delete)

**Permission Settings**:
```
Role: Users (authenticated)
Permissions: Create, Read, Update, Delete
```

**Or for Admin Only**:
```
Role: Team (admin team)
Permissions: Create, Read, Update, Delete
```

### 4. Configure File Settings

**Maximum File Size**: 
- Recommended: 10MB
- Adjust based on your needs

**Allowed Extensions**:
```
jpg, jpeg, png, gif, webp, svg
```

**Enable Compression**: ✅ (Recommended)
- Reduces storage usage
- Faster loading times

---

## Code Reference

The bucket ID is defined in `PhotoGridInput.jsx`:

```javascript
const STORAGE_BUCKET_ID = 'photo_grid_images';
```

If you want to use a different bucket ID, update this constant.

---

## Testing the Bucket

### 1. Test Upload
1. Go to your admin panel
2. Open Rich Text Editor
3. Click the Grid icon
4. Select a layout
5. Try uploading an image
6. Check if it appears in Appwrite Storage

### 2. Verify in Appwrite
1. Go to Storage in Appwrite Console
2. Click on `photo_grid_images` bucket
3. You should see uploaded files

---

## Troubleshooting

### Error: "Bucket not found"
**Solution**: Create the bucket with ID `photo_grid_images`

### Error: "Permission denied"
**Solution**: Check bucket permissions, ensure users have Create permission

### Error: "File too large"
**Solution**: Increase maximum file size in bucket settings

### Error: "File type not allowed"
**Solution**: Add the file extension to allowed extensions list

---

## Security Recommendations

### 1. File Validation
- ✅ Already implemented: File type checking
- ✅ Already implemented: Size limits

### 2. Permissions
- Use role-based permissions
- Don't allow anonymous uploads
- Restrict to authenticated users or admin only

### 3. File Scanning
- Consider enabling antivirus scanning (if available)
- Monitor for suspicious uploads

---

## Storage Management

### Cleanup Strategy
- Regularly review unused images
- Delete orphaned files (images not used in any grid)
- Set up automatic cleanup scripts if needed

### Backup
- Enable Appwrite backups
- Export important images periodically
- Keep backup of bucket configuration

---

## Alternative: Use Existing Bucket

If you want to use an existing bucket instead:

1. Open `src/pages/Admin/ProjectManagement/PhotoGridInput.jsx`
2. Find line 5:
   ```javascript
   const STORAGE_BUCKET_ID = 'photo_grid_images';
   ```
3. Change to your bucket ID:
   ```javascript
   const STORAGE_BUCKET_ID = 'your_existing_bucket_id';
   ```

---

## Quick Setup Checklist

- [ ] Login to Appwrite Console
- [ ] Navigate to Storage
- [ ] Click "Create Bucket"
- [ ] Set Bucket ID: `photo_grid_images`
- [ ] Set Name: "Photo Grid Images"
- [ ] Configure permissions (Users/Admin)
- [ ] Set max file size: 10MB
- [ ] Add allowed extensions: jpg, jpeg, png, gif, webp
- [ ] Enable compression (optional)
- [ ] Save bucket
- [ ] Test upload from admin panel

---

## Summary

**Required**:
- Bucket ID: `photo_grid_images`
- Permissions: Create, Read, Update, Delete
- Max Size: 10MB (recommended)
- Extensions: jpg, jpeg, png, gif, webp

**Optional but Recommended**:
- Compression enabled
- Encryption enabled
- Antivirus scanning

Once the bucket is created, the photo grid feature will work seamlessly!
