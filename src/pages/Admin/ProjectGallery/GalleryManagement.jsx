import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Upload, Image, ChevronUp, ChevronDown, GripVertical, ExternalLink } from 'lucide-react';
import { databaseService, storageService, ID } from '../../../lib/appwrite';
import { useToast } from '../../../contexts/ToastContext';

const GALLERIES_COLLECTION = 'gallery_carousels';
const GALLERY_BUCKET = 'gallery_images';

// Label design presets - 15 unique designs
const labelDesigns = [
  { id: 'vintage-paper', name: 'Vintage Paper', preview: 'bg-[#f5f0e1] text-[#2d8a8a] italic shadow-md' },
  { id: 'tape-label', name: 'Tape Label', preview: 'bg-[#f5f0e1] text-[#2d8a8a] italic' },
  { id: 'ribbon', name: 'Classic Ribbon', preview: 'bg-white text-gray-800 italic shadow-lg' },
  { id: 'neon-glow', name: 'Neon Glow', preview: 'bg-black text-[#00ff88] border border-[#00ff88]' },
  { id: 'retro-badge', name: 'Retro Badge', preview: 'bg-[#d4a574] text-[#3d2914] border-2 border-[#3d2914]' },
  { id: 'glass-card', name: 'Glass Card', preview: 'bg-white/30 text-white backdrop-blur' },
  { id: 'chalk-board', name: 'Chalkboard', preview: 'bg-[#2a3d2a] text-[#e8e8e8] border border-[#e8e8e8]' },
  { id: 'polaroid', name: 'Polaroid', preview: 'bg-white text-gray-700 shadow-xl' },
  { id: 'stamp', name: 'Stamp', preview: 'bg-transparent text-red-600 border-2 border-red-600 border-dashed' },
  { id: 'typewriter', name: 'Typewriter', preview: 'bg-[#f9f6f0] text-gray-800 font-mono' },
  { id: 'cinema', name: 'Cinema', preview: 'bg-black text-[#ffd700] border-y-2 border-[#ffd700]' },
  { id: 'wooden', name: 'Wooden Sign', preview: 'bg-[#8b5a2b] text-[#f5deb3] shadow-lg' },
  { id: 'neon-pink', name: 'Neon Pink', preview: 'bg-black text-[#ff1493] border border-[#ff1493]' },
  { id: 'newspaper', name: 'Newspaper', preview: 'bg-[#f5f5dc] text-gray-900 font-serif' },
  { id: 'gradient-modern', name: 'Modern Gradient', preview: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' },
];

const emptyGallery = {
  title: '',
  eventLink: '',
  images: [],
  labelDesign: 'ribbon',
  titleFontSize: '14px',
  titleColor: '#333333',
  scrollInterval: 3000,
  featured: true,
  order: 0,
};

export default function GalleryManagement() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingGallery, setEditingGallery] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyGallery);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newImageTitle, setNewImageTitle] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    loadGalleries();
  }, []);

  const loadGalleries = async () => {
    try {
      const result = await databaseService.listDocuments(GALLERIES_COLLECTION);
      if (result.success) {
        // Parse images JSON string to array
        const parsed = result.data.documents.map(g => ({
          ...g,
          images: typeof g.images === 'string' ? JSON.parse(g.images || '[]') : (g.images || [])
        }));
        const sorted = parsed.sort((a, b) => (a.order || 0) - (b.order || 0));
        setGalleries(sorted);
      }
    } catch (error) {
      console.error('Error loading galleries:', error);
      showToast('Failed to load galleries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (gallery = null) => {
    if (gallery) {
      setEditingGallery(gallery);
      setFormData({
        ...emptyGallery,
        ...gallery,
        images: typeof gallery.images === 'string' ? JSON.parse(gallery.images || '[]') : (gallery.images || []),
      });
    } else {
      setEditingGallery(null);
      setFormData({ ...emptyGallery, order: galleries.length });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGallery(null);
    setFormData(emptyGallery);
    setNewImageTitle('');
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadedImages = [];
      for (const file of files) {
        const fileId = ID.unique();
        const uploadResult = await storageService.uploadFile(GALLERY_BUCKET, fileId, file);
        if (uploadResult.success) {
          const imageUrl = storageService.getFilePreview(GALLERY_BUCKET, uploadResult.data.$id, 800, 600);
          uploadedImages.push({
            id: uploadResult.data.$id,
            url: imageUrl,
            title: newImageTitle || '',
          });
        }
      }
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages]
      }));
      setNewImageTitle('');
      showToast(`${uploadedImages.length} image(s) uploaded`, 'success');
    } catch (error) {
      console.error('Error uploading images:', error);
      showToast('Failed to upload images', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const updateImageTitle = (index, title) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? { ...img, title } : img)
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const moveImage = (index, direction) => {
    const newImages = [...formData.images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    setFormData(prev => ({ ...prev, images: newImages }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Gallery title is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const galleryData = {
        title: formData.title.trim(),
        eventLink: formData.eventLink.trim(),
        images: JSON.stringify(formData.images), // Convert array to JSON string
        labelDesign: formData.labelDesign,
        titleFontSize: formData.titleFontSize,
        titleColor: formData.titleColor,
        scrollInterval: parseInt(formData.scrollInterval) || 3000,
        featured: formData.featured,
        order: formData.order,
      };

      if (editingGallery) {
        const result = await databaseService.updateDocument(
          GALLERIES_COLLECTION,
          editingGallery.$id,
          galleryData
        );
        if (result.success) {
          showToast('Gallery updated successfully', 'success');
          loadGalleries();
          closeModal();
        } else {
          throw new Error(result.error);
        }
      } else {
        const result = await databaseService.createDocument(
          GALLERIES_COLLECTION,
          galleryData
        );
        if (result.success) {
          showToast('Gallery created successfully', 'success');
          loadGalleries();
          closeModal();
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error) {
      console.error('Error saving gallery:', error);
      showToast('Failed to save gallery', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (gallery) => {
    if (!window.confirm(`Delete "${gallery.title}"? This cannot be undone.`)) return;

    try {
      const result = await databaseService.deleteDocument(
        GALLERIES_COLLECTION,
        gallery.$id
      );
      if (result.success) {
        showToast('Gallery deleted', 'success');
        loadGalleries();
      }
    } catch (error) {
      console.error('Error deleting gallery:', error);
      showToast('Failed to delete gallery', 'error');
    }
  };

  const toggleFeatured = async (gallery) => {
    try {
      const result = await databaseService.updateDocument(
        GALLERIES_COLLECTION,
        gallery.$id,
        { featured: !gallery.featured }
      );
      if (result.success) {
        showToast(`Gallery ${!gallery.featured ? 'featured' : 'hidden'}`, 'success');
        loadGalleries();
      }
    } catch (error) {
      showToast('Failed to update', 'error');
    }
  };

  const moveGallery = async (index, direction) => {
    const newGalleries = [...galleries];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newGalleries.length) return;

    [newGalleries[index], newGalleries[targetIndex]] = [newGalleries[targetIndex], newGalleries[index]];

    try {
      await Promise.all([
        databaseService.updateDocument(GALLERIES_COLLECTION, newGalleries[index].$id, { order: index }),
        databaseService.updateDocument(GALLERIES_COLLECTION, newGalleries[targetIndex].$id, { order: targetIndex })
      ]);
      loadGalleries();
    } catch (error) {
      showToast('Failed to reorder', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#105652' }}></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#105652' }}>Project Gallery</h1>
          <p className="text-gray-600 mt-1">Manage image carousels for your project gallery</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
          style={{ backgroundColor: '#105652' }}
        >
          <Plus className="w-5 h-5" />
          Add Gallery
        </button>
      </div>

      {/* Gallery List */}
      {galleries.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
          <Image className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No galleries yet</h3>
          <p className="text-gray-500 mb-6">Create your first image carousel gallery</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: '#105652' }}
          >
            <Plus className="w-5 h-5" />
            Add Gallery
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {galleries.map((gallery, index) => (
            <div
              key={gallery.$id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* Order Controls */}
                <div className="flex flex-col items-center gap-1">
                  <button onClick={() => moveGallery(index, 'up')} disabled={index === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  </button>
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <button onClick={() => moveGallery(index, 'down')} disabled={index === galleries.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Preview Images */}
                <div className="flex -space-x-2">
                  {(gallery.images || []).slice(0, 4).map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover border-2 border-white"
                    />
                  ))}
                  {(gallery.images?.length || 0) > 4 && (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                      +{gallery.images.length - 4}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{gallery.title}</h3>
                    {gallery.eventLink && <ExternalLink className="w-4 h-4 text-pink-500" />}
                  </div>
                  <p className="text-sm text-gray-500">
                    {gallery.images?.length || 0} images • {gallery.scrollInterval / 1000}s interval • {gallery.labelDesign} style
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFeatured(gallery)}
                    className={`p-2 rounded-lg transition-colors ${gallery.featured ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                    title={gallery.featured ? 'Featured' : 'Hidden'}
                  >
                    {gallery.featured ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <button onClick={() => openModal(gallery)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(gallery)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl my-4">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between" style={{ backgroundColor: '#105652' }}>
              <h2 className="text-xl font-bold text-white">
                {editingGallery ? 'Edit Gallery' : 'Create New Gallery'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(95vh-180px)]">
              <div className="space-y-6">
                {/* Title & Event Link */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent"
                      placeholder="e.g., World Environment Day 2024"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Link (Optional)</label>
                    <input
                      type="url"
                      value={formData.eventLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventLink: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Scroll Interval */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Auto-scroll Interval (ms)</label>
                    <input
                      type="number"
                      value={formData.scrollInterval}
                      onChange={(e) => setFormData(prev => ({ ...prev, scrollInterval: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent"
                      min="1000"
                      step="500"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.scrollInterval / 1000} seconds</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title Font Size</label>
                    <select
                      value={formData.titleFontSize}
                      onChange={(e) => setFormData(prev => ({ ...prev, titleFontSize: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent"
                    >
                      <option value="12px">Small (12px)</option>
                      <option value="14px">Medium (14px)</option>
                      <option value="16px">Large (16px)</option>
                      <option value="18px">Extra Large (18px)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title Color</label>
                    <input
                      type="color"
                      value={formData.titleColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, titleColor: e.target.value }))}
                      className="w-full h-10 px-1 py-1 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Label Design Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title Label Design</label>
                  <div className="grid grid-cols-5 gap-3">
                    {labelDesigns.map((design) => (
                      <button
                        key={design.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, labelDesign: design.id }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.labelDesign === design.id
                            ? 'border-[#105652] ring-2 ring-[#105652]/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`h-8 rounded flex items-center justify-center text-xs font-medium ${design.preview}`}>
                          Sample
                        </div>
                        <p className="text-xs text-center mt-2 text-gray-600">{design.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
                  
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {uploadingImage ? (
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#105652]"></div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-400 mb-2" />
                          <span className="text-gray-600">Click to upload images</span>
                          <span className="text-xs text-gray-400 mt-1">You can select multiple images</span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Image List */}
                  {formData.images.length > 0 && (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {formData.images.map((img, index) => (
                        <div key={img.id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <img src={img.url} alt="" className="w-16 h-12 object-cover rounded" />
                          <input
                            type="text"
                            value={img.title || ''}
                            onChange={(e) => updateImageTitle(index, e.target.value)}
                            placeholder="Image title (shown on carousel)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => moveImage(index, 'up')} disabled={index === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => moveImage(index, 'down')} disabled={index === formData.images.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => removeImage(index)} className="p-1 hover:bg-red-100 text-red-500 rounded">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Featured Toggle */}
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Show on homepage</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button type="button" onClick={closeModal} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#105652' }}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingGallery ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
