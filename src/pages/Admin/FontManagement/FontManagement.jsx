import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Save, X, Type, AlertCircle, CheckCircle } from 'lucide-react';
import { databaseService, storageService, ID } from '../../../lib/appwrite';
import { useToast } from '../../../contexts/ToastContext';
import { GOOGLE_FONTS } from '../../../utils/googleFonts';
import { loadCustomFont, removeCustomFont } from '../../../utils/fontLoader';

const FONTS_BUCKET_ID = 'custom-fonts';

export default function FontManagement() {
  const { showToast } = useToast();
  const [customFonts, setCustomFonts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    fontName: '',
    file: null,
    preview: null
  });

  useEffect(() => {
    loadCustomFonts();
  }, []);

  const loadCustomFonts = async () => {
    try {
      setLoading(true);
      const result = await databaseService.listDocuments('custom_fonts');
      if (result.success) {
        setCustomFonts(result.data.documents);
        
        // Load fonts into DOM
        result.data.documents.forEach(font => {
          loadCustomFont(font.fontName, font.fileUrl);
        });
      }
    } catch (error) {
      console.error('Error loading custom fonts:', error);
      showToast('Error loading custom fonts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.ttf')) {
      showToast('Please upload a .ttf file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }

    setUploadForm({
      ...uploadForm,
      file,
      preview: file.name
    });
  };

  const handleUploadFont = async () => {
    if (!uploadForm.fontName.trim()) {
      showToast('Please enter a font name', 'error');
      return;
    }

    if (!uploadForm.file) {
      showToast('Please select a font file', 'error');
      return;
    }

    // Check if font name already exists
    const existingFont = customFonts.find(
      f => f.fontName.toLowerCase() === uploadForm.fontName.trim().toLowerCase()
    );
    if (existingFont) {
      showToast('A font with this name already exists', 'error');
      return;
    }

    try {
      setUploading(true);

      // Upload font file to storage
      const fileId = ID.unique();
      const uploadResult = await storageService.uploadFile(
        FONTS_BUCKET_ID,
        fileId,
        uploadForm.file
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload font file');
      }

      // Make file public
      await storageService.setFilePublic(FONTS_BUCKET_ID, uploadResult.data.$id);

      // Get file URL
      const fileUrl = storageService.getFileView(FONTS_BUCKET_ID, uploadResult.data.$id);

      // Save font metadata to database
      const fontData = {
        fontName: uploadForm.fontName.trim(),
        fileName: uploadForm.file.name,
        fileUrl: fileUrl,
        fileId: uploadResult.data.$id,
        fileSize: uploadForm.file.size,
        uploadedAt: new Date().toISOString()
      };

      const dbResult = await databaseService.createDocument('custom_fonts', fontData);

      if (!dbResult.success) {
        // Rollback: delete uploaded file
        await storageService.deleteFile(FONTS_BUCKET_ID, uploadResult.data.$id);
        throw new Error(dbResult.error || 'Failed to save font metadata');
      }

      // Load font into DOM
      loadCustomFont(fontData.fontName, fileUrl);

      showToast('Font uploaded successfully!', 'success');
      
      // Reset form
      setUploadForm({
        fontName: '',
        file: null,
        preview: null
      });

      // Reload fonts
      await loadCustomFonts();
    } catch (error) {
      console.error('Error uploading font:', error);
      showToast(error.message || 'Error uploading font', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFont = async (font) => {
    if (!confirm(`Are you sure you want to delete "${font.fontName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);

      // Delete from database
      const dbResult = await databaseService.deleteDocument('custom_fonts', font.$id);
      if (!dbResult.success) {
        throw new Error(dbResult.error || 'Failed to delete font from database');
      }

      // Delete from storage
      if (font.fileId) {
        await storageService.deleteFile(FONTS_BUCKET_ID, font.fileId);
      }

      // Remove from DOM
      removeCustomFont(font.fontName);

      showToast('Font deleted successfully', 'success');
      
      // Reload fonts
      await loadCustomFonts();
    } catch (error) {
      console.error('Error deleting font:', error);
      showToast(error.message || 'Error deleting font', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Font Management</h1>
        <p className="text-gray-600">Manage custom fonts and view available Google Fonts</p>
      </div>

      {/* Upload Custom Font Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Custom Font
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Name
            </label>
            <input
              type="text"
              value={uploadForm.fontName}
              onChange={(e) => setUploadForm({ ...uploadForm, fontName: e.target.value })}
              placeholder="e.g., My Custom Font"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font File (.ttf)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".ttf"
                onChange={handleFileSelect}
                className="hidden"
                id="font-file-upload"
                disabled={uploading}
              />
              <label
                htmlFor="font-file-upload"
                className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-4 h-4" />
                Choose File
              </label>
              {uploadForm.preview && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{uploadForm.preview}</span>
                  <button
                    onClick={() => setUploadForm({ ...uploadForm, file: null, preview: null })}
                    className="text-red-500 hover:text-red-700"
                    disabled={uploading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Upload .ttf files only. Max size: 5MB. Ensure the font supports both Bangla and English characters.
            </p>
          </div>

          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">Font Requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Only .ttf (TrueType Font) format is supported</li>
                <li>Font should include both Bangla and English character sets</li>
                <li>Test the font after upload to ensure proper rendering</li>
                <li>Custom fonts will appear with a purple "Custom" badge in font selectors</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleUploadFont}
            disabled={uploading || !uploadForm.fontName.trim() || !uploadForm.file}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2596be] text-white rounded-lg hover:bg-[#0d4240] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            <Upload className="w-5 h-5" />
            {uploading ? 'Uploading...' : 'Upload Font'}
          </button>
        </div>
      </div>

      {/* Custom Fonts List */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Type className="w-5 h-5 text-purple-600" />
          Custom Fonts ({customFonts.length})
        </h2>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading custom fonts...</div>
        ) : customFonts.length > 0 ? (
          <div className="space-y-3">
            {customFonts.map((font) => (
              <div
                key={font.$id}
                className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-purple-700">{font.fontName}</h3>
                      <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded">Custom</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      File: {font.fileName} • Size: {formatFileSize(font.fileSize)}
                    </p>
                    <div
                      className="p-3 bg-white rounded border border-purple-200"
                      style={{ fontFamily: `'${font.fontName}', sans-serif` }}
                    >
                      <p className="text-lg mb-1">The quick brown fox jumps over the lazy dog</p>
                      <p className="text-lg">আমি বাংলায় গান গাই (Bangla text preview)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteFont(font)}
                    disabled={loading}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    title="Delete font"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No custom fonts uploaded yet. Upload your first font above!
          </div>
        )}
      </div>

      {/* Google Fonts List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Available Google Fonts ({GOOGLE_FONTS.length})
        </h2>

        <div className="mb-4 flex gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Filter by:</span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            {GOOGLE_FONTS.filter(f => f.bangla).length} with Bangla support
          </span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {GOOGLE_FONTS.filter(f => f.category === 'serif').length} Serif
          </span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {GOOGLE_FONTS.filter(f => f.category === 'sans-serif').length} Sans-serif
          </span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {GOOGLE_FONTS.filter(f => f.category === 'display').length} Display
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {GOOGLE_FONTS.map((font, index) => (
            <div
              key={index}
              className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-800">{font.name}</h3>
                {font.bangla && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">বাংলা</span>
                )}
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{font.category}</span>
              </div>
              <p
                className="text-base text-gray-700"
                style={{ fontFamily: font.value }}
              >
                The quick brown fox jumps
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

