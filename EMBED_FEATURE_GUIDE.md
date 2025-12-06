# Embed Feature Guide - Rich Text Editor

## Overview

The Rich Text Editor now includes a powerful embed feature that allows you to insert and customize embedded content like YouTube videos, Google Maps, social media posts, and any other iframe-based content.

## Features

### 1. Insert Embed Code
- Click the **Embed button** (FileCode icon) in the toolbar
- Paste your embed code (iframe, video, map, etc.)
- Switch between **Code View** and **Preview** modes
- Insert at cursor position

### 2. Automatic Dimension Detection
- Automatically extracts width and height from embed code
- If dimensions are specified: Uses those dimensions
- If no dimensions: Defaults to 560x315px (standard video size)
- Dimensions can be overridden by resizing

### 3. Resize Embeds
Just like images, embeds can be resized:
- **8 resize handles** (4 corners + 4 edges)
- **Corner handles**: Resize maintaining aspect ratio
- **Edge handles**: Resize width or height independently
- **Minimum size**: 50x50px
- **Live preview** while resizing

### 4. Alignment
Use the alignment buttons to position embeds:
- **Left**: Align to left edge
- **Center**: Center horizontally
- **Right**: Align to right edge

### 5. Border Customization
Click the **Border button** when an embed is selected:

#### Border Style
- **Solid**: Standard solid border
- **Dashed**: Dashed line border
- **Dotted**: Dotted line border
- **None**: No border

#### Border Width
- Adjustable from 1px to 20px
- Slider control for easy adjustment
- Live preview of width

#### Border Color
- Color picker for visual selection
- Hex code input for precise colors
- Default: #105652 (teal)

### 6. Delete Embeds
- **Click Delete button**: Red trash icon above selected embed
- **Keyboard shortcut**: Delete or Backspace key

## How to Use

### Basic Embed Insertion

1. **Click Embed Button**
   - FileCode icon in the toolbar
   - Opens embed input panel

2. **Paste Embed Code**
   - Switch to "Code View"
   - Paste your iframe or embed code
   - Example:
     ```html
     <iframe src="https://www.youtube.com/embed/VIDEO_ID" 
             width="560" height="315" 
             frameborder="0" allowfullscreen>
     </iframe>
     ```

3. **Preview (Optional)**
   - Switch to "Preview" tab
   - See how the embed will look
   - Make sure it displays correctly

4. **Insert**
   - Click "Insert Embed"
   - Embed appears at cursor position

### Resizing Embeds

1. **Select Embed**
   - Click on the **edges or border** of the embedded content
   - Resize handles appear
   - **Note**: Click the center to interact with the embed (for maps, etc.)

2. **Drag Handles**
   - **Corners**: Maintain aspect ratio
   - **Edges**: Resize one dimension
   - Minimum size: 50x50px
   - **Content scales**: No cropping, actual resize with scaling

3. **Release**
   - Changes are saved automatically
   - Iframe dimensions update to match

### Customizing Border

1. **Select Embed**
   - Click on the embedded content

2. **Open Border Settings**
   - Click purple "Border" button
   - Settings panel appears

3. **Choose Style**
   - Select: Solid, Dashed, Dotted, or None

4. **Adjust Width** (if not "None")
   - Use slider: 1-20px
   - See live preview

5. **Pick Color** (if not "None")
   - Use color picker or hex input
   - Default: #105652

6. **Apply**
   - Click "Apply Border"
   - Border updates immediately

### Aligning Embeds

1. **Select Embed**
   - Click on the embedded content

2. **Click Alignment Button**
   - Use toolbar alignment buttons
   - Left, Center, or Right

3. **Result**
   - Embed repositions immediately

## Common Embed Sources

### YouTube Videos
```html
<iframe width="560" height="315" 
  src="https://www.youtube.com/embed/VIDEO_ID" 
  frameborder="0" allowfullscreen>
</iframe>
```

### Google Maps
```html
<iframe width="600" height="450" 
  src="https://www.google.com/maps/embed?pb=..." 
  frameborder="0" allowfullscreen>
</iframe>
```

### Vimeo Videos
```html
<iframe src="https://player.vimeo.com/video/VIDEO_ID" 
  width="640" height="360" 
  frameborder="0" allowfullscreen>
</iframe>
```

### Twitter/X Posts
```html
<blockquote class="twitter-tweet">
  <a href="https://twitter.com/user/status/ID"></a>
</blockquote>
<script async src="https://platform.twitter.com/widgets.js"></script>
```

### CodePen
```html
<iframe height="300" 
  src="https://codepen.io/user/embed/ID?default-tab=html,result" 
  frameborder="0" allowfullscreen>
</iframe>
```

## Tips & Best Practices

