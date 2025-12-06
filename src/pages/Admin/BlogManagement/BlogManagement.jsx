import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Save, X, Crop, ChevronLeft, ChevronRight, Copy, Link2, User, Calendar } from 'lucide-react';
import { databaseService, storageService } from '../../../lib/appwrite';
import { useToast } from '../../../contexts/ToastContext';
import RichTextEditor from '../ProjectManagement/RichTextEditor';
import ImageCropper from '../ProjectManagement/ImageCropper';

const BLOG_COLLECTION = 'blogs';
const BLOG_BUCKET = 'blog_images';
const BLOG_CATEGORIES_COLLECTION = 'blog_categories';

export default function BlogManagement() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [galleryScrollPosition, setGalleryScrollPosition] = useState(0);
  const [isBasicInfoCollapsed, setIsBasicInfoCollapsed] = useState(true);
  const [isRichTextCollapsed, setIsRichTextCollapsed] = useState(true);
  const [isLinkManagementCollapsed, setIsLinkManagementCollapsed] = useState(true);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    thumbnail: null,
    thumbnailUrl: '',
    gallery: [],
    galleryUrls: [],
    likes: 0,
    featured: false,
    customSlug: '',
    useProjectPrefix: true,
    fullDescription: '',
    authorNames: [''],
    authorImages: [''],
    publishDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadBlogs();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await databaseService.listDocuments(BLOG_CATEGORIES_COLLECTION);
      if (result.success) {
        const sorted = result.data.documents.sort((a, b) => a.order - b.order);
        setCategories(sorted);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const result = await databaseService.listDocuments(BLOG_COLLECTION);
      if (result.success) {
        setBlogs(result.data.documents);
      }
    } catch (error) {
      showToast('Failed to load blogs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCropComplete = (croppedBlob) => {
    const file = new File([croppedBlob], 'thumbnail.jpg', { type: 'image/jpeg' });
    setFormData(prev => ({ ...prev, thumbnail: file }));
    setShowCropper(false);
    showToast('Image cropped successfully', 'success');
  };

  const handleGalleryChange = async (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...files] }));
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
      galleryUrls: prev.galleryUrls.filter((_, i) => i !== index)
    }));
  };

  const uploadImage = async (file) => {
    try {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileExt = file.name.split('.').pop().toLowerCase();
      const fileId = `${timestamp}_${randomStr}.${fileExt}`;
      
      const result = await storageService.uploadFile(BLOG_BUCKET, fileId, file);
      if (result.success) {
        const fileUrl = storageService.getFileView(BLOG_BUCKET, result.data.$id);
        return fileUrl;
      }
      showToast(result.error || 'Failed to upload image', 'error');
      return null;
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload image: ' + error.message, 'error');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Upload thumbnail
      let thumbnailUrl = formData.thumbnailUrl;
      if (formData.thumbnail) {
        thumbnailUrl = await uploadImage(formData.thumbnail);
        if (!thumbnailUrl) {
          showToast('Failed to upload thumbnail', 'error');
          return;
        }
      }

      // Upload gallery images
      let galleryUrls = [...formData.galleryUrls];
      if (formData.gallery.length > 0) {
        for (const file of formData.gallery) {
          if (file instanceof File) {
            const url = await uploadImage(file);
            if (url) galleryUrls.push(url);
          }
        }
      }

      // Filter out empty author names and images
      const filteredAuthorNames = formData.authorNames.filter(name => name.trim() !== '');
      const filteredAuthorImages = formData.authorImages.filter(img => img.trim() !== '');

      const blogData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        thumbnailUrl: thumbnailUrl,
        galleryUrls: galleryUrls,
        likes: parseInt(formData.likes) || 0,
        featured: formData.featured,
        fullDescription: formData.fullDescription,
        customSlug: formData.customSlug,
        useProjectPrefix: formData.useProjectPrefix,
        authorNames: filteredAuthorNames,
        authorImages: filteredAuthorImages,
        publishDate: formData.publishDate,
      };

      console.log('Saving blog data:', blogData);
      
      let result;
      if (editingBlog) {
        result = await databaseService.updateDocument(
          BLOG_COLLECTION,
          editingBlog.$id,
          blogData
        );
      } else {
        result = await databaseService.createDocument(
          BLOG_COLLECTION,
          blogData
        );
      }

      if (result.success) {
        showToast(
          editingBlog ? 'Blog updated successfully' : 'Blog created successfully',
          'success'
        );
        resetForm();
        loadBlogs();
      } else {
        console.error('Save failed:', result.error);
        showToast(`Failed to save blog: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast(`Error saving blog: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    
    setFormData({
      title: blog.title,
      category: blog.category,
      description: blog.description,
      thumbnail: null,
      thumbnailUrl: blog.thumbnailUrl,
      gallery: [],
      galleryUrls: blog.galleryUrls || [],
      likes: blog.likes,
      featured: blog.featured,
      customSlug: blog.customSlug || '',
      useProjectPrefix: blog.useProjectPrefix !== undefined ? blog.useProjectPrefix : true,
      fullDescription: blog.fullDescription,
      authorNames: blog.authorNames && blog.authorNames.length > 0 ? blog.authorNames : [''],
      authorImages: blog.authorImages && blog.authorImages.length > 0 ? blog.authorImages : [''],
      publishDate: blog.publishDate || new Date().toISOString().split('T')[0],
    });
    setShowForm(true);
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      const result = await databaseService.deleteDocument(BLOG_COLLECTION, blogId);
      if (result.success) {
        showToast('Blog deleted successfully', 'success');
        loadBlogs();
      } else {
        showToast('Failed to delete blog', 'error');
      }
    } catch (error) {
      showToast('Error deleting blog', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      description: '',
      thumbnail: null,
      thumbnailUrl: '',
      gallery: [],
      galleryUrls: [],
      likes: 0,
      featured: false,
      customSlug: '',
      useProjectPrefix: true,
      fullDescription: '',
      authorNames: [''],
      authorImages: [''],
      publishDate: new Date().toISOString().split('T')[0],
    });
    setEditingBlog(null);
    setGalleryScrollPosition(0);
    setShowForm(false);
  };

  const addAuthor = () => {
    setFormData(prev => ({
      ...prev,
      authorNames: [...prev.authorNames, ''],
      authorImages: [...prev.authorImages, '']
    }));
  };

  const removeAuthor = (index) => {
    setFormData(prev => ({
      ...prev,
      authorNames: prev.authorNames.filter((_, i) => i !== index),
      authorImages: prev.authorImages.filter((_, i) => i !== index)
    }));
  };

  const updateAuthorName = (index, value) => {
    setFormData(prev => ({
      ...prev,
      authorNames: prev.authorNames.map((name, i) => i === index ? value : name)
    }));
  };

  const updateAuthorImage = (index, value) => {
    setFormData(prev => ({
      ...prev,
      authorImages: prev.authorImages.map((img, i) => i === index ? value : img)
    }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#105652' }}>
          Blog Management
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all duration-300 hover:scale-105"
          style={{ backgroundColor: '#105652' }}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add Blog'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#105652' }}>
            {editingBlog ? 'Edit Blog' : 'Add New Blog'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Collapsible Basic Info Section */}
            <div className="border rounded-lg" style={{ borderColor: '#105652' }}>
              <button
                type="button"
                onClick={() => setIsBasicInfoCollapsed(!isBasicInfoCollapsed)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
              >
                <h3 className="text-lg font-semibold" style={{ color: '#105652' }}>
                  Basic Blog Information
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {isBasicInfoCollapsed ? 'Expand' : 'Collapse'}
                  </span>
                  {isBasicInfoCollapsed ? (
                    <ChevronRight className="w-5 h-5" style={{ color: '#105652' }} />
                  ) : (
                    <ChevronLeft className="w-5 h-5 transform rotate-90" style={{ color: '#105652' }} />
                  )}
                </div>
              </button>

              {!isBasicInfoCollapsed && (
                <div className="p-6 space-y-6">
                  {/* Title and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{ borderColor: '#105652' }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Category *</label>
                      {categories.length === 0 ? (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            No categories found. Please create blog categories first.
                          </p>
                        </div>
                      ) : (
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                          style={{ borderColor: '#105652' }}
                        >
                          <option value="">Select a category</option>
                          {categories.map((cat) => (
                            <option key={cat.$id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Short Description (for card) *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows="2"
                      maxLength="200"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#105652' }}
                      placeholder="Brief description (max 200 characters)"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.description.length}/200 characters
                    </p>
                  </div>

                  {/* Author Information */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium">Author Information *</label>
                      <button
                        type="button"
                        onClick={addAuthor}
                        className="flex items-center gap-1 px-3 py-1 text-sm rounded-lg text-white transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: '#105652' }}
                      >
                        <Plus className="w-4 h-4" />
                        Add Author
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.authorNames.map((name, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-start p-3 bg-gray-50 rounded-lg">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Author Name</label>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => updateAuthorName(index, e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                              style={{ borderColor: '#105652' }}
                              placeholder="e.g., John Doe"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Author Image URL</label>
                            <input
                              type="url"
                              value={formData.authorImages[index] || ''}
                              onChange={(e) => updateAuthorImage(index, e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                              style={{ borderColor: '#105652' }}
                              placeholder="https://example.com/author.jpg"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAuthor(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-5"
                            title="Remove author"
                            disabled={formData.authorNames.length === 1}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Add author name and profile image URL. Multiple authors will be displayed as overlapping avatars.
                    </p>
                  </div>

                  {/* Publish Date */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Publish Date *
                    </label>
                    <input
                      type="date"
                      name="publishDate"
                      value={formData.publishDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#105652' }}
                    />
                  </div>

                  {/* Thumbnail */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Thumbnail Image *
                    </label>
                    
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <User className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-blue-800 mb-1">📏 Recommended Size</p>
                          <p className="text-blue-700">
                            <strong>800 × 600px</strong> (Blog card format)
                          </p>
                          <p className="text-blue-600 text-xs mt-1">
                            Click button below to upload and crop your image
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCropper(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition-colors hover:border-blue-400"
                      style={{ borderColor: '#105652' }}
                    >
                      <Crop className="w-5 h-5" />
                      <span>Choose & Crop Image</span>
                    </button>
                    
                    {formData.thumbnailUrl && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Current thumbnail:</p>
                        <img
                          src={formData.thumbnailUrl}
                          alt="Thumbnail preview"
                          className="h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>

                  {/* Gallery */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Gallery Images (Multiple)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryChange}
                      className="w-full px-4 py-2 border rounded-lg"
                      style={{ borderColor: '#105652' }}
                    />
                    {formData.galleryUrls.length > 0 && (
                      <div className="relative mt-2">
                        <div className="overflow-hidden">
                          <div 
                            className="flex gap-2 transition-transform duration-300 ease-in-out"
                            style={{ 
                              transform: `translateX(-${galleryScrollPosition * 25}%)` 
                            }}
                          >
                            {formData.galleryUrls.map((url, index) => (
                              <div 
                                key={index} 
                                className="relative flex-shrink-0"
                                style={{ width: 'calc(25% - 6px)' }}
                              >
                                <img
                                  src={url}
                                  alt={`Gallery ${index + 1}`}
                                  className="h-24 w-full object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeGalleryImage(index)}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {formData.galleryUrls.length > 4 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setGalleryScrollPosition(Math.max(0, galleryScrollPosition - 1))}
                              disabled={galleryScrollPosition === 0}
                              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ color: '#105652' }}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setGalleryScrollPosition(Math.min(formData.galleryUrls.length - 4, galleryScrollPosition + 1))}
                              disabled={galleryScrollPosition >= formData.galleryUrls.length - 4}
                              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ color: '#105652' }}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Likes and Featured */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Initial Likes</label>
                      <input
                        type="number"
                        name="likes"
                        value={formData.likes}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{ borderColor: '#105652' }}
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={formData.featured}
                          onChange={handleInputChange}
                          className="mr-2 w-5 h-5"
                        />
                        <span className="text-sm font-medium">Featured Blog (Show on Homepage)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rich Text Editor - Collapsible */}
            <div className="border rounded-lg" style={{ borderColor: '#105652' }}>
              <button
                type="button"
                onClick={() => setIsRichTextCollapsed(!isRichTextCollapsed)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
              >
                <h3 className="text-lg font-semibold" style={{ color: '#105652' }}>
                  Full Blog Content (Rich Text) *
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {isRichTextCollapsed ? 'Expand' : 'Collapse'}
                  </span>
                  {isRichTextCollapsed ? (
                    <ChevronRight className="w-5 h-5" style={{ color: '#105652' }} />
                  ) : (
                    <ChevronLeft className="w-5 h-5 transform rotate-90" style={{ color: '#105652' }} />
                  )}
                </div>
              </button>

              {!isRichTextCollapsed && (
                <div className="p-6">
                  <RichTextEditor
                    value={formData.fullDescription}
                    onChange={(value) => setFormData(prev => ({ ...prev, fullDescription: value }))}
                  />
                </div>
              )}
            </div>

            {/* Link Management - Collapsible */}
            <div className="border rounded-lg" style={{ borderColor: '#105652' }}>
              <button
                type="button"
                onClick={() => setIsLinkManagementCollapsed(!isLinkManagementCollapsed)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
              >
                <h3 className="text-lg font-semibold" style={{ color: '#105652' }}>
                  Link Management (Custom URL)
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {isLinkManagementCollapsed ? 'Expand' : 'Collapse'}
                  </span>
                  {isLinkManagementCollapsed ? (
                    <ChevronRight className="w-5 h-5" style={{ color: '#105652' }} />
                  ) : (
                    <ChevronLeft className="w-5 h-5 transform rotate-90" style={{ color: '#105652' }} />
                  )}
                </div>
              </button>

              {!isLinkManagementCollapsed && (
                <div className="p-6 space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Create a custom shareable URL for this blog. This allows you to share the blog as a standalone page.
                  </p>

                  {/* Use Blog Prefix Toggle */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="useProjectPrefix"
                      checked={formData.useProjectPrefix}
                      onChange={(e) => setFormData(prev => ({ ...prev, useProjectPrefix: e.target.checked }))}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <label htmlFor="useProjectPrefix" className="cursor-pointer flex-1">
                      <span className="font-medium">Use "/blog/" prefix</span>
                      <p className="text-xs text-gray-500 mt-1">
                        When enabled: <code className="bg-white px-2 py-0.5 rounded">{window.location.origin}/blog/your-slug</code>
                        <br />
                        When disabled: <code className="bg-white px-2 py-0.5 rounded">{window.location.origin}/your-slug</code>
                      </p>
                    </label>
                  </div>

                  {/* Custom Slug Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Custom Slug *
                    </label>
                    <input
                      type="text"
                      value={formData.customSlug}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-+|-+$/g, '');
                        setFormData(prev => ({ ...prev, customSlug: value }));
                      }}
                      placeholder="my-awesome-blog-post"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#105652' }}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Only lowercase letters, numbers, and hyphens. No spaces or special characters.
                    </p>
                  </div>

                  {/* Auto-generate from Title Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const slug = formData.title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                      setFormData(prev => ({ ...prev, customSlug: slug }));
                      showToast('Slug generated from title', 'success');
                    }}
                    disabled={!formData.title}
                    className="px-4 py-2 text-sm rounded-lg border-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ borderColor: '#105652', color: '#105652' }}
                  >
                    Auto-generate from Title
                  </button>

                  {/* Preview URL with Copy Button */}
                  {formData.customSlug && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-sm font-medium text-green-800">Preview URL:</p>
                        <button
                          type="button"
                          onClick={() => {
                            const url = `${window.location.origin}${formData.useProjectPrefix ? '/blog/' : '/'}${formData.customSlug}`;
                            navigator.clipboard.writeText(url);
                            showToast('URL copied to clipboard!', 'success');
                          }}
                          className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-300 hover:scale-105"
                          title="Copy URL"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                      </div>
                      <code className="text-sm text-green-700 break-all block mb-2">
                        {window.location.origin}{formData.useProjectPrefix ? '/blog/' : '/'}{formData.customSlug}
                      </code>
                      <p className="text-xs text-green-600">
                        ✓ This URL will display the blog as a standalone page
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all duration-300 hover:scale-105 disabled:opacity-50"
                style={{ backgroundColor: '#105652' }}
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : editingBlog ? 'Update Blog' : 'Create Blog'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-lg border-2 transition-all duration-300 hover:scale-105"
                style={{ borderColor: '#105652', color: '#105652' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Blogs List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#105652' }}>
          All Blogs ({blogs.length})
        </h2>
        
        {loading && !showForm ? (
          <p>Loading blogs...</p>
        ) : blogs.length === 0 ? (
          <p className="text-gray-500">No blogs yet. Add your first blog!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogs.map((blog) => (
              <div
                key={blog.$id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={blog.thumbnailUrl}
                  alt={blog.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: '#105652' }}
                    >
                      {blog.category}
                    </span>
                    {blog.featured && (
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-400 text-yellow-900">
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold mb-2 line-clamp-2">{blog.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {blog.description}
                  </p>
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{blog.publishDate}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-white text-sm transition-all duration-300 hover:scale-105"
                      style={{ backgroundColor: '#105652' }}
                      title="Edit Blog"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}${blog.useProjectPrefix ? '/blog/' : '/'}${blog.customSlug || ''}`;
                        if (blog.customSlug) {
                          navigator.clipboard.writeText(url);
                          showToast('Blog link copied!', 'success');
                        } else {
                          showToast('No custom link set for this blog', 'error');
                        }
                      }}
                      className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg bg-blue-500 text-white text-sm transition-all duration-300 hover:scale-105"
                      title="Copy Blog Link"
                    >
                      <Link2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(blog.$id)}
                      className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg bg-red-500 text-white text-sm transition-all duration-300 hover:scale-105"
                      title="Delete Blog"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Cropper Modal */}
      {showCropper && (
        <ImageCropper
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
          aspectRatio={4/3}
        />
      )}
    </div>
  );
}
