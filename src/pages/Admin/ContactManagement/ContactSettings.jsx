import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Image as ImageIcon, Crop } from 'lucide-react';
import { databaseService, storageService } from '../../../lib/appwrite';
import { useToast } from '../../../contexts/ToastContext';
import ProfileImageCropper from './ProfileImageCropper';

const CONTACT_SETTINGS_COLLECTION = 'contact_settings';
const CONTACT_BUCKET = 'contact_images';

export default function ContactSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    profileImage: '',
    name: 'Parvej Hossain',
    title: 'GIS & Remote Sensing Specialist',
    description: 'I am available for impactful research that promotes sustainability and addresses global climate change and environment.',
    phone: '+880 1714 594091',
    email: 'official.parvej.hossain@gmail.com',
    location: 'Bangladesh',
    socialLinks: [
      { platform: 'LinkedIn', url: '', icon: 'linkedin' },
      { platform: 'GitHub', url: '', icon: 'github' },
      { platform: 'Twitter', url: '', icon: 'twitter' }
    ]
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const result = await databaseService.listDocuments(CONTACT_SETTINGS_COLLECTION);
      
      if (result.success && result.data.documents.length > 0) {
        const settings = result.data.documents[0];
        setSettingsId(settings.$id);
        
        // Parse social links from JSON string
        let socialLinks = [];
        if (settings.socialLinks) {
          try {
            socialLinks = JSON.parse(settings.socialLinks);
          } catch (e) {
            socialLinks = [];
          }
        }
        
        setFormData({
          profileImage: settings.profileImage || '',
          name: settings.name || '',
          title: settings.title || '',
          description: settings.description || '',
          phone: settings.phone || '',
          email: settings.email || '',
          location: settings.location || '',
          socialLinks: socialLinks.length > 0 ? socialLinks : formData.socialLinks
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCropComplete = async (blob) => {
    setShowCropper(false);
    setUploadingImage(true);

    try {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileId = `profile_${timestamp}_${randomStr}.jpg`;

      // Convert blob to File
      const file = new File([blob], fileId, { type: 'image/jpeg' });

      const result = await storageService.uploadFile(CONTACT_BUCKET, fileId, file);
      if (result.success) {
        const fileUrl = storageService.getFileView(CONTACT_BUCKET, result.data.$id);
        setFormData(prev => ({ ...prev, profileImage: fileUrl }));
        showToast('Image uploaded successfully', 'success');
      } else {
        showToast('Failed to upload image', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: '', url: '', icon: 'link' }]
    }));
  };

  const removeSocialLink = (index) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const updateSocialLink = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      const dataToSave = {
        profileImage: formData.profileImage,
        name: formData.name,
        title: formData.title,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        location: formData.location,
        socialLinks: JSON.stringify(formData.socialLinks.filter(link => link.platform && link.url))
      };

      let result;
      if (settingsId) {
        result = await databaseService.updateDocument(
          CONTACT_SETTINGS_COLLECTION,
          settingsId,
          dataToSave
        );
      } else {
        result = await databaseService.createDocument(
          CONTACT_SETTINGS_COLLECTION,
          dataToSave
        );
        if (result.success) {
          setSettingsId(result.data.$id);
        }
      }

      if (result.success) {
        showToast('Settings saved successfully', 'success');
      } else {
        showToast(`Failed to save: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const iconOptions = [
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'github', label: 'GitHub' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'globe', label: 'Website' },
    { value: 'mail', label: 'Email' },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#105652' }}>
          Contact Settings
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#105652' }}>
            Profile Information
          </h2>

          {/* Profile Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Profile Image</label>
            <div className="flex items-start gap-4">
              {formData.profileImage ? (
                <img 
                  src={formData.profileImage} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-2"
                  style={{ borderColor: '#105652' }}
                />
              ) : (
                <div 
                  className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2"
                  style={{ borderColor: '#105652' }}
                >
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => setShowCropper(true)}
                  disabled={uploadingImage}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm transition-all hover:scale-105 disabled:opacity-50"
                  style={{ backgroundColor: '#105652' }}
                >
                  {uploadingImage ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Crop className="w-4 h-4" />
                      {formData.profileImage ? 'Change Image' : 'Upload Image'}
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Click to upload and crop your profile image
                </p>
              </div>
            </div>
          </div>

          {/* Name and Title */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#105652' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Title/Role *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., GIS & Remote Sensing Specialist"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#105652' }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: '#105652' }}
              placeholder="Brief description about yourself..."
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#105652' }}>
            Contact Information
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#105652' }}
                placeholder="+880 1714 594091"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#105652' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: '#105652' }}
              placeholder="e.g., Bangladesh"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: '#105652' }}>
              Social Media Links
            </h2>
            <button
              type="button"
              onClick={addSocialLink}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm transition-all hover:scale-105"
              style={{ backgroundColor: '#105652' }}
            >
              <Plus className="w-4 h-4" />
              Add Link
            </button>
          </div>

          <div className="space-y-4">
            {formData.socialLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Platform</label>
                    <input
                      type="text"
                      value={link.platform}
                      onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: '#105652' }}
                      placeholder="e.g., LinkedIn"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Icon</label>
                    <select
                      value={link.icon}
                      onChange={(e) => updateSocialLink(index, 'icon', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: '#105652' }}
                    >
                      {iconOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">URL</label>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: '#105652' }}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            {formData.socialLinks.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No social links added. Click "Add Link" to add one.
              </p>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-3">
            Links will open in a new tab when clicked.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all duration-300 hover:scale-105 disabled:opacity-50"
            style={{ backgroundColor: '#105652' }}
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Image Cropper Modal */}
      {showCropper && (
        <ProfileImageCropper
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
        />
      )}
    </div>
  );
}
