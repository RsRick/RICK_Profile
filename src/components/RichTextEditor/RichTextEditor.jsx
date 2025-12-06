import { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Type,
  Palette,
  ChevronDown,
} from 'lucide-react';
import { GOOGLE_FONTS, loadGoogleFont } from '../../utils/googleFonts';

const FONT_SIZES = [
  { label: 'Small', value: '12' },
  { label: 'Normal', value: '14' },
  { label: 'Medium', value: '16' },
  { label: 'Large', value: '18' },
  { label: 'X-Large', value: '24' },
  { label: 'XX-Large', value: '32' },
];

const COLORS = [
  '#000000', '#333333', '#666666', '#999999',
  '#105652', '#1E8479', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#3b82f6', '#8b5cf6',
];

export default function RichTextEditor({ value, onChange, placeholder, minHeight = '150px' }) {
  const editorRef = useRef(null);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showFonts, setShowFonts] = useState(false);
  const [fontSearch, setFontSearch] = useState('');
  const savedSelectionRef = useRef(null);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-picker')) {
        setShowFontSize(false);
        setShowColors(false);
        setShowFonts(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter fonts based on search
  const filteredFonts = GOOGLE_FONTS.filter(font => 
    font.name.toLowerCase().includes(fontSearch.toLowerCase())
  );

  // Save current selection
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  // Restore saved selection
  const restoreSelection = () => {
    if (savedSelectionRef.current && editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
      return true;
    }
    return false;
  };

  // Update content
  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Execute command
  const execCommand = (command, val = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    updateContent();
  };

  // Apply style to selection while preserving HTML structure (including line breaks)
  const applyStyleToSelection = (styleProp, styleValue) => {
    if (!restoreSelection()) return;
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return; // No selection

    // Clone the selected content to preserve HTML structure
    const fragment = range.cloneContents();
    
    // Create a wrapper span with the style
    const wrapper = document.createElement('span');
    
    if (styleProp === 'fontSize') {
      wrapper.style.fontSize = `${styleValue}px`;
    } else if (styleProp === 'color') {
      wrapper.style.color = styleValue;
    } else if (styleProp === 'fontFamily') {
      // Load the font first
      const fontObj = GOOGLE_FONTS.find(f => f.value === styleValue);
      if (fontObj) {
        loadGoogleFont(fontObj.name);
      }
      wrapper.style.fontFamily = styleValue;
    }
    
    // Append the cloned content (preserves line breaks and structure)
    wrapper.appendChild(fragment);
    
    // Delete the original selection and insert the styled wrapper
    range.deleteContents();
    range.insertNode(wrapper);
    
    // Move cursor after the wrapper
    range.setStartAfter(wrapper);
    range.setEndAfter(wrapper);
    selection.removeAllRanges();
    selection.addRange(range);

    updateContent();
  };

  // Apply font size
  const applySize = (size) => {
    applyStyleToSelection('fontSize', size);
    setShowFontSize(false);
  };

  // Apply color
  const applyColor = (color) => {
    applyStyleToSelection('color', color);
    setShowColors(false);
  };

  // Apply font family
  const applyFont = (fontValue) => {
    applyStyleToSelection('fontFamily', fontValue);
    setShowFonts(false);
    setFontSearch('');
  };

  // Apply list
  const applyList = (listType) => {
    restoreSelection();
    editorRef.current?.focus();
    document.execCommand(listType, false, null);
    updateContent();
  };

  // Handle input
  const handleInput = () => {
    updateContent();
  };

  // Handle paste - strip formatting
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    updateContent();
  };

  // Handle selection change
  const handleSelect = () => {
    saveSelection();
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#105652] focus-within:border-transparent">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50 border-b border-gray-200">
        {/* Bold */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('bold');
          }}
          title="Bold (Ctrl+B)"
          className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 hover:text-[#105652]"
        >
          <Bold className="w-4 h-4" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('italic');
          }}
          title="Italic (Ctrl+I)"
          className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 hover:text-[#105652]"
        >
          <Italic className="w-4 h-4" />
        </button>

        {/* Underline */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('underline');
          }}
          title="Underline (Ctrl+U)"
          className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 hover:text-[#105652]"
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Font Family */}
        <div className="relative dropdown-picker">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
              setShowFonts(!showFonts);
              setShowFontSize(false);
              setShowColors(false);
            }}
            title="Font Family"
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 transition-colors text-gray-600 hover:text-[#105652] text-xs"
          >
            <span>Font</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {showFonts && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-56">
              <div className="p-2 border-b border-gray-100">
                <input
                  type="text"
                  placeholder="Search fonts..."
                  value={fontSearch}
                  onChange={(e) => setFontSearch(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#105652]"
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredFonts.slice(0, 30).map((font) => (
                  <button
                    key={font.name}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      applyFont(font.value);
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-gray-100 text-sm truncate"
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Font Size */}
        <div className="relative dropdown-picker">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
              setShowFontSize(!showFontSize);
              setShowColors(false);
              setShowFonts(false);
            }}
            title="Font Size"
            className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 hover:text-[#105652]"
          >
            <Type className="w-4 h-4" />
          </button>
          {showFontSize && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[100px]">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    applySize(size.value);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-100"
                  style={{ fontSize: `${size.value}px` }}
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Color */}
        <div className="relative dropdown-picker">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
              setShowColors(!showColors);
              setShowFontSize(false);
              setShowFonts(false);
            }}
            title="Text Color"
            className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 hover:text-[#105652]"
          >
            <Palette className="w-4 h-4" />
          </button>
          {showColors && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2">
              <div className="grid grid-cols-4 gap-1">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      applyColor(color);
                    }}
                    className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Align Left */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('justifyLeft');
          }}
          title="Align Left"
          className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 hover:text-[#105652]"
        >
          <AlignLeft className="w-4 h-4" />
        </button>

        {/* Align Center */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('justifyCenter');
          }}
          title="Align Center"
          className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 hover:text-[#105652]"
        >
          <AlignCenter className="w-4 h-4" />
        </button>

        {/* Align Right */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('justifyRight');
          }}
          title="Align Right"
          className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 hover:text-[#105652]"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Bullet List */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            saveSelection();
            applyList('insertUnorderedList');
          }}
          title="Bullet List"
          className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 hover:text-[#105652]"
        >
          <List className="w-4 h-4" />
        </button>

        {/* Numbered List */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            saveSelection();
            applyList('insertOrderedList');
          }}
          title="Numbered List"
          className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 hover:text-[#105652]"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        dir="ltr"
        onInput={handleInput}
        onPaste={handlePaste}
        onBlur={updateContent}
        onMouseUp={handleSelect}
        onKeyUp={handleSelect}
        onSelect={handleSelect}
        className="p-3 outline-none overflow-y-auto"
        style={{ minHeight, direction: 'ltr', textAlign: 'left' }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          display: block;
        }
        [contenteditable] {
          direction: ltr !important;
          text-align: left;
        }
        [contenteditable] ul {
          list-style-type: disc;
          margin-left: 1.5em;
          padding-left: 0;
        }
        [contenteditable] ol {
          list-style-type: decimal;
          margin-left: 1.5em;
          padding-left: 0;
        }
        [contenteditable] li {
          margin-bottom: 0.25em;
        }
      `}</style>
    </div>
  );
}
