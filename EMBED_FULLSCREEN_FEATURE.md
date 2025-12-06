# Embed Fullscreen Feature

## Overview
Added fullscreen functionality to embedded content (iframes, maps, etc.) in the rich text editor. Users can now click a fullscreen icon on any embed to view it in fullscreen mode with full mouse interaction support.

## Features

### 1. Fullscreen Icon Button
- A fullscreen icon appears in the top-right corner of each embed when hovering
- Icon uses a subtle fade-in animation on hover
- Positioned absolutely to not interfere with embed content

### 2. Fullscreen Modal
- Clicking the fullscreen icon opens the embed in a true fullscreen modal
- Black background to eliminate distractions
- Embed scales to fill the entire viewport (100vw x 100vh)
- Full mouse interaction with the embedded content (maps, videos, etc.)

### 3. Close Functionality
- Close button in the top-right corner with hover effects
- ESC key closes the fullscreen modal
- Clicking outside the embed (on the black background) closes the modal

### 4. Works Everywhere
- **Rich Text Editor**: Fullscreen works while editing content
- **Project Modal**: Fullscreen works when viewing projects in the modal
- **Homepage**: Fullscreen works on the main projects page

## Implementation Details

### Files Modified

1. **src/pages/Admin/ProjectManagement/RichTextEditor.jsx**
   - Added `fullscreenEmbed` state to track fullscreen content
   - Added `handleEmbedFullscreen()` function to open fullscreen
   - Added `closeFullscreenEmbed()` function to close fullscreen
   - Modified `handleInsertEmbed()` to add fullscreen button to new embeds
   - Added useEffect to add fullscreen buttons to existing embeds
   - Added useEffect for ESC key handler
   - Added CSS for fullscreen button hover effects
   - Added fullscreen modal JSX at the end of the component

2. **src/utils/embedFullscreen.js** (NEW)
   - Utility function `initializeEmbedFullscreen()` to add fullscreen buttons to rendered embeds
   - Function `openFullscreenEmbed()` to create and display fullscreen modal
   - Handles all event listeners and cleanup
   - Prevents body scroll when fullscreen is active

3. **src/components/Projects/ProjectModal.jsx**
   - Imported `initializeEmbedFullscreen` utility
   - Added cleanup for embed fullscreen in useEffect
   - Fullscreen now works in project modal popups

## Technical Details

### Fullscreen Button Styling
```css
.editor-embed-wrapper:hover .embed-fullscreen-btn {
  opacity: 1 !important;
}
.embed-fullscreen-btn:hover {
  background: rgba(16, 86, 82, 1) !important;
  transform: scale(1.05);
}
```

### Fullscreen Modal Structure
- Fixed positioning with `z-index: 99999` to appear above everything
- Black background (`background: black`)
- Embed content fills 100% width and height
- Close button positioned absolutely in top-right
- ESC key and background click handlers for closing

### Embed Code Processing
The embed code is processed to ensure fullscreen compatibility:
- Width attributes replaced with `width="100%"`
- Height attributes replaced with `height="100%"`
- Inline styles added to iframes: `style="width:100%;height:100%;border:none;"`

## User Experience

### In Editor
1. Insert an embed (iframe, map, etc.)
2. Hover over the embed to see the fullscreen icon
3. Click the icon to view in fullscreen
4. Interact with the embed (pan map, play video, etc.)
5. Press ESC or click the close button to exit

### In Project View
1. Open a project that contains embeds
2. Hover over any embed to see the fullscreen icon
3. Click to view in fullscreen
4. Full interaction support
5. Close with ESC or close button

## Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Uses standard DOM APIs and CSS
- No external dependencies required

## Future Enhancements
- Add keyboard shortcuts (F11 for fullscreen)
- Add zoom controls for maps
- Add fullscreen indicator/badge
- Support for multiple embeds in sequence (gallery mode)
