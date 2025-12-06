# Blog System Setup Guide

## Overview
This guide will help you set up a complete blog system that mirrors your project management system but with blog-specific features including author information, author images, and publication dates.

---

## Part 1: Appwrite Database Setup

### Step 1: Create Blog Database Tables

You need to create **3 new collections** in your Appwrite database:

#### Collection 1: `blog_categories`
This collection stores blog categories (similar to project categories).

**Collection ID**: `blog_categories`

**Attributes**:
| Attribute Key | Type | Size | Required | Array | Default |
|--------------|------|------|----------|-------|---------|
| `name` | String | 100 | ✓ | No | - |
| `color` | String | 20 | ✓ | No | `#105652` |
| `order` | Integer | - | ✓ | No | `0` |

**Indexes**:
- Key: `name_idx`, Type: `key`, Attributes: `name`
- Key: `order_idx`, Type: `key`, Attributes: `order`

---

#### Collection 2: `blogs`
This is the main blog collection.

**Collection ID**: `blogs`

**Attributes**:
| Attribute Key | Type | Size | Required | Array | Default |
|--------------|------|------|----------|-------|---------|
| `title` | String | 255 | ✓ | No | - |
| `category` | String | 100 | ✓ | No | - |
| `description` | String | 500 | ✓ | No | - |
| `thumbnailUrl` | String | 2000 | ✓ | No | - |
| `galleryUrls` | String | 2000 | No | Yes | `[]` |
| `likes` | Integer | - | No | No | `0` |
| `featured` | Boolean | - | No | No | `false` |
| `fullDescription` | String | 100000 | ✓ | No | - |
| `customSlug` | String | 255 | ✓ | No | - |
| `useProjectPrefix` | Boolean | - | No | No | `true` |
| `authorNames` | String | 255 | No | Yes | `[]` |
| `authorImages` | String | 2000 | No | Yes | `[]` |
| `publishDate` | String | 50 | ✓ | No | - |

**Indexes**:
- Key: `title_idx`, Type: `fulltext`, Attributes: `title`
- Key: `category_idx`, Type: `key`, Attributes: `category`
- Key: `slug_idx`, Type: `unique`, Attributes: `customSlug`
- Key: `featured_idx`, Type: `key`, Attributes: `featured`
- Key: `date_idx`, Type: `key`, Attributes: `publishDate`

---

#### Collection 3: Storage Bucket for Blog Images

**Bucket ID**: `blog_images`

**Settings**:
- **File Security**: Enabled
- **Maximum File Size**: 10MB (10485760 bytes)
- **Allowed File Extensions**: `jpg, jpeg, png, gif, webp`
- **Compression**: Enabled (optional)
- **Encryption**: Enabled (optional)

**Permissions**:
- **Read Access**: `Any`
- **Create Access**: `Users` (authenticated users)
- **Update Access**: `Users`
- **Delete Access**: `Users`

---

## Part 2: Key Differences from Projects

### New Fields in Blog System:

1. **authorNames** (String Array)
   - Stores multiple author names
   - Example: `["John Doe", "Jane Smith"]`

2. **authorImages** (String Array)
   - Stores URLs of author profile images
   - Must match the order of authorNames
   - Example: `["https://..../author1.jpg", "https://..../author2.jpg"]`

3. **publishDate** (String)
   - Publication date in format: `YYYY-MM-DD` or `Month DD, YYYY`
   - Example: `"January 10, 2024"` or `"2024-01-10"`

4. **useProjectPrefix** renamed conceptually to "useBlogPrefix"
   - When true: `/blog/your-slug`
   - When false: `/your-slug`

---

## Part 3: Database Constants

In your blog management files, use these constants:

```javascript
const BLOG_DATABASE = 'portfolio_db'; // Same database as projects
const BLOG_COLLECTION = 'blogs';
const BLOG_BUCKET = 'blog_images';
const BLOG_CATEGORIES_COLLECTION = 'blog_categories';
```

---

## Part 4: Quick Setup Checklist

- [ ] Create `blog_categories` collection with attributes
- [ ] Create `blogs` collection with all attributes
- [ ] Create `blog_images` storage bucket
- [ ] Set proper permissions on all collections
- [ ] Add indexes for better query performance
- [ ] Test by creating a sample blog category
- [ ] Test by uploading a sample image to blog_images bucket

---

## Part 5: Sample Data for Testing

### Sample Blog Category:
```json
{
  "name": "Technology",
  "color": "#3b82f6",
  "order": 1
}
```

### Sample Blog Post:
```json
{
  "title": "Getting Started with GIS",
  "category": "Technology",
  "description": "A comprehensive guide to Geographic Information Systems",
  "thumbnailUrl": "https://your-appwrite-url/blog_images/...",
  "galleryUrls": [],
  "likes": 0,
  "featured": true,
  "fullDescription": "<h2>Introduction</h2><p>GIS is amazing...</p>",
  "customSlug": "getting-started-with-gis",
  "useProjectPrefix": true,
  "authorNames": ["Parvej Hossain"],
  "authorImages": ["https://your-appwrite-url/blog_images/author.jpg"],
  "publishDate": "January 10, 2024"
}
```

---

## Next Steps

After completing the database setup:
1. Create the BlogManagement admin component
2. Create the Blog display components for frontend
3. Integrate blog section into homepage
4. Add routing for blog pages

Refer to the implementation files for detailed code.
