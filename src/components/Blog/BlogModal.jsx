import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Calendar, ExternalLink } from 'lucide-react';
import DOMPurify from 'dompurify';

export default function BlogModal({ blog, onClose, onNavigate, currentIndex, totalBlogs }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Save scroll position and lock body
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    
    // Hide header
    const header = document.querySelector('header');
    const originalDisplay = header?.style.display;
    if (header) header.style.display = 'none';
    
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (header) header.style.display = originalDisplay || '';
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate('prev');
      if (e.key === 'ArrowRight' && currentIndex < totalBlogs - 1) onNavigate('next');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalBlogs, onNavigate]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const sanitizedHTML = DOMPurify.sanitize(blog.fullDescription || '', {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
  });

  const modalContent = (
    <div 
      className={`fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center p-5 transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ zIndex: 9999, backgroundColor: 'rgba(0, 0, 0, 0.90)' }}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-2xl max-w-5xl w-full shadow-2xl relative transform transition-all duration-300 my-auto ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{ maxHeight: 'calc(100vh - 40px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          style={{ color: '#105652' }}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 40px)' }}>
          {/* Top Section - Gallery and Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 p-4 md:p-8">
            {/* Left - Gallery */}
            {blog.gallery && blog.gallery.length > 0 && (
              <div className="space-y-4 p-3 md:p-6 rounded-2xl" style={{
                backgroundColor: 'rgba(30, 132, 121, 0.08)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(30, 132, 121, 0.2)'
              }}>
                <div className="relative rounded-xl overflow-hidden bg-gray-200 shadow-lg h-[250px] md:h-[350px]">
                  <img
                    src={blog.gallery[currentImageIndex]}
                    alt={blog.title}
                    className="w-full h-full object-contain"
                  />
                  
                  {blog.gallery.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? blog.gallery.length - 1 : prev - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                        style={{ color: '#105652' }}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev === blog.gallery.length - 1 ? 0 : prev + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                        style={{ color: '#105652' }}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      
                      {/* Image Indicators */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {blog.gallery.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {blog.gallery.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {blog.gallery.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                          index === currentImageIndex
                            ? 'ring-3 ring-[#1E8479] scale-105'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Right - Blog Info */}
            <div className="flex flex-col p-3 md:p-6 rounded-2xl" style={{
              backgroundColor: 'rgba(30, 132, 121, 0.08)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(30, 132, 121, 0.2)'
            }}>
              {/* Category Badge */}
              <span
                className="inline-flex self-start px-3 py-1 rounded-full text-xs font-bold text-white mb-3"
                style={{ backgroundColor: '#105652' }}
              >
                {blog.category}
              </span>

              {/* Title */}
              <h2 className="text-xl md:text-3xl font-bold mb-4" style={{ color: '#105652' }}>
                {blog.title}
              </h2>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {/* Authors */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center -space-x-2">
                    {blog.authorImages && blog.authorImages.length > 0 ? (
                      blog.authorImages.map((imgUrl, index) => (
                        <img
                          key={index}
                          src={imgUrl}
                          alt={blog.authorNames?.[index] || 'Author'}
                          className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-md"
                          title={blog.authorNames?.[index] || 'Author'}
                        />
                      ))
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#105652] flex items-center justify-center border-2 border-white">
                        <span className="text-white font-bold text-sm">
                          {blog.authorNames?.[0]?.charAt(0) || 'A'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      {blog.authorNames && blog.authorNames.length > 0 
                        ? blog.authorNames.join(', ') 
                        : 'Anonymous'}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{formatDate(blog.publishDate)}</span>
                </div>
              </div>

              {/* Navigation & Share */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200">
                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    onClick={() => onNavigate('prev')}
                    disabled={currentIndex === 0}
                    className="p-1.5 md:p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                  </button>
                  <span className="text-xs md:text-sm text-gray-400 min-w-[40px] text-center">{currentIndex + 1}/{totalBlogs}</span>
                  <button
                    onClick={() => onNavigate('next')}
                    disabled={currentIndex >= totalBlogs - 1}
                    className="p-1.5 md:p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                  </button>
                </div>
                
                {blog.customSlug && (
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}${blog.useProjectPrefix ? '/blog/' : '/'}${blog.customSlug}`;
                      navigator.clipboard.writeText(url);
                      alert('Link copied!');
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:scale-105"
                    style={{ backgroundColor: '#105652' }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Share
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Full Description Section */}
          <div className="px-4 md:px-8 pb-8">
            <div 
              className="prose prose-lg max-w-none blog-content"
              dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document root level
  return createPortal(modalContent, document.body);
}
