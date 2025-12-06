# Clean Video Implementation Plan

## Simple Approach

Instead of complex floating controls and alignment wrappers, use a simpler approach:

1. **Video Structure**: Single div with data attributes
2. **Styling**: Inline styles for alignment (text-align on parent)
3. **Controls**: CSS-only hover overlay with edit/delete buttons
4. **No Wrappers**: Direct insertion, no alignment wrapper divs

## Implementation

### 1. Video HTML Structure
```html
<div class="editor-video" 
     data-mode="embed|url" 
     data-video-url="..." 
     data-embed-code="..."
     data-width="900px"
     data-height="600px"
     data-alignment="left|center|right"
     style="width: 900px; height: 600px; margin: 1rem auto;">
  <div class="video-content">
    <!-- video or iframe here -->
  </div>
  <div class="video-controls">
    <button class="edit-btn">⚙️</button>
    <button class="delete-btn">🗑️</button>
  </div>
</div>
```

### 2. CSS for Controls (in style tag)
```css
.editor-video {
  position: relative;
  display: block;
}

.editor-video .video-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0;
  transition: opacity 0.2s;
}

.editor-video:hover .video-controls {
  opacity: 1;
}
```

### 3. Alignment Logic
- **Left**: `margin: 1rem 0 1rem 0`
- **Center**: `margin: 1rem auto`
- **Right**: `margin: 1rem 0 1rem auto`

### 4. Benefits
- ✅ No complex wrapper divs
- ✅ Controls are part of HTML (always there)
- ✅ CSS handles visibility
- ✅ Simpler to save/load
- ✅ Alignment works reliably
- ✅ No JavaScript event attachment needed

## Next Steps
1. Remove all existing video code
2. Implement new simple version
3. Test thoroughly
