import React, { useState, useEffect } from 'react';
import { X, Check, MousePointerClick } from 'lucide-react';

const PRESETS = [
  {
    id: 'modern-primary',
    name: 'Modern Primary',
    className: 'btn-design-modern-primary',
    style: {
      backgroundColor: '#2596be',
      color: '#ffffff',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      border: 'none',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    }
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    className: 'btn-design-neon-glow',
    style: {
      backgroundColor: '#000000',
      color: '#00ff00',
      padding: '12px 24px',
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: 'bold',
      border: '2px solid #00ff00',
      boxShadow: '0 0 10px #00ff00',
      textTransform: 'uppercase'
    }
  },
  {
    id: 'glass-morphism',
    name: 'Glass Morphism',
    className: 'btn-design-glass',
    style: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: '#1f2937',
      padding: '12px 24px',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '500',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
    }
  },
  {
    id: 'gradient-sunset',
    name: 'Sunset Gradient',
    className: 'btn-design-sunset',
    style: {
      backgroundImage: 'linear-gradient(45deg, #FF512F 0%, #DD2476 100%)',
      color: '#ffffff',
      padding: '12px 30px',
      borderRadius: '50px',
      fontSize: '16px',
      fontWeight: 'bold',
      border: 'none',
      boxShadow: '0 10px 20px rgba(221, 36, 118, 0.3)'
    }
  },
  {
    id: 'outline-minimal',
    name: 'Minimal Outline',
    className: 'btn-design-outline',
    style: {
      backgroundColor: 'transparent',
      color: '#2596be',
      padding: '10px 24px',
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: '500',
      border: '2px solid #2596be',
      transition: 'all 0.3s ease'
    }
  },
  {
    id: '3d-pop',
    name: '3D Pop',
    className: 'btn-design-3d',
    style: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      padding: '12px 24px',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: 'bold',
      border: 'none',
      boxShadow: '0 6px 0 #1d4ed8',
      transform: 'translateY(-2px)'
    }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    className: 'btn-design-cyberpunk',
    style: {
      backgroundColor: '#fcee0a',
      color: '#000000',
      padding: '12px 24px',
      borderRadius: '0px',
      fontSize: '16px',
      fontWeight: '900',
      border: '2px solid #000000',
      boxShadow: '4px 4px 0 #000000',
      textTransform: 'uppercase',
      letterSpacing: '2px'
    }
  },
  {
    id: 'soft-shadow',
    name: 'Soft Shadow',
    className: 'btn-design-soft',
    style: {
      backgroundColor: '#ffffff',
      color: '#4b5563',
      padding: '12px 24px',
      borderRadius: '16px',
      fontSize: '16px',
      fontWeight: '600',
      border: 'none',
      boxShadow: '5px 5px 10px #d1d5db, -5px -5px 10px #ffffff'
    }
  },
  {
    id: 'pill-dark',
    name: 'Dark Pill',
    className: 'btn-design-pill',
    style: {
      backgroundColor: '#111827',
      color: '#ffffff',
      padding: '10px 32px',
      borderRadius: '9999px',
      fontSize: '15px',
      fontWeight: '500',
      border: '1px solid #374151'
    }
  },
  {
    id: 'retro-pixel',
    name: 'Retro Pixel',
    className: 'btn-design-pixel',
    style: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
      padding: '12px 20px',
      borderRadius: '0',
      fontSize: '16px',
      fontWeight: 'bold',
      border: '4px solid #000000',
      boxShadow: 'inset -4px -4px 0 rgba(0,0,0,0.2)',
      fontFamily: '"Courier New", monospace'
    }
  }
];

