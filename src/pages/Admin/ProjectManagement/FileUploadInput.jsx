import React, { useState } from 'react';
import { X, Upload, Link as LinkIcon, File } from 'lucide-react';
import { storageService, ID } from '../../../lib/appwrite';

const STORAGE_BUCKET_ID = 'file_uploads'; // You'll need to create this bucket in Appwrite

export default function FileUploadInput({ onSave, onCancel, initialData }) {
  const [fileName, setFileName] = useState(initialData?.fileName || '');
  const [buttonText, setButtonText] = useState(initialData?.buttonText || 'Click here to download');
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'upload'
  const [fileUrl, setFileUrl] = useState(initialData?.fileUrl || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!fileName) {
        setFileName(file.name);
      }
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload');
      return null;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Upload file to Appwrite
      const fileId = ID.unique();
      const result = await storageService.uploadFile(STORAGE_BUCKET_ID, fileId, selectedFile);

      if (result.success) {
        // Get file URL
        const fileUrlResult = await storageService.getFileView(STORAGE_BUCKET_ID, fileId);
        setUploadProgress(100);
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

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!fileName.trim()) {
      alert('Please enter a file name');
      return;
    }

    if (!buttonText.trim()) {
      alert('Please enter button text');
      return;
    }

    let finalUrl = fileUrl;

    // If uploading a file, upload it first
    if (uploadMethod === 'upload' && selectedFile && !initialData) {
      finalUrl = await handleUploadFile();
      if (!finalUrl) return; // Upload failed
    }

    if (!finalUrl || !finalUrl.trim()) {
      alert('Please provide a file URL or upload a file');
      return;
    }

    onSave({
      fileName: fileName.trim(),
      buttonText: buttonText.trim(),
      fileUrl: finalUrl.trim()
    });
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
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#e5e7eb' }}>
          <h2 className="text-2xl font-bold" style={{ color: '#105652' }}>
            {initialData ? 'Edit File Download' : 'Insert File Download'}
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
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-sm text-gray-600 mb-4">
            Upload a file or provide a download link. Users can click to download the file.
          </p>

          {/* File Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: '#105652' }}>
              File Name (First Line)
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g., Project Documentation.pdf"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: '#105652' }}
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be displayed as the file name
            </p>
          </div>

          {/* Button Text Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: '#105652' }}>
              Button Text (Second Line)
            </label>
            <input
              type="text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="e.g., Click here to download"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: '#105652' }}
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be the clickable download button text
            </p>
          </div>

          {/* Upload Method Selection */}
          {!initialData && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#105652' }}>
                Upload Method
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMethod('url')}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    uploadMethod === 'url' 
                      ? 'border-[#105652] bg-[#105652] text-white' 
                      : 'border-gray-300 hover:border-[#105652]'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  Direct URL
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('upload')}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    uploadMethod === 'upload' 
                      ? 'border-[#105652] bg-[#105652] text-white' 
                      : 'border-gray-300 hover:border-[#105652]'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
              </div>
            </div>
          )}

          {/* URL Input */}
          {uploadMethod === 'url' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#105652' }}>
                File URL
              </label>
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://example.com/file.pdf"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#105652' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the direct download URL
              </p>
            </div>
          )}

          {/* File Upload */}
          {uploadMethod === 'upload' && !initialData && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#105652' }}>
                Upload File
              </label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: '#105652' }}>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload-input"
                />
                <label
                  htmlFor="file-upload-input"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <File className="w-12 h-12" style={{ color: '#105652' }} />
                  <span className="text-sm font-medium" style={{ color: '#105652' }}>
                    {selectedFile ? selectedFile.name : 'Click to select a file'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Any file type supported
                  </span>
                </label>
              </div>
              {uploading && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${uploadProgress}%`,
                        backgroundColor: '#105652'
                      }}
                    />
                  </div>
                  <p className="text-xs text-center mt-1 text-gray-600">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {fileName && buttonText && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-3" style={{ color: '#105652' }}>Preview:</p>
              <div className="file-download-preview" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: '10px',
                background: 'linear-gradient(135deg, #6dd5ed, #2193b0)',
                borderRadius: '15px',
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
                minHeight: '140px',
                position: 'relative'
              }}>
                {/* Folder Icon */}
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  animation: 'float 2.5s infinite ease-in-out'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #ff9a56, #ff6f56)',
                    width: '80px',
                    height: '20px',
                    borderRadius: '12px 12px 0 0',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                    marginBottom: '-1px'
                  }} />
                  <div style={{
                    background: 'linear-gradient(135deg, #ffe563, #ffc663)',
                    width: '120px',
                    height: '80px',
                    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)',
                    borderRadius: '10px'
                  }} />
                </div>
                {/* File Info */}
                <div style={{
                  fontSize: '0.9em',
                  color: '#ffffff',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  width: '100%',
                  marginTop: '80px'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '5px' }}>{fileName}</div>
                  <div style={{ fontSize: '0.9em', opacity: 0.9 }}>{buttonText}</div>
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
            disabled={uploading || !fileName.trim() || !buttonText.trim()}
            className="px-6 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: '#105652' }}
          >
            {uploading ? 'Uploading...' : initialData ? 'Update' : 'Insert File Download'}
          </button>
        </div>
      </div>
    </div>
  );
}