### Interaction Tips
- **Click center**: Interact with embed content (drag maps, play videos)
- **Click edges**: Select embed for resizing/editing
- **Visual hint**: Blue tooltip shows when embed is selected
- **20px threshold**: Clicking within 20px of edge selects the embed

### Dimension Tips
- **Standard video**: 560x315 or 640x360
- **Widescreen**: 16:9 aspect ratio
- **Square**: Equal width and height
- **Responsive**: Can be resized after insertion
- **True scaling**: Content scales, not crops

### Border Tips
- **No border**: Clean, minimal look
- **Solid border**: Professional appearance
- **Dashed/Dotted**: Creative, casual style
- **Thick border**: Makes embed stand out
- **Colored border**: Match your brand colors

### Performance Tips
- **Limit embeds**: Too many can slow page load
- **Use preview**: Check before inserting
- **Optimize size**: Don't make embeds too large
- **Test responsiveness**: Ensure it works on mobile

### Security Tips
- **Trust sources**: Only embed from trusted sites
- **Check code**: Review embed code before inserting
- **HTTPS**: Prefer secure (https://) embeds
- **Permissions**: Be aware of what the embed can access

## Keyboard Shortcuts

- **Delete/Backspace**: Delete selected embed
- **Click edges**: Select embed for editing
- **Click center**: Interact with embed content
- **Drag handles**: Resize embed

## Visual Guide

```
   [Border Settings]    [🗑️ Delete]
     nw -------- n -------- ne
     |                       |
     |                       |
     w      EMBED CONTENT    e
     |                       |
     |                       |
     sw -------- s -------- se
```

### Control Elements
- **Border Button** (purple, left): Opens border customization
- **Delete Button** (red, right): Removes the embed
- **Resize Handles** (teal circles): Drag to resize

## Troubleshooting

### Embed Not Showing
- **Check code**: Ensure valid HTML
- **Check URL**: Verify embed source is accessible
- **Check preview**: Use preview mode to test
- **Browser console**: Look for errors

### Resize Not Working
- **Click edges**: Click near the border, not the center
- **Check handles**: Handles should be visible
- **Try again**: Click and drag handles
- **20px rule**: Click within 20px of the edge

### Can't Interact with Embed
- **Click center**: Click the middle area, not edges
- **Avoid edges**: Stay away from 20px border zone
- **Maps/Videos**: Should work normally in center area

### Border Not Applying
- **Select embed**: Click on embed first
- **Open settings**: Click Border button
- **Apply changes**: Click "Apply Border"
- **Check style**: Ensure style isn't "None"

### Alignment Issues
- **Select embed**: Click on embed
- **Use toolbar**: Click alignment buttons
- **Check result**: Embed should reposition

## Examples

### Example 1: YouTube Video with Border
```html
Code: <iframe width="560" height="315" 
        src="https://www.youtube.com/embed/dQw4w9WgXcQ">
      </iframe>

Border: Solid, 3px, #105652
Alignment: Center
Result: Centered video with teal border
```

### Example 2: Google Map, No Border
```html
Code: <iframe width="600" height="450" 
        src="https://www.google.com/maps/embed?pb=...">
      </iframe>

Border: None
Alignment: Left
Result: Left-aligned map without border
```

### Example 3: Custom Sized Embed
```html
Code: <iframe src="https://example.com/widget" 
        width="400" height="300">
      </iframe>

Resize: Drag to 800x600
Border: Dashed, 2px, #FF5733
Alignment: Right
Result: Large right-aligned embed with orange dashed border
```

## Technical Details

### HTML Structure
```html
<div class="editor-embed-wrapper" 
     contenteditable="false"
     data-embed-code="..."
     data-original-width="560"
     data-original-height="315"
     style="width: 560px; height: 315px; border: 1px solid #105652;">
  <div style="width: 100%; height: 100%; pointer-events: none;">
    <!-- Embed code here -->
  </div>
</div>
```

### Data Attributes
- `data-embed-code`: Original embed code
- `data-original-width`: Initial width
- `data-original-height`: Initial height

### Styling
- Inline styles for portability
- Border customization via style attribute
- Pointer events disabled on content (prevents interaction during editing)

## Future Enhancements

Potential improvements:
- Embed library with popular sources
- Responsive embed options
- Embed templates
- Auto-detect embed type
- Embed preview thumbnails
- Embed URL shortcut (paste URL, auto-convert to embed)
- Shadow and effects for embeds
- Rounded corners option
- Padding control

## Support

For issues or questions:
1. Check this guide first
2. Verify embed code is valid
3. Test in preview mode
4. Check browser console for errors
5. Try a different embed source

Enjoy embedding rich content in your projects! 🎬🗺️📺
