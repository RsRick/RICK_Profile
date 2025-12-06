# Video Feature Complete Rewrite Plan

## Current Issues
1. Floating controls not appearing on page reload
2. Controls being saved to database (shouldn't be)
3. Complex alignment wrapper causing issues
4. Too many moving parts (useEffect, MutationObserver, event handlers)

## Recommended Solution: CSS-Based Controls

### Approach
Use CSS `:hover` pseudo-class instead of JavaScript for showing/hiding controls. This is:
- ✅ More reliable
- ✅ Always works (no JS attachment needed)
- ✅ Simpler code
- ✅ Better performance

### Implementation Steps

#### 1. Add CSS to Style Tag
```css
.editor-video-wrapper {
  position: relative;
  display: inline-block;
  margin: 1rem 0;
}

.editor-video-wrapper.align-left {
  margin-left: 0;
  margin-right: auto;
}

.editor-video-wrapper.align-center {
  margin-left: auto;
  margin-right: auto;
}

.editor-video-wrapper.align-right {
  margin-left: auto;
  margin-right: 0;
}

.video-controls-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
}

.editor-video-wrapper:hover .video-controls-overlay {
  opacity: 1;
}

.video-control-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  transition: transform 0.2s;
}

.video-control-btn:hover {
  transform: scale(1.1);
}

.video-edit-btn {
  background: #16a34a;
  color: white;
}

.video-delete-btn {
  background: #dc2626;
  color: white;
}
```

#### 2. Simplified Video HTML Structure
```html
<div class="editor-video-wrapper align-center" 
     data-video-id="unique-id"
     data-mode="embed"
     data-width="900px"
     data-height="600px"
     style="width: 900px; height: 600px;">
  
  <div class="video-content" style="width: 100%; height: 100%;">
    <iframe src="..." style="width: 100%; height: 100%; border: none;"></iframe>
  </div>
  
  <div class="video-controls-overlay">
    <button class="video-control-btn video-edit-btn" data-action="edit">
      ⚙️
    </button>
    <button class="video-control-btn video-delete-btn" data-action="delete">
      🗑️
    </button>
  </div>
</div>
```

#### 3. Event Delegation (One Listener for All Videos)
```javascript
// Single click handler for all video controls
editorRef.current.addEventListener('click', (e) => {
  const btn = e.target.closest('.video-control-btn');
  if (!btn) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  const wrapper = btn.closest('.editor-video-wrapper');
  const action = btn.dataset.action;
  
  if (action === 'edit') {
    handleEditVideo(wrapper);
  } else if (action === 'delete') {
    if (confirm('Delete video?')) {
      wrapper.remove();
      updateContent();
    }
  }
});
```

#### 4. Render Video Function
```javascript
const renderVideo = (data) => {
  const { mode, videoUrl, embedCode, width, height, alignment } = data;
  
  // Clean embed code
  let cleanCode = embedCode;
  if (mode === 'embed') {
    cleanCode = embedCode
      .replace(/\s+width\s*=\s*["'][^"']*["']/gi, '')
      .replace(/\s+height\s*=\s*["'][^"']*["']/gi, '')
      .replace(/<iframe/gi, '<iframe style="width:100%;height:100%;border:none;"');
  }
  
  const alignClass = `align-${alignment || 'center'}`;
  const videoId = 'video-' + Date.now();
  
  return `
    <div class="editor-video-wrapper ${alignClass}" 
         data-video-id="${videoId}"
         data-mode="${mode}"
         data-video-url="${videoUrl || ''}"
         data-embed-code="${encodeURIComponent(embedCode || '')}"
         data-width="${width}"
         data-height="${height}"
         data-alignment="${alignment}"
         style="width: ${width}; height: ${height};">
      
      <div class="video-content" style="width: 100%; height: 100%;">
        ${mode === 'embed' ? cleanCode : `
          <video src="${videoUrl}" controls style="width:100%;height:100%;">
          </video>
        `}
      </div>
      
      <div class="video-controls-overlay">
        <button class="video-control-btn video-edit-btn" data-action="edit" type="button">
          ⚙️
        </button>
        <button class="video-control-btn video-delete-btn" data-action="delete" type="button">
          🗑️
        </button>
      </div>
    </div>
  `;
};
```

## Benefits of This Approach

1. **CSS handles visibility** - No JavaScript needed for hover
2. **Controls always in HTML** - No dynamic addition needed
3. **Event delegation** - One listener for all videos
4. **Simpler alignment** - Just CSS classes
5. **Always works on reload** - Controls are part of saved HTML
6. **No MutationObserver needed** - Controls are always there
7. **No useEffect complexity** - Just one click listener

## Migration Steps

1. Remove all existing video useEffect code
2. Remove floating controls generation code
3. Add CSS to style tag
4. Update renderVideo function
5. Add single event delegation listener
6. Test thoroughly

Would you like me to implement this complete rewrite?
