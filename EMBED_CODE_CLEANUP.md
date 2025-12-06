# Embed Code Cleanup Feature

## Problem
When inserting YouTube or other embed codes, they come with hardcoded width and height attributes:
```html
<iframe width="560" height="315" src="https://www.youtube.com/embed/..." ...></iframe>
```

These hardcoded dimensions prevented the custom width/height settings from working properly.

## Solution
Automatically clean the embed code by:

1. **Remove width attribute**: Strips `width="560"` or `width='560'`
2. **Remove height attribute**: Strips `height="315"` or `height='315'`
3. **Add responsive styles**: Injects `style="width: 100%; height: 100%; border: none;"` to the iframe

### Code Changes

**File**: `src/pages/Admin/ProjectManagement/RichTextEditor.jsx`
**Function**: `renderVideo()`

```javascript
if (mode === 'embed') {
  // Clean the embed code by removing width and height attributes
  let cleanedEmbedCode = embedCode;
  
  // Remove width attribute (handles width="560" or width='560')
  cleanedEmbedCode = cleanedEmbedCode.replace(/\s+width\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove height attribute (handles height="315" or height='315')
  cleanedEmbedCode = cleanedEmbedCode.replace(/\s+height\s*=\s*["'][^"']*["']/gi, '');
  
  // Add our own width and height as inline styles to the iframe
  cleanedEmbedCode = cleanedEmbedCode.replace(
    /<iframe/gi,
    '<iframe style="width: 100%; height: 100%; border: none;"'
  );
  
  return `<div class="video-embed-container" ...>
    ${cleanedEmbedCode}
  </div>`;
}
```

## How It Works

### Before:
```html
<iframe width="560" height="315" src="..." frameborder="0"></iframe>
```

### After:
```html
<iframe style="width: 100%; height: 100%; border: none;" src="..." frameborder="0"></iframe>
```

The iframe now fills its container (100% × 100%), and the container's size is controlled by your custom width/height settings.

## Benefits

1. ✅ **Custom dimensions work**: Your 900px × 600px settings are respected
2. ✅ **Responsive**: Video scales to fit the wrapper
3. ✅ **Clean code**: No conflicting size attributes
4. ✅ **Works with all embeds**: YouTube, Vimeo, etc.
5. ✅ **Alignment works**: Flexbox alignment now works properly

## Testing

1. Copy a YouTube embed code with width/height
2. Paste into Video Input (Embed mode)
3. Set custom dimensions (e.g., 900px × 600px)
4. Set alignment (left, center, or right)
5. Insert video
6. Verify:
   - Video is exactly 900px × 600px
   - Video aligns correctly
   - Video plays normally

## Example

**Input embed code**:
```html
<iframe width="560" height="315" src="https://www.youtube.com/embed/zm3t7AZIHtw?si=uUMa45obCYvlHniB" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
```

**Cleaned embed code**:
```html
<iframe style="width: 100%; height: 100%; border: none;" src="https://www.youtube.com/embed/zm3t7AZIHtw?si=uUMa45obCYvlHniB" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
```

**Result**: Video respects your custom 900px × 600px dimensions and aligns properly!
