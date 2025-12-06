# Social Media Links Feature - Complete Guide

## Overview
A new feature has been added to the Rich Text Editor that allows you to insert beautiful, interactive social media links with hover effects, similar to the design you provided.

## Features

### ✨ What's New
- **Insert Social Media Links** button in the toolbar (Share icon)
- Support for 8 popular platforms:
  - Facebook
  - Twitter
  - Instagram
  - LinkedIn
  - YouTube
  - GitHub
  - Website (custom)
  - Email
- Add multiple social links at once
- Beautiful hover animations with color transitions
- Tooltips showing platform names
- Responsive circular icon design

### 🎨 Design
The social links feature uses a design inspired by your provided code:
- Circular white icons with shadows
- Smooth hover transitions
- Platform-specific colors on hover
- Animated tooltips
- Professional appearance

## How to Use

### 1. Insert Social Links
1. Click the **Share icon** (Share2) in the toolbar
2. A modal will open titled "Insert Social Media Links"

### 2. Add Label Text (Optional)
1. Enter text in the "Label Text" field (e.g., "Follow us on", "Connect with us")
2. This text will appear before the social icons
3. Leave empty if you don't want a label
4. Default: "Follow us on"

### 3. Add Links
1. Click **"Add Social Media Link"** button
2. Select the platform from the dropdown
3. Paste the URL for that platform (e.g., www.google.com, facebook.com/yourpage)
4. **URLs are automatically validated** - http:// or https:// is added if missing
5. Repeat to add more links

### 4. Preview
- As you add links, a preview appears at the bottom of the modal
- Preview shows the label text and icons together
- Hover over icons to see the color effects

### 5. Insert
- Click **"Insert Social Links"** to add them to your content
- The links will appear as: **"Follow us on"** [icon] [icon] [icon]

### 6. Edit or Delete
Multiple ways to manage your social links:

**Option 1: Click on Label Text**
- Click on "Follow us on" text to open edit modal
- Modify links, add/remove platforms, change label text
- Click "Insert Social Links" to save changes

**Option 2: Hover Buttons**
- Hover over the social links section
- Two buttons appear in the top-right:
  - **Edit button** (pencil icon) - Opens edit modal
  - **Delete button** (trash icon) - Deletes entire section (with confirmation)

**Option 3: Keyboard**
- Click anywhere on the social links section to select it
- Press **Delete** or **Backspace** to remove entire section

**Note:** Clicking on individual social icons opens the links in new tabs

## Technical Details

### Files Created
1. **SocialLinksInput.jsx** - Modal component for adding/editing social links
   - Label text input field
   - Platform selector
   - URL input fields with automatic validation
   - Add/remove functionality
   - Live preview with label text

2. **RichTextEditor.jsx** - Updated with:
   - Social links state management
   - Insert/edit/delete handlers
   - Toolbar button
   - Click handlers for selection
   - Keyboard handlers for deletion

### Supported Platforms
```javascript
{
  facebook: '#1877f2',
  twitter: '#1da1f2',
  instagram: '#e4405f',
  linkedin: '#0077b5',
  youtube: '#ff0000',
  github: '#333333',
  website: '#105652',
  email: '#ea4335'
}
```

### HTML Structure
The social links are rendered as:
```html
<div class="editor-social-links-wrapper" 
     data-social-links="..." 
     data-label-text="Follow us on">
  <div> <!-- icons container -->
    <span class="social-label-text">Follow us on</span>
    <div> <!-- icon wrapper -->
      <span class="social-tooltip">Platform Name</span>
      <a href="https://validated-url.com" target="_blank">
        <svg>...</svg>
      </a>
    </div>
    <!-- more icons... -->
  </div>
</div>
```

## Styling

### Icon Styles
- Size: 50px × 50px
- Background: White
- Border-radius: 50% (circular)
- Shadow: `0 10px 10px rgba(0, 0, 0, 0.1)`
- Transition: `all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)`

### Hover Effects
- Background changes to platform color
- Icon color changes to white
- Tooltip appears above with platform name
- Smooth cubic-bezier animation

### Tooltip
- Position: Absolute, above icon
- Background: Platform color
- Padding: 5px 8px
- Border-radius: 5px
- Arrow pointing down (rotated square)

## Example Usage

### Adding Social Links
1. User clicks Share icon in toolbar
2. Modal opens
3. User enters label text: "Follow us on"
4. User adds:
   - Facebook: www.facebook.com/yourpage (auto-corrected to https://www.facebook.com/yourpage)
   - Twitter: twitter.com/yourhandle (auto-corrected to https://twitter.com/yourhandle)
   - Instagram: instagram.com/yourprofile (auto-corrected to https://instagram.com/yourprofile)
5. Preview shows "Follow us on" with 3 circular icons
6. User clicks "Insert Social Links"
7. Content appears in the editor

### Result
A beautiful row showing:
**"Follow us on"** [Facebook icon] [Twitter icon] [Instagram icon]

Features:
- Label text appears before icons
- Icons display as white circles with platform icons
- Change to platform colors on hover
- Show platform names in tooltips
- Open links in new tabs when clicked (with proper https:// URLs)
- Can be deleted by selecting and pressing Delete

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- CSS transitions supported
- SVG icons for crisp rendering

## Customization Options

### To Change Icon Size
Edit the wrapper styles in `handleSaveSocialLinks`:
```javascript
width: 50px;  // Change this
height: 50px; // And this
```

### To Add New Platforms
1. Add to `SOCIAL_PLATFORMS` array in `SocialLinksInput.jsx`
2. Add icon SVG to `platformIcons` object in `handleSaveSocialLinks`
3. Add color to `platformColors` object
4. Add viewBox to `platformViewBox` object

### To Change Hover Animation
Modify the transition in icon wrapper styles:
```javascript
transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

## Testing Checklist

- [ ] Click Share icon in toolbar
- [ ] Modal opens correctly
- [ ] Add a social link
- [ ] Select different platforms
- [ ] Add multiple links
- [ ] Preview shows correctly
- [ ] Hover effects work in preview
- [ ] Insert links into editor
- [ ] Icons render correctly
- [ ] Hover effects work in editor
- [ ] Tooltips appear on hover
- [ ] Links open in new tabs
- [ ] Select social links block
- [ ] Delete with keyboard
- [ ] Save and reload content

## Notes

- Links are stored as JSON in `data-social-links` attribute
- Label text is stored in `data-label-text` attribute
- Each link has platform and URL properties
- **URLs are automatically validated and fixed:**
  - Missing protocol (http:// or https://) is added automatically
  - Example: `www.google.com` → `https://www.google.com`
  - Example: `facebook.com/page` → `https://facebook.com/page`
  - Email links get `mailto:` prefix automatically
- Empty URLs are filtered out before saving
- At least one valid link required to insert
- Links open in new tabs with `rel="noopener noreferrer"` for security

## Future Enhancements

Possible additions:
- Edit existing social links (double-click to reopen modal)
- Drag to reorder icons
- Custom icon colors
- Different icon styles (square, rounded square)
- Icon size options
- Alignment options (left, center, right)
- Vertical layout option
- Animation effects (bounce, pulse, etc.)

---

**Status**: ✅ Complete and Ready to Use

The social media links feature is fully implemented and ready for testing!
