import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Upload, DollarSign, Tag, Image as ImageIcon, ZoomIn, ZoomOut, Check, GalleryHorizontal } from 'lucide-react';
import { databaseService, storageService, ID } from '../../../lib/appwrite';
import { useToast } from '../../../contexts/ToastContext';
import RichTextEditor from '../../../components/RichTextEditor/RichTextEditor';

const SHOP_COLLECTION = 'products';
const SHOP_BUCKET = 'shop-images';

// Image Editor Component with Slider Zoom
function ImageEditor({ imageFile, onSave, onCancel }) {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(0.1);
  const [maxScale, setMaxScale] = useState(3);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  // Card preview dimensions (matching ProductCard)
  const previewWidth = 260;
  const previewHeight = 200;

  useEffect(() => {
    if (imageFile) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        
        // Calculate scale to cover the preview area (cover, not contain)
        const scaleX = previewWidth / img.width;
        const scaleY = previewHeight / img.height;
        const coverScale = Math.max(scaleX, scaleY);
        
        // Set min scale to cover the preview, max to 3x of cover
        const minS = coverScale;
        const maxS = coverScale * 4;
        setMinScale(minS);
        setMaxScale(maxS);
        
        // Start at cover scale (image fills the preview)
        const initialScale = coverScale;
        setScale(initialScale);
        
        // Center the image
        setPosition({
          x: (previewWidth - img.width * initialScale) / 2,
          y: (previewHeight - img.height * initialScale) / 2
        });
      };
      img.src = URL.createObjectURL(imageFile);
      return () => URL.revokeObjectURL(img.src);
    }
  }, [imageFile]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleTouchMove = useCallback((e) => {
    if (isDragging) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove]);

  const handleSliderChange = (e) => {
    const newScale = parseFloat(e.target.value);
    
    // Adjust position to zoom from center
    if (image) {
      const centerX = previewWidth / 2;
      const centerY = previewHeight / 2;
      const imgCenterX = position.x + (image.width * scale) / 2;
      const imgCenterY = position.y + (image.height * scale) / 2;
      
      const newImgWidth = image.width * newScale;
      const newImgHeight = image.height * newScale;
      
      setPosition({
        x: centerX - (centerX - position.x) * (newScale / scale),
        y: centerY - (centerY - position.y) * (newScale / scale)
      });
    }
    
    setScale(newScale);
  };

  const handleSave = async () => {
    if (!image || !canvasRef.current) return;
    setSaving(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // Higher resolution output
    const outputScale = 2;
    canvas.width = previewWidth * outputScale;
    canvas.height = previewHeight * outputScale;
    ctx.scale(outputScale, outputScale);
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, previewWidth, previewHeight);
    
    // Draw the image with current position and scale
    ctx.drawImage(
      image,
      position.x,
      position.y,
      image.width * scale,
      image.height * scale
    );

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'product-image.jpg', { type: 'image/jpeg' });
        await onSave(file);
      }
      setSaving(false);
    }, 'image/jpeg', 0.92);
  };

  // Calculate zoom percentage relative to cover scale
  const zoomPercent = image ? Math.round((scale / minScale) * 100) : 100;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Adjust Image</h3>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-500 mb-3 text-center">
            Drag to position • Use slider to zoom
          </p>

          {/* Preview Area */}
          <div 
            className="relative mx-auto bg-gray-100 rounded-xl overflow-hidden cursor-move border-2 border-[#105652] shadow-lg"
            style={{ width: previewWidth, height: previewHeight }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {image && (
              <img
                src={image.src}
                alt="Preview"
                draggable={false}
                style={{
                  position: 'absolute',
                  left: position.x,
                  top: position.y,
                  width: image.width * scale,
                  height: image.height * scale,
                  maxWidth: 'none',
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}
              />
            )}
            {/* Center crosshair */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/50 rounded-full"></div>
            </div>
          </div>

          {/* Hidden canvas for export */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Zoom Slider */}
          <div className="mt-5 px-2">
            <div className="flex items-center gap-3">
              <ZoomOut className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="range"
                min={minScale}
                max={maxScale}
                step={(maxScale - minScale) / 100}
                value={scale}
                onChange={handleSliderChange}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#105652]"
                style={{
                  background: `linear-gradient(to right, #105652 0%, #105652 ${((scale - minScale) / (maxScale - minScale)) * 100}%, #e5e7eb ${((scale - minScale) / (maxScale - minScale)) * 100}%, #e5e7eb 100%)`
                }}
              />
              <ZoomIn className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
            <p className="text-center text-sm text-[#105652] font-medium mt-2">{zoomPercent}%</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-[#105652] text-white rounded-lg hover:bg-[#0d4543] flex items-center justify-center gap-2 font-medium"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Apply
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


const CATEGORY_COLLECTION = 'shop_categories';

export default function ProductManagement() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [tagInput, setTagInput] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discountedPrice: '',
    onSale: false,
    featured: false,
    imageUrl: '',
    imageId: '',
    fullImageUrl: '',
    fullImageId: '',
    category: '',
    tags: [],
    description: '',
    additionalInfo: '',
    galleryUrls: [],
    galleryIds: [],
  });
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await databaseService.listDocuments(CATEGORY_COLLECTION);
      if (result.success) {
        setCategories(result.data.documents.sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const result = await databaseService.listDocuments(SHOP_COLLECTION);
      if (result.success) {
        setProducts(result.data.documents);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image size should be less than 10MB', 'error');
      return;
    }

    setSelectedImageFile(file);
    setShowImageEditor(true);
  };

  const handleImageSave = async (croppedFile) => {
    setShowImageEditor(false);
    setUploading(true);

    try {
      // Delete old images if exist
      if (formData.imageId) {
        try { await storageService.deleteFile(SHOP_BUCKET, formData.imageId); } catch (e) {}
      }
      if (formData.fullImageId) {
        try { await storageService.deleteFile(SHOP_BUCKET, formData.fullImageId); } catch (e) {}
      }

      // Upload original full image first
      const fullFileId = ID.unique();
      const fullResult = await storageService.uploadFile(SHOP_BUCKET, fullFileId, selectedImageFile);
      
      // Upload cropped thumbnail
      const thumbFileId = ID.unique();
      const thumbResult = await storageService.uploadFile(SHOP_BUCKET, thumbFileId, croppedFile);
      
      if (fullResult.success && thumbResult.success) {
        const fullImageId = fullResult.data.$id;
        const fullImageUrl = storageService.getFileView(SHOP_BUCKET, fullImageId);
        const imageId = thumbResult.data.$id;
        const imageUrl = storageService.getFileView(SHOP_BUCKET, imageId);
        
        setFormData(prev => ({
          ...prev,
          imageUrl,
          imageId,
          fullImageUrl,
          fullImageId,
        }));
        showToast('Image uploaded successfully', 'success');
      } else {
        showToast('Failed to upload image', 'error');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast('Failed to upload image', 'error');
    } finally {
      setUploading(false);
      setSelectedImageFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      showToast('Valid price is required', 'error');
      return;
    }

    const productData = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : null,
      onSale: formData.onSale,
      featured: formData.featured,
      imageUrl: formData.imageUrl,
      imageId: formData.imageId,
      fullImageUrl: formData.fullImageUrl,
      fullImageId: formData.fullImageId,
      category: formData.category,
      tags: formData.tags,
      description: formData.description,
      additionalInfo: formData.additionalInfo,
      galleryUrls: formData.galleryUrls,
      galleryIds: formData.galleryIds,
    };

    try {
      if (editingProduct) {
        const result = await databaseService.updateDocument(
          SHOP_COLLECTION, editingProduct.$id, productData
        );
        if (result.success) {
          showToast('Product updated successfully', 'success');
        } else {
          showToast('Failed to update product', 'error');
        }
      } else {
        const result = await databaseService.createDocument(
          SHOP_COLLECTION, productData
        );
        if (result.success) {
          showToast('Product created successfully', 'success');
        } else {
          showToast('Failed to create product', 'error');
        }
      }
      
      setShowModal(false);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Failed to save product', 'error');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      price: product.price?.toString() || '',
      discountedPrice: product.discountedPrice?.toString() || '',
      onSale: product.onSale || false,
      featured: product.featured || false,
      imageUrl: product.imageUrl || '',
      imageId: product.imageId || '',
      fullImageUrl: product.fullImageUrl || '',
      fullImageId: product.fullImageId || '',
      category: product.category || '',
      tags: product.tags || [],
      description: product.description || '',
      additionalInfo: product.additionalInfo || '',
      galleryUrls: product.galleryUrls || [],
      galleryIds: product.galleryIds || [],
    });
    setTagInput('');
    setShowModal(true);
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    try {
      // Delete both images
      if (product.imageId) {
        try { await storageService.deleteFile(SHOP_BUCKET, product.imageId); } catch (e) {}
      }
      if (product.fullImageId) {
        try { await storageService.deleteFile(SHOP_BUCKET, product.fullImageId); } catch (e) {}
      }
      
      const result = await databaseService.deleteDocument(
        SHOP_COLLECTION, product.$id
      );
      
      if (result.success) {
        showToast('Product deleted successfully', 'success');
        loadProducts();
      } else {
        showToast('Failed to delete product', 'error');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Failed to delete product', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', price: '', discountedPrice: '', onSale: false, featured: false, 
      imageUrl: '', imageId: '', fullImageUrl: '', fullImageId: '',
      category: '', tags: [], description: '', additionalInfo: '',
      galleryUrls: [], galleryIds: [],
    });
    setTagInput('');
    setEditingProduct(null);
  };

  // Gallery image upload handler
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingGallery(true);
    const newUrls = [...formData.galleryUrls];
    const newIds = [...formData.galleryIds];

    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 10 * 1024 * 1024) continue;

        const fileId = ID.unique();
        const result = await storageService.uploadFile(SHOP_BUCKET, fileId, file);
        
        if (result.success) {
          const imageUrl = storageService.getFileView(SHOP_BUCKET, result.data.$id);
          newUrls.push(imageUrl);
          newIds.push(result.data.$id);
        }
      }

      setFormData(prev => ({
        ...prev,
        galleryUrls: newUrls,
        galleryIds: newIds,
      }));
      showToast(`${files.length} image(s) uploaded`, 'success');
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      showToast('Failed to upload some images', 'error');
    } finally {
      setUploadingGallery(false);
    }
  };

  // Remove gallery image
  const removeGalleryImage = async (index) => {
    const imageId = formData.galleryIds[index];
    
    try {
      if (imageId) {
        await storageService.deleteFile(SHOP_BUCKET, imageId);
      }
    } catch (e) {
      console.error('Error deleting gallery image:', e);
    }

    setFormData(prev => ({
      ...prev,
      galleryUrls: prev.galleryUrls.filter((_, i) => i !== index),
      galleryIds: prev.galleryIds.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
          <p className="text-gray-600 mt-1">Manage your shop products</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-[#105652] text-white rounded-lg hover:bg-[#0d4543] transition-colors">
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#105652]"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No products yet. Add your first product!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.$id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-100">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.onSale && <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">SALE</span>}
                  {product.featured && <span className="px-2 py-1 bg-[#105652] text-white text-xs font-bold rounded">FEATURED</span>}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1">{product.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  {product.onSale && product.discountedPrice ? (
                    <>
                      <span className="text-gray-400 line-through text-sm">${product.price?.toFixed(2)}</span>
                      <span className="text-[#105652] font-bold">${product.discountedPrice?.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-[#105652] font-bold">${product.price?.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(product)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(product)} className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Product Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {formData.imageUrl ? (
                    <div className="relative">
                      <img src={formData.imageUrl} alt="Product" className="w-full h-40 object-cover rounded" />
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, imageUrl: '', imageId: '', fullImageUrl: '', fullImageId: '' }))} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                        <X className="w-4 h-4" />
                      </button>
                      <label className="absolute bottom-2 right-2 px-3 py-1 bg-[#105652] text-white text-sm rounded cursor-pointer hover:bg-[#0d4543]">
                        Change
                        <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer py-4">
                      {uploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#105652]"></div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">Click to upload image</span>
                          <span className="text-xs text-gray-400 mt-1">You can adjust position after upload</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent" placeholder="Enter product name" required />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent" placeholder="0.00" required />
                </div>
              </div>

              {/* On Sale Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-700">On Sale</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.onSale} onChange={(e) => setFormData(prev => ({ ...prev, onSale: e.target.checked }))} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#105652]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>

              {/* Discounted Price */}
              {formData.onSale && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="number" step="0.01" min="0" value={formData.discountedPrice} onChange={(e) => setFormData(prev => ({ ...prev, discountedPrice: e.target.value }))} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent" placeholder="0.00" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Leave empty to show original price only</p>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.$id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent"
                    placeholder="Add a tag and press Enter"
                  />
                  <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Add</button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-[#105652]/10 text-[#105652] text-sm rounded-full">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <GalleryHorizontal className="w-4 h-4" />
                    Gallery Images
                  </div>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {/* Gallery Preview */}
                  {formData.galleryUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.galleryUrls.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img src={url} alt={`Gallery ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <label className="flex items-center justify-center gap-2 cursor-pointer py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    {uploadingGallery ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#105652]" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Add Gallery Images</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryUpload}
                      className="hidden"
                      disabled={uploadingGallery}
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-2 text-center">These images will appear as thumbnails in the product modal</p>
                </div>
              </div>

              {/* Description - Rich Text Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                  placeholder="Enter product description with formatting..."
                  minHeight="120px"
                />
              </div>

              {/* Additional Info - Rich Text Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                <RichTextEditor
                  value={formData.additionalInfo}
                  onChange={(value) => setFormData(prev => ({ ...prev, additionalInfo: value }))}
                  placeholder="Enter additional info (materials, dimensions, care instructions, etc.)..."
                  minHeight="100px"
                />
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Featured on Homepage</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#105652]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#105652]"></div>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[#105652] text-white rounded-lg hover:bg-[#0d4543] transition-colors">{editingProduct ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Editor Modal */}
      {showImageEditor && selectedImageFile && (
        <ImageEditor
          imageFile={selectedImageFile}
          onSave={handleImageSave}
          onCancel={() => { setShowImageEditor(false); setSelectedImageFile(null); }}
        />
      )}
    </div>
  );
}
