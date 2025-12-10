import React, { useState } from 'react';
import { X, Plus, Trash2, Facebook, Twitter, Instagram, Linkedin, Youtube, Github, Globe, Mail } from 'lucide-react';

// Available social media platforms with icons
const SOCIAL_PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877f2' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1da1f2' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#e4405f' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0077b5' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#ff0000' },
  { id: 'github', name: 'GitHub', icon: Github, color: '#333333' },
  { id: 'website', name: 'Website', icon: Globe, color: '#2596be' },
  { id: 'email', name: 'Email', icon: Mail, color: '#ea4335' },
];

export default function SocialLinksInput({ onSave, onCancel, initialData }) {
  const [links, setLinks] = useState(initialData?.links || []);
  const [labelText, setLabelText] = useState(initialData?.labelText || 'Follow us on');

  const handleAddLink = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLinks([...links, { platform: 'facebook', url: '' }]);
  };

  const handleRemoveLink = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setLinks(links.filter((_, i) => i !== index));
  };

  const handlePlatformChange = (index, platform) => {
    const newLinks = [...links];
    newLinks[index].platform = platform;
    setLinks(newLinks);
  };

  const handleUrlChange = (index, url) => {
    const newLinks = [...links];
    newLinks[index].url = url;
    setLinks(newLinks);
  };

  // Validate and fix URL format
  const validateUrl = (url, platform) => {
    if (!url) return '';
    
    // Trim whitespace
    url = url.trim();
    
    // Handle email separately
    if (platform === 'email') {
      if (!url.startsWith('mailto:')) {
        return `mailto:${url}`;
      }
      return url;
    }
    
    // If URL doesn't start with http:// or https://, add https://
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }
    
    return url;
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Filter out empty URLs and validate them
    const validLinks = links
      .filter(link => link.url.trim() !== '')
      .map(link => ({
        ...link,
        url: validateUrl(link.url, link.platform)
      }));
    
    if (validLinks.length === 0) {
      alert('Please add at least one social media link');
      return;
    }
    onSave({ links: validLinks, labelText: labelText.trim() });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#e5e7eb' }}>
          <h2 className="text-2xl font-bold" style={{ color: '#2596be' }}>
            Insert Social Media Links
          </h2>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCancel();
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" style={{ color: '#2596be' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-sm text-gray-600 mb-4">
            Add your social media links. Select the platform and paste the URL. You can add multiple links.
          </p>

          {/* Label Text Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: '#2596be' }}>
              Label Text (optional)
            </label>
            <input
              type="text"
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              placeholder="e.g., Follow us on, Connect with us, Find us on"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: '#2596be' }}
            />
            <p className="text-xs text-gray-500 mt-1">
              This text will appear before the social media icons. Leave empty for no label.
            </p>
          </div>

          {/* Links List */}
          <div className="space-y-4">
            {links.map((link, index) => (
              <div key={index} className="flex gap-3 items-start p-4 border rounded-lg" style={{ borderColor: '#e5e7eb' }}>
                {/* Platform Selector */}
                <div className="flex-shrink-0">
                  <select
                    value={link.platform}
                    onChange={(e) => handlePlatformChange(index, e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#2596be' }}
                  >
                    {SOCIAL_PLATFORMS.map(platform => (
                      <option key={platform.id} value={platform.id}>
                        {platform.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* URL Input */}
                <div className="flex-1">
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder={`Enter ${SOCIAL_PLATFORMS.find(p => p.id === link.platform)?.name} URL`}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#2596be' }}
                  />
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={(e) => handleRemoveLink(index, e)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Button */}
          <button
            type="button"
            onClick={handleAddLink}
            className="mt-4 w-full py-3 border-2 border-dashed rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            style={{ borderColor: '#2596be', color: '#2596be' }}
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Social Media Link</span>
          </button>

          {/* Preview */}
          {links.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-3" style={{ color: '#2596be' }}>Preview:</p>
              <div className="flex justify-center items-center gap-3 flex-wrap">
                {labelText.trim() && (
                  <span className="text-lg font-medium mr-2" style={{ color: '#2596be' }}>
                    {labelText}
                  </span>
                )}
                {links.filter(link => link.url.trim()).map((link, index) => {
                  const platform = SOCIAL_PLATFORMS.find(p => p.id === link.platform);
                  const Icon = platform.icon;
                  return (
                    <div
                      key={index}
                      className="relative group"
                      style={{
                        width: '50px',
                        height: '50px',
                      }}
                    >
                      <div
                        className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-md cursor-pointer transition-all duration-200 hover:scale-110"
                        style={{
                          border: '2px solid #f0f0f0',
                        }}
                      >
                        <Icon className="w-6 h-6" style={{ color: platform.color }} />
                      </div>
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {platform.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: '#e5e7eb' }}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCancel();
            }}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#2596be', color: '#2596be' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={links.filter(link => link.url.trim()).length === 0}
            className="px-6 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: '#2596be' }}
          >
            Insert Social Links
          </button>
        </div>
      </div>
    </div>
  );
}

