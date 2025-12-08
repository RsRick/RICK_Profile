import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ExternalLink, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { databaseService } from '../lib/appwrite';
import { initializeFaqInteractions } from '../utils/faqInteractions';
import { initializeEmbedFullscreen } from '../utils/embedFullscreen';

const PROJECTS_COLLECTION = 'projects';

export default function ProjectPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageOrientation, setImageOrientation] = useState('landscape');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const thumbnailContainerRef = React.useRef(null);

  useEffect(() => {
    loadProject();
  }, [slug]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const result = await databaseService.listDocuments(PROJECTS_COLLECTION);
      
      if (result.success) {
        // Find project by custom slug
        const foundProject = result.data.documents.find(p => p.customSlug === slug);
        
        if (foundProject) {
          setProject(foundProject);
        } else {
          // Project not found
          setProject(null);
        }
      }
    } catch (error) {
      console.error('Error loading project:', error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  // Initialize FAQ and Embed interactions
  useEffect(() => {
    if (!project) return;

    const contentElement = document.querySelector('.project-page-content');
    let cleanupFaq;
    let cleanupEmbeds;
    
    if (contentElement) {
      cleanupFaq = initializeFaqInteractions(contentElement);
      cleanupEmbeds = initializeEmbedFullscreen(contentElement);
    }

    return () => {
      if (cleanupFaq) cleanupFaq();
      if (cleanupEmbeds) cleanupEmbeds();
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

  const nextImage = () => {
    setImageLoaded(false);
    setCurrentImageIndex((prev) => (prev + 1) % project.galleryUrls.length);
  };

  const prevImage = () => {
    setImageLoaded(false);
    setCurrentImageIndex((prev) =>
      prev === 0 ? project.galleryUrls.length - 1 : prev - 1
    );
  };

  const handleImageLoad = (e) => {
    const img = e.target;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    
    if (aspectRatio > 1.2) {
      setImageOrientation('landscape');
    } else if (aspectRatio < 0.8) {
      setImageOrientation('portrait');
    } else {
      setImageOrientation('square');
    }
    
    setImageLoaded(true);
  };

  const createMarkup = (html) => {
    return { __html: html };
  };

  const getProjectDetails = () => {
    if (project.projectDetails && Array.isArray(project.projectDetails)) {
      return project.projectDetails.map(jsonStr => {
        try {
          return JSON.parse(jsonStr);
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
    }
    return [];
  };

  const getGridCols = (count) => {
    if (imageOrientation === 'portrait') return 'grid-cols-1';
    if (count <= 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#2596be' }}></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#2596be' }}>Project Not Found</h1>
          <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: '#2596be' }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const projectDetails = getProjectDetails();
  const gallery = project.galleryUrls || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Portfolio</span>
          </Link>
          <span className="text-sm text-gray-500">Project Page</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Top Section - Gallery and Info */}
          <div className={`grid grid-cols-1 gap-12 p-8 ${
            imageOrientation === 'portrait' 
              ? 'lg:grid-cols-[400px_1fr]' 
              : imageOrientation === 'landscape'
              ? 'lg:grid-cols-[600px_1fr]'
              : 'lg:grid-cols-2'
          }`}>
            {/* Left - Gallery */}
            {gallery.length > 0 && (
              <div className="space-y-4 p-6 rounded-2xl" style={{
                backgroundColor: 'rgba(30, 132, 121, 0.08)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(30, 132, 121, 0.2)'
              }}>
                <div className={`relative rounded-xl overflow-hidden bg-gray-200 shadow-lg transition-all duration-300 border border-gray-300 ${
                  imageOrientation === 'portrait' 
                    ? 'h-[500px]' 
                    : imageOrientation === 'landscape'
                    ? 'h-[350px]'
                    : 'h-80'
                }`}>
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#2596be' }}></div>
                    </div>
                  )}
                  <img
                    src={gallery[currentImageIndex]}
                    alt={`${project.title} - Image ${currentImageIndex + 1}`}
                    className={`w-full h-full object-contain transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={handleImageLoad}
                  />
                  
                  {gallery.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-300"
                        style={{ color: '#2596be' }}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-300"
                        style={{ color: '#2596be' }}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {gallery.map((_, index) => (
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

                {gallery.length > 1 && (
                  <div className="relative group">
                    <div 
                      ref={thumbnailContainerRef}
                      className="overflow-x-auto scrollbar-hide scroll-smooth"
                      style={{ cursor: 'grab' }}
                    >
                      <div className="flex gap-2 pb-2">
                        {gallery.map((img, index) => (
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
                                ? 'ring-4 ring-[#3ba8d1] scale-105'
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
                  </div>
                )}
              </div>
            )}

            {/* Right - Project Info */}
            <div className="flex flex-col p-6 rounded-2xl" style={{
              backgroundColor: 'rgba(30, 132, 121, 0.08)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(30, 132, 121, 0.2)'
            }}>
              <div className="space-y-6 flex-1">
                <div>
                  <h1
                    className={`font-bold mb-3 ${
                      imageOrientation === 'portrait' ? 'text-3xl' : 'text-4xl'
                    }`}
                    style={{ color: '#2596be' }}
                  >
                    {project.title}
                  </h1>
                  <p className={`text-gray-600 ${
                    imageOrientation === 'portrait' ? 'text-base' : 'text-lg'
                  }`}>{project.description}</p>
                </div>

                {projectDetails.length > 0 && (
                  <div className={`grid gap-3 ${getGridCols(projectDetails.length)}`}>
                    {projectDetails.map((detail, index) => (
                      <div
                        key={index}
                        className="relative overflow-hidden rounded-2xl p-3.5 transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          background: '#ffffff',
                          boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff',
                        }}
                      >
                        <div className="relative z-10">
                          <p
                            className="text-xs font-bold uppercase tracking-wider mb-1.5"
                            style={{ color: '#3ba8d1' }}
                          >
                            {detail.label}
                          </p>
                          <p className="text-sm font-semibold text-gray-800 leading-snug">
                            {detail.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <a
                  href={project.projectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white transition-all duration-300 hover:scale-105 shadow-md"
                  style={{ backgroundColor: '#2596be' }}
                >
                  <span>View Project</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Full Description Section */}
          <div className="px-8 pb-8" style={{ maxWidth: '100%' }}>
            <style>{`
              .project-page-content ul {
                list-style-type: disc;
                padding-left: 2rem;
                margin: 1rem 0;
              }
              .project-page-content ol {
                list-style-type: decimal;
                padding-left: 2rem;
                margin: 1rem 0;
              }
              .project-page-content li {
                margin: 0.5rem 0;
                color: #4a5568;
                line-height: 1.8;
              }
              .project-page-content img {
                max-width: 100%;
                height: auto;
              }
              .project-page-content blockquote {
                border-left: 4px solid #3ba8d1;
                padding-left: 1.5rem;
                margin: 1rem 0;
                font-style: italic;
                color: #2d3748;
                font-size: 1.25rem;
                background: #FFFAEB;
                padding: 1.5rem;
                border-radius: 0.5rem;
              }
              .project-page-content a.editor-link {
                color: #3ba8d1;
                text-decoration: underline;
                cursor: pointer;
                transition: all 0.2s;
              }
              .project-page-content a.editor-link:hover {
                color: #2596be;
                background-color: #f0fdfa;
              }
            `}</style>
            <div
              className="project-page-content"
              style={{ 
                fontSize: '1.125rem',
                lineHeight: '1.75',
                color: '#374151',
                maxWidth: '100%'
              }}
              dangerouslySetInnerHTML={createMarkup(project.fullDescription)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}