export default function ButtonInput({ initialData, customFonts = [], googleFonts = [], onSave, onCancel }) {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [customStyles, setCustomStyles] = useState({});
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' or 'custom'

  useEffect(() => {
    if (initialData) {
      setText(initialData.text || '');
      setUrl(initialData.url || '');
      
      // Try to find matching preset by class name
      const preset = PRESETS.find(p => p.className === initialData.className);
      if (preset) {
        setSelectedPreset(preset);
      }
      
      // Load custom styles
      if (initialData.styles) {
        setCustomStyles(initialData.styles);
      }
    }
  }, [initialData]);

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    // Reset custom styles when picking a new preset to ensure the new design takes full effect
    setCustomStyles({});
  };

  const handleStyleChange = (key, value) => {
    setCustomStyles(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Merge preset styles with custom styles
    // We will save the className for the preset, and inline styles for overrides
    onSave({
      text,
      url,
      className: selectedPreset.className,
      styles: customStyles
    });
  };

  // Combine preset styles with custom overrides for preview
  const getPreviewStyle = () => {
    return {
      ...selectedPreset.style,
      ...customStyles,
      cursor: 'pointer',
      display: 'inline-block',
      textDecoration: 'none',
      textAlign: 'center'
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <MousePointerClick className="w-5 h-5 text-teal-700" />
            {initialData ? 'Edit Button' : 'Insert Button'}
          </h3>
          <button type="button" onClick={onCancel} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Click me"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">Opens in a new tab</p>
              </div>

              {/* Tabs */}
              <div className="flex border-b mt-6">
                <button
                  type="button"
                  className={`px-4 py-2 font-medium text-sm ${activeTab === 'presets' ? 'text-teal-700 border-b-2 border-teal-700' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('presets')}
                >
                  Presets
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 font-medium text-sm ${activeTab === 'custom' ? 'text-teal-700 border-b-2 border-teal-700' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('custom')}
                >
                  Customization
                </button>
              </div>

              {/* Presets List */}
              {activeTab === 'presets' && (
                <div className="grid grid-cols-2 gap-3 mt-4 max-h-[300px] overflow-y-auto pr-2">
                  {PRESETS.map(preset => (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`border rounded-lg p-2 hover:border-teal-500 transition-all text-left group ${selectedPreset.id === preset.id ? 'ring-2 ring-teal-500 border-transparent' : ''}`}
                    >
                      <div className="flex items-center justify-center h-12 mb-2 bg-gray-50 rounded overflow-hidden">
                        <div style={{ ...preset.style, padding: '4px 8px', fontSize: '10px', transform: 'scale(0.8)' }}>
                          Button
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-700 group-hover:text-teal-700 block text-center">{preset.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Customization Controls */}
              {activeTab === 'custom' && (
                <div className="space-y-3 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Background Color</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={customStyles.backgroundColor || selectedPreset.style.backgroundColor}
                        onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border"
                      />
                      <input 
                        type="text" 
                        value={customStyles.backgroundColor || selectedPreset.style.backgroundColor}
                        onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                        className="flex-1 border rounded px-2 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Text Color</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={customStyles.color || selectedPreset.style.color}
                        onChange={(e) => handleStyleChange('color', e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border"
                      />
                      <input 
                        type="text" 
                        value={customStyles.color || selectedPreset.style.color}
                        onChange={(e) => handleStyleChange('color', e.target.value)}
                        className="flex-1 border rounded px-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Font Size</label>
                      <input 
                        type="text" 
                        value={customStyles.fontSize || selectedPreset.style.fontSize}
                        onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                        className="w-full border rounded px-2 py-1.5 text-sm"
                        placeholder="16px"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Border Radius</label>
                      <input 
                        type="text" 
                        value={customStyles.borderRadius || selectedPreset.style.borderRadius}
                        onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                        className="w-full border rounded px-2 py-1.5 text-sm"
                        placeholder="4px"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Font Family</label>
                    <select 
                      value={customStyles.fontFamily || 'inherit'}
                      onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                      className="w-full border rounded px-2 py-1.5 text-sm"
                    >
                      <option value="inherit">Default</option>
                      <option value="sans-serif">Sans Serif</option>
                      <option value="serif">Serif</option>
                      <option value="monospace">Monospace</option>
                      {googleFonts.map((font, index) => (
                        <option key={`google-${index}`} value={font.value}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Preview */}
            <div className="bg-gray-100 rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-gray-300">
              <label className="text-sm font-medium text-gray-500 mb-8">Live Preview</label>
              
              <button
                type="button"
                style={getPreviewStyle()}
                onClick={(e) => e.preventDefault()}
              >
                {text || 'Button Text'}
              </button>

              <div className="mt-8 text-xs text-gray-400 text-center max-w-xs">
                This is how your button will appear. Hover effects will be active in the final page.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!text.trim()}
            className="px-6 py-2 rounded-lg bg-teal-700 text-white hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {initialData ? 'Update Button' : 'Insert Button'}
          </button>
        </div>
      </div>
    </div>
  );
}

