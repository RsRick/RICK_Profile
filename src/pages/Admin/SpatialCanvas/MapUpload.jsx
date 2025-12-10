import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon, Link as LinkIcon, Copy, ExternalLink } from 'lucide-react';
import { databaseService, storageService } from '../../../lib/appwrite';
import { useToast } from '../../../contexts/ToastContext';

const MAPS_COLLECTION = 'spatial_maps';
const MAP_CATEGORIES_COLLECTION = 'map_categories';
const MAPS_BUCKET = 'spatial_maps';

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export default function MapUpload() {
  const [maps, setMaps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    useSlug: true,
    description: '',
    category: '',
    imageUrl: '',
    featured: false
  });
  const fileInputRef = useRef(null);
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileExt = file.name.split('.').pop().toLowerCase();
      const fileId = `map_${timestamp}_${randomStr}.${fileExt}`;

      const result = await storageService.uploadFile(MAPS_BUCKET, fileId, file);
      if (result.success) {
        const fileUrl = storageService.getFileView(MAPS_BUCKET, result.data.$id);
        setFormData(prev => ({ ...prev, imageUrl: fileUrl }));
        showToast('Image uploaded successfully', 'success');
      } else {
        showToast('Failed to upload image', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.imageUrl || !formData.category) {
      showToast('Title, image, and category are required', 'error');
      return;
    }

    const slug = formData.useSlug ? (formData.slug || generateSlug(formData.title)) : '';

    try {
      const dataToSave = {
        title: formData.title.trim(),
        slug: slug,
        description: formData.description,
        category: formData.category,
        imageUrl: formData.imageUrl,
        featured: formData.featured
      };

      let result;
      if (editingId) {
        result = await databaseService.updateDocument(
          MAPS_COLLECTION, editingId, dataToSave
        );
      } else {
        result = await databaseService.createDocument(
          MAPS_COLLECTION, dataToSave
        );
      }

      if (result.success) {
        showToast(editingId ? 'Map updated successfully' : 'Map added successfully', 'success');
        resetForm();
        loadData();
      } else {
        showToast('Failed to save map', 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save map', 'error');
    }
  };

  const handleEdit = (map) => {
    setEditingId(map.$id);
    setFormData({
      title: map.title,
      slug: map.slug || '',
      useSlug: !!map.slug,
      description: map.description || '',
      category: map.category,
      imageUrl: map.imageUrl,
      featured: map.featured || false
    });
    setShowForm(true);
  };

  const copyMapLink = (slug) => {
    const url = `${window.location.origin}/map/${slug}`;
    navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard!', 'success');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this map?')) return;

    try {
      const result = await databaseService.deleteDocument(MAPS_COLLECTION, id);
      if (result.success) {
        showToast('Map deleted successfully', 'success');
        loadData();
      } else {
        showToast('Failed to delete map', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Failed to delete map', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', slug: '', useSlug: true, description: '', category: '', imageUrl: '', featured: false });
    setEditingId(null);
    setShowForm(false);
  };

  const getCategoryColor = (categoryName) => {
    const cat = categories.find(c => c.name === categoryName);
    return cat?.color || '#2596be';
  };

  if (loading) {
    return <div className="p-6"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#2596be' }}>Map Upload</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all hover:scale-105"
          style={{ backgroundColor: '#2596be' }}
        >
          <Plus className="w-5 h-5" />
          Add Map
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: '#2596be' }}>
            {editingId ? 'Edit Map' : 'Add New Map'}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Map Image (A4 Portrait)</label>
              <div 
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-[#2596be] transition-colors"
                onClick={() => fileInputRef.current?.click()}
                style={{ borderColor: formData.imageUrl ? '#2596be' : '#d1d5db' }}
              >
                {formData.imageUrl ? (
                  <img 
                    src={formData.imageUrl} 
                    alt="Preview" 
                    className="max-h-80 mx-auto rounded-lg object-contain"
                  />
                ) : (
                  <div className="py-12">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Click to upload A4 portrait image</p>
                    <p className="text-xs text-gray-400 mt-1">Recommended: 2480 × 3508 px</p>
                  </div>
                )}
                {uploading && (
                  <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-[#2596be] border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Right: Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#2596be' }}
                  placeholder="e.g., Sundarban NDVI Map"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Custom URL Slug</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-gray-500">{formData.useSlug ? 'Enabled' : 'Disabled'}</span>
                    <div 
                      className={`relative w-10 h-5 rounded-full transition-colors ${formData.useSlug ? 'bg-[#2596be]' : 'bg-gray-300'}`}
                      onClick={() => setFormData({ ...formData, useSlug: !formData.useSlug })}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.useSlug ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </label>
                </div>
                {formData.useSlug && (
                  <>
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center border rounded-lg overflow-hidden" style={{ borderColor: '#2596be' }}>
                        <span className="px-3 py-2 bg-gray-100 text-gray-600 text-sm border-r" style={{ borderColor: '#2596be' }}>
                          /map/
                        </span>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '') })}
                          className="flex-1 px-3 py-2 focus:outline-none"
                          placeholder="your-map-slug"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, slug: generateSlug(formData.title) })}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                        style={{ borderColor: '#2596be', color: '#2596be' }}
                        title="Auto-generate from title"
                      >
                        Auto
                      </button>
                    </div>
                    {formData.slug && (
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        Preview: {window.location.origin}/map/{formData.slug}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#2596be' }}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.$id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Short Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#2596be' }}
                  placeholder="Brief description of the map..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  Feature on Homepage
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg text-white disabled:opacity-50"
                  style={{ backgroundColor: '#2596be' }}
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update' : 'Save'}
                </button>
                <button
                  onClick={resetForm}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg border hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maps Grid */}
      {maps.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Maps Yet</h3>
          <p className="text-gray-500">Click "Add Map" to upload your first spatial map.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {maps.map(map => (
            <div 
              key={map.$id} 
              className="bg-white rounded-lg shadow-md overflow-hidden group relative"
            >
              <div className="aspect-[3/4] relative">
                <img 
                  src={map.imageUrl} 
                  alt={map.title}
                  className="w-full h-full object-cover"
                />
                {map.featured && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                    Featured
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleEdit(map)}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4 text-gray-700" />
                  </button>
                  {map.slug && (
                    <button
                      onClick={() => copyMapLink(map.slug)}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4 text-gray-700" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(map.$id)}
                    className="p-2 bg-red-500 rounded-lg hover:bg-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <span 
                  className="text-xs font-bold px-2 py-1 rounded-full text-white"
                  style={{ backgroundColor: getCategoryColor(map.category) }}
                >
                  {map.category}
                </span>
                <h4 className="font-semibold mt-2 text-sm line-clamp-2" style={{ color: '#2596be' }}>
                  {map.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

