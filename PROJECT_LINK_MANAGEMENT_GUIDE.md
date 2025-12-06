# Project Link Management System

## Overview
A comprehensive link management system that allows you to create custom shareable URLs for projects. Projects can be viewed as standalone pages instead of popups, perfect for sharing on social media or sending direct links.

## Features

### 1. **Custom URL Slugs**
- Create SEO-friendly URLs for each project
- Auto-generate slugs from project titles
- Manual slug customization with validation
- Only lowercase letters, numbers, and hyphens allowed

### 2. **Flexible URL Structure**
Two URL format options:
- **With Prefix**: `http://localhost:5173/project/my-project`
- **Without Prefix**: `http://localhost:5173/my-project`

Toggle between formats using the "Use /project/ prefix" checkbox.

### 3. **Standalone Project Pages**
- Full-page view instead of modal popup
- Same content as modal (gallery, details, rich text)
- Optimized for sharing and direct access
- Back button to return to portfolio
- Responsive design

### 4. **Collapsible Management Section**
- Integrated into project form
- Collapsed by default to save space
- Easy access when needed

## How to Use

### Creating a Custom URL

1. **Open Project Form**
   - Go to Admin → Project Management
   - Click "Add Project" or edit existing project

2. **Expand Link Management Section**
   - Scroll to "Link Management (Custom URL)"
   - Click to expand the section

3. **Configure URL Settings**
   
   **Option A: Auto-generate from Title**
   - Enter your project title first
   - Click "Auto-generate from Title" button
   - Slug is automatically created (e.g., "My Project" → "my-project")
   
   **Option B: Manual Entry**
   - Type your custom slug directly
   - Only use: lowercase letters, numbers, hyphens
   - No spaces or special characters

4. **Choose URL Format**
   - ☑ **Checked**: Uses `/project/` prefix
     - Example: `http://localhost:5173/project/my-project`
   - ☐ **Unchecked**: No prefix
     - Example: `http://localhost:5173/my-project`

5. **Preview URL**
   - Green box shows your final URL
   - Verify it looks correct before saving

6. **Save Project**
   - Click "Create Project" or "Update Project"
   - Your custom URL is now active!

## Accessing Projects

### Method 1: Direct URL
Visit the custom URL directly:
```
http://localhost:5173/project/my-awesome-project
```

### Method 2: Share Link
Copy and share the URL on:
- Social media (Twitter, LinkedIn, Facebook)
- Email
- Messaging apps
- Portfolio websites

### Method 3: From Portfolio
- Click on project card → Opens modal
- Or use the custom URL → Opens full page

## Project Page Features

The standalone project page includes:

### ✅ **Gallery Section**
- Image carousel with navigation
- Thumbnail strip for quick access
- Drag-to-scroll thumbnails
- Responsive image sizing
- Loading states

### ✅ **Project Information**
- Title and description
- Category badge
- Project details (Software, Timeframe, etc.)
- External project link button

### ✅ **Rich Content**
All rich text editor features work:
- Text formatting (bold, italic, headings)
- Images and embeds
- Code blocks with syntax highlighting
- Tables
- FAQ/Accordions
- Quote blocks
- Audio/Video players
- Social media links
- File downloads
- Photo grids
- **Embed fullscreen** (works perfectly!)

### ✅ **Interactive Elements**
- FAQ accordions expand/collapse
- Embed fullscreen button
- Code copy buttons
- Audio/video controls
- All interactions from modal work here

### ✅ **Navigation**
- Back button to return to portfolio
- Sticky header
- Smooth scrolling

## Database Fields

The following fields are stored in Appwrite:

```javascript
{
  customSlug: "my-project-slug",      // String
  useProjectPrefix: true,              // Boolean
  // ... other project fields
}
```

### Field Details

**customSlug** (String, Required)
- The URL-friendly identifier
- Must be unique per project
- Validated format: lowercase, numbers, hyphens only
- Example: "gis-analysis-2024"

