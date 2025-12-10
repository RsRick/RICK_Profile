import { useState, useEffect } from 'react';
import { Save, Star, StarOff } from 'lucide-react';
import { databaseService } from '../../../lib/appwrite';
import { useToast } from '../../../contexts/ToastContext';

const MAPS_COLLECTION = 'spatial_maps';
const MAP_CATEGORIES_COLLECTION = 'map_categories';

export default function FeaturedMapsManagement() {
  const [maps, setMaps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [featuredCount, setFeaturedCount] = useState(6);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mapsResult, categoriesResult] = await Promise.all([
        databaseService.listDocuments(MAPS_COLLECTION),
        databaseService.listDocuments(MAP_CATEGORIES_COLLECTION)
      ]);

      if (mapsResult.success) {
        setMaps(mapsResult.data.documents);
      }
      if (categoriesResult.success) {
        setCategories(categoriesResult.data.documents.sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (mapId, currentFeatured) => {
    try {
      const result = await databaseService.updateDocument(
        MAPS_COLLECTION,
        mapId,
        { featured: !currentFeatured }
      );

      if (result.success) {
        setMaps(prev => prev.map(m => 
          m.$id === mapId ? { ...m, featured: !currentFeatured } : m
        ));
        showToast(currentFeatured ? 'Removed from featured' : 'Added to featured', 'success');
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      showToast('Failed to update', 'error');
    }
  };

  const getCategoryColor = (categoryName) => {
    const cat = categories.find(c => c.name === categoryName);
    return cat?.color || '#2596be';
  };

  const featuredMaps = maps.filter(m => m.featured);
  const nonFeaturedMaps = maps.filter(m => !m.featured);

  if (loading) {
    return <div className="p-6"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#2596be' }}>Featured Maps</h1>
          <p className="text-gray-500 text-sm mt-1">
            Select which maps to display on the homepage
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow">
          <span className="text-sm font-medium">Featured:</span>
          <span className="text-2xl font-bold" style={{ color: '#2596be' }}>
            {featuredMaps.length}
          </span>
          <span className="text-gray-400">maps</span>
        </div>
      </div>

      {/* Featured Maps Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#2596be' }}>
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          Currently Featured ({featuredMaps.length})
        </h2>
        
        {featuredMaps.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No maps are featured yet. Select maps from below to feature them.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featuredMaps.map(map => (
              <div 
                key={map.$id}
                className="relative group rounded-lg overflow-hidden border-2 border-yellow-400"
              >
                <div className="aspect-[3/4]">
                  <img 
                    src={map.imageUrl} 
                    alt={map.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-xs font-medium line-clamp-2">{map.title}</p>
                </div>
                <button
                  onClick={() => toggleFeatured(map.$id, true)}
                  className="absolute top-2 right-2 p-1.5 bg-yellow-500 rounded-full text-white hover:bg-yellow-600 transition-colors"
                  title="Remove from featured"
                >
                  <StarOff className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Maps Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: '#2596be' }}>
          All Maps ({nonFeaturedMaps.length} not featured)
        </h2>
        
        {nonFeaturedMaps.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            All maps are already featured!
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {nonFeaturedMaps.map(map => (
              <div 
                key={map.$id}
                className="relative group rounded-lg overflow-hidden border hover:border-[#2596be] transition-colors"
              >
                <div className="aspect-[3/4]">
                  <img 
                    src={map.imageUrl} 
                    alt={map.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <span 
                    className="text-xs px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: getCategoryColor(map.category) }}
                  >
                    {map.category}
                  </span>
                  <p className="text-white text-xs font-medium line-clamp-2 mt-1">{map.title}</p>
                </div>
                <button
                  onClick={() => toggleFeatured(map.$id, false)}
                  className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full text-gray-600 hover:bg-[#2596be] hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  title="Add to featured"
                >
                  <Star className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

