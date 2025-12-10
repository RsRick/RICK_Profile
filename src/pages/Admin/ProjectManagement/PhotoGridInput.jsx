import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Grid, Upload, Link as LinkIcon, Check } from 'lucide-react';
import { storageService, ID } from '../../../lib/appwrite';
import ImageEditor from './ImageEditor';

const STORAGE_BUCKET_ID = 'photo_grid_images'; // Create this bucket in Appwrite

// 20+ Grid Layout Designs (max 2 rows each)
const GRID_LAYOUTS = [
  // Row 1: Simple layouts
  { id: 1, name: '2 Columns', cells: 2, template: 'grid-cols-2', rows: 1 },
  { id: 2, name: '3 Columns', cells: 3, template: 'grid-cols-3', rows: 1 },
  { id: 3, name: '4 Columns', cells: 4, template: 'grid-cols-4', rows: 1 },
  { id: 4, name: '2x2 Grid', cells: 4, template: 'grid-cols-2', rows: 2 },
  { id: 5, name: '3x2 Grid', cells: 6, template: 'grid-cols-3', rows: 2 },
  
  // Row 2: Asymmetric layouts
  { id: 6, name: 'Large Left + 2 Right', cells: 3, template: 'custom-6', rows: 2 },
  { id: 7, name: 'Large Right + 2 Left', cells: 3, template: 'custom-7', rows: 2 },
  { id: 8, name: '2 Top + 3 Bottom', cells: 5, template: 'custom-8', rows: 2 },
  { id: 9, name: '3 Top + 2 Bottom', cells: 5, template: 'custom-9', rows: 2 },
  { id: 10, name: 'Large Center + 4 Corners', cells: 5, template: 'custom-10', rows: 2 },
  
  // Row 3: Creative layouts
  { id: 11, name: 'Masonry 1', cells: 5, template: 'custom-11', rows: 2 },
  { id: 12, name: 'Masonry 2', cells: 6, template: 'custom-12', rows: 2 },
  { id: 13, name: 'Featured + 3', cells: 4, template: 'custom-13', rows: 2 },
  { id: 14, name: 'Split + 4', cells: 5, template: 'custom-14', rows: 2 },
  { id: 15, name: 'Showcase', cells: 4, template: 'custom-15', rows: 2 },
  
  // Row 4: More variations
  { id: 16, name: 'Gallery 1', cells: 5, template: 'custom-16', rows: 2 },
  { id: 17, name: 'Gallery 2', cells: 6, template: 'custom-17', rows: 2 },
  { id: 18, name: 'Portfolio 1', cells: 4, template: 'custom-18', rows: 2 },
  { id: 19, name: 'Portfolio 2', cells: 5, template: 'custom-19', rows: 2 },
  { id: 20, name: 'Magazine', cells: 6, template: 'custom-20', rows: 2 },
  
  // Row 5: Additional layouts
  { id: 21, name: 'Hero + Grid', cells: 4, template: 'custom-21', rows: 2 },
  { id: 22, name: 'Spotlight', cells: 5, template: 'custom-22', rows: 2 },
  { id: 23, name: 'Collage 1', cells: 6, template: 'custom-23', rows: 2 },
  { id: 24, name: 'Collage 2', cells: 5, template: 'custom-24', rows: 2 },
];

