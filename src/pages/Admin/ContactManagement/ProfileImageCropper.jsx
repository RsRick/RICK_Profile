import { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Check, X, Upload, Move } from 'lucide-react';

export default function ProfileImageCropper({ onCropComplete, onCancel }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const OUTPUT_SIZE = 400; // Square output

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
        setZoom(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
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
    if (imageSrc) {
      updatePreview();
    }
  }, [imageSrc, zoom, rotation, position]);

  const updatePreview = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !image.complete) return;

    const ctx = canvas.getContext('2d');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;

    // Clear canvas
    ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    // Create circular clip
    ctx.beginPath();
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Calculate dimensions
    const containerSize = 300;
    const scale = Math.min(containerSize / image.naturalWidth, containerSize / image.naturalHeight);
    const scaledWidth = image.naturalWidth * scale * zoom;
    const scaledHeight = image.naturalHeight * scale * zoom;

    // Map position from container to output
    const outputScale = OUTPUT_SIZE / containerSize;
    const offsetX = (OUTPUT_SIZE - scaledWidth * outputScale) / 2 + position.x * outputScale;
    const offsetY = (OUTPUT_SIZE - scaledHeight * outputScale) / 2 + position.y * outputScale;

    // Apply transformations
    ctx.save();
    ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-OUTPUT_SIZE / 2, -OUTPUT_SIZE / 2);
    
    ctx.drawImage(
      image,
      offsetX,
      offsetY,
      scaledWidth * outputScale,
      scaledHeight * outputScale
    );
    ctx.restore();
  };

  const handleCropConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      onCropComplete(blob);
    }, 'image/jpeg', 0.92);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: '#2596be' }}>
              Edit Profile Image
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {!imageSrc ? (
            <div className="space-y-4">
              {/* Upload Area */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#2596be] transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Upload Profile Image</h3>
                <p className="text-gray-500 mb-4">
                  Click to select an image or drag and drop
                </p>
                <p className="text-sm text-gray-400">
                  Recommended: Square image, at least 400×400px
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Crop Area */}
              <div className="flex justify-center">
                <div
                  ref={containerRef}
                  className="relative bg-gray-900 rounded-xl overflow-hidden cursor-move"
                  style={{ width: '300px', height: '300px' }}
                  onMouseDown={handleMouseDown}
                  onWheel={handleWheel}
                >
                  {/* Image */}
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Crop"
                    className="absolute select-none pointer-events-none"
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                      transformOrigin: 'center',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      left: '50%',
                      top: '50%',
                      marginLeft: '-50%',
                      marginTop: '-50%',
                    }}
                    draggable={false}
                    onLoad={updatePreview}
                  />
                  
                  {/* Circular Overlay */}
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      boxShadow: '0 0 0 150px rgba(0, 0, 0, 0.6)',
                      borderRadius: '50%',
                    }}
                  />
                  
                  {/* Circle Border */}
                  <div 
                    className="absolute inset-0 border-2 border-white border-dashed rounded-full pointer-events-none"
                    style={{ margin: '0' }}
                  />

                  {/* Move hint */}
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-1 px-3 py-1 bg-black/50 rounded-full text-white text-xs">
                    <Move className="w-3 h-3" />
                    Drag to reposition
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-4">
                {/* Zoom Control */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                    className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-3 flex-1 max-w-xs">
                    <span className="text-sm text-gray-600">Zoom</span>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1 accent-[#2596be]"
                    />
                    <span className="text-sm font-mono w-12 text-right">{Math.round(zoom * 100)}%</span>
                  </div>
                  
                  <button
                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                    className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    disabled={zoom >= 3}
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </div>

                {/* Rotate Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleRotate}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <RotateCw className="w-4 h-4" />
                    Rotate 90°
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">Preview</p>
                <div className="inline-flex gap-4 items-end">
                  <div>
                    <canvas
                      ref={canvasRef}
                      className="rounded-full border-2 shadow-lg"
                      style={{ 
                        width: '100px', 
                        height: '100px',
                        borderColor: '#2596be'
                      }}
                    />
                    <p className="text-xs text-gray-400 mt-1">Large</p>
                  </div>
                  <div>
                    <canvas
                      ref={canvasRef}
                      className="rounded-full border-2 shadow"
                      style={{ 
                        width: '60px', 
                        height: '60px',
                        borderColor: '#2596be'
                      }}
                    />
                    <p className="text-xs text-gray-400 mt-1">Medium</p>
                  </div>
                  <div>
                    <canvas
                      ref={canvasRef}
                      className="rounded-full border shadow"
                      style={{ 
                        width: '40px', 
                        height: '40px',
                        borderColor: '#2596be'
                      }}
                    />
                    <p className="text-xs text-gray-400 mt-1">Small</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center pt-4 border-t">
                <button
                  onClick={() => {
                    setImageSrc(null);
                    setZoom(1);
                    setRotation(0);
                    setPosition({ x: 0, y: 0 });
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 transition-all hover:bg-gray-50"
                  style={{ borderColor: '#2596be', color: '#2596be' }}
                >
                  <Upload className="w-4 h-4" />
                  Change Image
                </button>
                <button
                  onClick={onCancel}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border transition-all hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleCropConfirm}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white transition-all hover:scale-105"
                  style={{ backgroundColor: '#2596be' }}
                >
                  <Check className="w-4 h-4" />
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

