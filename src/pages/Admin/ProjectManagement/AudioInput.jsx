import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Music, Upload, Link as LinkIcon, Play, Pause, Volume2, SkipBack, SkipForward } from 'lucide-react';
import { storageService, ID } from '../../../lib/appwrite';

const LAYOUT_PRESETS = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Basic controls only',
    preview: 'Simple horizontal bar'
  },
  {
    id: 'medium',
    name: 'Medium',
    description: 'Controls + small cover',
    preview: 'Compact card design'
  },
  {
    id: 'full',
    name: 'Full Player',
    description: 'Large cover + metadata',
    preview: 'Feature-rich player'
  },
  {
    id: 'cassette',
    name: 'Cassette Tape',
    description: 'Retro cassette design',
    preview: 'Vintage tape player'
  }
];

export default function AudioInput({ initialData, onSave, onCancel }) {
  // Audio file states
  const [audioInputMode, setAudioInputMode] = useState('url'); // 'url' or 'upload'
  const [audioUrl, setAudioUrl] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  
  // Cover image states
  const [coverInputMode, setCoverInputMode] = useState('url'); // 'url' or 'upload'
  const [coverUrl, setCoverUrl] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  
  // Layout and metadata
  const [selectedLayout, setSelectedLayout] = useState(LAYOUT_PRESETS[0]);
  const [metadata1Label, setMetadata1Label] = useState('Song Title');
  const [metadata1Value, setMetadata1Value] = useState('');
  const [metadata2Label, setMetadata2Label] = useState('Artist');
  const [metadata2Value, setMetadata2Value] = useState('');
  
  // Audio player state for preview
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setAudioUrl(initialData.audioUrl || '');
      setCoverUrl(initialData.coverUrl || '');
      setMetadata1Label(initialData.metadata1Label || 'Song Title');
      setMetadata1Value(initialData.metadata1Value || '');
      setMetadata2Label(initialData.metadata2Label || 'Artist');
      setMetadata2Value(initialData.metadata2Value || '');
      
      const layout = LAYOUT_PRESETS.find(l => l.id === initialData.layoutId);
      if (layout) {
        setSelectedLayout(layout);
      }
    }
  }, [initialData]);

  // Audio player controls
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      audioRef.current.currentTime = percentage * duration;
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAudioFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAudioUrl(previewUrl);
    }
  };

  const handleCoverFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setCoverUrl(previewUrl);
    }
  };

  const handleSave = async () => {
    let finalAudioUrl = audioUrl;
    let finalCoverUrl = coverUrl;

    try {
      // Upload audio file if in upload mode
      if (audioInputMode === 'upload' && audioFile) {
        setUploadingAudio(true);
        const fileId = ID.unique();
        const uploadResult = await storageService.uploadFile(
          'editor-audio-files',
          fileId,
          audioFile
        );

        if (!uploadResult.success) {
          alert('Failed to upload audio: ' + uploadResult.error);
          setUploadingAudio(false);
          return;
        }

        finalAudioUrl = storageService.getFileView('editor-audio-files', uploadResult.data.$id);
        setUploadingAudio(false);
      }

      // Upload cover image if in upload mode
      if (coverInputMode === 'upload' && coverFile) {
        setUploadingCover(true);
        const fileId = ID.unique();
        const uploadResult = await storageService.uploadFile(
          'editor-audio-covers',
          fileId,
          coverFile
        );

        if (!uploadResult.success) {
          alert('Failed to upload cover: ' + uploadResult.error);
          setUploadingCover(false);
          return;
        }

        finalCoverUrl = storageService.getFileView('editor-audio-covers', uploadResult.data.$id);
        setUploadingCover(false);
      }

      // Save data
      onSave({
        audioUrl: finalAudioUrl,
        coverUrl: finalCoverUrl,
        layoutId: selectedLayout.id,
        metadata1Label,
        metadata1Value,
        metadata2Label,
        metadata2Value
      });
    } catch (error) {
      console.error('Error saving audio player:', error);
      alert('Error: ' + error.message);
      setUploadingAudio(false);
      setUploadingCover(false);
    }
  };

  // Render preview based on selected layout
  const renderPreview = () => {
    if (selectedLayout.id === 'minimal') {
      return (
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#1f2937',
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          boxSizing: 'border-box'
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <audio 
              controls 
              src={audioUrl} 
              style={{ width: '100%', height: '40px', outline: 'none' }}
            />
          </div>
        </div>
      );
    }

    if (selectedLayout.id === 'medium') {
      return (
        <div style={{
          width: '100%',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          border: '1px solid #e5e7eb',
          boxSizing: 'border-box'
        }}>
          {coverUrl && (
            <img
              src={coverUrl}
              alt="Cover"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '8px',
                objectFit: 'cover',
                flexShrink: 0,
                display: 'block'
              }}
            />
          )}
          {!coverUrl && (
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '8px',
              backgroundColor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Music size={32} style={{ color: '#9ca3af' }} />
            </div>
          )}
          
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {metadata1Value || 'Song Title'}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '8px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {metadata2Value || 'Artist'}
            </div>
            
            <audio 
              controls 
              src={audioUrl} 
              style={{ width: '100%', height: '32px', outline: 'none' }}
            />
          </div>
        </div>
      );
    }

    if (selectedLayout.id === 'full') {
      return (
        <div style={{
          width: '100%',
          maxWidth: '400px',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          boxSizing: 'border-box'
        }}>
          {coverUrl ? (
            <img
              src={coverUrl}
              alt="Cover"
              style={{
                width: '100%',
                height: '352px',
                borderRadius: '12px',
                objectFit: 'cover',
                display: 'block',
                margin: '0 0 16px 0'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '352px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 0 16px 0'
            }}>
              <Music size={64} style={{ color: '#9ca3af' }} />
            </div>
          )}
          
          <div style={{ margin: '0 0 16px 0' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 4px 0',
              lineHeight: '1.3'
            }}>
              {metadata1Value || 'Song Title'}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0',
              lineHeight: '1.3'
            }}>
              {metadata2Value || 'Artist'}
            </div>
          </div>
          
          <div 
            onClick={handleProgressClick}
            style={{
              height: '4px',
              background: '#e5e7eb',
              borderRadius: '2px',
              cursor: 'pointer',
              margin: '0 0 8px 0',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div style={{
              height: '100%',
              width: `${duration ? (currentTime / duration) * 100 : 0}%`,
              background: '#0d9488',
              borderRadius: '2px',
              transition: 'width 0.1s linear'
            }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 0 20px 0' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>
              {formatTime(currentTime)}
            </span>
            <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>
              {formatTime(duration)}
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', margin: '0' }}>
            <button
              type="button"
              onClick={() => audioRef.current && (audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10))}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#6b7280',
                transition: 'all 0.2s',
                padding: '0'
              }}
            >
              <SkipBack size={18} />
            </button>
            
            <button
              type="button"
              onClick={togglePlay}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                boxShadow: '0 4px 16px rgba(13, 148, 136, 0.4)',
                transition: 'all 0.2s',
                padding: '0'
              }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
            </button>
            
            <button
              type="button"
              onClick={() => audioRef.current && (audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10))}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#6b7280',
                transition: 'all 0.2s',
                padding: '0'
              }}
            >
              <SkipForward size={18} />
            </button>
          </div>
        </div>
      );
    }

    if (selectedLayout.id === 'cassette') {
      return (
        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
          borderRadius: '12px',
          padding: '14px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          boxSizing: 'border-box',
          position: 'relative'
        }}>
          {/* Cassette Body */}
          <div style={{
            background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '8px',
            padding: '10px',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            {/* Label Area */}
            <div style={{
              background: '#fef3c7',
              borderRadius: '4px',
              padding: '6px 8px',
              marginBottom: '8px',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #fbbf24'
            }}>
              <div style={{
                fontSize: '10px',
                fontWeight: '700',
                color: '#78350f',
                marginBottom: '2px',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {metadata1Value || 'Song Title'}
              </div>
              <div style={{
                fontSize: '8px',
                color: '#92400e',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                {metadata2Value || 'Artist'}
              </div>
            </div>

            {/* Tape Reels */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
              gap: '10px'
            }}>
              {/* Left Reel */}
              <div style={{
                width: '45px',
                height: '45px',
                flexShrink: 0,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                animation: isPlaying ? 'spin 2s linear infinite' : 'none'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#374151',
                  boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#1f2937'
                  }} />
                </div>
              </div>

              {/* Center Window (Cover Image) */}
              {coverUrl ? (
                <div style={{
                  flex: 1,
                  height: '60px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)',
                  border: '2px solid rgba(0,0,0,0.2)'
                }}>
                  <img
                    src={coverUrl}
                    alt="Cover"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  flex: 1,
                  height: '60px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.3)',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(0,0,0,0.2)'
                }}>
                  <Music size={28} style={{ color: 'rgba(255,255,255,0.3)' }} />
                </div>
              )}

              {/* Right Reel */}
              <div style={{
                width: '45px',
                height: '45px',
                flexShrink: 0,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                animation: isPlaying ? 'spin 2s linear infinite' : 'none'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#374151',
                  boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#1f2937'
                  }} />
                </div>
              </div>
            </div>

            {/* Tape Window Strip */}
            <div style={{
              height: '4px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.3) 80%, transparent 100%)',
              borderRadius: '2px',
              marginBottom: '5px'
            }} />
          </div>

          {/* Progress Bar */}
          <div 
            onClick={handleProgressClick}
            style={{
              height: '4px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '2px',
              cursor: 'pointer',
              margin: '10px 0 6px 0',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{
              height: '100%',
              width: `${duration ? (currentTime / duration) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
              borderRadius: '2px',
              transition: 'width 0.1s linear',
              boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)'
            }} />
          </div>

          {/* Time Display */}
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 0 10px 0' }}>
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontFamily: 'monospace' }}>
              {formatTime(currentTime)}
            </span>
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontFamily: 'monospace' }}>
              {formatTime(duration)}
            </span>
          </div>

          {/* Control Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', margin: '0' }}>
            <button
              type="button"
              onClick={() => audioRef.current && (audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10))}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fbbf24',
                transition: 'all 0.2s',
                padding: '0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              <SkipBack size={16} />
            </button>
            
            <button
              type="button"
              onClick={togglePlay}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: '2px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1a202c',
                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
                transition: 'all 0.2s',
                padding: '0'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
            </button>
            
            <button
              type="button"
              onClick={() => audioRef.current && (audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10))}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fbbf24',
                transition: 'all 0.2s',
                padding: '0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              <SkipForward size={20} />
            </button>
          </div>

          {/* CSS Animation for spinning reels */}
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Music className="w-5 h-5 text-teal-700" />
            {initialData ? 'Edit Audio Player' : 'Insert Audio Player'}
          </h3>
          <button type="button" onClick={onCancel} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Inputs */}
            <div className="space-y-6">
              {/* Audio File Section */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Audio File</label>
                
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setAudioInputMode('url')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      audioInputMode === 'url'
                        ? 'bg-teal-700 text-white'
                        : 'bg-white text-gray-700 border hover:bg-gray-100'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4 inline mr-1" />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudioInputMode('upload')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      audioInputMode === 'upload'
                        ? 'bg-teal-700 text-white'
                        : 'bg-white text-gray-700 border hover:bg-gray-100'
                    }`}
                  >
                    <Upload className="w-4 h-4 inline mr-1" />
                    Upload
                  </button>
                </div>

                {audioInputMode === 'url' ? (
                  <input
                    type="url"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    placeholder="https://example.com/audio.mp3"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    {audioFile && (
                      <p className="text-xs text-gray-600 mt-1">Selected: {audioFile.name}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Cover Image Section */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Cover Image</label>
                
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setCoverInputMode('url')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      coverInputMode === 'url'
                        ? 'bg-teal-700 text-white'
                        : 'bg-white text-gray-700 border hover:bg-gray-100'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4 inline mr-1" />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverInputMode('upload')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      coverInputMode === 'upload'
                        ? 'bg-teal-700 text-white'
                        : 'bg-white text-gray-700 border hover:bg-gray-100'
                    }`}
                  >
                    <Upload className="w-4 h-4 inline mr-1" />
                    Upload
                  </button>
                </div>

                {coverInputMode === 'url' ? (
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://example.com/cover.jpg"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    {coverFile && (
                      <p className="text-xs text-gray-600 mt-1">Selected: {coverFile.name}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Layout Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Player Layout</label>
                <div className="grid grid-cols-2 gap-3">
                  {LAYOUT_PRESETS.map(layout => (
                    <button
                      type="button"
                      key={layout.id}
                      onClick={() => setSelectedLayout(layout)}
                      className={`border rounded-lg p-3 text-center hover:border-teal-500 transition-all ${
                        selectedLayout.id === layout.id ? 'ring-2 ring-teal-500 border-transparent bg-teal-50' : ''
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-800 mb-1">{layout.name}</div>
                      <div className="text-xs text-gray-500">{layout.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Metadata Fields (for full and cassette layouts) */}
              {(selectedLayout.id === 'full' || selectedLayout.id === 'cassette') && (
                <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Custom Metadata {selectedLayout.id === 'full' ? '(Full Layout)' : '(Cassette Layout)'}
                  </label>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={metadata1Label}
                        onChange={(e) => setMetadata1Label(e.target.value)}
                        placeholder="Field 1 Label"
                        className="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <input
                        type="text"
                        value={metadata1Value}
                        onChange={(e) => setMetadata1Value(e.target.value)}
                        placeholder="Field 1 Value"
                        className="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={metadata2Label}
                        onChange={(e) => setMetadata2Label(e.target.value)}
                        placeholder="Field 2 Label"
                        className="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <input
                        type="text"
                        value={metadata2Value}
                        onChange={(e) => setMetadata2Value(e.target.value)}
                        placeholder="Field 2 Value"
                        className="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-amber-700 mt-2">
                    {selectedLayout.id === 'full' 
                      ? 'These fields will appear in the Full Player layout'
                      : 'These fields will appear on the cassette label'}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Preview */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 flex flex-col items-center justify-center min-h-[500px] border-2 border-dashed border-gray-300">
              <label className="text-sm font-medium text-gray-500 mb-8">Live Preview</label>
              
              {audioUrl && (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                />
              )}
              
              {renderPreview()}
              
              <div className="mt-8 text-xs text-gray-400 text-center max-w-xs">
                {audioUrl ? 'Audio player preview with functional controls' : 'Add an audio file to see the preview'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!audioUrl || uploadingAudio || uploadingCover}
            className="px-6 py-2 rounded-lg bg-teal-700 text-white hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {(uploadingAudio || uploadingCover) ? (
              <>Uploading...</>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {initialData ? 'Update Player' : 'Insert Player'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

