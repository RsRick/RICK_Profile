# Research Profile Icon Update Instructions

## Overview
The Research Profile section now supports custom icons for each research platform link. This guide explains how to update your existing Appwrite database to support this feature.

## Database Changes Required

### Collection: `about_me`

The `researchLinks` attribute now stores an array with the following structure:

```json
[
  {
    "name": "ResearchGate",
    "url": "https://www.researchgate.net/profile/...",
    "iconUrl": "https://sgp.cloud.appwrite.io/v1/storage/buckets/profile-images/files/.../view?project=..."
  }
]
```

### Steps to Update Existing Data

#### Option 1: Update via Admin Panel (Recommended)
1. Go to `/admin/about-me` in your portfolio
2. Scroll to "Research Profile Links" section
3. For each existing link, you'll see an "Upload" button below the icon placeholder
4. Click "Upload" and select an icon image (PNG, JPG, SVG recommended)
5. The icon will be uploaded to Appwrite Storage and the URL will be saved automatically
6. Click "Save Changes" at the bottom

#### Option 2: Manual Update via Appwrite Console
1. Log in to your Appwrite Console
2. Navigate to your project → Databases → `portfolioreact` database
3. Open the `about_me` collection
4. Find your document and edit the `researchLinks` attribute
5. Update the JSON to include `iconUrl` for each link:

**Before:**
```json
[
  {
    "name": "ResearchGate",
    "url": "https://www.researchgate.net/profile/..."
  }
]
```

**After:**
```json
[
  {
    "name": "ResearchGate",
    "url": "https://www.researchgate.net/profile/...",
    "iconUrl": ""
  }
]
```

6. Save the document
7. Then use the admin panel to upload icons

## Icon Recommendations

### Size & Format
- **Recommended size:** 256x256px or 512x512px
- **Aspect ratio:** 1:1 (square)
- **Max file size:** 2MB
- **Formats:** PNG (with transparency), JPG, SVG, WebP

### Design Tips
- Use the official logo/icon of the research platform
- Ensure good contrast and visibility
- Square icons work best
- Transparent backgrounds (PNG) look cleaner

### Where to Find Icons
- **Official websites:** Most platforms provide brand assets
- **Icon libraries:** 
  - [Simple Icons](https://simpleicons.org/) - Brand icons as SVG
  - [Flaticon](https://www.flaticon.com/) - Free icons
  - [Font Awesome](https://fontawesome.com/) - Icon library

## Display Behavior

### Frontend Display
- Icons are displayed in a grid layout (similar to "Find me on" section)
- Each icon is 64x64px (w-16 h-16)
- Rounded corners with 2px border in theme color (#105652)
- Hover effect: scales up 10% with shadow
- Clicking opens the link in a new tab

### Fallback
- If no icon is uploaded, a default external link icon is shown
- The platform name appears as a tooltip on hover

## Storage Details

### Bucket Information
- **Bucket ID:** `profile-images`
- **Permissions:** Public read access required
- **Location:** Same bucket as profile photos

### File Naming
- Files are automatically named with unique IDs
- Format: `[unique-id].[extension]`
- Example: `691c3d8f62636731b85e.png`

## Troubleshooting

### Icons not displaying
1. Check browser console for errors
2. Verify the `iconUrl` is not empty in the database
3. Ensure the file exists in Appwrite Storage
4. Check bucket permissions (must allow public read)

### Upload fails
1. Check file size (must be < 2MB)
2. Verify file format (must be image/*)
3. Check Appwrite Storage bucket exists
4. Verify bucket permissions allow file creation

### Icons look distorted
1. Use square images (1:1 aspect ratio)
2. Recommended: 256x256px or larger
3. Avoid very small images (they may appear pixelated)

## Example Research Platforms

Common research platforms you might want to add:
- ResearchGate
- Google Scholar
- ORCID
- Academia.edu
- Scopus
- Web of Science
- PubMed
- arXiv
- IEEE Xplore
- Semantic Scholar

## Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Appwrite configuration in `.env`
3. Ensure the `profile-images` bucket exists and has proper permissions
4. Test with a small PNG file first
