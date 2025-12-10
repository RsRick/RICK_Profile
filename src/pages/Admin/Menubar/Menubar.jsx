import React, { useState, useEffect } from 'react';
import {
  Upload,
  Save,
  GripVertical,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  databaseService,
  storageService,
  appwriteConfig,
  ID,
} from '../../../lib/appwrite';
import FontSelector from '../../../components/FontSelector/FontSelector';

export default function Menubar() {
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [menuItemsFont, setMenuItemsFont] = useState("'Poppins', sans-serif");
  const [cvButton, setCvButton] = useState({ text: 'Get My CV', link: '#' });
  const [cvButtonFont, setCvButtonFont] = useState("'Poppins', sans-serif");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const MENUBAR_COLLECTION = 'menubar_settings';
  const STORAGE_BUCKET = appwriteConfig.storageId || 'reactbucket';

  useEffect(() => {
    loadMenubarSettings();
  }, []);

  const loadMenubarSettings = async () => {
    try {
      setLoading(true);
      // Load menu items
      const menuResult = await databaseService.listDocuments(MENUBAR_COLLECTION);
      if (menuResult.success && menuResult.data.documents.length > 0) {
        const settings = menuResult.data.documents[0];
        if (settings.menuItems) {
          setMenuItems(JSON.parse(settings.menuItems));
        }
        if (settings.menuItemsFont) {
          setMenuItemsFont(settings.menuItemsFont);
        }
        if (settings.logoUrl) {
          setLogoUrl(settings.logoUrl);
          setLogoPreview(settings.logoUrl);
        }
        if (settings.cvButton) {
          setCvButton(JSON.parse(settings.cvButton));
        }
        if (settings.cvButtonFont) {
          setCvButtonFont(settings.cvButtonFont);
        }
      } else {
        // Initialize with default menu items
        const defaultItems = [
          { id: '1', name: 'Home', href: '/', enabled: true, order: 0 },
          { id: '2', name: 'About Me', href: '/about', enabled: true, order: 1 },
          { id: '3', name: 'Project', href: '/projects', enabled: true, order: 2 },
          { id: '4', name: 'Spatial Canvas', href: '/spatial-canvas', enabled: true, order: 3 },
          { id: '5', name: 'Certificate', href: '/certificates', enabled: true, order: 4 },
          { id: '6', name: 'Blog', href: '/blogs', enabled: true, order: 5 },
          { id: '7', name: 'Experience', href: '/about#experience', enabled: true, order: 6 },
          { id: '8', name: 'Galleries', href: '/project-gallery', enabled: true, order: 7 },
          { id: '9', name: 'Shop', href: '/shop', enabled: true, order: 8 },
          { id: '10', name: 'Contact', href: '/contact', enabled: true, order: 9 },
        ];
        setMenuItems(defaultItems);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Logo size should be less than 2MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return null;

    try {
      const fileId = ID.unique();
      const result = await storageService.uploadFile(STORAGE_BUCKET, fileId, logoFile);
      if (result.success) {
        // Get file view URL (full size)
        const fileUrl = storageService.getFileView(STORAGE_BUCKET, result.data.$id);
        return fileUrl;
      }
      return null;
    } catch (error) {
      console.error('Error uploading logo:', error);
      return null;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      let finalLogoUrl = logoUrl;

      // Upload logo if new file selected
      if (logoFile) {
        finalLogoUrl = await uploadLogo();
        if (!finalLogoUrl) {
          alert('Failed to upload logo');
          setSaving(false);
          return;
        }
      }

      // Save to database
      const settingsData = {
        menuItems: JSON.stringify(menuItems),
        menuItemsFont: menuItemsFont,
        logoUrl: finalLogoUrl,
        cvButton: JSON.stringify(cvButton),
        cvButtonFont: cvButtonFont,
      };

      // Check if document exists
      const existing = await databaseService.listDocuments(MENUBAR_COLLECTION);
      if (existing.success && existing.data.documents.length > 0) {
        // Update existing
        await databaseService.updateDocument(
          MENUBAR_COLLECTION,
          existing.data.documents[0].$id,
          settingsData
        );
      } else {
        // Create new
        await databaseService.createDocument(
          MENUBAR_COLLECTION,
          settingsData
        );
      }

      setLogoUrl(finalLogoUrl);
      setLogoFile(null);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleMenuNameChange = (id, newName) => {
    setMenuItems(
      menuItems.map((item) =>
        item.id === id ? { ...item, name: newName } : item
      )
    );
  };

  const handleMenuHrefChange = (id, newHref) => {
    setMenuItems(
      menuItems.map((item) =>
        item.id === id ? { ...item, href: newHref } : item
      )
    );
  };

  const toggleMenuItem = (id) => {
    setMenuItems(
      menuItems.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const moveItem = (index, direction) => {
    const newItems = [...menuItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[index], newItems[targetIndex]] = [
        newItems[targetIndex],
        newItems[index],
      ];
      // Update order
      newItems.forEach((item, idx) => {
        item.order = idx;
      });
      setMenuItems(newItems);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold mb-8" style={{ color: '#2596be' }}>
        Menubar Management
      </h1>

      {/* Logo Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Logo Upload</h2>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Recommended size:</strong> 40x40px to 80x80px (Square)
          </p>
          <p className="text-sm text-gray-600 mb-4">
            <strong>Formats:</strong> PNG, JPG, SVG (Max 2MB)
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-20 h-20 object-contain rounded-lg border border-gray-300"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No logo</span>
              </div>
            )}
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <div
              className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{
                background: 'linear-gradient(135deg, #2596be, #3ba8d1)',
              }}
            >
              <Upload className="w-4 h-4" />
              {logoFile ? 'Change Logo' : 'Upload Logo'}
            </div>
          </label>
        </div>
      </div>

      {/* Menu Items Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Menu Items
        </h2>
        <div className="mb-4">
          <FontSelector
            value={menuItemsFont}
            onChange={setMenuItemsFont}
            label="Menu Items Font"
            previewText={menuItems[0]?.name || 'Home'}
          />
        </div>
        <div className="space-y-3">
          {menuItems
            .sort((a, b) => a.order - b.order)
            .map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-[#2596be] transition-colors"
              >
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-[#2596be] disabled:opacity-30 disabled:cursor-not-allowed p-1"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === menuItems.length - 1}
                    className="text-gray-400 hover:text-[#2596be] disabled:opacity-30 disabled:cursor-not-allowed p-1"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleMenuNameChange(item.id, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2596be]"
                />
                <input
                  type="text"
                  value={item.href}
                  onChange={(e) => handleMenuHrefChange(item.id, e.target.value)}
                  placeholder="#section"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2596be]"
                />
                <button
                  onClick={() => toggleMenuItem(item.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    item.enabled
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {item.enabled ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* CV Button Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          CV Button Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Button Text
            </label>
            <input
              type="text"
              value={cvButton.text}
              onChange={(e) =>
                setCvButton({ ...cvButton, text: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2596be]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Button Link
            </label>
            <input
              type="text"
              value={cvButton.link}
              onChange={(e) =>
                setCvButton({ ...cvButton, link: e.target.value })
              }
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2596be]"
            />
          </div>
        </div>
        <FontSelector
          value={cvButtonFont}
          onChange={setCvButtonFont}
          label="CV Button Font"
          previewText={cvButton.text}
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-lg text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #2596be, #3ba8d1)',
          }}
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}


