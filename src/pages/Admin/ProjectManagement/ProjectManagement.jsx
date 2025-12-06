import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, Image as ImageIcon, Save, X, Crop, ChevronLeft, ChevronRight, Copy, Link2 } from 'lucide-react';
import { databaseService, storageService } from '../../../lib/appwrite';
import { useToast } from '../../../contexts/ToastContext';
import RichTextEditor from './RichTextEditor';
import SetupChecker from './SetupChecker';
import ImageCropper from './ImageCropper';

const PROJECTS_COLLECTION = 'projects';
const PROJECTS_BUCKET = 'project_images';
const CATEGORIES_COLLECTION = 'categories';

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropperType, setCropperType] = useState('thumbnail'); // 'thumbnail' or 'gallery'
  const [galleryScrollPosition, setGalleryScrollPosition] = useState(0);
  const [isBasicInfoCollapsed, setIsBasicInfoCollapsed] = useState(true); // Default: minimized
  const [isRichTextCollapsed, setIsRichTextCollapsed] = useState(true); // Default: minimized
  const [isLinkManagementCollapsed, setIsLinkManagementCollapsed] = useState(true); // Default: minimized
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
    projectDetails: [
      { label: 'Software', value: '' },
      { label: 'Timeframe', value: '' },
      { label: 'Data Source', value: '' },
      { label: 'Study Area', value: '' }
    ],
    projectLink: '',
    fullDescription: '',
    // Link Management
    customSlug: '',
    useProjectPrefix: true,
  });

  useEffect(() => {
    loadProjects();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await databaseService.listDocuments(CATEGORIES_COLLECTION);
      if (result.success) {
        const sorted = result.data.documents.sort((a, b) => a.order - b.order);
        setCategories(sorted);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const result = await databaseService.listDocuments(PROJECTS_COLLECTION);
      if (result.success) {
        setProjects(result.data.documents);
      }
    } catch (error) {
      showToast('Failed to load projects', 'error');
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

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Directly open cropper - no intermediate step
      setShowCropper(true);
    }
  };

  const handleCropComplete = (croppedBlob) => {
    // Convert blob to file
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
      // Generate a short unique ID (max 36 chars)
      // Format: timestamp_randomstring (e.g., 1234567890_abc123)
      const timestamp = Date.now().toString(36); // Convert to base36 for shorter string
      const randomStr = Math.random().toString(36).substring(2, 8); // 6 random chars
      const fileExt = file.name.split('.').pop().toLowerCase();
      const fileId = `${timestamp}_${randomStr}.${fileExt}`;
      
      const result = await storageService.uploadFile(PROJECTS_BUCKET, fileId, file);
      if (result.success) {
        const fileUrl = storageService.getFileView(PROJECTS_BUCKET, result.data.$id);
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

      // Filter out empty project details and convert to JSON strings for Appwrite
      const filteredDetails = formData.projectDetails
        .filter(detail => detail.label.trim() !== '' && detail.value.trim() !== '')
        .map(detail => JSON.stringify(detail)); // Convert to JSON strings for String Array

      const projectData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        thumbnailUrl: thumbnailUrl,
        galleryUrls: galleryUrls,
        likes: parseInt(formData.likes) || 0,
        featured: formData.featured,
        projectDetails: filteredDetails,
        projectLink: formData.projectLink,
        fullDescription: formData.fullDescription,
        customSlug: formData.customSlug,
        useProjectPrefix: formData.useProjectPrefix,
      };

      console.log('Saving project data:', projectData);
      
      let result;
      if (editingProject) {
        result = await databaseService.updateDocument(
          PROJECTS_COLLECTION,
          editingProject.$id,
          projectData
        );
      } else {
        result = await databaseService.createDocument(
          PROJECTS_COLLECTION,
          projectData
        );
      }

      console.log('Save result:', result);

      if (result.success) {
        showToast(
          editingProject ? 'Project updated successfully' : 'Project created successfully',
          'success'
        );
        resetForm();
        loadProjects();
      } else {
        console.error('Save failed:', result.error);
        showToast(`Failed to save project: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast(`Error saving project: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    
    // Parse projectDetails from database (stored as JSON strings)
    let projectDetails = [];
    if (project.projectDetails && Array.isArray(project.projectDetails)) {
      // New format: array of JSON strings
      projectDetails = project.projectDetails.map(jsonStr => {
        try {
          return JSON.parse(jsonStr);
        } catch (e) {
          console.error('Error parsing project detail:', e);
          return null;
        }
      }).filter(Boolean);
    } else if (project.software || project.timeframe || project.dataSource || project.studyArea) {
      // Old format: individual fields
      projectDetails = [
        { label: 'Software', value: project.software || '' },
        { label: 'Timeframe', value: project.timeframe || '' },
        { label: 'Data Source', value: project.dataSource || '' },
        { label: 'Study Area', value: project.studyArea || '' }
      ];
    }
    
    // Default fields if empty
    if (projectDetails.length === 0) {
      projectDetails = [
        { label: 'Software', value: '' },
        { label: 'Timeframe', value: '' },
        { label: 'Data Source', value: '' },
        { label: 'Study Area', value: '' }
      ];
    }
    
    setFormData({
      title: project.title,
      category: project.category,
      description: project.description,
      thumbnail: null,
      thumbnailUrl: project.thumbnailUrl,
      gallery: [],
      galleryUrls: project.galleryUrls || [],
      likes: project.likes,
      featured: project.featured,
      projectDetails: projectDetails,
      projectLink: project.projectLink,
      fullDescription: project.fullDescription,
      customSlug: project.customSlug || '',
      useProjectPrefix: project.useProjectPrefix !== undefined ? project.useProjectPrefix : true,
    });
    setShowForm(true);
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const result = await databaseService.deleteDocument(PROJECTS_COLLECTION, projectId);
      if (result.success) {
        showToast('Project deleted successfully', 'success');
        loadProjects();
      } else {
        showToast('Failed to delete project', 'error');
      }
    } catch (error) {
      showToast('Error deleting project', 'error');
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
      projectDetails: [
        { label: 'Software', value: '' },
        { label: 'Timeframe', value: '' },
        { label: 'Data Source', value: '' },
        { label: 'Study Area', value: '' }
      ],
      projectLink: '',
      fullDescription: '',
      customSlug: '',
      useProjectPrefix: true,
    });
    setEditingProject(null);
    setGalleryScrollPosition(0);
    setShowForm(false);
  };

  const addProjectDetail = () => {
    setFormData(prev => ({
      ...prev,
      projectDetails: [...prev.projectDetails, { label: '', value: '' }]
    }));
  };

  const removeProjectDetail = (index) => {
    setFormData(prev => ({
      ...prev,
      projectDetails: prev.projectDetails.filter((_, i) => i !== index)
    }));
  };

  const updateProjectDetail = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      projectDetails: prev.projectDetails.map((detail, i) =>
        i === index ? { ...detail, [field]: value } : detail
      )
    }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#105652' }}>
          Project Management
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all duration-300 hover:scale-105"
          style={{ backgroundColor: '#105652' }}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add Project'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#105652' }}>
            {editingProject ? 'Edit Project' : 'Add New Project'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Collapsible Basic Info Section */}
            <div className="border rounded-lg" style={{ borderColor: '#105652' }}>
              {/* Section Header with Toggle */}
              <button
                type="button"
                onClick={() => setIsBasicInfoCollapsed(!isBasicInfoCollapsed)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
              >
                <h3 className="text-lg font-semibold" style={{ color: '#105652' }}>
                  Basic Project Information
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

              {/* Collapsible Content */}
              {!isBasicInfoCollapsed && (
                <div className="p-6 space-y-6">
            {/* Basic Info */}
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
                  style={{ borderColor: '#105652', focusRing: '#1E8479' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                {categories.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      No categories found. Please{' '}
                      <Link to="/admin/categories" className="underline font-semibold">
                        create categories
                      </Link>{' '}
                      first.
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
                maxLength="150"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#105652' }}
                placeholder="Brief description (max 150 characters)"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/150 characters
              </p>
            </div>

            {/* Project Details - Dynamic Fields */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">Project Details</label>
                <button
                  type="button"
                  onClick={addProjectDetail}
                  className="flex items-center gap-1 px-3 py-1 text-sm rounded-lg text-white transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#105652' }}
                >
                  <Plus className="w-4 h-4" />
                  Add Field
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.projectDetails.map((detail, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-2 items-start">
                    <div>
                      <input
                        type="text"
                        value={detail.label}
                        onChange={(e) => updateProjectDetail(index, 'label', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                        style={{ borderColor: '#105652' }}
                        placeholder="Label (e.g., Software)"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={detail.value}
                        onChange={(e) => updateProjectDetail(index, 'value', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                        style={{ borderColor: '#105652' }}
                        placeholder="Value (e.g., ArcGIS Pro)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProjectDetail(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove field"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Add custom fields to display project information. Empty fields will not be shown.
              </p>
            </div>

            {/* Project Link */}
            <div>
              <label className="block text-sm font-medium mb-2">Project Link</label>
              <input
                type="url"
                name="projectLink"
                value={formData.projectLink}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#105652' }}
                placeholder="https://example.com"
              />
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Thumbnail Image *
              </label>
              
              {/* Size Guidelines */}
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-800 mb-1">📏 Recommended Size</p>
                    <p className="text-blue-700">
                      <strong>465 × 531px</strong> (Portrait card format)
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
                  {/* Slider Container */}
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
                  
                  {/* Navigation Arrows */}
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
                  <span className="text-sm font-medium">Featured Project (Show on Homepage)</span>
                </label>
              </div>
            </div>
                </div>
              )}
            </div>

            {/* Rich Text Editor - Collapsible */}
            <div className="border rounded-lg" style={{ borderColor: '#105652' }}>
              {/* Section Header with Toggle */}
              <button
                type="button"
                onClick={() => setIsRichTextCollapsed(!isRichTextCollapsed)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
              >
                <h3 className="text-lg font-semibold" style={{ color: '#105652' }}>
                  Full Description (Rich Text) *
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

              {/* Collapsible Content */}
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
              {/* Section Header with Toggle */}
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

              {/* Collapsible Content */}
              {!isLinkManagementCollapsed && (
                <div className="p-6 space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Create a custom shareable URL for this project. This allows you to share the project as a standalone page instead of a popup.
                  </p>

                  {/* Use Project Prefix Toggle */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="useProjectPrefix"
                      checked={formData.useProjectPrefix}
                      onChange={(e) => setFormData(prev => ({ ...prev, useProjectPrefix: e.target.checked }))}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <label htmlFor="useProjectPrefix" className="cursor-pointer flex-1">
                      <span className="font-medium">Use "/project/" prefix</span>
                      <p className="text-xs text-gray-500 mt-1">
                        When enabled: <code className="bg-white px-2 py-0.5 rounded">{window.location.origin}/project/your-slug</code>
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
                        // Auto-generate slug from title if empty and user is typing
                        const value = e.target.value.toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-+|-+$/g, '');
                        setFormData(prev => ({ ...prev, customSlug: value }));
                      }}
                      placeholder="my-awesome-project"
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
                            const url = `${window.location.origin}${formData.useProjectPrefix ? '/project/' : '/'}${formData.customSlug}`;
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
                        {window.location.origin}{formData.useProjectPrefix ? '/project/' : '/'}{formData.customSlug}
                      </code>
                      <p className="text-xs text-green-600">
                        ✓ This URL will display the project as a standalone page
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
                {loading ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
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

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#105652' }}>
          All Projects ({projects.length})
        </h2>
        
        {loading && !showForm ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-500">No projects yet. Add your first project!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.$id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={project.thumbnailUrl}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-full text-white"
                      style={{
                        backgroundColor:
                          project.category === 'GIS'
                            ? '#3b82f6'
                            : project.category === 'R'
                            ? '#a855f7'
                            : '#10b981',
                      }}
                    >
                      {project.category}
                    </span>
                    {project.featured && (
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-400 text-yellow-900">
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold mb-2 line-clamp-2">{project.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-white text-sm transition-all duration-300 hover:scale-105"
                      style={{ backgroundColor: '#105652' }}
                      title="Edit Project"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}${project.useProjectPrefix ? '/project/' : '/'}${project.customSlug || ''}`;
                        if (project.customSlug) {
                          navigator.clipboard.writeText(url);
                          showToast('Project link copied!', 'success');
                        } else {
                          showToast('No custom link set for this project', 'error');
                        }
                      }}
                      className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg bg-blue-500 text-white text-sm transition-all duration-300 hover:scale-105"
                      title="Copy Project Link"
                    >
                      <Link2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.$id)}
                      className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg bg-red-500 text-white text-sm transition-all duration-300 hover:scale-105"
                      title="Delete Project"
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
          aspectRatio={7/8}
        />
      )}
    </div>
  );
}
