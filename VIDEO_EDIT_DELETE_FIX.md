# Video Edit/Delete Fix

## Problem
After inserting a video, clicking the edit button (gear icon) would delete the video from the editor instead of opening the edit modal.

## Root Cause
The video structure changed when we implemented flexbox alignment:

**Old structure:**
```html
<div class="editor-video-player">
  <!-- video content -->
</div>
```

**New structure:**
```html
<div style="display: flex; ..."> <!-- alignment wrapper -->
  <div class="editor-video-player">
    <!-- video content -->
  </div>
</div>
```

When editing, the code was trying to replace just the `.editor-video-player` div, but it needed to replace the entire alignment wrapper.

## Solution

Updated the `handleSaveVideo` function to properly handle editing:

```javascript
if (!editingVideo) {
  // New video - insert at cursor
  // ... insert logic
} else {
  // Editing existing video
  // Find the alignment wrapper (parent of the video wrapper)
  const oldAlignmentWrapper = editingVideo.parentElement;
  
  if (oldAlignmentWrapper && oldAlignmentWrapper.style.display === 'flex') {
    // Replace the old alignment wrapper with the new one
    oldAlignmentWrapper.replaceWith(finalElement);
  } else {
    // Fallback: if no alignment wrapper found, just replace the video wrapper
    editingVideo.replaceWith(finalElement);
  }
}
```

## How It Works

1. **Check if editing**: `if (editingVideo)`
2. **Find parent wrapper**: `editingVideo.parentElement`
3. **Verify it's alignment wrapper**: Check if `display === 'flex'`
4. **Replace entire wrapper**: `oldAlignmentWrapper.replaceWith(finalElement)`
5. **Fallback**: If no alignment wrapper, replace just the video element

## Benefits

✅ **Edit works correctly**: Video stays in place when editing
✅ **Alignment preserved**: New alignment wrapper replaces old one
✅ **No deletion**: Video doesn't disappear
✅ **Backward compatible**: Fallback for videos without alignment wrapper

## Testing

1. Insert a video with custom dimensions and alignment
2. Click the green gear icon to edit
3. Change width, height, or alignment
4. Click "Update Video"
5. Verify:
   - Video updates with new settings
   - Video doesn't disappear
   - Alignment changes work
   - Dimensions change correctly

## Related Files

- `src/pages/Admin/ProjectManagement/RichTextEditor.jsx`
  - Function: `handleSaveVideo()`
  - Lines: ~2020-2050
