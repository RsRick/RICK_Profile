// Add this CSS to the style tag in RichTextEditor
const videoCSS = `
.editor-video-player {
  position: relative !important;
}

.editor-video-player .video-floating-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 20;
  pointer-events: none;
}

.editor-video-player:hover .video-floating-controls {
  opacity: 1 !important;
}

.video-floating-controls button {
  pointer-events: auto;
  background: rgba(22, 163, 74, 0.95);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  transition: all 0.2s;
}

.video-floating-controls .delete-btn {
  background: rgba(220, 38, 38, 0.95);
}

.video-floating-controls button:hover {
  transform: scale(1.1);
}
`;

// Simplified addVideoControls function
const addVideoControls = () => {
  const videos = document.querySelectorAll('.editor-video-player');
  
  videos.forEach(wrapper => {
    // Remove any existing controls first
    const existing = wrapper.querySelector('.video-floating-controls');
    if (existing) existing.remove();
    
    // Create controls HTML
    const controls = document.createElement('div');
    controls.className = 'video-floating-controls';
    controls.innerHTML = `
      <button class="edit-btn" title="Edit Video" onclick="handleVideoEdit(this)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m6-12h-6m-6 0H1m17 6h6m-6 6h6"></path>
        </svg>
      </button>
      <button class="delete-btn" title="Delete Video" onclick="handleVideoDelete(this)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    `;
    
    wrapper.appendChild(controls);
  });
};

// Call on load and after any content change
window.addEventListener('load', addVideoControls);
// Use MutationObserver for dynamic content
const observer = new MutationObserver(addVideoControls);
observer.observe(document.querySelector('.rich-text-editor'), {
  childList: true,
  subtree: true
});
