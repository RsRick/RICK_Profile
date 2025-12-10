import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Crop, ZoomIn, ZoomOut, Check, X, Upload } from 'lucide-react';

export default function ImageCropper({ onCropComplete, onCancel, aspectRatio = 16/9 }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 45 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - (crop.x / 100) * rect.width,
      y: e.clientY - (crop.y / 100) * rect.height
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - dragStart.x) / rect.width) * 100;
    const y = ((e.clientY - dragStart.y) / rect.height) * 100;
    
    setCrop(prev => ({
      ...prev,
      x: Math.max(0, Math.min(100 - prev.width, x)),
      y: Math.max(0, Math.min(100 - prev.height, y))
    }));
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (imageSrc && canvasRef.current && imageRef.current) {
      updatePreview();
    }
  }, [imageSrc, crop, zoom]);

  const updatePreview = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    const outputWidth = 465;
    const outputHeight = outputWidth / aspectRatio;
    
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scaleX = image.naturalWidth / (rect.width * zoom);
    const scaleY = image.naturalHeight / (rect.height * zoom);
    
    const cropX = (crop.x / 100) * rect.width * scaleX;
    const cropY = (crop.y / 100) * rect.height * scaleY;
    const cropWidth = (crop.width / 100) * rect.width * scaleX;
    const cropHeight = (crop.height / 100) * rect.height * scaleY;
    
    ctx.drawImage(
      image,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, outputWidth, outputHeight
    );
  };

  const handleCropConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      onCropComplete(blob);
    }, 'image/jpeg', 0.92);
  };

  const recommendedSizes = [
    { name: 'Optimal', width: 465, height: Math.round(465 / aspectRatio), desc: 'Perfect for cards' },
    { name: 'Large', width: 700, height: Math.round(700 / aspectRatio), desc: 'High quality' },
    { name: 'Medium', width: 400, height: Math.round(400 / aspectRatio), desc: 'Good balance' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold" style={{ color: '#2596be' }}>
              Crop Image
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {!imageSrc ? (
            <div className="space-y-6">
              {/* Size Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <Crop className="w-5 h-5" />
                  Recommended Image Sizes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {recommendedSizes.map((size) => (
                    <div key={size.name} className="bg-white rounded-lg p-3 border border-blue-200">
                      <div className="font-semibold text-blue-700">{size.name}</div>
                      <div className="text-sm text-gray-600">
                        {size.width} × {size.height}px
                      </div>
                      <div className="text-xs text-gray-500">{size.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm text-blue-700">
                  <strong>Aspect Ratio:</strong> {aspectRatio.toFixed(2)}:1 (Portrait Card)
                </div>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Upload Image</h3>
                <p className="text-gray-600 mb-4">
                  Select an image to crop it to the perfect size
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#2596be' }}
                >
                  <Upload className="w-5 h-5" />
                  Choose Image
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Crop Area */}
              <div
                ref={containerRef}
                className="relative mx-auto bg-gray-900 rounded-lg overflow-hidden"
                style={{ width: '600px', height: '400px', maxWidth: '100%' }}
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop"
                  className="absolute inset-0 w-full h-full object-contain select-none"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center'
                  }}
                  draggable={false}
                />
                
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-60 pointer-events-none" />
                
                {/* Crop Box */}
                <div
                  className="absolute border-2 border-white cursor-move"
                  style={{
                    left: `${crop.x}%`,
                    top: `${crop.y}%`,
                    width: `${crop.width}%`,
                    height: `${crop.height}%`,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                  }}
                  onMouseDown={handleMouseDown}
                >
                  {/* Corner Handles */}
                  <div className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full"></div>
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full"></div>
                  <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full"></div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full"></div>
                  
                  {/* Center Icon */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <Crop className="w-8 h-8 text-white opacity-50" />
                  </div>
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-12">Zoom:</span>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-48"
                  />
                  <span className="text-sm font-mono w-12">{Math.round(zoom * 100)}%</span>
                </div>
                
                <button
                  onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>

              {/* Preview */}
              <div className="text-center">
                <h4 className="font-semibold mb-2 text-gray-700">
                  Preview (465×{Math.round(465 / aspectRatio)}px)
                </h4>
                <div className="inline-block border-2 rounded-lg overflow-hidden" style={{ borderColor: '#2596be' }}>
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center pt-4 border-t">
                <button
                  onClick={onCancel}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all duration-300 hover:scale-105"
                  style={{ borderColor: '#2596be', color: '#2596be' }}
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  onClick={handleCropConfirm}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#2596be' }}
                >
                  <Check className="w-5 h-5" />
                  Use Cropped Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

