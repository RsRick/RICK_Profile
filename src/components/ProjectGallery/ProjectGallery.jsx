import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ExternalLink, ArrowRight } from 'lucide-react';
import { databaseService } from '../../lib/appwrite';

const GALLERIES_COLLECTION = 'gallery_carousels';

// Single Carousel with TRUE Continuous Infinite Loop
function InfiniteCarousel({ gallery }) {
  const trackRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const animationRef = useRef(null);
  const positionRef = useRef(0);

  const originalImages = gallery.images || [];
  const imageCount = originalImages.length;
  
  if (imageCount === 0) return null;

  // Multiply images 10 times to create a very long track
  const multiplier = 10;
  const repeatedImages = [];
  for (let i = 0; i < multiplier; i++) {
    repeatedImages.push(...originalImages);
  }
  
  const scrollInterval = gallery.scrollInterval || 3000;
  const imageWidthPercent = 20; // 5 images visible
  const totalImages = imageCount * multiplier;
  const singleImageWidth = 100 / 5; // Each image is 20% of viewport

  // Continuous smooth animation using requestAnimationFrame
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let lastTime = Date.now();
    const pixelsPerSecond = (singleImageWidth / (scrollInterval * 2)) * 1000; // Speed calculation (2x slower)

    const animate = () => {
      if (!isHovered) {
        const now = Date.now();
        const delta = now - lastTime;
        lastTime = now;

        // Move forward continuously
        positionRef.current += (pixelsPerSecond * delta) / 1000;

        // When we've scrolled through half the images, seamlessly loop back
        const halfwayPoint = (totalImages / 2) * singleImageWidth;
        if (positionRef.current >= halfwayPoint) {
          positionRef.current = positionRef.current - halfwayPoint;
        }

        track.style.transform = `translateX(-${positionRef.current}%)`;
      } else {
        lastTime = Date.now();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovered, singleImageWidth, scrollInterval, totalImages]);

  const getLabelStyle = (design) => {
    // Position: bottom-[5%] leaves 5% free space below the label
    const baseStyle = "absolute bottom-[5%] left-1/2 -translate-x-1/2 px-4 py-2 text-center max-w-[85%] font-bold z-10";
    switch (design) {
      case 'vintage-paper':
        return `${baseStyle} bg-[#f5f0e1] text-[#2d8a8a] italic shadow-lg rotate-[-1deg] rounded-sm text-xs`;
      case 'tape-label':
        return `${baseStyle} bg-[#f8f4e8] text-[#2d8a8a] italic shadow-lg skew-x-[-2deg] text-xs`;
      case 'ribbon':
        return `${baseStyle} bg-white/95 text-gray-800 italic shadow-lg rounded text-xs`;
      case 'neon-glow':
        return `${baseStyle} bg-black/90 text-[#00ff88] rounded text-xs shadow-[0_0_10px_#00ff88,0_0_20px_#00ff88] border border-[#00ff88]`;
      case 'retro-badge':
        return `${baseStyle} bg-[#d4a574] text-[#3d2914] rounded-lg border-2 border-[#3d2914] text-xs uppercase tracking-wider`;
      case 'glass-card':
        return `${baseStyle} bg-white/20 backdrop-blur-md text-white rounded-lg border border-white/30 text-xs`;
      case 'chalk-board':
        return `${baseStyle} bg-[#2a3d2a] text-[#e8e8e8] rounded border border-[#e8e8e8]/50 text-xs tracking-wide`;
      case 'polaroid':
        return `${baseStyle} bg-white text-gray-700 shadow-xl rounded-sm pb-4 text-xs`;
      case 'stamp':
        return `${baseStyle} bg-white/90 text-red-600 border-2 border-red-600 border-dashed rounded text-xs uppercase rotate-[-3deg]`;
      case 'typewriter':
        return `${baseStyle} bg-[#f9f6f0] text-gray-800 font-mono rounded-sm shadow text-xs tracking-widest`;
      case 'cinema':
        return `${baseStyle} bg-black text-[#ffd700] border-y-2 border-[#ffd700] text-xs uppercase tracking-[0.2em]`;
      case 'wooden':
        return `${baseStyle} bg-gradient-to-b from-[#8b5a2b] to-[#6b4423] text-[#f5deb3] rounded shadow-lg text-xs border border-[#5a3d1a]`;
      case 'neon-pink':
        return `${baseStyle} bg-black/90 text-[#ff1493] rounded text-xs shadow-[0_0_10px_#ff1493,0_0_20px_#ff1493] border border-[#ff1493]`;
      case 'newspaper':
        return `${baseStyle} bg-[#f5f5dc] text-gray-900 font-serif rounded-sm text-xs border border-gray-400`;
      case 'gradient-modern':
        return `${baseStyle} bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs shadow-lg`;
      default:
        return `${baseStyle} bg-[#f5f0e1] text-[#2d8a8a] italic shadow-lg rounded-sm text-xs`;
    }
  };

  return (
    <div className="mb-8">
      {/* Gallery Header */}
      <div className="flex items-center justify-between mb-3 px-2">
        <h3 className="text-base md:text-lg font-bold" style={{ color: '#105652' }}>
          {gallery.title}
        </h3>
        {gallery.eventLink && (
          <a
            href={gallery.eventLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 text-white text-xs font-medium rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#105652' }}
          >
            Event Link
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Carousel Container */}
      <div 
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Images Track - Continuous scroll */}
        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex"
            style={{ willChange: 'transform' }}
          >
            {repeatedImages.map((img, idx) => (
              <div
                key={`${img.id || idx}-${idx}`}
                className="flex-shrink-0 px-1 w-[45%] md:w-[20%]"
              >
                <div 
                  className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 bg-gray-100 min-h-[100px] md:min-h-[150px]" 
                  style={{ borderColor: '#105652' }}
                >
                  <img
                    src={img.url}
                    alt={img.title || `Image ${idx + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  {img.title && (
                    <div className={getLabelStyle(gallery.labelDesign || 'ribbon')}>
                      <span style={{ fontSize: gallery.titleFontSize || '10px' }}>
                        {img.title}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hover indicator */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-xs bg-black/50 px-2 py-1 rounded">
            Hover to pause
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Project Gallery Component
export default function ProjectGallery() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGalleries();
  }, []);

  const loadGalleries = async () => {
    try {
      const result = await databaseService.listDocuments(
        GALLERIES_COLLECTION
      );
      if (result.success && result.data?.documents) {
        const featured = result.data.documents
          .filter(g => g.featured)
          .map(g => ({
            ...g,
            images: typeof g.images === 'string' ? JSON.parse(g.images || '[]') : (g.images || [])
          }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setGalleries(featured);
      }
    } catch (error) {
      console.error('Error loading galleries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (galleries.length === 0) return null;

  return (
    <section 
      id="project-gallery" 
      className="py-10 relative overflow-hidden"
      style={{ 
        background: '#FFFAEB',
        backgroundImage: `linear-gradient(rgba(16, 86, 82, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 86, 82, 0.03) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }}
    >
      <div className="container mx-auto px-4">
        {galleries.map((gallery) => (
          <InfiniteCarousel key={gallery.$id} gallery={gallery} />
        ))}

        <div className="text-center mt-4">
          <Link
            to="/project-gallery"
            className="inline-flex items-center gap-2 px-5 py-2 text-white text-sm font-medium rounded-full transition-all hover:scale-105 hover:opacity-90"
            style={{ backgroundColor: '#105652' }}
          >
            View All Galleries
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
