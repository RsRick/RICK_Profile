import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check } from 'lucide-react';

export default function ImageEditor({ imageUrl, onSave, onCancel }) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      drawImage();
    };
  }, [imageUrl]);

  useEffect(() => {
    drawImage();
  }, [zoom, position, rotation]);

  const drawImage = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const scaledWidth = img.width * zoom;
    const scaledHeight = img.height * zoom;

    ctx.drawImage(
      img,
      -scaledWidth / 2 + position.x,
      -scaledHeight / 2 + position.y,
      scaledWidth,
      scaledHeight
    );

    ctx.restore();
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleZoomIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleRotate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      onSave(url);
    }, 'image/jpeg', 0.95);
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  };

  const handleBackdropClick = (e) => {
    // Only close if clicking the backdrop itself, not children
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[99999]" 
      style={{ pointerEvents: 'auto' }}
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#e5e7eb' }}>
          <h3 className="text-lg font-bold" style={{ color: '#105652' }}>
            Edit Image
          </h3>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <X className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Canvas Preview - Compact Size */}
          <div className="flex justify-center mb-4 bg-gray-100 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              className="border-2 cursor-move bg-white rounded"
              style={{ borderColor: '#105652', maxWidth: '100%' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          {/* Controls - Compact Layout */}
          <div className="space-y-3">
            {/* Zoom Controls */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium min-w-[80px]" style={{ color: '#105652' }}>
                Zoom: {Math.round(zoom * 100)}%
              </label>
              <button
                onClick={handleZoomOut}
                className="p-2 border rounded hover:bg-gray-50"
                style={{ borderColor: '#105652', color: '#105652' }}
                type="button"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => {
                  e.stopPropagation();
                  setZoom(parseFloat(e.target.value));
                }}
                className="flex-1"
                style={{ accentColor: '#105652' }}
              />
              <button
                onClick={handleZoomIn}
                className="p-2 border rounded hover:bg-gray-50"
                style={{ borderColor: '#105652', color: '#105652' }}
                type="button"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRotate}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                style={{ borderColor: '#105652', color: '#105652' }}
                type="button"
              >
                <RotateCw className="w-4 h-4" />
                Rotate
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                style={{ borderColor: '#105652', color: '#105652' }}
                type="button"
              >
                Reset
              </button>
            </div>

            {/* Tip */}
            <div className="p-2 bg-blue-50 rounded text-xs text-blue-800 text-center">
              💡 Drag to move • Use slider to zoom • Rotate 90° at a time
            </div>

            {/* Final Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                style={{ borderColor: '#105652', color: '#105652' }}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2"
                style={{ backgroundColor: '#105652' }}
                type="button"
              >
                <Check className="w-4 h-4" />
                Apply & Insert
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
