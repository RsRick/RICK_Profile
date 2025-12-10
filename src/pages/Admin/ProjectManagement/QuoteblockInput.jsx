import React, { useState, useEffect } from 'react';
import { X, Check, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const PRESETS = [
  {
    id: 'modern',
    name: 'Modern',
    style: {
      backgroundColor: '#f9fafb',
      color: '#374151',
      borderLeft: '4px solid #9ca3af',
      fontFamily: 'sans-serif',
      fontSize: '16px',
      padding: '1rem',
      fontStyle: 'normal',
      fontWeight: 'normal',
      borderRadius: '0.25rem'
    }
  },
  {
    id: 'classic',
    name: 'Classic',
    style: {
      backgroundColor: '#fffbeb',
      color: '#92400e',
      borderLeft: 'none',
      fontFamily: 'serif',
      fontSize: '18px',
      padding: '1.5rem',
      fontStyle: 'italic',
      fontWeight: 'normal',
      borderRadius: '0.5rem'
    }
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    style: {
      backgroundColor: '#8b5cf6',
      backgroundImage: 'linear-gradient(to right, #8b5cf6, #ec4899)',
      color: '#ffffff',
      borderLeft: 'none',
      fontFamily: 'sans-serif',
      fontSize: '20px',
      padding: '2rem',
      fontStyle: 'normal',
      fontWeight: 'bold',
      borderRadius: '1rem',
      textAlign: 'center'
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    style: {
      backgroundColor: 'transparent',
      color: '#111827',
      borderLeft: 'none',
      fontFamily: 'sans-serif',
      fontSize: '24px',
      padding: '1rem',
      fontStyle: 'normal',
      fontWeight: '300',
      borderRadius: '0',
      textAlign: 'center'
    }
  },
  {
    id: 'code',
    name: 'Code-like',
    style: {
      backgroundColor: '#1f2937',
      color: '#4ade80',
      borderLeft: 'none',
      fontFamily: 'monospace',
      fontSize: '14px',
      padding: '1.5rem',
      fontStyle: 'normal',
      fontWeight: 'normal',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }
  }
];

export default function QuoteblockInput({ initialData, customFonts = [], googleFonts = [], onSave, onCancel }) {
  const [content, setContent] = useState('');
  const [styles, setStyles] = useState(PRESETS[0].style);
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' or 'custom'

  // Helper to convert RGB/RGBA to Hex
  const rgbToHex = (color) => {
    if (!color) return '#000000';
    if (color.startsWith('#')) return color;
    if (color === 'transparent') return '#ffffff';
    
    const rgb = color.match(/\d+/g);
    if (!rgb) return '#000000';
    
    return '#' + ((1 << 24) + (parseInt(rgb[0]) << 16) + (parseInt(rgb[1]) << 8) + (parseInt(rgb[2]))).toString(16).slice(1);
  };

  useEffect(() => {
    if (initialData) {
      setContent(initialData.text || '');
      if (initialData.styles) {
        // Deep copy and convert colors to hex for inputs
        const newStyles = { ...initialData.styles };
        if (newStyles.backgroundColor) newStyles.backgroundColor = rgbToHex(newStyles.backgroundColor);
        if (newStyles.color) newStyles.color = rgbToHex(newStyles.color);
        setStyles(newStyles);
      }
    }
  }, [initialData]);

  const handlePresetSelect = (preset) => {
    setStyles(preset.style);
  };

  const handleStyleChange = (key, value) => {
    setStyles(prev => {
      const newStyles = { ...prev, [key]: value };
      // If changing background color, clear background image to ensure color is visible
      if (key === 'backgroundColor') {
        newStyles.backgroundImage = 'none';
      }
      return newStyles;
    });
  };

  const handleSave = () => {
    onSave({
      text: content,
      styles: styles
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Quote className="w-5 h-5 text-teal-700" />
            {initialData ? 'Edit Quoteblock' : 'Insert Quoteblock'}
          </h3>
          <button type="button" onClick={onCancel} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Preview Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
            <div 
              className="w-full min-h-[100px] break-words"
              style={styles}
            >
              {content || 'Your quote text will appear here...'}
            </div>
          </div>

          {/* Content Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your quote here..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 min-h-[100px]"
              autoFocus
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b mb-4">
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

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRESETS.map(preset => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className="border rounded-lg p-2 hover:border-teal-500 transition-all text-left group"
                >
                  <div 
                    className="w-full h-16 mb-2 overflow-hidden text-[10px] p-1"
                    style={{ ...preset.style, fontSize: '10px', padding: '4px' }}
                  >
                    Preview
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-teal-700">{preset.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Customization Tab */}
          {activeTab === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Background Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={styles.backgroundColor}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer border"
                  />
                  <input 
                    type="text" 
                    value={styles.backgroundColor}
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
                    value={styles.color}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer border"
                  />
                  <input 
                    type="text" 
                    value={styles.color}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="flex-1 border rounded px-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Font Size</label>
                <input 
                  type="number" 
                  value={parseInt(styles.fontSize)}
                  onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Font Family</label>
                <select 
                  value={styles.fontFamily ? styles.fontFamily.replace(/"/g, "'") : 'sans-serif'}
                  onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                >
                  <option value="sans-serif">Sans Serif</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                  <option value="'Inter', sans-serif">Inter</option>
                  <option value="'Roboto', sans-serif">Roboto</option>
                  {customFonts.length > 0 && (
                    <optgroup label="Custom Fonts">
                      {customFonts.map((font, index) => (
                        <option key={`custom-${index}`} value={font.fontName}>
                          {font.fontName}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {googleFonts.length > 0 && (
                    <optgroup label="Google Fonts">
                      {googleFonts.map((font, index) => (
                        <option key={`google-${index}`} value={font.value}>
                          {font.name} {font.bangla ? '(Bangla)' : ''}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
              
               <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Text Align</label>
                <select 
                  value={styles.textAlign || 'left'}
                  onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Border Radius</label>
                <input 
                  type="text" 
                  value={styles.borderRadius || '0'}
                  onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                  placeholder="e.g. 0.5rem"
                />
              </div>
            </div>
          )}
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
            disabled={!content.trim()}
            className="px-6 py-2 rounded-lg bg-teal-700 text-white hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {initialData ? 'Update Quote' : 'Insert Quote'}
          </button>
        </div>
      </div>
    </div>
  );
}

