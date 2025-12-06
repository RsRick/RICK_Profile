# Experience & Achievement Showcase - Setup Guide

## Overview
The Experience component displays your work experience, education, achievements, and awards in a beautiful carousel format with modal details.

## Appwrite Database Setup

### 1. Create the Collection
In your Appwrite Console, navigate to **Databases** → **portfolio_db** and create a new collection:

- **Collection ID**: `experiences`
- **Collection Name**: `Experiences`

### 2. Create Attributes

| Attribute Name | Type | Size | Required | Default |
|---------------|------|------|----------|---------|
| `title` | String | 255 | Yes | - |
| `organization` | String | 255 | No | - |
| `type` | String | 50 | No | `achievement` |
| `description` | String | 5000 | No | - |
| `location` | String | 255 | No | - |
| `startDate` | String | 50 | No | - |
| `endDate` | String | 50 | No | - |
| `current` | Boolean | - | No | `false` |
| `skills` | String[] | 50 each | No | - |
| `highlights` | String[] | 500 each | No | - |
| `color` | String | 20 | No | `#105652` |
| `colorSecondary` | String | 20 | No | `#1E8479` |
| `imageUrl` | String | 500 | No | - |
| `credentialUrl` | String | 500 | No | - |
| `featured` | Boolean | - | No | `true` |
| `order` | Integer | - | No | `0` |

### 3. Set Permissions
Go to **Settings** → **Permissions** and add:
- **Any** → Read (for public viewing)
- **Users** → Create, Read, Update, Delete (for admin management)

### 4. Create Storage Bucket (Optional)
If you want to upload images for experiences:

1. Go to **Storage** → **Create Bucket**
2. **Bucket ID**: `experience_images`
3. **Bucket Name**: `Experience Images`
4. Set permissions:
   - **Any** → Read
   - **Users** → Create, Read, Update, Delete

## Experience Types
The system supports these experience types:
- `work` - Work Experience (Briefcase icon)
- `education` - Education (Graduation cap icon)
- `achievement` - Achievement (Trophy icon)
- `award` - Award (Award icon)

## Color Themes
Preset color themes available:
- Teal (default): `#105652` / `#1E8479`
- Blue: `#1e40af` / `#3b82f6`
- Purple: `#7c3aed` / `#a78bfa`
- Red: `#dc2626` / `#f87171`
- Orange: `#ea580c` / `#fb923c`
- Green: `#16a34a` / `#4ade80`
- Cyan: `#0891b2` / `#22d3ee`
- Pink: `#be185d` / `#f472b6`

## Admin Panel Access
Navigate to `/admin/experiences` to manage your experiences.

## Features
- ✅ Carousel view with smooth navigation arrows
- ✅ Modal with full details and navigation between items
- ✅ Skills/tags display with colored badges
- ✅ Key highlights list with bullet points
- ✅ Date range support (with "Present" option for ongoing)
- ✅ Location display with map pin icon
- ✅ Credential URL linking with external link button
- ✅ Image support with folder-style card design
- ✅ 8 custom color themes
- ✅ Drag-to-reorder functionality in admin
- ✅ Featured toggle (show/hide on homepage)
- ✅ Type-based icons (work, education, achievement, award)

## Admin Panel
Navigate to `/admin/experiences` to manage your experiences.

## Component Location
- Public component: `src/components/Experience/Experience.jsx`
- Admin management: `src/pages/Admin/Experience/ExperienceManagement.jsx`
