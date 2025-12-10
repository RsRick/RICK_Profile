import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Video, Upload, Link as LinkIcon, Code, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { storageService, ID } from '../../../lib/appwrite';

export default function VideoInput({ initialData, onSave, onCancel }) {
  // Video source states
  const [videoMode, setVideoMode] = useState('url'); // 'url', 'embed', 'upload'
  const [videoUrl, setVideoUrl] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Thumbnail states
  const [thumbnailMode, setThumbnailMode] = useState('url'); // 'url', 'upload'
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  // Settings
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('auto');
  const [alignment, setAlignment] = useState('center');
  const [widthMode, setWidthMode] = useState('auto'); // 'auto', 'max', 'custom'
  const [customWidth, setCustomWidth] = useState('600');
  const [heightMode, setHeightMode] = useState('auto'); // 'auto', 'custom'
  const [customHeight, setCustomHeight] = useState('400');

  useEffect(() => {
    if (initialData) {
      setVideoMode(initialData.mode || 'url');
      setVideoUrl(initialData.videoUrl || '');
      setEmbedCode(initialData.embedCode || '');
      setThumbnailUrl(initialData.thumbnailUrl || '');
      
      const w = initialData.width || '100%';
      const h = initialData.height || 'auto';
      
      setWidth(w);
      setHeight(h);
      setAlignment(initialData.alignment || 'center');
      
      // Parse width mode
      if (w === '100%') {
        setWidthMode('auto');
      } else if (w === 'max-content') {
        setWidthMode('max');
      } else {
        setWidthMode('custom');
        setCustomWidth(w.replace('px', ''));
      }
      
      // Parse height mode
      if (h === 'auto') {
        setHeightMode('auto');
      } else {
        setHeightMode('custom');
        setCustomHeight(h.replace('px', ''));
      }
    }
  }, [initialData]);

  const handleFileUpload = async (file, type) => {
    try {
      if (type === 'video') setUploadingVideo(true);
      else setUploadingThumbnail(true);

      const fileId = ID.unique();
      
      // You need to create this bucket in Appwrite with 'editor-video-files' ID
      // and set permissions to allow 'Any' to read.
      const bucketId = 'editor-video-files'; 
      
      const response = await storageService.uploadFile(bucketId, fileId, file);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      const url = storageService.getFileView(bucketId, response.data.$id);

      if (type === 'video') {
        setVideoUrl(url);
        setVideoFile(null); // Clear file after upload
      } else {
        setThumbnailUrl(url);
        setThumbnailFile(null);
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      alert(`Failed to upload ${type}. Please try again.`);
    } finally {
      if (type === 'video') setUploadingVideo(false);
      else setUploadingThumbnail(false);
    }
  };

  const handleSubmit = async () => {
    // specific validation
    if (videoMode === 'url' && !videoUrl) return;
    if (videoMode === 'embed' && !embedCode) return;
    if (videoMode === 'upload' && !videoUrl && !videoFile) return;

    // Handle pending uploads
    if (videoMode === 'upload' && videoFile) {
      await handleFileUpload(videoFile, 'video');
    }
    if (thumbnailMode === 'upload' && thumbnailFile) {
      await handleFileUpload(thumbnailFile, 'thumbnail');
    }

    // Calculate final width and height
    let finalWidth = '100%';
    let finalHeight = 'auto';
    
    if (widthMode === 'auto') {
      finalWidth = '100%';
    } else if (widthMode === 'max') {
      finalWidth = 'max-content';
    } else if (widthMode === 'custom') {
      finalWidth = `${customWidth}px`;
    }
    
    if (heightMode === 'auto') {
      finalHeight = 'auto';
    } else if (heightMode === 'custom') {
      finalHeight = `${customHeight}px`;
    }

    onSave({
      mode: videoMode,
      videoUrl: videoMode === 'embed' ? '' : videoUrl,
      embedCode: videoMode === 'embed' ? embedCode : '',
      thumbnailUrl,
      width: finalWidth,
      height: finalHeight,
      alignment
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Video className="w-5 h-5 text-teal-600" />
            Insert Video
          </h2>
          <button type="button" onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Video Source Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Video Source</label>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
              <button
                type="button"
                onClick={() => setVideoMode('url')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  videoMode === 'url' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Direct Link
                </div>
              </button>
              <button
                type="button"
                onClick={() => setVideoMode('embed')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  videoMode === 'embed' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Embed Code
                </div>
              </button>
              <button
                type="button"
                onClick={() => setVideoMode('upload')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  videoMode === 'upload' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload
                </div>
              </button>
            </div>

            {/* Source Inputs */}
            {videoMode === 'url' && (
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              />
            )}

            {videoMode === 'embed' && (
              <textarea
                value={embedCode}
                onChange={(e) => setEmbedCode(e.target.value)}
                placeholder="<iframe src='...'></iframe>"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all h-24 font-mono text-sm"
              />
            )}

            {videoMode === 'upload' && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors bg-gray-50">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setVideoFile(file);
                      // Auto upload could happen here or on save
                      handleFileUpload(file, 'video');
                    }
                  }}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  {uploadingVideo ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600">
                    {videoUrl ? 'Change Video' : 'Click to upload video'}
                  </span>
                  {videoUrl && <span className="text-xs text-teal-600 break-all">{videoUrl}</span>}
                </label>
              </div>
            )}
          </div>

          {/* Thumbnail Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Thumbnail (Optional)</label>
            <div className="flex gap-4 items-start">
              <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setThumbnailMode('url')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      thumbnailMode === 'url' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setThumbnailMode('upload')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      thumbnailMode === 'upload' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Upload
                  </button>
                </div>

                {thumbnailMode === 'url' ? (
                  <input
                    type="text"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-teal-500 transition-colors bg-gray-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setThumbnailFile(file);
                          handleFileUpload(file, 'thumbnail');
                        }
                      }}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label htmlFor="thumbnail-upload" className="cursor-pointer flex flex-col items-center gap-1">
                      {uploadingThumbnail ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      )}
                      <span className="text-xs text-gray-600">
                        {thumbnailUrl ? 'Change Thumbnail' : 'Upload Image'}
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Thumbnail Preview */}
              <div className="w-32 h-20 bg-gray-100 rounded-lg border flex items-center justify-center overflow-hidden flex-shrink-0">
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                )}
              </div>
            </div>
          </div>

          {/* Dimensions & Alignment */}
          <div className="space-y-4">
            {/* Width Settings */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Width</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWidthMode('auto')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    widthMode === 'auto' ? 'bg-teal-100 text-teal-700 border-2 border-teal-500' : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                  }`}
                >
                  Auto (100%)
                </button>
                <button
                  type="button"
                  onClick={() => setWidthMode('max')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    widthMode === 'max' ? 'bg-teal-100 text-teal-700 border-2 border-teal-500' : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                  }`}
                >
                  Maximum
                </button>
                <button
                  type="button"
                  onClick={() => setWidthMode('custom')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    widthMode === 'custom' ? 'bg-teal-100 text-teal-700 border-2 border-teal-500' : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                  }`}
                >
                  Custom
                </button>
              </div>
              {widthMode === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    placeholder="600"
                    min="100"
                    max="2000"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  <span className="text-sm text-gray-600">px</span>
                </div>
              )}
            </div>

            {/* Height Settings */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Height</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHeightMode('auto')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    heightMode === 'auto' ? 'bg-teal-100 text-teal-700 border-2 border-teal-500' : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                  }`}
                >
                  Auto
                </button>
                <button
                  type="button"
                  onClick={() => setHeightMode('custom')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    heightMode === 'custom' ? 'bg-teal-100 text-teal-700 border-2 border-teal-500' : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                  }`}
                >
                  Custom
                </button>
              </div>
              {heightMode === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    placeholder="400"
                    min="100"
                    max="2000"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  <span className="text-sm text-gray-600">px</span>
                </div>
              )}
            </div>

            {/* Alignment */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Alignment</label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setAlignment('left')}
                  className={`flex-1 flex justify-center py-2 rounded transition-colors ${
                    alignment === 'left' ? 'bg-white shadow-sm text-teal-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Left"
                >
                  <AlignLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setAlignment('center')}
                  className={`flex-1 flex justify-center py-2 rounded transition-colors ${
                    alignment === 'center' ? 'bg-white shadow-sm text-teal-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Center"
                >
                  <AlignCenter className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setAlignment('right')}
                  className={`flex-1 flex justify-center py-2 rounded transition-colors ${
                    alignment === 'right' ? 'bg-white shadow-sm text-teal-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Right"
                >
                  <AlignRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={uploadingVideo || uploadingThumbnail || (videoMode === 'url' && !videoUrl) || (videoMode === 'embed' && !embedCode)}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-lg shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {initialData ? 'Update Video' : 'Insert Video'}
          </button>
        </div>
      </div>
    </div>
  );
}