**useProjectPrefix** (Boolean, Default: true)
- Controls URL structure
- `true`: `/project/slug`
- `false`: `/slug`

## URL Routing

### Route Configuration
```javascript
// With prefix
/project/:slug → ProjectPage component

// Without prefix (fallback)
/:slug → ProjectPage component
```

### Route Priority
1. Admin routes (`/admin/*`)
2. Projects list (`/projects`)
3. Project with prefix (`/project/:slug`)
4. Project without prefix (`/:slug`)
5. Portfolio home (`/*`)

## Validation Rules

### Slug Validation
- **Allowed**: a-z, 0-9, hyphen (-)
- **Not Allowed**: 
  - Uppercase letters (auto-converted)
  - Spaces (converted to hyphens)
  - Special characters (removed)
  - Leading/trailing hyphens (removed)

### Examples
```
Input: "My Awesome Project!"
Output: "my-awesome-project"

Input: "GIS Analysis 2024"
Output: "gis-analysis-2024"

Input: "Project___Name"
Output: "project-name"
```

## Best Practices

### 1. **Slug Naming**
✅ **Good Slugs**
- `gis-mapping-bangladesh`
- `covid-19-analysis`
- `portfolio-website-2024`

❌ **Bad Slugs**
- `project1` (not descriptive)
- `my-project-with-a-very-long-name-that-goes-on-forever` (too long)
- `test` (not meaningful)

### 2. **URL Structure**
- **Use prefix** for professional portfolios
  - Cleaner organization
  - Easier to manage multiple content types
  
- **No prefix** for personal blogs
  - Shorter URLs
  - More direct access

### 3. **SEO Optimization**
- Use descriptive slugs
- Include keywords
- Keep it concise (3-5 words)
- Use hyphens, not underscores

### 4. **Sharing**
- Test URL before sharing
- Use full URL with domain
- Consider URL shorteners for social media
- Track clicks with analytics

## Troubleshooting

### Issue: "Project Not Found"
**Causes:**
- Slug doesn't exist in database
- Typo in URL
- Project was deleted

**Solution:**
- Verify slug in admin panel
- Check project is published
- Regenerate slug if needed

### Issue: URL Not Working
**Causes:**
- Browser cache
- Routing conflict
- Missing slug field

**Solution:**
- Clear browser cache
- Hard refresh (Ctrl+F5)
- Check database has customSlug field
- Verify useProjectPrefix setting

### Issue: Embeds Not Working
**Causes:**
- Fullscreen script not loaded
- Content not initialized

**Solution:**
- Refresh page
- Check browser console for errors
- Verify embed code is valid

## Technical Implementation

### Components
1. **ProjectManagement.jsx**
   - Link management form section
   - Slug generation logic
   - Database save/load

2. **ProjectPage.jsx**
   - Standalone page component
   - Gallery and content display
   - FAQ and embed initialization

3. **App.jsx**
   - Route configuration
   - Dynamic slug routing

### Key Functions

**Auto-generate Slug**
```javascript
const slug = formData.title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');
```

**Load Project by Slug**
```javascript
const foundProject = projects.find(p => p.customSlug === slug);
```

**Generate URL**
```javascript
const url = `${window.location.origin}${
  useProjectPrefix ? '/project/' : '/'
}${customSlug}`;
```

## Future Enhancements

Potential features to add:
- [ ] Slug uniqueness validation
- [ ] URL redirect management
- [ ] Analytics integration
- [ ] Social media preview cards (Open Graph)
- [ ] Custom meta descriptions
- [ ] URL history/versioning
- [ ] Bulk slug generation
- [ ] Import/export URLs

## Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Verify database fields exist
4. Test with simple slug first

## Summary

The Link Management System provides:
✅ Custom shareable URLs for projects
✅ Flexible URL structure (with/without prefix)
✅ Standalone project pages
✅ Full feature parity with modal view
✅ SEO-friendly slugs
✅ Easy social media sharing
✅ Professional presentation

Perfect for sharing individual projects while maintaining your portfolio's integrity!