export default function PhotoGridInput({ onSave, onCancel, initialData }) {
  const [step, setStep] = useState(initialData ? 2 : 1); // 1: Select layout, 2: Add images
  const [selectedLayout, setSelectedLayout] = useState(initialData?.layout || null);
  const [images, setImages] = useState(initialData?.images || []);
  const [gridHeight, setGridHeight] = useState(initialData?.gridHeight || 400);
  const [editingCell, setEditingCell] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('url');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');


  const handleLayoutSelect = (layout) => {
    setSelectedLayout(layout);
    // Initialize empty images array
    const emptyImages = Array(layout.cells).fill(null);
    setImages(emptyImages);
    setStep(2);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return null;

    try {
      setUploading(true);
      const fileId = ID.unique();
      const result = await storageService.uploadFile(STORAGE_BUCKET_ID, fileId, selectedFile);

      if (result.success) {
        const fileUrlResult = await storageService.getFileView(STORAGE_BUCKET_ID, fileId);
        return fileUrlResult;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file: ' + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleAddImage = async () => {
    if (editingCell === null) return;

    let finalUrl = imageUrl;

    if (uploadMethod === 'upload' && selectedFile) {
      finalUrl = await handleUploadFile();
      if (!finalUrl) return;
    }

    if (!finalUrl || !finalUrl.trim()) {
      alert('Please provide an image URL or upload a file');
      return;
    }

    // Open image editor instead of directly adding
    setTempImageUrl(finalUrl.trim());
    setShowImageEditor(true);
  };

  const handleImageEditorSave = (editedImageUrl) => {
    const newImages = [...images];
    newImages[editingCell] = editedImageUrl;
    setImages(newImages);
    
    // Reset
    setShowImageEditor(false);
    setTempImageUrl('');
    setEditingCell(null);
    setImageUrl('');
    setSelectedFile(null);
    setUploadMethod('url');
  };

  const handleImageEditorCancel = () => {
    setShowImageEditor(false);
    setTempImageUrl('');
  };

  const handleSave = () => {
    // Check if all cells have images
    const emptyCount = images.filter(img => !img).length;
    if (emptyCount > 0) {
      if (!confirm(`${emptyCount} cell(s) are empty. Continue anyway?`)) {
        return;
      }
    }

    onSave({
      layout: selectedLayout,
      images: images,
      gridHeight: gridHeight
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Don't close if image editor is open or editing a cell
        if (e.target === e.currentTarget && !editingCell && !showImageEditor) {
          onCancel();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        style={{ maxWidth: step === 1 ? '1200px' : '800px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#e5e7eb' }}>
          <h2 className="text-2xl font-bold" style={{ color: '#2596be' }}>
            {step === 1 ? 'Select Grid Layout' : 'Add Images to Grid'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" style={{ color: '#2596be' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            // Step 1: Layout Selection
            <div>
              <p className="text-sm text-gray-600 mb-6">
                Choose a grid layout for your photo gallery. Each layout has a unique design.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {GRID_LAYOUTS.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => handleLayoutSelect(layout)}
                    className="p-4 border-2 rounded-lg hover:border-[#2596be] transition-colors group"
                    style={{ borderColor: '#e5e7eb' }}
                  >
                    {/* Actual Layout Preview */}
                    <div className="aspect-video bg-gray-50 rounded mb-2 p-2">
                      <div className={`grid gap-1 h-full grid-layout-${layout.id}`}>
                        {Array.from({ length: layout.cells }).map((_, i) => (
                          <div 
                            key={i} 
                            className="bg-gray-300 rounded"
                            style={{ minHeight: '20px' }}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-center">{layout.name}</p>
                    <p className="text-xs text-gray-500 text-center">{layout.cells} photos</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Step 2: Add Images
            <div>
              {editingCell === null ? (
                // Grid Preview
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#2596be' }}>
                        Layout: {selectedLayout.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Click on each cell to add an image
                      </p>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50"
                      style={{ borderColor: '#2596be', color: '#2596be' }}
                    >
                      Change Layout
                    </button>
                  </div>

                  {/* Grid Height Control */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border" style={{ borderColor: '#2596be' }}>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2596be' }}>
                      Grid Height: {gridHeight}px
                    </label>
                    <input
                      type="range"
                      min="200"
                      max="800"
                      step="50"
                      value={gridHeight}
                      onChange={(e) => setGridHeight(parseInt(e.target.value))}
                      className="w-full"
                      style={{ accentColor: '#2596be' }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Small (200px)</span>
                      <span>Medium (400px)</span>
                      <span>Large (800px)</span>
                    </div>
                  </div>

                  {/* Grid Preview */}
                  <div 
                    className={`grid gap-2 grid-layout-${selectedLayout.id}`}
                    style={{ height: `${gridHeight}px` }}
                  >
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setEditingCell(index)}
                        className="relative border-2 border-dashed rounded-lg overflow-hidden hover:border-[#2596be] transition-colors group"
                        style={{ 
                          borderColor: img ? '#2596be' : '#e5e7eb',
                          minHeight: '150px'
                        }}
                      >
                        {img ? (
                          <>
                            <img 
                              src={img} 
                              alt={`Cell ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                              <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                                Click to change
                              </span>
                            </div>
                            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Upload className="w-8 h-8 mb-2" />
                            <span className="text-sm">Cell {index + 1}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // Image Upload Form
                <div>
                  <div className="mb-4">
                    <button
                      onClick={() => {
                        setEditingCell(null);
                        setImageUrl('');
                        setSelectedFile(null);
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      ← Back to grid
                    </button>
                  </div>

                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#2596be' }}>
                    Add Image to Cell {editingCell + 1}
                  </h3>

                  {/* Upload Method */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2596be' }}>
                      Upload Method
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setUploadMethod('url')}
                        className={`flex-1 px-4 py-2 border rounded-lg transition-colors flex items-center justify-center gap-2 ${
                          uploadMethod === 'url' 
                            ? 'border-[#2596be] bg-[#2596be] text-white' 
                            : 'border-gray-300 hover:border-[#2596be]'
                        }`}
                      >
                        <LinkIcon className="w-4 h-4" />
                        Image URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMethod('upload')}
                        className={`flex-1 px-4 py-2 border rounded-lg transition-colors flex items-center justify-center gap-2 ${
                          uploadMethod === 'upload' 
                            ? 'border-[#2596be] bg-[#2596be] text-white' 
                            : 'border-gray-300 hover:border-[#2596be]'
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        Upload File
                      </button>
                    </div>
                  </div>

                  {/* URL Input */}
                  {uploadMethod === 'url' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2" style={{ color: '#2596be' }}>
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{ borderColor: '#2596be' }}
                      />
                    </div>
                  )}

                  {/* File Upload */}
                  {uploadMethod === 'upload' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2" style={{ color: '#2596be' }}>
                        Upload Image
                      </label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: '#2596be' }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="grid-image-upload"
                        />
                        <label
                          htmlFor="grid-image-upload"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Upload className="w-12 h-12" style={{ color: '#2596be' }} />
                          <span className="text-sm font-medium" style={{ color: '#2596be' }}>
                            {selectedFile ? selectedFile.name : 'Click to select an image'}
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleAddImage}
                    disabled={uploading || (!imageUrl && !selectedFile)}
                    className="w-full px-6 py-3 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#2596be' }}
                  >
                    {uploading ? 'Uploading...' : 'Add Image'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 2 && editingCell === null && (
          <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: '#e5e7eb' }}>
            <button
              onClick={onCancel}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              style={{ borderColor: '#2596be', color: '#2596be' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg text-white"
              style={{ backgroundColor: '#2596be' }}
            >
              {initialData ? 'Update Grid' : 'Insert Grid'}
            </button>
          </div>
        )}
      </div>

      {/* Image Editor Modal - Rendered outside using Portal */}
      {showImageEditor && tempImageUrl && createPortal(
        <ImageEditor
          imageUrl={tempImageUrl}
          onSave={handleImageEditorSave}
          onCancel={handleImageEditorCancel}
        />,
        document.body
      )}
    </div>
  );
}

