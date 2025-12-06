import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Heart, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { initializeFaqInteractions } from '../../utils/faqInteractions';
import { initializeEmbedFullscreen } from '../../utils/embedFullscreen';
import ProjectNavButtons from './ProjectNavButtons';

export default function ProjectModal({ project, isLiked, onLike, onClose, onNavigate, currentIndex, totalProjects }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [imageOrientation, setImageOrientation] = useState('landscape'); // 'portrait' or 'landscape'
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const thumbnailContainerRef = useRef(null);

  // Prevent body scroll and hide header when modal is open
  useEffect(() => {
    console.log('Modal opened with project:', project);
    
    // Save current scroll position
    const scrollY = window.scrollY;
    
    // Lock body scroll by fixing position at current scroll
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const originalOverflow = document.body.style.overflow;
    
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    
    // Hide header
    const header = document.querySelector('header');
    const originalHeaderDisplay = header ? header.style.display : '';
    if (header) {
      header.style.display = 'none';
    }
    
    // Prevent embed clicks from closing modal (but allow fullscreen button)
    const handleEmbedClick = (e) => {
      // Allow fullscreen button clicks to pass through
      if (e.target.closest('.embed-fullscreen-btn')) {
        return;
      }
      
      // Check if click is on or inside an embed
      if (e.target.closest('.editor-embed-wrapper')) {
        e.stopPropagation();
      }
    };
    
    document.addEventListener('click', handleEmbedClick, true);
    
    return () => {
      // Restore body styles
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      document.body.style.overflow = originalOverflow;
      
      // Restore header
      if (header) {
        header.style.display = originalHeaderDisplay;
      }
      
      // Remove embed click handler
      document.removeEventListener('click', handleEmbedClick, true);
      
      // Restore scroll position
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    };
  }, [project]);

  // Attach copy handlers to code blocks and FAQ interactions in modal
  useEffect(() => {
    const attachCopyHandlers = () => {
      const codeBlocks = document.querySelectorAll('.project-modal .editor-code-block-wrapper');
      codeBlocks?.forEach(wrapper => {
        const copyBtn = wrapper.querySelector('.editor-code-copy');
        const codeElement = wrapper.querySelector('code');
        
        if (copyBtn && codeElement && !copyBtn.onclick) {
          const codeText = wrapper.getAttribute('data-code') || codeElement.textContent;
          copyBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigator.clipboard.writeText(codeText).then(() => {
              const originalHTML = copyBtn.innerHTML;
              copyBtn.innerHTML = 'Copied!';
              copyBtn.style.fontSize = '11px';
              setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.style.fontSize = '';
              }, 2000);
            }).catch(err => {
              console.error('Failed to copy:', err);
            });
          };
        }
      });
    };
    
    // Disable table editing in modal (read-only mode)
    const disableTableEditing = () => {
      const modalContent = document.querySelector('.project-modal');
      if (modalContent) {
        // Disable all table cells
        const tableCells = modalContent.querySelectorAll('.table-cell, td[contenteditable="true"]');
        tableCells.forEach(cell => {
          cell.contentEditable = 'false';
          cell.style.cursor = 'default';
        });
        
        // Disable all tables
        const tables = modalContent.querySelectorAll('table[contenteditable="true"]');
        tables.forEach(table => {
          table.contentEditable = 'false';
        });
        
        // Hide all table controls
        const tableControls = modalContent.querySelectorAll('.table-row-controls, .table-col-controls, .table-settings-btn');
        tableControls.forEach(control => {
          control.style.display = 'none';
        });
        
        // Remove hover effects on table wrappers
        const tableWrappers = modalContent.querySelectorAll('.editor-table-wrapper');
        tableWrappers.forEach(wrapper => {
          wrapper.style.outline = 'none';
        });
      }
    };
    
    // Initialize FAQ interactions
    const modalContent = document.querySelector('.project-modal');
    let cleanupFaq;
    let cleanupEmbeds;
    if (modalContent) {
      cleanupFaq = initializeFaqInteractions(modalContent);
      cleanupEmbeds = initializeEmbedFullscreen(modalContent);
    }
    
    // Attach after content is rendered
    const timer = setTimeout(() => {
      attachCopyHandlers();
      disableTableEditing();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (cleanupFaq) cleanupFaq();
      if (cleanupEmbeds) cleanupEmbeds();
    };
  }, [project]);

  // Handle custom audio player interactivity
  useEffect(() => {
    const formatTime = (seconds) => {
      if (isNaN(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const updatePlayerUI = (audio, player) => {
      const playIcon = player.querySelector('.play-icon');
      const pauseIcon = player.querySelector('.pause-icon');
      const progressFill = player.querySelector('.progress-fill');
      const currentTimeEl = player.querySelector('.current-time');
      const durationEl = player.querySelector('.duration');

      if (playIcon && pauseIcon) {
        if (audio.paused) {
          playIcon.style.display = 'flex';
          pauseIcon.style.display = 'none';
        } else {
          playIcon.style.display = 'none';
          pauseIcon.style.display = 'flex';
        }
      }

      if (progressFill && audio.duration) {
        const percentage = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${percentage}%`;
      }

      if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
      if (durationEl && audio.duration) durationEl.textContent = formatTime(audio.duration);
    };

    const players = document.querySelectorAll('.custom-audio-player');
    const handlers = [];

    players.forEach(player => {
      const audio = player.querySelector('.hidden-audio');
      const playPauseBtn = player.querySelector('.play-pause-btn');
      const skipBackBtn = player.querySelector('.skip-back-btn');
      const skipForwardBtn = player.querySelector('.skip-forward-btn');
      const progressContainer = player.querySelector('.progress-container');

      if (!audio) return;

      const handlePlayPause = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (audio.paused) {
          document.querySelectorAll('.custom-audio-player .hidden-audio').forEach(a => {
            if (a !== audio) a.pause();
          });
          audio.play();
        } else {
          audio.pause();
        }
      };

      const handleSkipBack = (e) => {
        e.preventDefault();
        e.stopPropagation();
        audio.currentTime = Math.max(0, audio.currentTime - 10);
      };

      const handleSkipForward = (e) => {
        e.preventDefault();
        e.stopPropagation();
        audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
      };

      const handleProgressClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = progressContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        if (audio.duration) {
          audio.currentTime = percentage * audio.duration;
        }
      };

      const handleTimeUpdate = () => updatePlayerUI(audio, player);
      const handleLoadedMetadata = () => updatePlayerUI(audio, player);
      const handlePlay = () => updatePlayerUI(audio, player);
      const handlePause = () => updatePlayerUI(audio, player);

      if (playPauseBtn) playPauseBtn.addEventListener('click', handlePlayPause);
      if (skipBackBtn) skipBackBtn.addEventListener('click', handleSkipBack);
      if (skipForwardBtn) skipForwardBtn.addEventListener('click', handleSkipForward);
      if (progressContainer) progressContainer.addEventListener('click', handleProgressClick);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);

      handlers.push({
        playPauseBtn, skipBackBtn, skipForwardBtn, progressContainer, audio,
        handlePlayPause, handleSkipBack, handleSkipForward, handleProgressClick,
        handleTimeUpdate, handleLoadedMetadata, handlePlay, handlePause
      });
    });

    return () => {
      handlers.forEach(h => {
        if (h.playPauseBtn) h.playPauseBtn.removeEventListener('click', h.handlePlayPause);
        if (h.skipBackBtn) h.skipBackBtn.removeEventListener('click', h.handleSkipBack);
        if (h.skipForwardBtn) h.skipForwardBtn.removeEventListener('click', h.handleSkipForward);
        if (h.progressContainer) h.progressContainer.removeEventListener('click', h.handleProgressClick);
        h.audio.removeEventListener('timeupdate', h.handleTimeUpdate);
        h.audio.removeEventListener('loadedmetadata', h.handleLoadedMetadata);
        h.audio.removeEventListener('play', h.handlePlay);
        h.audio.removeEventListener('pause', h.handlePause);
      });
    };
  }, [project]);

  // Handle drag-to-scroll for thumbnails
  useEffect(() => {
    const container = thumbnailContainerRef.current;
    if (!container) return;

    const handleMouseDown = (e) => {
      setIsDragging(true);
      setStartX(e.pageX - container.offsetLeft);
      setScrollLeft(container.scrollLeft);
      container.style.cursor = 'grabbing';
      container.style.userSelect = 'none';
    };

    const handleMouseLeave = () => {
      setIsDragging(false);
      container.style.cursor = 'grab';
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      container.style.cursor = 'grab';
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, startX, scrollLeft]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Infinite scroll for thumbnails
  const scrollThumbnails = (direction) => {
    if (!thumbnailContainerRef.current) return;
    
    const container = thumbnailContainerRef.current;
    const scrollAmount = 200;
    
    if (direction === 'left') {
      // If at the beginning, jump to the end
      if (container.scrollLeft <= 0) {
        container.scrollLeft = container.scrollWidth - container.clientWidth;
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    } else {
      // If at the end, jump to the beginning
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 1) {
        container.scrollLeft = 0;
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const nextImage = () => {
    setImageLoaded(false);
    setCurrentImageIndex((prev) => (prev + 1) % project.gallery.length);
  };

  const prevImage = () => {
    setImageLoaded(false);
    setCurrentImageIndex((prev) =>
      prev === 0 ? project.gallery.length - 1 : prev - 1
    );
  };

  const handleImageLoad = (e) => {
    const img = e.target;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    
    // Determine orientation based on aspect ratio
    if (aspectRatio > 1.2) {
      setImageOrientation('landscape');
    } else if (aspectRatio < 0.8) {
      setImageOrientation('portrait');
    } else {
      setImageOrientation('square');
    }
    
    setImageLoaded(true);
    console.log(`Image orientation: ${aspectRatio > 1.2 ? 'landscape' : aspectRatio < 0.8 ? 'portrait' : 'square'}, Aspect ratio: ${aspectRatio.toFixed(2)}`);
  };

  // Parse HTML content safely
  const createMarkup = (html) => {
    return { __html: html };
  };

  // Convert project details to display format
  const getProjectDetails = () => {
    // New format: array of {label, value}
    if (project.projectDetails && Array.isArray(project.projectDetails)) {
      return project.projectDetails;
    }
    
    // Old format: object with keys
    if (project.details) {
      return Object.entries(project.details).map(([key, value]) => ({
        label: key,
        value: value
      }));
    }
    
    // Legacy format: individual fields
    const legacyDetails = [];
    if (project.software) legacyDetails.push({ label: 'Software', value: project.software });
    if (project.timeframe) legacyDetails.push({ label: 'Timeframe', value: project.timeframe });
    if (project.dataSource) legacyDetails.push({ label: 'Data Source', value: project.dataSource });
    if (project.studyArea) legacyDetails.push({ label: 'Study Area', value: project.studyArea });
    
    return legacyDetails;
  };

  const projectDetails = getProjectDetails();
  
  // Determine grid columns based on number of details
  const getGridCols = (count) => {
    if (imageOrientation === 'portrait') return 'grid-cols-1';
    if (count <= 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  const modalContent = (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.90)',
        padding: '20px',
        overflowY: 'auto'
      }}
      onClick={handleClose}
    >
      {/* Modal Container */}
      <div
        className={`relative w-full bg-white rounded-2xl shadow-2xl transform transition-all duration-300 my-auto ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{
          maxWidth: '1200px',
          maxHeight: 'calc(100vh - 40px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-300 hover:scale-110"
          style={{ color: '#105652' }}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Scrollable Content */}
        <div 
          className="overflow-y-auto custom-scrollbar"
          style={{ maxHeight: 'calc(100vh - 40px)' }}
        >
          {/* Top Section - Gallery and Info - Adaptive Layout */}
          <div className={`grid grid-cols-1 gap-6 md:gap-12 p-4 md:p-8 ${
            imageOrientation === 'portrait' 
              ? 'lg:grid-cols-[400px_1fr]' 
              : imageOrientation === 'landscape'
              ? 'lg:grid-cols-[600px_1fr]'
              : 'lg:grid-cols-2'
          }`}>
            {/* Left - Gallery - Adaptive Height */}
            <div className="space-y-4 p-3 md:p-6 rounded-2xl" style={{
              backgroundColor: 'rgba(30, 132, 121, 0.08)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(30, 132, 121, 0.2)'
            }}>
              <div className={`relative rounded-xl overflow-hidden bg-gray-200 shadow-lg transition-all duration-300 border border-gray-300 ${
                imageOrientation === 'portrait' 
                  ? 'h-[350px] md:h-[500px]' 
                  : imageOrientation === 'landscape'
                  ? 'h-[250px] md:h-[350px]'
                  : 'h-64 md:h-80'
              }`}>
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#105652' }}></div>
                  </div>
                )}
                <img
                  src={project.gallery[currentImageIndex]}
                  alt={`${project.title} - Image ${currentImageIndex + 1}`}
                  className={`w-full h-full object-contain transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={handleImageLoad}
                />
                
                {/* Gallery Navigation */}
                {project.gallery.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-300"
                      style={{ color: '#105652' }}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-300"
                      style={{ color: '#105652' }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {project.gallery.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentImageIndex
                              ? 'bg-white w-8'
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery - Horizontal Slider with Arrows - Hidden on mobile */}
              {project.gallery.length > 1 && (
                <div className="relative group hidden md:block">
                  <div 
                    ref={thumbnailContainerRef}
                    className="overflow-x-auto scrollbar-hide scroll-smooth"
                    style={{ cursor: 'grab' }}
                  >
                    <div className="flex gap-2 pb-2">
                      {project.gallery.map((img, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            if (!isDragging) {
                              setCurrentImageIndex(index);
                            }
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          className={`relative h-20 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 ${
                            index === currentImageIndex
                              ? 'ring-4 ring-[#1E8479] scale-105'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                          style={{ width: 'calc(25% - 6px)', minWidth: '80px' }}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover pointer-events-none"
                            draggable="false"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Navigation Arrows - Show when more than 4 images */}
                  {project.gallery.length > 4 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollThumbnails('left');
                        }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                        style={{ color: '#105652' }}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollThumbnails('right');
                        }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                        style={{ color: '#105652' }}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Right - Project Info - Adaptive Layout */}
            <div className={`flex flex-col p-3 md:p-6 rounded-2xl ${
              imageOrientation === 'portrait' ? 'lg:space-y-8' : ''
            }`} style={{
              backgroundColor: 'rgba(30, 132, 121, 0.08)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(30, 132, 121, 0.2)'
            }}>
              <div className="space-y-4 md:space-y-6 flex-1">
                <div>
                  <h2
                    className={`font-bold mb-3 ${
                      imageOrientation === 'portrait' ? 'text-xl md:text-3xl' : 'text-2xl md:text-4xl'
                    }`}
                    style={{ color: '#105652' }}
                  >
                    {project.title}
                  </h2>
                  <p className={`text-gray-600 ${
                    imageOrientation === 'portrait' ? 'text-sm md:text-base' : 'text-sm md:text-lg'
                  }`}>{project.description}</p>
                </div>

                {/* Project Details - Premium Neumorphic Design - Dynamic Grid */}
                {projectDetails.length > 0 && (
                  <div className={`grid gap-2 md:gap-3 grid-cols-2 md:${getGridCols(projectDetails.length)}`}>
                    {projectDetails.map((detail, index) => (
                      <div
                        key={index}
                        className="relative overflow-hidden rounded-xl md:rounded-2xl p-2.5 md:p-3.5 transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          background: '#ffffff',
                          boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff',
                          animation: `slideInUp 0.4s ease-out ${index * 0.1}s both`
                        }}
                      >
                        {/* Content */}
                        <div className="relative z-10">
                          <p
                            className="text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 md:mb-1.5 truncate"
                            style={{ color: '#1E8479' }}
                          >
                            {detail.label}
                          </p>
                          <p className="text-xs md:text-sm font-semibold text-gray-800 leading-snug break-words">
                            {detail.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons - Aligned to bottom in landscape mode with 4+ fields */}
              <div className={`flex gap-3 ${
                imageOrientation === 'landscape' && projectDetails.length >= 4 
                  ? 'mt-6' 
                  : 'mt-6'
              }`}>
                <button
                  onClick={() => onLike(project.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:scale-105 shadow-md ${
                    isLiked
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`}
                  />
                  <span>
                    {isLiked ? 'Liked' : 'Like'} ({project.likes})
                  </span>
                </button>

                <a
                  href={project.projectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white transition-all duration-300 hover:scale-105 shadow-md"
                  style={{ backgroundColor: '#105652' }}
                >
                  <span>View Project</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Full Description Section */}
          <div className="px-4 md:px-8 pb-8" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
            <style>{`
              .project-content ul {
                list-style-type: disc;
                padding-left: 2rem;
                margin: 1rem 0;
              }
              .project-content ol {
                list-style-type: decimal;
                padding-left: 2rem;
                margin: 1rem 0;
              }
              .project-content li {
                margin: 0.5rem 0;
                color: #4a5568;
                line-height: 1.8;
              }
              .project-content img {
                max-width: 100%;
                height: auto;
              }
              .project-content blockquote {
                border-left: 4px solid #1E8479;
                padding-left: 1.5rem;
                margin: 1rem 0;
                font-style: italic;
                color: #2d3748;
                font-size: 1.25rem;
                background: #FFFAEB;
                padding: 1.5rem;
                border-radius: 0.5rem;
              }
              .project-content > div:has(> blockquote) {
                overflow: auto;
              }
              .project-content p,
              .project-content h1,
              .project-content h2,
              .project-content h3,
              .project-content h4,
              .project-content h5,
              .project-content h6,
              .project-content pre,
              .project-content blockquote,
              .project-content .editor-quoteblock-wrapper {
                clear: none;
              }
              .project-content a.editor-link {
                color: #1E8479;
                text-decoration: underline;
                cursor: pointer;
                transition: all 0.2s;
              }
              .project-content a.editor-link:hover {
                color: #105652;
                background-color: #f0fdfa;
              }
              .project-content .project-nav-buttons-wrapper {
                display: none !important;
              }
              .project-content .editor-project-nav-wrapper {
                display: none !important;
              }
            `}</style>
            <div
              className="project-content project-modal"
              style={{ 
                fontSize: '1.125rem',
                lineHeight: '1.75',
                color: '#374151',
                maxWidth: '100%'
              }}
              dangerouslySetInnerHTML={createMarkup(project.fullDescription)}
            />
            
            {/* Project Navigation Buttons - Only show if navigation is available */}
            {onNavigate && totalProjects > 1 && (
              <ProjectNavButtons
                onPrevious={() => onNavigate('prev')}
                onNext={() => onNavigate('next')}
                hasPrevious={currentIndex > 0}
                hasNext={currentIndex < totalProjects - 1}
              />
            )}
          </div>
        </div>
      </div>

    </div>
  );

  // Use portal to render modal at document root level
  return createPortal(modalContent, document.body);
}
