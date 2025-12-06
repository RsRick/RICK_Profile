import React, { useState, useEffect } from 'react';
import { Type, Search, X } from 'lucide-react';
import { GOOGLE_FONTS, loadGoogleFont } from '../../utils/googleFonts';
import { databaseService } from '../../lib/appwrite';
import { loadCustomFont } from '../../utils/fontLoader';

export default function FontSelector({ value, onChange, label = 'Font', previewText = 'Preview Text' }) {
  const [customFonts, setCustomFonts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadCustomFonts();
  }, []);

  const loadCustomFonts = async () => {
    try {
      const result = await databaseService.listDocuments('custom_fonts');
      if (result.success && result.data.documents.length > 0) {
        const fonts = result.data.documents.map(doc => ({
          name: doc.fontName,
          value: `'${doc.fontName}', sans-serif`,
          category: 'custom',
          fileUrl: doc.fileUrl,
          custom: true
        }));
        setCustomFonts(fonts);
        
        // Load custom fonts into DOM
        fonts.forEach(font => {
          loadCustomFont(font.name, font.fileUrl);
        });
      }
    } catch (error) {
      console.error('Error loading custom fonts:', error);
    }
  };

  // Combine Google Fonts and Custom Fonts
  const allFonts = [...GOOGLE_FONTS, ...customFonts];

  // Filter fonts based on search and category
  const filteredFonts = allFonts.filter(font => {
    const matchesSearch = font.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || font.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFontSelect = (font) => {
    onChange(font.value);
    setIsOpen(false);
    
    // Load Google Font if not custom
    if (!font.custom) {
      loadGoogleFont(font.name);
    }
  };

  // Get current font name from value
  const getCurrentFontName = () => {
    const font = allFonts.find(f => f.value === value);
    return font ? font.name : 'Select Font';
  };

  const isCustomFont = (font) => font.custom === true;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Selected Font Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{getCurrentFontName()}</span>
          {allFonts.find(f => f.value === value)?.custom && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Custom</span>
          )}
          {allFonts.find(f => f.value === value)?.bangla && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">বাংলা</span>
          )}
        </div>
        <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Font Preview */}
      <div 
        className="mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50"
        style={{ fontFamily: value }}
      >
        <p className="text-lg">{previewText}</p>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Search and Filter */}
          <div className="p-3 border-b border-gray-200 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fonts..."
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'serif', 'sans-serif', 'display', 'certificate', 'custom'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#105652] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat === 'certificate' ? 'Certificate' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Font List */}
          <div className="overflow-y-auto max-h-80">
            {filteredFonts.length > 0 ? (
              filteredFonts.map((font, index) => (
                <button
                  key={index}
                  onClick={() => handleFontSelect(font)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    value === font.value ? 'bg-blue-50' : ''
                  }`}
                  style={{ fontFamily: font.value }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${isCustomFont(font) ? 'text-purple-700' : 'text-gray-900'}`}>
                          {font.name}
                        </span>
                        {isCustomFont(font) && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Custom</span>
                        )}
                        {font.bangla && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">বাংলা</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">The quick brown fox jumps</p>
                    </div>
                    {value === font.value && (
                      <span className="text-[#105652] font-bold">✓</span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No fonts found matching "{searchQuery}"
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="p-2 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
