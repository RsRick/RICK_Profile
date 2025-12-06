# Font Management System - Quick Start Checklist

## ⚡ 5-Minute Setup

Follow these steps to get the font management system working:

### Step 1: Create Appwrite Collection (2 minutes)

1. Go to your Appwrite Console
2. Navigate to your database
3. Click "Add Collection"
4. **Collection ID:** `custom_fonts`
5. Add these attributes:

| Attribute | Type | Size | Required |
|-----------|------|------|----------|
| fontName | String | 255 | Yes |
| fileName | String | 255 | Yes |
| fileUrl | String | 2000 | Yes |
| fileId | String | 255 | Yes |
| fileSize | Integer | - | Yes |
| uploadedAt | String | 255 | Yes |

6. Set permissions:
   - Read: `Any`
   - Create/Update/Delete: `Users` (or your admin role)

### Step 2: Create Storage Bucket (1 minute)

1. Go to Storage in Appwrite Console
2. Click "Add Bucket"
3. **Bucket ID:** `custom-fonts`
4. **Max File Size:** 5MB
5. **Allowed Extensions:** `ttf`
6. Set permissions:
   - Read: `Any`
   - Create/Update/Delete: `Users`

### Step 3: Update Existing Collections (2 minutes)

#### Update `header_section` collection:
Add these attributes (all String, 500 chars, Optional):
- `heroNameFont` (default: `'Playfair Display', serif'`)
- `rolesFont` (default: `'Poppins', sans-serif'`)
- `descriptionFont` (default: `'Open Sans', sans-serif'`)

#### Update `about_me` collection:
Verify this attribute exists (String, 500 chars, Optional):
- `nameFont` (default: `'Playfair Display', serif'`)

### Step 4: Test It! (30 seconds)

1. Login to admin panel
2. Go to Settings → Font Management
3. Try uploading a font or selecting a Google Font
4. Edit Header Section or About Me
5. Select a font from the dropdown
6. Save and view on the public site

## ✅ Verification Checklist

- [ ] `custom_fonts` collection created
- [ ] `custom-fonts` bucket created
- [ ] Font fields added to `header_section`
- [ ] Font field verified in `about_me`
- [ ] Can access `/admin/font-management`
- [ ] Can see font selector in admin forms
- [ ] Can upload a .ttf font
- [ ] Can select Google Fonts
- [ ] Fonts save and persist
- [ ] Fonts display on public site

## 🎯 Quick Test

**Test with this Bangla font:**
1. Download "Noto Sans Bengali" from Google Fonts (as .ttf)
2. Upload it via Font Management
3. Use it in About Me section
4. Type: আমি বাংলায় গান গাই
5. Save and verify it displays correctly

## 🚨 Troubleshooting

**Can't upload fonts?**
- Check bucket ID is exactly `custom-fonts`
- Verify bucket permissions allow Create
- Ensure file is .ttf format and under 5MB

**Fonts not showing in selector?**
- Check collection ID is exactly `custom_fonts`
- Verify collection permissions allow Read
- Check browser console for errors

**Fonts not displaying on site?**
- Verify font URL is accessible
- Check browser console for 404 errors
- Ensure bucket has Read permission for `Any`

## 📚 Full Documentation

- **Setup Guide:** `FONT_MANAGEMENT_SETUP.md`
- **Developer Guide:** `ADDING_FONT_SELECTORS_GUIDE.md`
- **Implementation Details:** `FONT_SYSTEM_IMPLEMENTATION_SUMMARY.md`

## 🎉 You're Done!

Your font management system is now ready. You can:
- ✅ Select from 35+ Google Fonts
- ✅ Upload custom .ttf fonts
- ✅ Use fonts in all admin forms
- ✅ Support Bangla and English text
- ✅ Manage fonts from one place

Enjoy your new font system! 🎨
