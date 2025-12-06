import React, { useState, useEffect } from 'react';
import { Save, Upload, Plus, Trash2, ExternalLink, Info, X, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { databaseService, storageService, ID, PROFILE_IMAGES_BUCKET_ID } from '../../../lib/appwrite';
import { useToast } from '../../../contexts/ToastContext';
import FontSelector from '../../../components/FontSelector/FontSelector';

export default function AboutMe() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documentId, setDocumentId] = useState(null);

  const [formData, setFormData] = useState({
    title: 'about me',
    subtitle: 'Who am I?',
    name: 'OLIVIA WILSON',
    nameFont: "'Playfair Display', serif",
    photoUrl: '',
    bioText: '',
    bioTextFont: "'Georgia', serif",
    researchLinks: []
  });

  const ABOUT_COLLECTION = 'about_me';

  useEffect(() => {
    loadAboutData();
  }, []);

  const loadAboutData = async () => {
    try {
      setLoading(true);
      const result = await databaseService.listDocuments(ABOUT_COLLECTION);

      if (result.success && result.data.documents.length > 0) {
        const data = result.data.documents[0];
        setDocumentId(data.$id);
        setFormData({
          title: data.title || 'about me',
          subtitle: data.subtitle || 'Who am I?',
          name: data.name || 'OLIVIA WILSON',
          nameFont: data.nameFont || "'Playfair Display', serif",
          photoUrl: data.photoUrl || '',
          bioText: data.bioText || '',
          bioTextFont: data.bioTextFont || "'Georgia', serif",
          researchLinks: data.researchLinks ? JSON.parse(data.researchLinks) : []
        });
        showToast('About Me data loaded successfully', 'success');
      } else {
        showToast('No data found. Create a new entry.', 'info');
      }
    } catch (error) {
      console.error('Error loading about data:', error);
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    try {
      setUploading(true);

      // Upload to Appwrite Storage
      const fileId = ID.unique();
      console.log('🆔 Generated file ID:', fileId);
      const result = await storageService.uploadFile(
        PROFILE_IMAGES_BUCKET_ID,
        fileId,
        file
      );

      if (result.success) {
        const uploadedFileId = result.data.$id;
        console.log('✅ Upload successful, file ID:', uploadedFileId);
        console.log('📦 File data:', result.data);
        
        await storageService.setFilePublic(PROFILE_IMAGES_BUCKET_ID, uploadedFileId);
        const fileUrl = storageService.getFileView(PROFILE_IMAGES_BUCKET_ID, uploadedFileId);
        console.log('🔗 Generated file URL:', fileUrl);
        console.log('🔗 URL type:', typeof fileUrl);
        
        setFormData(prev => ({ ...prev, photoUrl: fileUrl }));
        showToast('Photo uploaded successfully', 'success');
      } else {
        console.error('❌ Upload error:', result.error);
        showToast(`Error: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      showToast('Error uploading photo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAddResearchLink = () => {
    setFormData({
      ...formData,
      researchLinks: [...formData.researchLinks, { 
        name: '', 
        url: '', 
        iconUrl: '', 
        order: formData.researchLinks.length,
        hidden: false 
      }]
    });
  };

  const handleRemoveResearchLink = (index) => {
    const newLinks = formData.researchLinks.filter((_, i) => i !== index);
    // Reorder remaining items
    newLinks.forEach((link, i) => {
      link.order = i;
    });
    setFormData({ ...formData, researchLinks: newLinks });
  };

  const handleMoveResearchLink = (index, direction) => {
    const newLinks = [...formData.researchLinks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newLinks.length) return;
    
    // Swap items
    [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]];
    
    // Update order values
    newLinks.forEach((link, i) => {
      link.order = i;
    });
    
    setFormData({ ...formData, researchLinks: newLinks });
  };

  const handleToggleResearchLinkVisibility = (index) => {
    const newLinks = [...formData.researchLinks];
    newLinks[index].hidden = !newLinks[index].hidden;
    setFormData({ ...formData, researchLinks: newLinks });
  };

  const handleResearchLinkChange = (index, field, value) => {
    const newLinks = [...formData.researchLinks];
    newLinks[index][field] = value;
    setFormData({ ...formData, researchLinks: newLinks });
  };

  const handleResearchIconUpload = async (index, file) => {
    if (!file) return;

    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      showToast('Icon size must be less than 2MB', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    try {
      setUploading(true);
      const fileId = ID.unique();
      const result = await storageService.uploadFile(
        PROFILE_IMAGES_BUCKET_ID,
        fileId,
        file
      );

      if (result.success) {
        const uploadedFileId = result.data.$id;
        await storageService.setFilePublic(PROFILE_IMAGES_BUCKET_ID, uploadedFileId);
        const iconUrl = storageService.getFileView(PROFILE_IMAGES_BUCKET_ID, uploadedFileId);
        
        const newLinks = [...formData.researchLinks];
        newLinks[index].iconUrl = iconUrl;
        setFormData({ ...formData, researchLinks: newLinks });
        showToast('Icon uploaded successfully', 'success');
      } else {
        showToast(`Error: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error uploading icon:', error);
      showToast('Error uploading icon', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validate bio text length
      const wordCount = formData.bioText.split(/\s+/).filter(w => w).length;
      if (wordCount > 400) {
        showToast('Bio text exceeds 400 words. Please reduce the text.', 'error');
        return;
      }
      if (formData.bioText.length > 2500) {
        showToast('Bio text exceeds 2500 characters. Please reduce the text.', 'error');
        return;
      }

      setLoading(true);

      const dataToSave = {
        title: formData.title,
        subtitle: formData.subtitle,
        name: formData.name,
        nameFont: formData.nameFont,
        photoUrl: formData.photoUrl,
        bioText: formData.bioText,
        bioTextFont: formData.bioTextFont,
        researchLinks: JSON.stringify(formData.researchLinks)
      };

      let result;
      if (documentId) {
        // Update existing document
        result = await databaseService.updateDocument(
          ABOUT_COLLECTION,
          documentId,
          dataToSave
        );
      } else {
        // Create new document
        result = await databaseService.createDocument(
          ABOUT_COLLECTION,
          dataToSave
        );
        if (result.success) {
          setDocumentId(result.data.$id);
        }
      }

      if (result.success) {
        showToast('About Me section saved successfully!', 'success');
      } else {
        console.error('Save error:', result.error);
        showToast(`Error: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error saving about data:', error);
      showToast('Error saving data', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">About Me Section</h1>
        <p className="text-gray-600">Manage your About Me content with vintage style</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Title and Subtitle */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent"
              placeholder="about me"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent"
              placeholder="Who am I?"
            />
          </div>
        </div>

        {/* Name and Font Selection */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vertical Name Text
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent uppercase font-bold tracking-widest"
              placeholder="OLIVIA WILSON"
              maxLength={30}
            />
            <p className="text-xs text-gray-500 mt-1">
              Appears vertically on the right side of the section
            </p>
          </div>
          <div>
            <FontSelector
              value={formData.nameFont}
              onChange={(value) => setFormData({ ...formData, nameFont: value })}
              label="Name Font"
              previewText={formData.name || 'PREVIEW'}
            />
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Photo
          </label>
          <div className="flex items-center gap-4">
            {formData.photoUrl && (
              <img
                src={formData.photoUrl}
                alt="Preview"
                className="w-32 h-40 object-cover border-2 border-gray-300 rounded"
              />
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
                disabled={uploading}
              />
              <label
                htmlFor="photo-upload"
                className={`inline-flex items-center gap-2 px-4 py-2 bg-[#105652] text-white rounded-lg hover:bg-[#0d4240] cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </label>
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700">
                    <p className="font-semibold mb-1">Recommended Image Size:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Aspect Ratio: 3:4 (Portrait)</li>
                      <li>Recommended: 600x800px or higher</li>
                      <li>Max file size: 5MB</li>
                      <li>Formats: JPG, PNG, WebP</li>
                    </ul>
                    <p className="mt-2 italic">Photo will be displayed in grayscale for vintage effect</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Text */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Bio Text
            </label>
            <div className="text-sm">
              <span className={`font-medium ${
                formData.bioText.split(/\s+/).filter(w => w).length > 400 
                  ? 'text-red-600' 
                  : formData.bioText.split(/\s+/).filter(w => w).length > 350
                  ? 'text-orange-600'
                  : 'text-gray-600'
              }`}>
                {formData.bioText.split(/\s+/).filter(w => w).length} / 400 words
              </span>
              <span className="text-gray-400 mx-2">•</span>
              <span className={`${
                formData.bioText.length > 2500 
                  ? 'text-red-600' 
                  : formData.bioText.length > 2200
                  ? 'text-orange-600'
                  : 'text-gray-600'
              }`}>
                {formData.bioText.length} / 2500 chars
              </span>
            </div>
          </div>
          <FontSelector
            value={formData.bioTextFont}
            onChange={(value) => setFormData({ ...formData, bioTextFont: value })}
            label="Bio Text Font"
            previewText={formData.bioText.substring(0, 100) || 'Your bio text will appear here...'}
          />
          <textarea
            value={formData.bioText}
            onChange={(e) => {
              const text = e.target.value;
              const wordCount = text.split(/\s+/).filter(w => w).length;
              if (wordCount <= 400 && text.length <= 2500) {
                setFormData({ ...formData, bioText: text });
              } else if (text.length < formData.bioText.length) {
                // Allow deletion even if over limit
                setFormData({ ...formData, bioText: text });
              }
            }}
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent font-serif mt-4"
            placeholder="Write your bio here... Use double line breaks (press Enter twice) to create new paragraphs."
            style={{ fontFamily: formData.bioTextFont }}
            maxLength={2500}
          />
          <div className="flex items-start justify-between mt-2">
            <p className="text-sm text-gray-500 flex-1">
              Tip: Use double line breaks to create new paragraphs. Text will be displayed in 2 columns on desktop.
            </p>
            {(formData.bioText.split(/\s+/).filter(w => w).length > 350 || formData.bioText.length > 2200) && (
              <p className="text-sm text-orange-600 ml-4">
                ⚠️ Approaching limit - text may extend below Research Profile section
              </p>
            )}
            {(formData.bioText.split(/\s+/).filter(w => w).length > 400 || formData.bioText.length > 2500) && (
              <p className="text-sm text-red-600 font-medium ml-4">
                ❌ Limit reached - reduce text to save
              </p>
            )}
          </div>
        </div>

        {/* Research Links */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Research Profile Links
            </label>
            <button
              onClick={handleAddResearchLink}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#105652] text-white text-sm rounded-lg hover:bg-[#0d4240] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Link
            </button>
          </div>

          <div className="space-y-3">
            {formData.researchLinks.map((link, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border-2 transition-all ${
                  link.hidden 
                    ? 'bg-gray-100 border-gray-300 opacity-60' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex gap-3 items-start">
                  {/* Reorder Controls */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleMoveResearchLink(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveResearchLink(index, 'down')}
                      disabled={index === formData.researchLinks.length - 1}
                      className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Icon Preview */}
                  <div className="flex-shrink-0">
                    {link.iconUrl ? (
                      <div className="relative group">
                        <img
                          src={link.iconUrl}
                          alt="Icon"
                          className="w-16 h-16 object-cover rounded-lg border-2 border-[#105652]"
                        />
                        <button
                          onClick={() => {
                            const newLinks = [...formData.researchLinks];
                            newLinks[index].iconUrl = '';
                            setFormData({ ...formData, researchLinks: newLinks });
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleResearchIconUpload(index, file);
                      }}
                      className="hidden"
                      id={`icon-upload-${index}`}
                      disabled={uploading}
                    />
                    <label
                      htmlFor={`icon-upload-${index}`}
                      className="block text-center mt-1 text-xs text-[#105652] hover:underline cursor-pointer"
                    >
                      {link.iconUrl ? 'Change' : 'Upload'}
                    </label>
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={link.name}
                      onChange={(e) => handleResearchLinkChange(index, 'name', e.target.value)}
                      placeholder="Platform name (e.g., ResearchGate)"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#105652] focus:border-transparent text-sm"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleResearchLinkChange(index, 'url', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#105652] focus:border-transparent text-sm"
                    />
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Order: {index + 1}</span>
                      <span className="text-gray-400">•</span>
                      <span className={link.hidden ? 'text-orange-600 font-medium' : 'text-green-600 font-medium'}>
                        {link.hidden ? 'Hidden' : 'Visible'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleResearchLinkVisibility(index)}
                      className={`p-2 rounded transition-colors ${
                        link.hidden 
                          ? 'text-orange-600 hover:bg-orange-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={link.hidden ? 'Show' : 'Hide'}
                    >
                      {link.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleRemoveResearchLink(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {formData.researchLinks.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No research links added yet. Click "Add Link" to get started.
              </p>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={loading || uploading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#105652] text-white rounded-lg hover:bg-[#0d4240] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Preview Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Preview Your Changes</h3>
        <p className="text-sm text-blue-700">
          After saving, visit the main website to see your About Me section in vintage style with decorative borders, grayscale photo, 2-column text layout, and your custom name displayed vertically.
        </p>
      </div>
    </div>
  );
}
