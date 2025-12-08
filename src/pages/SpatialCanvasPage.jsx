import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { databaseService } from '../lib/appwrite';
import PageWrapper from '../components/PageWrapper/PageWrapper';

const MAPS_COLLECTION = 'spatial_maps';
const MAP_CATEGORIES_COLLECTION = 'map_categories';

export default function SpatialCanvasPage() {
  const [maps, setMaps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMap, setSelectedMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryColors, setCategoryColors] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    loadData();
    window.scrollTo(0, 0);
  }, []);

  const loadData = async () => {
    try {
      const [mapsResult, categoriesResult] = await Promise.all([
        databaseService.listDocuments(MAPS_COLLECTION),
        databaseService.listDocuments(MAP_CATEGORIES_COLLECTION)
      ]);

      if (mapsResult.success) {
        setMaps(mapsResult.data.documents);
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
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <PageWrapper>
      <div className="min-h-[calc(100vh-144px)] pt-8 pb-16 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              background: '#3ba8d1',
              width: '500px',
              height: '500px',
              top: '10%',
              left: '-150px',
              animation: 'float 25s ease-in-out infinite',
              opacity: 0.1,
            }}
          />
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              background: '#2596be',
              width: '400px',
              height: '400px',
              bottom: '20%',
              right: '-100px',
              animation: 'float 20s ease-in-out infinite reverse',
              opacity: 0.08,
            }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold" style={{ color: '#2596be' }}>
              Spatial Canvas
            </h1>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              <button
                onClick={() => handleCategoryChange('All')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === 'All'
                    ? 'text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                }`}
                style={{
                  backgroundColor: selectedCategory === 'All' ? '#2596be' : undefined,
                }}
              >
                All Maps
              </button>
              {categories.map(cat => (
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

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#2596be', borderTopColor: 'transparent' }} />
              <p className="text-gray-500">Loading maps...</p>
            </div>
          ) : filteredMaps.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">No maps found in this category.</p>
            </div>
          ) : (
            /* Maps Grid */
            <div 
              className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl mx-auto transition-all duration-300 ${
                isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              {filteredMaps.map((map, index) => (
                <div
                  key={map.$id}
                  className="group cursor-pointer"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                  }}
                  onClick={() => handleMapClick(map)}
                >
                  <div
                    className="relative bg-white rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
                    style={{
                      boxShadow: '6px 6px 0px #2596be',
                      border: '2px solid #2596be',
                    }}
                  >
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
                      style={{ background: 'linear-gradient(135deg, #2596be 0%, #3ba8d1 100%)' }}
                    >
                      <h3 className="text-white text-sm font-semibold line-clamp-2 leading-tight min-h-[2.5rem]">
                        {map.title}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Modal */}
      {selectedMap && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Image */}
            <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-4">
              <img
                src={selectedMap.imageUrl}
                alt={selectedMap.title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Right: Details */}
            <div className="md:w-1/2 p-6 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: categoryColors[selectedMap.category] || '#2596be' }}
                >
                  {selectedMap.category}
                </span>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <h2 className="text-2xl font-bold mb-4" style={{ color: '#2596be' }}>
                {selectedMap.title}
              </h2>

              {selectedMap.description && (
                <div 
                  className="text-gray-600 text-sm leading-relaxed flex-grow overflow-y-auto prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedMap.description }}
                />
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => navigateMap('prev')}
                  disabled={filteredMaps.findIndex(m => m.$id === selectedMap.$id) === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-gray-400 text-sm">
                  {filteredMaps.findIndex(m => m.$id === selectedMap.$id) + 1} / {filteredMaps.length}
                </span>
                <button
                  onClick={() => navigateMap('next')}
                  disabled={filteredMaps.findIndex(m => m.$id === selectedMap.$id) === filteredMaps.length - 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
