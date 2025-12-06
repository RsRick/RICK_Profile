import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AuthorInput({ onSave, onCancel, initialData }) {
  const [authorName, setAuthorName] = useState(initialData?.authorName || '');
  const [alignment, setAlignment] = useState(initialData?.alignment || 'center');

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!authorName.trim()) {
      alert('Please enter an author name');
      return;
    }
    
    onSave({ authorName: authorName.trim(), alignment });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#e5e7eb' }}>
          <h2 className="text-2xl font-bold" style={{ color: '#105652' }}>
            Insert Author
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
            <X className="w-6 h-6" style={{ color: '#105652' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Enter the author name. It will appear with a typing animation in a terminal-style box.
          </p>

          {/* Author Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: '#105652' }}>
              Author Name
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g., John Doe, Jane Smith"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: '#105652' }}
              maxLength={50}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave(e);
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum 50 characters. Keep it concise for best animation effect.
            </p>
          </div>

          {/* Alignment Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: '#105652' }}>
              Alignment
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAlignment('left')}
                className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                  alignment === 'left' 
                    ? 'border-[#105652] bg-[#105652] text-white' 
                    : 'border-gray-300 hover:border-[#105652]'
                }`}
              >
                Left
              </button>
              <button
                type="button"
                onClick={() => setAlignment('center')}
                className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                  alignment === 'center' 
                    ? 'border-[#105652] bg-[#105652] text-white' 
                    : 'border-gray-300 hover:border-[#105652]'
                }`}
              >
                Center
              </button>
              <button
                type="button"
                onClick={() => setAlignment('right')}
                className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                  alignment === 'right' 
                    ? 'border-[#105652] bg-[#105652] text-white' 
                    : 'border-gray-300 hover:border-[#105652]'
                }`}
              >
                Right
              </button>
            </div>
          </div>

          {/* Preview */}
          {authorName.trim() && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-3" style={{ color: '#105652' }}>Preview:</p>
              <div style={{ textAlign: alignment }}>
                <div className="terminal-loader-preview" style={{
                border: '0.1em solid #333',
                backgroundColor: '#1a1a1a',
                color: '#0f0',
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: '1em',
                padding: '1.5em 1em',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                borderRadius: '4px',
                position: 'relative',
                overflow: 'hidden',
                boxSizing: 'border-box',
                display: 'inline-block'
              }}>
                {/* Terminal Header */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '1.5em',
                  backgroundColor: '#333',
                  borderTopLeftRadius: '4px',
                  borderTopRightRadius: '4px',
                  padding: '0 0.4em',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ color: '#eee', fontSize: '0.8em' }}>Author</span>
                  <div style={{ display: 'flex', gap: '0.4em' }}>
                    <div style={{ width: '0.6em', height: '0.6em', borderRadius: '50%', backgroundColor: '#e33' }}></div>
                    <div style={{ width: '0.6em', height: '0.6em', borderRadius: '50%', backgroundColor: '#ee0' }}></div>
                    <div style={{ width: '0.6em', height: '0.6em', borderRadius: '50%', backgroundColor: '#0b0' }}></div>
                  </div>
                </div>
                {/* Text */}
                <div style={{
                  marginTop: '1.5em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  display: 'inline-block'
                }}>
                  {authorName}
                </div>
              </div>
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
            style={{ borderColor: '#105652', color: '#105652' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!authorName.trim()}
            className="px-6 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: '#105652' }}
          >
            Insert Author
          </button>
        </div>
      </div>
    </div>
  );
}
