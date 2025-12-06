# Project Gallery - Setup Guide

## Overview
The Project Gallery displays image carousels with infinite auto-scrolling, customizable label designs, and event links.

## Appwrite Database Setup

### 1. Create Collection
In **Databases** → **portfolio_db**, create:
- **Collection ID**: `gallery_carousels`
- **Collection Name**: `Gallery Carousels`

### 2. Create Attributes

| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| `title` | String | 255 | Yes | - |
| `eventLink` | String | 500 | No | - |
| `images` | String | 50000 | No | `[]` |
| `labelDesign` | String | 50 | No | `ribbon` |
| `titleFontSize` | String | 20 | No | `14px` |
| `titleColor` | String | 20 | No | `#333333` |
| `scrollInterval` | Integer | - | No | `3000` |
| `featured` | Boolean | - | No | `true` |
| `order` | Integer | - | No | `0` |

**Note**: `images` stores JSON array as string with format:
```json
[{"id": "fileId", "url": "imageUrl", "title": "Image Title"}]
```

### 3. Create Storage Bucket
1. Go to **Storage** → **Create Bucket**
2. **Bucket ID**: `gallery_images`
3. **Bucket Name**: `Gallery Images`
4. Set permissions:
   - **Any** → Read
   - **Users** → Create, Read, Update, Delete

### 4. Set Collection Permissions
- **Any** → Read (for public viewing)
- **Users** → Create, Read, Update, Delete (for admin management)

## Label Design Options (15 Styles)
- `vintage-paper` - Cream background with teal italic text
- `tape-label` - Tape-style with slight skew
- `ribbon` - Classic white ribbon (default)
- `neon-glow` - Black with green neon glow
- `retro-badge` - Brown badge with dark border
- `glass-card` - Frosted glass effect
- `chalk-board` - Dark green chalkboard style
- `polaroid` - White polaroid frame
- `stamp` - Red dashed border stamp
- `typewriter` - Monospace typewriter style
- `cinema` - Black with gold cinema marquee
- `wooden` - Wood grain texture
- `neon-pink` - Black with pink neon glow
- `newspaper` - Vintage newspaper style
- `gradient-modern` - Purple to pink gradient

## Features
- ✅ True infinite 360° auto-scroll carousel (no visible reset)
- ✅ Hover to pause scrolling
- ✅ 15 unique title label design presets
- ✅ Customizable scroll speed (interval in ms)
- ✅ Font size & color settings for titles
- ✅ Event link support with external link button
- ✅ Featured toggle for homepage display
- ✅ Drag-to-reorder galleries
- ✅ Multiple image upload with individual titles
- ✅ Image reordering within gallery

## Admin Panel
Navigate to `/admin/project-gallery` to manage galleries.

## Public Pages
- Homepage section: Shows featured galleries
- Full page: `/project-gallery` - Shows all galleries
