import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Type, Palette, TextCursor } from 'lucide-react';
import { GOOGLE_FONTS, loadGoogleFont } from '../../../utils/googleFonts';

export default function FaqInput({ initialData, customFonts = [], onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Title styles
  const [titleFontFamily, setTitleFontFamily] = useState("'Poppins', sans-serif");
  const [titleFontSize, setTitleFontSize] = useState('18');
  const [titleColor, setTitleColor] = useState('#2596be');
  const [titleBgColor, setTitleBgColor] = useState('#f0fdfa');
  const [titleFontWeight, setTitleFontWeight] = useState('600');
  
  // Content styles
  const [contentFontFamily, setContentFontFamily] = useState("'Inter', sans-serif");
  const [contentFontSize, setContentFontSize] = useState('16');
  const [contentColor, setContentColor] = useState('#4a5568');
  const [contentBgColor, setContentBgColor] = useState('#ffffff');
  
  // Border and spacing
  const [borderColor, setBorderColor] = useState('#2596be');
  const [borderRadius, setBorderRadius] = useState('8');
  const [padding, setPadding] = useState('16');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setIsOpen(initialData.isOpen || false);
      
      // Title styles
      setTitleFontFamily(initialData.titleStyles?.fontFamily || "'Poppins', sans-serif");
      setTitleFontSize(initialData.titleStyles?.fontSize || '18');
      setTitleColor(initialData.titleStyles?.color || '#2596be');
      setTitleBgColor(initialData.titleStyles?.backgroundColor || '#f0fdfa');
      setTitleFontWeight(initialData.titleStyles?.fontWeight || '600');
      
      // Content styles
      setContentFontFamily(initialData.contentStyles?.fontFamily || "'Inter', sans-serif");
      setContentFontSize(initialData.contentStyles?.fontSize || '16');
      setContentColor(initialData.contentStyles?.color || '#4a5568');
      setContentBgColor(initialData.contentStyles?.backgroundColor || '#ffffff');
      
      // Border and spacing
      setBorderColor(initialData.borderColor || '#2596be');
      setBorderRadius(initialData.borderRadius || '8');
      setPadding(initialData.padding || '16');
    }
  }, [initialData]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    const data = {
      title,
      content,
      isOpen,
      titleStyles: {
        fontFamily: titleFontFamily,
        fontSize: titleFontSize + 'px',
        color: titleColor,
        backgroundColor: titleBgColor,
        fontWeight: titleFontWeight,
      },
      contentStyles: {
        fontFamily: contentFontFamily,
        fontSize: contentFontSize + 'px',
        color: contentColor,
        backgroundColor: contentBgColor,
      },
      borderColor,
      borderRadius: borderRadius + 'px',
      padding: padding + 'px',
    };

    onSave(data);
  };

  const colorPalette = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#008000', '#FFC0CB', '#A52A2A', '#808080', '#2596be',
    '#3ba8d1', '#2d3748', '#4a5568', '#718096', '#e53e3e',
    '#f0fdfa', '#ffffff', '#f3f4f6', '#e5e7eb',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-xl font-bold" style={{ color: '#2596be' }}>
            {initialData ? 'Edit FAQ Item' : 'Insert FAQ Item'}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              FAQ Title/Question *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your question or title..."
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: '#2596be' }}
            />
          </div>

          {/* Content Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              FAQ Content/Answer
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the answer or content... You can use line breaks for paragraphs."
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 min-h-[150px]"
              style={{ borderColor: '#2596be' }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Tip: Press Enter to create new paragraphs. Use bullet points with "•" or numbers.
            </p>
          </div>

          {/* Default State */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">
              Default State:
            </label>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isOpen ? 'bg-green-100 text-green-700 border-2 border-green-600' : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
              }`}
            >
              {isOpen ? 'Open by Default' : 'Closed by Default'}
            </button>
          </div>

          {/* Title Styling */}
          <div className="border-2 rounded-lg p-4" style={{ borderColor: '#2596be' }}>
            <h4 className="text-md font-bold mb-4" style={{ color: '#2596be' }}>
              Title Styling
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Title Font Family */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Font Family
                </label>
                <select
                  value={titleFontFamily}
                  onChange={(e) => {
                    setTitleFontFamily(e.target.value);
                    const font = GOOGLE_FONTS.find(f => f.value === e.target.value);
                    if (font) loadGoogleFont(font.name);
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                  style={{ borderColor: '#2596be', fontFamily: titleFontFamily }}
                >
                  <option value="serif">Serif</option>
                  <option value="sans-serif">Sans-serif</option>
                  <option value="monospace">Monospace</option>
                  
                  {customFonts.length > 0 && (
                    <optgroup label="Custom Fonts">
                      {customFonts.map((font) => (
                        <option key={font.$id} value={`'${font.fontName}', sans-serif`}>
                          {font.fontName} (Custom)
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  <optgroup label="Bangla Fonts">
                    {GOOGLE_FONTS.filter(f => f.bangla).map((font, index) => (
                      <option key={`bangla-${index}`} value={font.value}>
                        {font.name}
                      </option>
                    ))}
                  </optgroup>
                  
                  <optgroup label="Serif Fonts">
                    {GOOGLE_FONTS.filter(f => f.category === 'serif' && !f.bangla).map((font, index) => (
                      <option key={`serif-${index}`} value={font.value}>
                        {font.name}
                      </option>
                    ))}
                  </optgroup>
                  
                  <optgroup label="Sans-serif Fonts">
                    {GOOGLE_FONTS.filter(f => f.category === 'sans-serif' && !f.bangla).map((font, index) => (
                      <option key={`sans-${index}`} value={font.value}>
                        {font.name}
                      </option>
                    ))}
                  </optgroup>
                  
                  <optgroup label="Display Fonts">
                    {GOOGLE_FONTS.filter(f => f.category === 'display').map((font, index) => (
                      <option key={`display-${index}`} value={font.value}>
                        {font.name}
                      </option>
                    ))}
                  </optgroup>
                  
                  <optgroup label="Certificate Fonts">
                    {GOOGLE_FONTS.filter(f => f.category === 'certificate').map((font, index) => (
                      <option key={`cert-${index}`} value={font.value}>
                        {font.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Title Font Size */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Font Size: {titleFontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={titleFontSize}
                  onChange={(e) => setTitleFontSize(e.target.value)}
                  className="w-full"
                  style={{ accentColor: '#2596be' }}
                />
              </div>

              {/* Title Color */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={titleColor}
                    onChange={(e) => setTitleColor(e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={titleColor}
                    onChange={(e) => setTitleColor(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div className="grid grid-cols-8 gap-1 mt-2">
                  {colorPalette.slice(0, 16).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setTitleColor(color)}
                      className="w-6 h-6 rounded border-2"
                      style={{ backgroundColor: color, borderColor: titleColor === color ? '#2596be' : '#e5e7eb' }}
                    />
                  ))}
                </div>
              </div>

              {/* Title Background Color */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={titleBgColor}
                    onChange={(e) => setTitleBgColor(e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={titleBgColor}
                    onChange={(e) => setTitleBgColor(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div className="grid grid-cols-8 gap-1 mt-2">
                  {colorPalette.slice(16).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setTitleBgColor(color)}
                      className="w-6 h-6 rounded border-2"
                      style={{ backgroundColor: color, borderColor: titleBgColor === color ? '#2596be' : '#e5e7eb' }}
                    />
                  ))}
                </div>
              </div>

              {/* Title Font Weight */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Font Weight
                </label>
                <div className="flex gap-2">
                  {['300', '400', '500', '600', '700', '800'].map((weight) => (
                    <button
                      key={weight}
                      type="button"
                      onClick={() => setTitleFontWeight(weight)}
                      className={`px-4 py-2 rounded border text-sm ${
                        titleFontWeight === weight ? 'bg-teal-100 border-teal-600' : 'bg-white border-gray-300'
                      }`}
                      style={{ fontWeight: weight }}
                    >
                      {weight === '300' ? 'Light' : weight === '400' ? 'Normal' : weight === '500' ? 'Medium' : weight === '600' ? 'Semibold' : weight === '700' ? 'Bold' : 'Extra Bold'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content Styling */}
          <div className="border-2 rounded-lg p-4" style={{ borderColor: '#3ba8d1' }}>
            <h4 className="text-md font-bold mb-4" style={{ color: '#3ba8d1' }}>
              Content Styling
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Content Font Family */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Font Family
                </label>
                <select
                  value={contentFontFamily}
                  onChange={(e) => {
                    setContentFontFamily(e.target.value);
                    const font = GOOGLE_FONTS.find(f => f.value === e.target.value);
                    if (font) loadGoogleFont(font.name);
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                  style={{ borderColor: '#3ba8d1', fontFamily: contentFontFamily }}
                >
                  <option value="serif">Serif</option>
                  <option value="sans-serif">Sans-serif</option>
                  <option value="monospace">Monospace</option>
                  
                  {customFonts.length > 0 && (
                    <optgroup label="Custom Fonts">
                      {customFonts.map((font) => (
                        <option key={font.$id} value={`'${font.fontName}', sans-serif`}>
                          {font.fontName} (Custom)
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  <optgroup label="Bangla Fonts">
                    {GOOGLE_FONTS.filter(f => f.bangla).map((font, index) => (
                      <option key={`bangla-${index}`} value={font.value}>
                        {font.name}
                      </option>
                    ))}
                  </optgroup>
                  
                  <optgroup label="Serif Fonts">
                    {GOOGLE_FONTS.filter(f => f.category === 'serif' && !f.bangla).map((font, index) => (
                      <option key={`serif-${index}`} value={font.value}>
                        {font.name}
                      </option>
                    ))}
                  </optgroup>
                  
                  <optgroup label="Sans-serif Fonts">
                    {GOOGLE_FONTS.filter(f => f.category === 'sans-serif' && !f.bangla).map((font, index) => (
                      <option key={`sans-${index}`} value={font.value}>
                        {font.name}
                      </option>
                    ))}
                  </optgroup>
                  
                  <optgroup label="Display Fonts">
                    {GOOGLE_FONTS.filter(f => f.category === 'display').map((font, index) => (
                      <option key={`display-${index}`} value={font.value}>
                        {font.name}
                      </option>
                    ))}
                  </optgroup>
                  
                  <optgroup label="Certificate Fonts">
                    {GOOGLE_FONTS.filter(f => f.category === 'certificate').map((font, index) => (
                      <option key={`cert-${index}`} value={font.value}>
                        {font.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Content Font Size */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Font Size: {contentFontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={contentFontSize}
                  onChange={(e) => setContentFontSize(e.target.value)}
                  className="w-full"
                  style={{ accentColor: '#3ba8d1' }}
                />
              </div>

              {/* Content Color */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={contentColor}
                    onChange={(e) => setContentColor(e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={contentColor}
                    onChange={(e) => setContentColor(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div className="grid grid-cols-8 gap-1 mt-2">
                  {colorPalette.slice(0, 16).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setContentColor(color)}
                      className="w-6 h-6 rounded border-2"
                      style={{ backgroundColor: color, borderColor: contentColor === color ? '#3ba8d1' : '#e5e7eb' }}
                    />
                  ))}
                </div>
              </div>

              {/* Content Background Color */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={contentBgColor}
                    onChange={(e) => setContentBgColor(e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={contentBgColor}
                    onChange={(e) => setContentBgColor(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div className="grid grid-cols-8 gap-1 mt-2">
                  {colorPalette.slice(16).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setContentBgColor(color)}
                      className="w-6 h-6 rounded border-2"
                      style={{ backgroundColor: color, borderColor: contentBgColor === color ? '#3ba8d1' : '#e5e7eb' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Border & Spacing */}
          <div className="border-2 rounded-lg p-4" style={{ borderColor: '#718096' }}>
            <h4 className="text-md font-bold mb-4" style={{ color: '#718096' }}>
              Border & Spacing
            </h4>
            
            <div className="grid md:grid-cols-3 gap-4">
              {/* Border Color */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Border Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded text-sm"
                  />
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Border Radius: {borderRadius}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(e.target.value)}
                  className="w-full"
                  style={{ accentColor: '#718096' }}
                />
              </div>

              {/* Padding */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Padding: {padding}px
                </label>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={padding}
                  onChange={(e) => setPadding(e.target.value)}
                  className="w-full"
                  style={{ accentColor: '#718096' }}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="border-2 rounded-lg p-4" style={{ borderColor: '#2596be' }}>
            <h4 className="text-md font-bold mb-4" style={{ color: '#2596be' }}>
              Preview
            </h4>
            
            <div 
              className="border-2 rounded overflow-hidden"
              style={{ 
                borderColor: borderColor,
                borderRadius: borderRadius + 'px'
              }}
            >
              {/* Title */}
              <div 
                className="flex items-center gap-3 cursor-pointer"
                style={{
                  fontFamily: titleFontFamily,
                  fontSize: titleFontSize + 'px',
                  color: titleColor,
                  backgroundColor: titleBgColor,
                  fontWeight: titleFontWeight,
                  padding: padding + 'px',
                }}
              >
                {/* Plus/Minus Icon */}
                <span className="flex-shrink-0">
                  {isOpen ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="16"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                  )}
                </span>
                
                {/* Title Text */}
                <span className="flex-1">{title || 'Your question will appear here'}</span>
                
                {/* Chevron */}
                <span className="flex-shrink-0" style={{ opacity: 0.7 }}>
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </div>
              
              {/* Content */}
              {isOpen && (
                <div 
                  style={{
                    fontFamily: contentFontFamily,
                    fontSize: contentFontSize + 'px',
                    color: contentColor,
                    backgroundColor: contentBgColor,
                    padding: padding + 'px',
                    borderTop: `1px solid ${borderColor}`,
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.6',
                  }}
                >
                  {content || 'Your answer will appear here. You can add multiple paragraphs and lists.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border-2 rounded-lg font-medium transition-colors"
            style={{ borderColor: '#2596be', color: '#2596be' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-lg text-white font-medium transition-colors"
            style={{ backgroundColor: '#2596be' }}
          >
            {initialData ? 'Update' : 'Insert'} FAQ
          </button>
        </div>
      </div>
    </div>
  );
}

