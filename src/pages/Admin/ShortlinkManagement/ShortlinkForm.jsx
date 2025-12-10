import { useState, useEffect } from 'react';
import { X, Link2, AlertCircle, CheckCircle2, Upload, Image as ImageIcon, Globe, Loader, Download, QrCode } from 'lucide-react';
import { checkAllCollisions, validatePathFormat } from '../../../lib/collisionDetection';
import { validateUrl } from '../../../lib/shortlinkService';
import { getActiveDomains } from '../../../lib/domainService';
import { useToast } from '../../../contexts/ToastContext';
import QRCode from 'qrcode';

export default function ShortlinkForm({ shortlink, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    destinationUrl: '',
    customPath: '',
    autoGenerate: false,
    previewImage: null,
    title: '',
    description: '',
    domainId: null,
    generateQR: false,
    usePrefix: false,
    customPrefix: ''
  });

  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [collisionCheck, setCollisionCheck] = useState({ checking: false, result: null });
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    loadDomains();
    
    if (shortlink) {
      // Check if path contains a prefix (has a slash)
      const hasPrefix = shortlink.customPath.includes('/');
      const prefix = hasPrefix ? shortlink.customPath.split('/')[0] : '';
      const path = hasPrefix ? shortlink.customPath.split('/')[1] : shortlink.customPath;
      
      setFormData({
        destinationUrl: shortlink.destinationUrl,
        customPath: path,
        autoGenerate: false,
        previewImage: null,
        title: shortlink.title || '',
        description: shortlink.description || '',
        domainId: shortlink.domainId || null,
        generateQR: false,
        usePrefix: hasPrefix,
        customPrefix: prefix
      });
      setPreviewImageUrl(shortlink.previewImageUrl || '');
      
      // Generate QR code for existing shortlink
      generateQRCode(getShortUrl(shortlink.customPath, shortlink.domainId));
    }
  }, [shortlink]);

  // Generate QR code when path or domain changes
  useEffect(() => {
    if (formData.generateQR && (formData.customPath || formData.autoGenerate)) {
      const url = getShortUrl(formData.customPath || '[auto-generated]', formData.domainId);
      generateQRCode(url);
    }
  }, [formData.customPath, formData.domainId, formData.generateQR]);

  const loadDomains = async () => {
    try {
      const activeDomains = await getActiveDomains();
      setDomains(activeDomains);
    } catch (error) {
      console.error('Error loading domains:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: null }));

    // Check collision when custom path or prefix changes
    if ((name === 'customPath' || name === 'customPrefix') && value && !formData.autoGenerate) {
      debouncedCollisionCheck(name === 'customPath' ? value : formData.customPath);
    }
    
    // Re-check collision when prefix is toggled
    if (name === 'usePrefix' && formData.customPath) {
      debouncedCollisionCheck(formData.customPath);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        showToast('Image must be JPEG, PNG, WebP, or GIF format', 'error');
        return;
      }

      setFormData(prev => ({ ...prev, previewImage: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, previewImage: null }));
    setPreviewImageUrl('');
  };

  let collisionTimeout;
  const debouncedCollisionCheck = (path) => {
    clearTimeout(collisionTimeout);
    setCollisionCheck({ checking: true, result: null });
    
    collisionTimeout = setTimeout(async () => {
      try {
        // Build full path with prefix if enabled
        let fullPath = path;
        if (formData.usePrefix && formData.customPrefix) {
          fullPath = `${formData.customPrefix}/${path}`;
        }
        
        const result = await checkAllCollisions(fullPath, shortlink?.$id);
        setCollisionCheck({ checking: false, result });
      } catch (error) {
        console.error('Error checking collision:', error);
        setCollisionCheck({ checking: false, result: null });
      }
    }, 500);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate destination URL
    const urlValidation = validateUrl(formData.destinationUrl);
    if (!urlValidation.isValid) {
      newErrors.destinationUrl = urlValidation.error;
    }

    // Validate custom path if not auto-generating
    if (!formData.autoGenerate && formData.customPath) {
      const pathValidation = validatePathFormat(formData.customPath);
      if (!pathValidation.isValid) {
        newErrors.customPath = pathValidation.error;
      }

      // Validate prefix if enabled
      if (formData.usePrefix) {
        if (!formData.customPrefix) {
          newErrors.customPath = 'Prefix is required when "Use Custom Prefix" is enabled';
        } else {
          const prefixValidation = validatePathFormat(formData.customPrefix);
          if (!prefixValidation.isValid) {
            newErrors.customPath = `Prefix error: ${prefixValidation.error}`;
          }
        }
      }

      // Check for collisions
      if (collisionCheck.result?.hasCollision) {
        newErrors.customPath = collisionCheck.result.collisions[0].message;
      }
    }

    // Validate custom path is provided if not auto-generating
    if (!formData.autoGenerate && !formData.customPath) {
      newErrors.customPath = 'Custom path is required when not auto-generating';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the errors before submitting', 'error');
      return;
    }

    try {
      setLoading(true);
      
      // Build the full custom path with prefix if enabled
      const submitData = { ...formData };
      if (formData.usePrefix && formData.customPrefix) {
        submitData.customPath = `${formData.customPrefix}/${formData.customPath}`;
      }
      
      await onSubmit(submitData);
    } catch (error) {
      // Error is handled by parent component
    } finally {
      setLoading(false);
    }
  };

  const getShortUrl = (path = null, domainId = null) => {
    const domain = domains.find(d => d.$id === (domainId || formData.domainId));
    const hostname = domain ? domain.domain : window.location.hostname;
    
    // Build the full path with prefix if enabled
    let fullPath = path || formData.customPath || '[auto-generated]';
    if (formData.usePrefix && formData.customPrefix) {
      fullPath = `${formData.customPrefix}/${fullPath}`;
    }
    
    return `https://${hostname}/${fullPath}`;
  };

  const generateQRCode = async (url) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#2596be',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-${formData.customPath || 'shortlink'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('QR code downloaded successfully', 'success');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#2596be' }}>
            {shortlink ? 'Edit Shortlink' : 'Create Shortlink'}
          </h1>
          <p className="text-gray-600 mt-1">
            {shortlink ? 'Update your shortened URL' : 'Create a new shortened URL'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-300 hover:scale-105"
          style={{ borderColor: '#2596be', color: '#2596be' }}
        >
          <X className="w-5 h-5" />
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destination URL */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#2596be' }}>
            Destination URL
          </h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Long URL (Destination) *
            </label>
            <input
              type="url"
              name="destinationUrl"
              value={formData.destinationUrl}
              onChange={handleInputChange}
              required
              placeholder="https://example.com/very/long/url"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.destinationUrl ? 'border-red-500' : ''
              }`}
              style={{ borderColor: errors.destinationUrl ? '#ef4444' : '#2596be' }}
            />
            {errors.destinationUrl && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.destinationUrl}
              </p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Enter the full URL you want to shorten
            </p>
          </div>
        </div>

        {/* Custom Path */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#2596be' }}>
            Short URL Path
          </h2>

          {/* Auto-generate toggle */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="autoGenerate"
                checked={formData.autoGenerate}
                onChange={handleInputChange}
                className="w-5 h-5 cursor-pointer"
              />
              <div>
                <span className="font-medium">Auto-generate short path</span>
                <p className="text-sm text-gray-600">
                  Let the system create a random short path for you
                </p>
              </div>
            </label>
          </div>

          {/* Custom path input */}
          {!formData.autoGenerate && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Custom Path *
              </label>
              
              {/* Prefix/Suffix Option */}
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="usePrefix"
                    checked={formData.usePrefix}
                    onChange={handleInputChange}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-medium text-sm">Use Custom Prefix/Group</span>
                    <p className="text-xs text-gray-600">
                      Create organized links like: <code className="bg-white px-1 rounded">group1/my-link</code>
                    </p>
                  </div>
                </label>
                
                {formData.usePrefix && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium mb-1 text-gray-700">
                      Prefix/Group Name
                    </label>
                    <input
                      type="text"
                      name="customPrefix"
                      value={formData.customPrefix}
                      onChange={handleInputChange}
                      placeholder="group1"
                      pattern="[a-zA-Z0-9_-]+"
                      minLength={2}
                      maxLength={30}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                      style={{ borderColor: '#2596be' }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      2-30 characters, letters, numbers, hyphens, and underscores only
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {formData.usePrefix && formData.customPrefix && (
                  <>
                    <span className="text-gray-500">/</span>
                    <span className="px-3 py-2 bg-blue-50 text-blue-700 rounded font-mono text-sm">
                      {formData.customPrefix}
                    </span>
                  </>
                )}
                <span className="text-gray-500">/</span>
                <input
                  type="text"
                  name="customPath"
                  value={formData.customPath}
                  onChange={handleInputChange}
                  required={!formData.autoGenerate}
                  placeholder="my-custom-link"
                  pattern="[a-zA-Z0-9_-]+"
                  minLength={3}
                  maxLength={50}
                  className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.customPath ? 'border-red-500' : ''
                  }`}
                  style={{ borderColor: errors.customPath ? '#ef4444' : '#2596be' }}
                />
              </div>
              
              {/* Collision check status */}
              {formData.customPath && !formData.autoGenerate && (
                <div className="mt-2">
                  {collisionCheck.checking ? (
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Checking availability...
                    </p>
                  ) : collisionCheck.result?.hasCollision ? (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {collisionCheck.result.collisions[0].message}
                    </p>
                  ) : collisionCheck.result && !collisionCheck.result.hasCollision ? (
                    <p className="text-green-500 text-sm flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Path is available!
                    </p>
                  ) : null}
                </div>
              )}

              {errors.customPath && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.customPath}
                </p>
              )}
              
              <p className="text-gray-500 text-sm mt-1">
                3-50 characters, letters, numbers, hyphens, and underscores only
              </p>
            </div>
          )}

          {/* Domain selector */}
          {domains.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                Domain (Optional)
              </label>
              <select
                name="domainId"
                value={formData.domainId || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#2596be' }}
              >
                <option value="">Main domain ({window.location.hostname})</option>
                {domains.map(domain => (
                  <option key={domain.$id} value={domain.$id}>
                    {domain.domain}
                  </option>
                ))}
              </select>
              <p className="text-gray-500 text-sm mt-1">
                Select a custom domain or use the main domain
              </p>
            </div>
          )}

          {/* Preview of short URL */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-1">Short URL Preview:</p>
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-600" />
              <code className="text-blue-900 font-mono">{getShortUrl()}</code>
            </div>
          </div>

          {/* QR Code Generation */}
          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                name="generateQR"
                checked={formData.generateQR}
                onChange={handleInputChange}
                className="w-5 h-5 cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5" style={{ color: '#2596be' }} />
                <div>
                  <span className="font-medium">Generate QR Code</span>
                  <p className="text-sm text-gray-600">
                    Create a downloadable QR code for this shortlink
                  </p>
                </div>
              </div>
            </label>

            {formData.generateQR && qrCodeUrl && (
              <div className="mt-4 p-4 bg-white border rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32 border rounded" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">QR Code Preview</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Scan this QR code to access the shortlink directly
                    </p>
                    <button
                      type="button"
                      onClick={downloadQRCode}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-300 hover:scale-105"
                      style={{ borderColor: '#2596be', color: '#2596be' }}
                    >
                      <Download className="w-4 h-4" />
                      Download QR Code
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Image */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#2596be' }}>
            Social Media Preview (Optional)
          </h2>

          <div>
            <label className="block text-sm font-medium mb-2">
              Preview Image
            </label>
            
            {!previewImageUrl ? (
              <label className="w-full flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#2596be' }}
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload preview image
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, WebP or GIF (max 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={previewImageUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="text-gray-500 text-sm mt-2">
              This image will be shown when the link is shared on social media platforms
            </p>
          </div>

          {/* Open Graph fields */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Page title for social media"
                maxLength={60}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#2596be' }}
              />
              <p className="text-gray-500 text-sm mt-1">
                {formData.title.length}/60 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description for social media"
                maxLength={160}
                rows={3}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#2596be' }}
              />
              <p className="text-gray-500 text-sm mt-1">
                {formData.description.length}/160 characters
              </p>
            </div>
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-lg border-2 transition-all duration-300 hover:scale-105"
            style={{ borderColor: '#2596be', color: '#2596be' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || (collisionCheck.checking && !formData.autoGenerate)}
            className="px-6 py-3 rounded-lg text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ backgroundColor: '#2596be' }}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                {shortlink ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {shortlink ? 'Update Shortlink' : 'Create Shortlink'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

