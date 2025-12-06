// Utility to add fullscreen functionality to embeds in rendered content

export const initializeEmbedFullscreen = (containerElement) => {
  if (!containerElement) return () => {};

  // Add fullscreen buttons to all embeds
  const embeds = containerElement.querySelectorAll('.editor-embed-wrapper');
  
  embeds.forEach(embed => {
    // Skip if button already exists
    if (embed.querySelector('.embed-fullscreen-btn')) {
      console.log('Fullscreen button already exists for embed');
      return;
    }
    
    const embedCode = embed.getAttribute('data-embed-code');
    if (!embedCode) {
      console.log('Embed missing data-embed-code attribute');
      return;
    }
    
    console.log('Creating fullscreen button for embed');
    
    // Create fullscreen button
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.className = 'embed-fullscreen-btn';
    fullscreenBtn.type = 'button';
    fullscreenBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>';
    fullscreenBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(16, 86, 82, 0.9);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px;
      cursor: pointer;
      opacity: 1;
      transition: all 0.2s ease;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      pointer-events: auto;
    `;
    fullscreenBtn.title = 'Fullscreen';
    
    // Add hover effect
    embed.addEventListener('mouseenter', () => {
      fullscreenBtn.style.opacity = '1';
      fullscreenBtn.style.background = 'rgba(16, 86, 82, 1)';
    });
    
    embed.addEventListener('mouseleave', () => {
      fullscreenBtn.style.opacity = '1';
      fullscreenBtn.style.background = 'rgba(16, 86, 82, 0.9)';
    });
    
    fullscreenBtn.addEventListener('mouseenter', () => {
      fullscreenBtn.style.background = 'rgba(16, 86, 82, 1)';
      fullscreenBtn.style.transform = 'scale(1.05)';
    });
    
    fullscreenBtn.addEventListener('mouseleave', () => {
      fullscreenBtn.style.background = 'rgba(16, 86, 82, 0.9)';
      fullscreenBtn.style.transform = 'scale(1)';
    });
    
    // Handle fullscreen click
    fullscreenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      console.log('Fullscreen button clicked!', embedCode);
      openFullscreenEmbed(embedCode);
    });
    
    embed.appendChild(fullscreenBtn);
  });
  
  // Cleanup function
  return () => {
    embeds.forEach(embed => {
      const btn = embed.querySelector('.embed-fullscreen-btn');
      if (btn) btn.remove();
    });
  };
};

// Open fullscreen embed modal
const openFullscreenEmbed = (embedCode) => {
  // Create fullscreen modal
  const modal = document.createElement('div');
  modal.className = 'embed-fullscreen-modal';
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 99999;
    background: black;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
  `;
  
  // Create close button with higher visibility
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  closeBtn.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2147483647;
    padding: 16px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.95);
    color: #000;
    border: 2px solid rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    pointer-events: auto;
  `;
  closeBtn.title = 'Exit Fullscreen (ESC)';
  
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = 'rgba(255, 255, 255, 1)';
    closeBtn.style.transform = 'scale(1.1)';
    closeBtn.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
  });
  
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'rgba(255, 255, 255, 0.95)';
    closeBtn.style.transform = 'scale(1)';
    closeBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
  });
  
  // Create embed container
  const embedContainer = document.createElement('div');
  embedContainer.style.cssText = `
    width: 100%;
    height: 100%;
    max-width: 100vw;
    max-height: 100vh;
  `;
  
  // Process embed code to make it fullscreen
  const processedEmbedCode = embedCode
    .replace(/width\s*=\s*["'][^"']*["']/gi, 'width="100%"')
    .replace(/height\s*=\s*["'][^"']*["']/gi, 'height="100%"')
    .replace(/<iframe/gi, '<iframe style="width:100%;height:100%;border:none;"');
  
  embedContainer.innerHTML = processedEmbedCode;
  
  // Prevent clicks on embed from closing modal
  embedContainer.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Close modal function
  const closeModal = () => {
    // Exit browser fullscreen if active
    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
    }
    
    document.body.style.overflow = '';
    modal.remove();
    document.removeEventListener('keydown', handleEscKey);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
  };
  
  // Handle ESC key
  const handleEscKey = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };
  
  // Handle fullscreen change (when user exits fullscreen via browser controls)
  const handleFullscreenChange = () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement) {
      closeModal();
    }
  };
  
  // Close on background click
  modal.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal();
  });
  
  // Add ESC key listener
  document.addEventListener('keydown', handleEscKey);
  
  // Add fullscreen change listeners
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
  
  // Assemble and append modal
  modal.appendChild(closeBtn);
  modal.appendChild(embedContainer);
  document.body.appendChild(modal);
  
  // Enter browser fullscreen mode (like YouTube)
  setTimeout(() => {
    if (modal.requestFullscreen) {
      modal.requestFullscreen().catch(err => {
        console.log('Fullscreen request failed:', err);
      });
    } else if (modal.webkitRequestFullscreen) {
      modal.webkitRequestFullscreen();
    } else if (modal.mozRequestFullScreen) {
      modal.mozRequestFullScreen();
    }
  }, 100);
};
