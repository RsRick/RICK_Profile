import React, { useState, useEffect } from 'react';
import { Upload, Save, X, Image as ImageIcon, Type, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  databaseService,
  storageService,
  appwriteConfig,
  ID,
} from '../../../lib/appwrite';

export default function Settings() {
  const [siteTitle, setSiteTitle] = useState('');
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [faviconUrl, setFaviconUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const SETTINGS_COLLECTION = 'site_settings';
  const STORAGE_BUCKET = appwriteConfig.storageId || 'reactbucket';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const result = await databaseService.listDocuments(SETTINGS_COLLECTION);
      if (result.success && result.data.documents.length > 0) {
        const settings = result.data.documents[0];
        if (settings.siteTitle) {
          setSiteTitle(settings.siteTitle);
        }
        if (settings.faviconUrl) {
          setFaviconUrl(settings.faviconUrl);
          setFaviconPreview(settings.faviconUrl);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (PNG, JPG, SVG, ICO, or WebP)');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFavicon = () => {
    setFaviconFile(null);
    setFaviconPreview(null);
  };

  const uploadFavicon = async () => {
    if (!faviconFile) return null;

    try {
      const fileId = ID.unique();
      const result = await storageService.uploadFile(STORAGE_BUCKET, fileId, faviconFile);
      if (result.success) {
        // Get file view URL (full size)
        const fileUrl = storageService.getFileView(STORAGE_BUCKET, result.data.$id);
        return fileUrl;
      }
      return null;
    } catch (error) {
      console.error('Error uploading favicon:', error);
      return null;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      let finalFaviconUrl = faviconUrl;

      // Upload favicon if new file selected
      if (faviconFile) {
        finalFaviconUrl = await uploadFavicon();
        if (!finalFaviconUrl) {
          alert('Failed to upload favicon. Please check your storage bucket permissions.');
          setSaving(false);
          return;
        }
      }

      // Save to database
      const settingsData = {
        siteTitle: siteTitle || 'Parvej Hossain - Portfolio',
        faviconUrl: finalFaviconUrl || '',
      };

      // Check if document exists
      const existing = await databaseService.listDocuments(SETTINGS_COLLECTION);
      if (existing.success && existing.data.documents.length > 0) {
        // Update existing
        const updateResult = await databaseService.updateDocument(
          SETTINGS_COLLECTION,
          existing.data.documents[0].$id,
          settingsData
        );
        if (!updateResult.success) {
          throw new Error(updateResult.error || 'Failed to update settings');
        }
      } else {
        // Create new
        const createResult = await databaseService.createDocument(
          SETTINGS_COLLECTION,
          settingsData
        );
        if (!createResult.success) {
          throw new Error(createResult.error || 'Failed to create settings');
        }
      }

      setFaviconUrl(finalFaviconUrl);
      setFaviconFile(null);
      
      // Update the page title and favicon immediately
      if (siteTitle) {
        document.title = siteTitle;
      }
      if (finalFaviconUrl) {
        updateFavicon(finalFaviconUrl);
      }

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      const errorMessage = error.message || 'Failed to save settings. Please check console for details.';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const updateFavicon = (url) => {
    if (!url || typeof url !== 'string') {
      console.error('Invalid favicon URL:', url);
      return;
    }

    // Remove all existing favicon links
    const existingLinks = document.querySelectorAll("link[rel*='icon'], link[rel='shortcut icon']");
    existingLinks.forEach(link => link.remove());

    // Detect file type from URL
    const urlLower = url.toLowerCase();
    let type = 'image/x-icon';
    if (urlLower.includes('.png')) {
      type = 'image/png';
    } else if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) {
      type = 'image/jpeg';
    } else if (urlLower.includes('.svg')) {
      type = 'image/svg+xml';
    } else if (urlLower.includes('.webp')) {
      type = 'image/webp';
    } else if (urlLower.includes('.ico')) {
      type = 'image/x-icon';
    }

    // Create new favicon links (multiple for browser compatibility)
    const link1 = document.createElement('link');
    link1.rel = 'icon';
    link1.type = type;
    link1.href = url;
    document.head.appendChild(link1);

    const link2 = document.createElement('link');
    link2.rel = 'shortcut icon';
    link2.type = type;
    link2.href = url;
    document.head.appendChild(link2);

    // Force browser to reload favicon by adding timestamp
    const link3 = document.createElement('link');
    link3.rel = 'icon';
    link3.type = type;
    link3.href = `${url}?t=${Date.now()}`;
    document.head.appendChild(link3);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Font Management Link */}
      <Link
        to="/admin/font-management"
        className="block mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg hover:border-purple-300 transition-colors group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Type className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                Font Management
              </h3>
              <p className="text-sm text-gray-600">
                Upload custom fonts and manage Google Fonts for your site
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#105652' }}>
          Site Settings
        </h1>

        {/* Site Title Section */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Site Title
          </label>
          <input
            type="text"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            placeholder="Parvej Hossain - Portfolio"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent outline-none transition-all"
          />
          <p className="mt-2 text-sm text-gray-500">
            This will be displayed in the browser tab title
          </p>
        </div>

        {/* Favicon Section */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Site Favicon
          </label>
          
          {faviconPreview ? (
            <div className="mb-4">
              <div className="relative inline-block">
                <div className="w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img
                    src={faviconPreview}
                    alt="Favicon preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                {faviconFile && (
                  <button
                    onClick={removeFavicon}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {faviconFile ? `New file: ${faviconFile.name}` : 'Current favicon'}
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
              <p className="mt-2 text-sm text-gray-500">No favicon uploaded</p>
            </div>
          )}

          <label className="inline-flex items-center gap-2 px-6 py-3 bg-[#105652] text-white rounded-lg cursor-pointer hover:bg-[#1E8479] transition-colors">
            <Upload className="w-5 h-5" />
            <span>{faviconFile ? 'Change Favicon' : 'Upload Favicon'}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,image/webp,.ico"
              onChange={handleFaviconChange}
              className="hidden"
            />
          </label>
          <p className="mt-2 text-sm text-gray-500">
            Recommended: 32x32px or 16x16px. Max size: 2MB. Formats: PNG, JPG, SVG, ICO, WebP
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-[#105652] text-white rounded-lg font-semibold hover:bg-[#1E8479] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

