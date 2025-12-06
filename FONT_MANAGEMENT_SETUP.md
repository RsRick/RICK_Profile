# Font Management System Setup Guide

This guide will help you set up the font management system for your portfolio site.

## Features Implemented

✅ **Font Selector Component** - Reusable component for all admin forms
✅ **Google Fonts Integration** - 35+ curated fonts with Bangla support
✅ **Custom Font Upload** - Upload .ttf files with Bangla + English support
✅ **Font Management Page** - Manage all fonts from admin settings
✅ **Visual Distinction** - Custom fonts shown with purple badges
✅ **Applied to All Fields** - Hero name, roles, description, about me name, etc.

## Appwrite Setup Required

### 1. Create Custom Fonts Collection

Create a new collection in your Appwrite database:

**Collection Name:** `custom_fonts`
**Collection ID:** `custom_fonts`

**Attributes:**
- `fontName` (String, 255 characters, Required)
- `fileName` (String, 255 characters, Required)
- `fileUrl` (String, 2000 characters, Required)
- `fileId` (String, 255 characters, Required)
- `fileSize` (Integer, Required)
- `uploadedAt` (String, 255 characters, Required)

**Permissions:**
- Read: `Any`
- Create: `Users` (or your admin role)
- Update: `Users` (or your admin role)
- Delete: `Users` (or your admin role)

### 2. Create Custom Fonts Storage Bucket

Create a new storage bucket:

**Bucket Name:** `Custom Fonts`
**Bucket ID:** `custom-fonts`

**Settings:**
- File Size Limit: 5MB
- Allowed File Extensions: `ttf`
- Compression: None (to preserve font quality)
- Encryption: Enabled
- Antivirus: Enabled

**Permissions:**
- Read: `Any` (so fonts can be loaded on the website)
- Create: `Users` (or your admin role)
- Update: `Users` (or your admin role)
- Delete: `Users` (or your admin role)

### 3. Update Existing Collections

Add font fields to existing collections:

#### `header_section` Collection
Add these attributes:
- `heroNameFont` (String, 500 characters, Optional, Default: `'Playfair Display', serif`)
- `rolesFont` (String, 500 characters, Optional, Default: `'Poppins', sans-serif`)
- `descriptionFont` (String, 500 characters, Optional, Default: `'Open Sans', sans-serif`)

#### `about_me` Collection
Already has:
- `nameFont` (String, 500 characters, Optional)

If not present, add it with default: `'Playfair Display', serif`

## How to Use

### For Admins

1. **Access Font Management**
   - Go to Admin Panel → Settings
   - Click on "Font Management" card at the top
   - Or navigate to `/admin/font-management`

2. **Upload Custom Font**
   - Enter a font name (e.g., "Kalpurush", "SolaimanLipi")
   - Choose a .ttf file (max 5MB)
   - Click "Upload Font"
   - Font will appear with a purple "Custom" badge

3. **Use Fonts in Content**
   - When editing any section (Header, About Me, etc.)
   - Look for font selector dropdowns
   - Search or filter fonts by category
   - Custom fonts appear with purple badges
   - Bangla-supported fonts show "বাংলা" badge
   - Preview text updates in real-time

4. **Delete Custom Fonts**
   - Go to Font Management page
   - Click trash icon next to custom font
   - Confirm deletion
   - Font will be removed from storage and database

### Font Categories

- **Serif** - Traditional, elegant fonts (Georgia, Playfair Display, etc.)
- **Sans-serif** - Modern, clean fonts (Roboto, Open Sans, etc.)
- **Display** - Decorative, attention-grabbing fonts (Bebas Neue, Cinzel, etc.)
- **Custom** - Your uploaded fonts

### Bangla Font Support

Fonts with Bangla support are marked with a green "বাংলা" badge:
- Noto Serif Bengali
- Noto Sans Bengali
- Hind Siliguri
- Tiro Bangla
- Mukta
- Baloo Da 2

## Finding Good Bangla Fonts

### Free Bangla Fonts (.ttf)
1. **Noto Fonts** - https://fonts.google.com/noto
2. **Ekushey Fonts** - https://www.omicronlab.com/bangla-fonts.html
3. **SolaimanLipi** - Popular Bangla font
4. **Kalpurush** - Modern Bangla font
5. **Siyam Rupali** - Classic Bangla font

### How to Download and Upload
1. Download the .ttf file from a trusted source
2. Go to Font Management in admin panel
3. Enter the font name
4. Upload the .ttf file
5. Test with both English and Bangla text

## Technical Details

### Files Created
- `src/utils/googleFonts.js` - Google Fonts list and loader
- `src/utils/fontLoader.js` - Custom font loader utilities
- `src/components/FontSelector/FontSelector.jsx` - Font picker component
- `src/pages/Admin/FontManagement/FontManagement.jsx` - Font management page

### Files Modified
- `src/App.jsx` - Added font management route
- `src/pages/Admin/Settings/Settings.jsx` - Added link to font management
- `src/pages/Admin/AboutMe/AboutMe.jsx` - Added font selector
- `src/pages/Admin/HeaderSection/HeaderSection.jsx` - Added font selectors

### How Fonts Load
1. **Google Fonts** - Loaded dynamically via Google Fonts API
2. **Custom Fonts** - Loaded via @font-face from Appwrite storage
3. **Font Caching** - Fonts are cached by browser for performance

## Troubleshooting

### Font Not Displaying
- Check if font file is valid .ttf format
- Ensure font supports the characters you're using
- Check browser console for loading errors
- Verify Appwrite storage bucket permissions

### Upload Fails
- Check file size (must be under 5MB)
- Verify file extension is .ttf
- Check Appwrite storage bucket exists
- Verify admin permissions

### Bangla Text Not Showing
- Ensure font has Bangla character support
- Test font with: আমি বাংলায় গান গাই
- Try Noto Sans Bengali or Noto Serif Bengali
- Check font file integrity

## Future Enhancements

Possible additions:
- Font preview with custom text
- Font weight selection (light, regular, bold)
- Font style selection (normal, italic)
- Bulk font upload
- Font usage tracking
- Font fallback configuration

## Support

If you encounter issues:
1. Check Appwrite console for errors
2. Verify all collections and buckets are created
3. Check browser console for JavaScript errors
4. Ensure .env variables are set correctly
5. Test with a simple Google Font first before custom fonts
