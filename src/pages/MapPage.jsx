import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Share2, X, Maximize2 } from 'lucide-react';
import { databaseService } from '../lib/appwrite';
import Header from '../components/Header/Header';
import { Query } from 'appwrite';

const MAPS_COLLECTION = 'spatial_maps';
const MAP_CATEGORIES_COLLECTION = 'map_categories';

export default function MapPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryColor, setCategoryColor] = useState('#2596be');
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [viewportPosition, setViewportPosition] = useState({ top: 0, height: 100 });
  const mainImageRef = useRef(null);

  useEffect(() => {
    loadMap();
    window.scrollTo(0, 0);
  }, [slug]);

  // Track scroll position relative to main map image
  useEffect(() => {
    const handleScroll = () => {
      if (!mainImageRef.current) return;
      
      const imageRect = mainImageRef.current.getBoundingClientRect();
      const imageTop = mainImageRef.current.offsetTop;
      const imageHeight = imageRect.height;
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      
      // Calculate what portion of the image is visible
      const imageVisibleTop = Math.max(0, scrollY - imageTop + 80); // 80px for header
      const imageVisibleBottom = Math.min(imageHeight, scrollY + viewportHeight - imageTop);
      
      // Convert to percentage
      const topPercent = Math.max(0, Math.min(100, (imageVisibleTop / imageHeight) * 100));
      const heightPercent = Math.max(5, Math.min(100 - topPercent, ((imageVisibleBottom - imageVisibleTop) / imageHeight) * 100));
      
      setViewportPosition({ top: topPercent, height: heightPercent });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [map]);

  const loadMap = async () => {
    try {
      setLoading(true);
      
      const result = await databaseService.listDocuments(
        MAPS_COLLECTION,
        [Query.equal('slug', slug)]
      );

      if (result.success && result.data.documents.length > 0) {
        const mapData = result.data.documents[0];
        setMap(mapData);
        
        if (mapData.category) {
          const catResult = await databaseService.listDocuments(
            MAP_CATEGORIES_COLLECTION,
            [Query.equal('name', mapData.category)]
          );
          if (catResult.success && catResult.data.documents.length > 0) {
            setCategoryColor(catResult.data.documents[0].color || '#2596be');
          }
        }
      } else {
        navigate('/spatial-canvas');
      }
    } catch (error) {
      console.error('Error loading map:', error);
      navigate('/spatial-canvas');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: map.title, url });
      } catch (err) {
        navigator.clipboard.writeText(url);
      }
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFAEB' }}>
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2596be', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!map) return null;

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        background: '#FFFAEB',
        backgroundImage: `linear-gradient(rgba(16, 86, 82, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 86, 82, 0.05) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }}
    >
      <Header />

      {/* Floating Mini Map */}
      {showMiniMap && (
        <div 
          className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block"
          style={{ maxWidth: '180px' }}
        >
          <div 
            className="bg-white rounded-xl overflow-hidden shadow-2xl"
            style={{ border: '2px solid #2596be' }}
          >
            <div className="relative">
              <img
                src={map.imageUrl}
                alt={map.title}
                className="w-full h-auto"
              />
              {/* Viewport Indicator */}
              <div 
                className="absolute left-0 right-0 pointer-events-none transition-all duration-150"
                style={{
                  top: `${viewportPosition.top}%`,
                  height: `${viewportPosition.height}%`,
                  background: 'rgba(16, 86, 82, 0.25)',
                  borderTop: '2px solid #2596be',
                  borderBottom: '2px solid #2596be',
                  boxShadow: '0 0 0 1px rgba(16, 86, 82, 0.3)',
                }}
              />
              <button
                onClick={() => setShowMiniMap(false)}
                className="absolute top-1 right-1 p-1 bg-white/90 rounded-full hover:bg-white transition-colors shadow"
                title="Hide mini map"
              >
                <X className="w-3 h-3 text-gray-600" />
              </button>
            </div>
            <div 
              className="px-2 py-1.5 text-center"
              style={{ background: 'linear-gradient(135deg, #2596be 0%, #3ba8d1 100%)' }}
            >
              <p className="text-white text-xs font-medium truncate">{map.title}</p>
            </div>
          </div>
        </div>
      )}

      {/* Show Mini Map Button (when hidden) */}
      {!showMiniMap && (
        <button
          onClick={() => setShowMiniMap(true)}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          style={{ border: '2px solid #2596be', color: '#2596be' }}
        >
          <Maximize2 className="w-4 h-4" />
          <span className="text-sm font-medium">Map</span>
        </button>
      )}
      
      <div className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl lg:pl-52">

          {/* Full Size Map Image */}
          <div 
            ref={mainImageRef}
            className="bg-white rounded-2xl overflow-hidden shadow-xl mb-6" 
            style={{ border: '2px solid #2596be' }}
          >
            <img
              src={map.imageUrl}
              alt={map.title}
              className="w-full h-auto"
            />
          </div>

          {/* Map Details Below */}
          <div className="bg-white rounded-xl p-6 shadow-lg" style={{ border: '2px solid #2596be' }}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <span 
                  className="inline-block px-4 py-1.5 rounded-full text-sm font-bold text-white mb-3"
                  style={{ backgroundColor: categoryColor }}
                >
                  {map.category}
                </span>
                <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#2596be' }}>
                  {map.title}
                </h1>
                {map.description && (
                  <div 
                    className="text-gray-600 mt-3 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: map.description }}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#2596be', color: '#2596be' }}
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <a
                  href={map.imageUrl}
                  download={`${map.title}.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#2596be' }}
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

