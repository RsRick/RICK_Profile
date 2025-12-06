import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { databaseService } from '../../lib/appwrite';

const MAPS_COLLECTION = 'spatial_maps';
const MAP_CATEGORIES_COLLECTION = 'map_categories';

export default function SpatialCanvas() {
  const [maps, setMaps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMap, setSelectedMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryColors, setCategoryColors] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mapsResult, categoriesResult] = await Promise.all([
        databaseService.listDocuments(MAPS_COLLECTION),
        databaseService.listDocuments(MAP_CATEGORIES_COLLECTION)
      ]);

      if (mapsResult.success) {
        const featuredMaps = mapsResult.data.documents.filter(m => m.featured);
        setMaps(featuredMaps);
      }

      if (categoriesResult.success) {
        const cats = categoriesResult.data.documents.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(cats);
        
        const colorMap = {};
        cats.forEach(cat => {
          colorMap[cat.name] = cat.color;
        });
        setCategoryColors(colorMap);
      }
    } catch (error) {
      console.error('Error loading spatial canvas data:', error);
    } finally {
      setLoading(false);
    }
  };

  const featuredCategories = [...new Set(maps.map(m => m.category))];
  const displayCategories = categories.filter(c => featuredCategories.includes(c.name));

  const filteredMaps = selectedCategory === 'All' 
    ? maps 
    : maps.filter(m => m.category === selectedCategory);

  const handleCategoryChange = (category) => {
    if (category === selectedCategory) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedCategory(category);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 250);
  };

  const handleMapClick = (map) => {
    setSelectedMap(map);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedMap(null);
    document.body.style.overflow = 'auto';
  };

  const navigateMap = (direction) => {
    const currentIndex = filteredMaps.findIndex(m => m.$id === selectedMap.$id);
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedMap(filteredMaps[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < filteredMaps.length - 1) {
      setSelectedMap(filteredMaps[currentIndex + 1]);
    }
  };

  if (loading || maps.length === 0) {
    return null;
  }

  return (
    <section id="spatial-canvas" className="py-10 relative overflow-hidden scroll-mt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            background: '#1E8479',
            width: '400px',
            height: '400px',
            top: '30%',
            right: '-100px',
            animation: 'float 20s ease-in-out infinite',
            opacity: 0.1,
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Title */}
        <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: '#105652' }}>
          Spatial Canvas
        </h2>

        {/* Category Filter */}
        {displayCategories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => handleCategoryChange('All')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === 'All'
                  ? 'text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
              style={{
                backgroundColor: selectedCategory === 'All' ? '#105652' : undefined,
              }}
            >
              All Maps
            </button>
            {displayCategories.map(cat => (
              <button
                key={cat.$id}
                onClick={() => handleCategoryChange(cat.name)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === cat.name
                    ? 'text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                }`}
                style={{
                  backgroundColor: selectedCategory === cat.name ? cat.color : undefined,
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Maps Grid */}
        <div className="max-w-6xl mx-auto">
          <div 
            className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-all duration-300 ${
              isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            {filteredMaps.slice(0, 8).map((map, index) => (
              <div
                key={map.$id}
                className="group cursor-pointer"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.08}s both`,
                }}
                onClick={() => handleMapClick(map)}
              >
                <div
                  className="relative bg-white rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
                  style={{
                    boxShadow: '6px 6px 0px #105652',
                    border: '2px solid #105652',
                  }}
                >
                  {/* Map Image - A4 Portrait ratio */}
                  <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                    <img
                      src={map.imageUrl}
                      alt={map.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Title Bar - Fixed 2 line height */}
                  <div 
                    className="p-3"
                    style={{ background: 'linear-gradient(135deg, #105652 0%, #1E8479 100%)' }}
                  >
                    <h3 className="text-white text-sm font-semibold line-clamp-2 leading-tight min-h-[2.5rem]">
                      {map.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-10">
          <Link
            to="/spatial-canvas"
            className="group relative px-6 py-2.5 rounded-lg font-semibold text-white text-base overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{ backgroundColor: '#105652' }}
          >
            <span className="relative z-10">View All Maps</span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, #1E8479, #105652)',
              }}
            />
          </Link>
        </div>
      </div>

      {/* Map Modal - Using Portal to render outside section */}
      {selectedMap && createPortal(
        <MapModal 
          map={selectedMap}
          categoryColor={categoryColors[selectedMap.category] || '#105652'}
          onClose={closeModal}
          onNavigate={navigateMap}
          currentIndex={filteredMaps.findIndex(m => m.$id === selectedMap.$id)}
          totalMaps={filteredMaps.length}
        />,
        document.body
      )}
    </section>
  );
}

// Map Modal Component - Matches Project Modal Style
function MapModal({ map, categoryColor, onClose, onNavigate, currentIndex, totalMaps }) {
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

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.90)', padding: '20px' }}
      onClick={handleClose}
    >
      <div
        className={`relative w-full bg-white rounded-2xl shadow-2xl transform transition-all duration-300 my-auto ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{ maxWidth: '1100px', maxHeight: 'calc(100vh - 40px)' }}
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
        <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 40px)' }}>
          {/* Top Section - Image and Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 p-4 md:p-8">
            {/* Left - Map Image */}
            <div className="p-3 md:p-6 rounded-2xl" style={{
              backgroundColor: 'rgba(30, 132, 121, 0.08)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(30, 132, 121, 0.2)'
            }}>
              <div className="relative rounded-xl overflow-hidden bg-gray-100 shadow-lg">
                <img
                  src={map.imageUrl}
                  alt={map.title}
                  className="w-full h-auto max-h-[350px] md:max-h-[500px] object-contain"
                />
              </div>
            </div>

            {/* Right - Map Info */}
            <div className="flex flex-col p-3 md:p-6 rounded-2xl" style={{
              backgroundColor: 'rgba(30, 132, 121, 0.08)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(30, 132, 121, 0.2)'
            }}>
              {/* Category Badge */}
              <span
                className="inline-flex self-start px-3 py-1 rounded-full text-xs font-bold text-white mb-4"
                style={{ backgroundColor: categoryColor }}
              >
                {map.category}
              </span>

              {/* Title */}
              <h2 className="text-xl md:text-3xl font-bold mb-4" style={{ color: '#105652' }}>
                {map.title}
              </h2>

              {/* Description */}
              {map.description && (
                <div 
                  className="text-gray-600 text-sm leading-relaxed flex-grow overflow-y-auto prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: map.description }}
                />
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => onNavigate('prev')}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-gray-400 text-sm">
                  {currentIndex + 1} / {totalMaps}
                </span>
                <button
                  onClick={() => onNavigate('next')}
                  disabled={currentIndex >= totalMaps - 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
