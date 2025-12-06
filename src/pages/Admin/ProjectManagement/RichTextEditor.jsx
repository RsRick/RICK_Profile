import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
  RemoveFormatting,
  Type,
  Palette,
  TextCursor,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FileCode,
  Eye,
  Settings,
  Quote,
  MousePointerClick,
  Music,
  Video,
  Minus,
  HelpCircle,
  Table as TableIcon,
  Share2,
  ArrowLeftRight,
  User,
  FolderDown,
  Grid3x3,
} from 'lucide-react';
import { GOOGLE_FONTS, loadGoogleFont } from '../../../utils/googleFonts';
import { databaseService, storageService, ID } from '../../../lib/appwrite';
import { loadCustomFont } from '../../../utils/fontLoader';
import QuoteblockInput from './QuoteblockInput';
import ButtonInput from './ButtonInput';
import CodeBlockInput from './CodeBlockInput';
import AudioInput from './AudioInput';
import VideoInput from './VideoInput';
import FaqInput from './FaqInput';
import TableInput from './TableInput';
import SocialLinksInput from './SocialLinksInput';
import AuthorInput from './AuthorInput';
import FileUploadInput from './FileUploadInput';
import PhotoGridInput from './PhotoGridInput';
import { highlightCode } from '../../../utils/syntaxHighlighter';

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkMode, setLinkMode] = useState('selection'); // 'selection' or 'insert'
  const [editingLink, setEditingLink] = useState(null); // Store link element being edited
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageInputMode, setImageInputMode] = useState('url'); // 'url' or 'upload'
  
  // New states for font, color, and size
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [customFonts, setCustomFonts] = useState([]);
  const [colorInput, setColorInput] = useState('#000000');
  const [sizeInput, setSizeInput] = useState('16');
  
  // Store the selection to restore it later
  const savedSelectionRef = useRef(null);
  
  // Image resize states
  const [selectedImage, setSelectedImage] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0, handle: '' });
  
  // Text wrap states
  const [showTextWrapOptions, setShowTextWrapOptions] = useState(false);
  const [textWrapEnabled, setTextWrapEnabled] = useState(false);
  const [textWrapGap, setTextWrapGap] = useState(20);
  
  // Embed states
  const [showEmbedInput, setShowEmbedInput] = useState(false);
  const [embedCode, setEmbedCode] = useState('');
  const [embedViewMode, setEmbedViewMode] = useState('preview'); // 'code' or 'preview'
  const [selectedEmbed, setSelectedEmbed] = useState(null);
  const [showEmbedCodeView, setShowEmbedCodeView] = useState(false);
  const [editingEmbedCode, setEditingEmbedCode] = useState('');
  const [embedCodeViewMode, setEmbedCodeViewMode] = useState('code'); // 'code' or 'preview'
  const [showBorderSettings, setShowBorderSettings] = useState(false);
  const [borderStyle, setBorderStyle] = useState('solid');
  const [borderWidth, setBorderWidth] = useState(1);
  const [borderColor, setBorderColor] = useState('#105652');
  const [fullscreenEmbed, setFullscreenEmbed] = useState(null);

  // Quoteblock states
  const [showQuoteblockInput, setShowQuoteblockInput] = useState(false);
  const [editingQuoteblock, setEditingQuoteblock] = useState(null);
  const [quoteblockData, setQuoteblockData] = useState(null);
  const [selectedQuoteblock, setSelectedQuoteblock] = useState(null);
  
  // Button states
  const [showButtonInput, setShowButtonInput] = useState(false);
  const [editingButton, setEditingButton] = useState(null);
  const [buttonData, setButtonData] = useState(null);
  const [selectedButton, setSelectedButton] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });

  // Code Block states
  const [showCodeBlockInput, setShowCodeBlockInput] = useState(false);
  const [editingCodeBlock, setEditingCodeBlock] = useState(null);
  const [codeBlockData, setCodeBlockData] = useState(null);
  const [selectedCodeBlock, setSelectedCodeBlock] = useState(null);

  // Audio Player states
  const [showAudioInput, setShowAudioInput] = useState(false);
  const [editingAudioPlayer, setEditingAudioPlayer] = useState(null);
  const [audioPlayerData, setAudioPlayerData] = useState(null);
  const [selectedAudioPlayer, setSelectedAudioPlayer] = useState(null);

  // Video Player states (simplified)
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Divider states
  const [showDividerInput, setShowDividerInput] = useState(false);
  const [selectedDivider, setSelectedDivider] = useState(null);
  const [dividerDesign, setDividerDesign] = useState('solid');
  const [dividerColor, setDividerColor] = useState('#105652');
  const [dividerWidth, setDividerWidth] = useState(100);
  const [dividerThickness, setDividerThickness] = useState(2);
  const [dividerGapTop, setDividerGapTop] = useState(20);
  const [dividerGapBottom, setDividerGapBottom] = useState(20);
  
  // FAQ states
  const [showFaqInput, setShowFaqInput] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqData, setFaqData] = useState(null);
  const [selectedFaq, setSelectedFaq] = useState(null);

  // Photo Grid states
  const [showPhotoGridInput, setShowPhotoGridInput] = useState(false);
  const [editingPhotoGrid, setEditingPhotoGrid] = useState(null);
  const [photoGridData, setPhotoGridData] = useState(null);
  const [selectedPhotoGrid, setSelectedPhotoGrid] = useState(null);
  
  // Table states
  const [showTableInput, setShowTableInput] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  
  // Social Links states
  const [showSocialLinksInput, setShowSocialLinksInput] = useState(false);
  const [editingSocialLinks, setEditingSocialLinks] = useState(null);
  const [socialLinksData, setSocialLinksData] = useState(null);
  const [selectedSocialLinks, setSelectedSocialLinks] = useState(null);
  
  // Author states
  const [showAuthorInput, setShowAuthorInput] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [authorData, setAuthorData] = useState(null);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  
  // File Download states
  const [showFileUploadInput, setShowFileUploadInput] = useState(false);
  const [editingFileDownload, setEditingFileDownload] = useState(null);
  const [fileDownloadData, setFileDownloadData] = useState(null);
  const [selectedFileDownload, setSelectedFileDownload] = useState(null);
  
  // Predefined color palette
  const colorPalette = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#008000', '#FFC0CB', '#A52A2A', '#808080', '#105652',
    '#1E8479', '#2d3748', '#4a5568', '#718096', '#e53e3e',
  ];
  
  // Divider designs
  const dividerDesigns = [
    { id: 'none', name: 'Invisible', preview: 'No visible line' },
    { id: 'solid', name: 'Solid Line', preview: '━━━━━━━━━━' },
    { id: 'dashed', name: 'Dashed Line', preview: '╌╌╌╌╌╌╌╌╌╌' },
    { id: 'dotted', name: 'Dotted Line', preview: '┄┄┄┄┄┄┄┄┄┄' },
    { id: 'double', name: 'Double Line', preview: '═══════════' },
    { id: 'gradient', name: 'Gradient Fade', preview: '▓▒░░░░░▒▓' },
    { id: 'wave', name: 'Wave Line', preview: '∿∿∿∿∿∿∿∿∿∿' },
    { id: 'zigzag', name: 'Zigzag Line', preview: '⩘⩘⩘⩘⩘⩘⩘⩘⩘⩘' },
    { id: 'dots', name: 'Dot Pattern', preview: '• • • • • • • • • •' },
    { id: 'stars', name: 'Star Pattern', preview: '✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦' },
  ];
  
  // Font sizes
  const fontSizes = [
    { label: 'Tiny', value: '12' },
    { label: 'Small', value: '14' },
    { label: 'Normal', value: '16' },
    { label: 'Medium', value: '18' },
    { label: 'Large', value: '20' },
    { label: 'X-Large', value: '24' },
    { label: 'XX-Large', value: '32' },
    { label: 'Huge', value: '48' },
  ];

  // Initialize editor content only once
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
    }
  }, []);
  
  // Load custom fonts
  useEffect(() => {
    loadCustomFontsFromDB();
  }, []);
  
  // Add table hover styles
  useEffect(() => {
    const styleId = 'table-hover-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .editor-table-wrapper {
          position: relative;
        }
        .table-settings-btn {
          opacity: 1 !important;
        }
        .editor-table-wrapper.selected {
          outline: 2px solid #0d9488;
          outline-offset: 2px;
        }

        .table-cell {
          outline: none;
        }
        .table-cell:focus {
          outline: 2px solid #0d9488;
          outline-offset: -2px;
        }
        .table-cell:focus-within {
          background-color: #f0fdfa !important;
        }

        /* Social Media Icons Hover Effects */
        .social-icon-wrapper:hover {
          background: var(--social-color) !important;
        }
        .social-icon-wrapper:hover .social-icon-link {
          color: #fff !important;
        }
        .social-icon-wrapper:hover .social-tooltip {
          top: -45px !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          background: var(--social-color) !important;
        }
        .social-icon-wrapper:hover .social-tooltip-arrow {
          background: var(--social-color) !important;
        }

        /* Platform-specific colors */
        .social-facebook { --social-color: #1877f2; }
        .social-twitter { --social-color: #1da1f2; }
        .social-instagram { --social-color: #e4405f; }
        .social-linkedin { --social-color: #0077b5; }
        .social-youtube { --social-color: #ff0000; }
        .social-github { --social-color: #333333; }
        .social-website { --social-color: #105652; }
        .social-email { --social-color: #ea4335; }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById(styleId);
      if (style) style.remove();
    };
  }, []);
  

  
  // Attach copy handlers to code blocks
  useEffect(() => {
    const attachCopyHandlers = () => {
      const codeBlocks = editorRef.current?.querySelectorAll('.editor-code-block-wrapper');
      codeBlocks?.forEach(wrapper => {
        const copyBtn = wrapper.querySelector('.editor-code-copy');
        const codeElement = wrapper.querySelector('code');
        
        if (copyBtn && codeElement && !copyBtn.onclick) {
          const codeText = wrapper.getAttribute('data-code') || codeElement.textContent;
          copyBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigator.clipboard.writeText(codeText).then(() => {
              const originalHTML = copyBtn.innerHTML;
              copyBtn.innerHTML = 'Copied!';
              copyBtn.style.fontSize = '11px';
              setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.style.fontSize = '';
              }, 2000);
            }).catch(err => {
              console.error('Failed to copy:', err);
            });
          };
        }
      });
    };
    
    // Attach on mount and whenever content changes
    attachCopyHandlers();
    
    // Use MutationObserver to handle dynamically added code blocks
    const observer = new MutationObserver(attachCopyHandlers);
    if (editorRef.current) {
      observer.observe(editorRef.current, { childList: true, subtree: true });
    }
    
    return () => observer.disconnect();
  }, [value]);
  
  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.font-picker-container') && 
          !e.target.closest('.color-picker-container') && 
          !e.target.closest('.size-picker-container')) {
        setShowFontPicker(false);
        setShowColorPicker(false);
        setShowSizePicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Audio Player Interactivity
  useEffect(() => {
    const handleAudioClick = (e) => {
      const player = e.target.closest('.custom-audio-player');
      if (!player) return;

      const audio = player.querySelector('audio');
      if (!audio) return;

      // Play/Pause
      if (e.target.closest('.play-pause-btn')) {
        e.preventDefault();
        e.stopPropagation();
        
        // Pause all other audios
        document.querySelectorAll('audio').forEach(a => {
          if (a !== audio) {
            a.pause();
            const p = a.closest('.custom-audio-player');
            if (p) {
              p.querySelector('.play-icon').style.display = 'flex';
              p.querySelector('.pause-icon').style.display = 'none';
              // Stop cassette reels
              const reels = p.querySelectorAll('.cassette-reel');
              reels.forEach(reel => reel.classList.remove('playing'));
            }
          }
        });

        if (audio.paused) {
          audio.play();
          player.querySelector('.play-icon').style.display = 'none';
          player.querySelector('.pause-icon').style.display = 'flex';
          // Start cassette reels
          const reels = player.querySelectorAll('.cassette-reel');
          reels.forEach(reel => reel.classList.add('playing'));
        } else {
          audio.pause();
          player.querySelector('.play-icon').style.display = 'flex';
          player.querySelector('.pause-icon').style.display = 'none';
          // Stop cassette reels
          const reels = player.querySelectorAll('.cassette-reel');
          reels.forEach(reel => reel.classList.remove('playing'));
        }
      }

      // Skip Forward
      if (e.target.closest('.skip-forward-btn')) {
        e.preventDefault();
        e.stopPropagation();
        audio.currentTime = Math.min(audio.currentTime + 10, audio.duration);
      }

      // Skip Back
      if (e.target.closest('.skip-back-btn')) {
        e.preventDefault();
        e.stopPropagation();
        audio.currentTime = Math.max(audio.currentTime - 10, 0);
      }

      // Progress Bar Click
      if (e.target.closest('.progress-container')) {
        const container = e.target.closest('.progress-container');
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        if (audio.duration) {
          audio.currentTime = percentage * audio.duration;
        }
      }
    };

    const formatTime = (seconds) => {
      if (!seconds) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const updateProgress = (e) => {
      const audio = e.target;
      const player = audio.closest('.custom-audio-player');
      if (!player) return;

      const progressFill = player.querySelector('.progress-fill');
      const currentTimeEl = player.querySelector('.current-time');
      const durationEl = player.querySelector('.duration');

      if (progressFill) {
        const percent = (audio.currentTime / audio.duration) * 100 || 0;
        progressFill.style.width = `${percent}%`;
      }

      if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
      if (durationEl && audio.duration) durationEl.textContent = formatTime(audio.duration);
    };

    const handleEnded = (e) => {
      const player = e.target.closest('.custom-audio-player');
      if (player) {
        player.querySelector('.play-icon').style.display = 'flex';
        player.querySelector('.pause-icon').style.display = 'none';
        const progressFill = player.querySelector('.progress-fill');
        if (progressFill) progressFill.style.width = '0%';
        // Stop cassette reels
        const reels = player.querySelectorAll('.cassette-reel');
        reels.forEach(reel => reel.classList.remove('playing'));
      }
    };

    // Attach listeners to editor content
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('click', handleAudioClick);
      
      // We need to attach timeupdate listeners to audio elements dynamically
      const observer = new MutationObserver(() => {
        const audios = editor.querySelectorAll('audio');
        audios.forEach(audio => {
          audio.removeEventListener('timeupdate', updateProgress);
          audio.addEventListener('timeupdate', updateProgress);
          audio.removeEventListener('ended', handleEnded);
          audio.addEventListener('ended', handleEnded);
          
          // Initialize duration display
          audio.addEventListener('loadedmetadata', () => {
            const player = audio.closest('.custom-audio-player');
            if (player) {
              const durationEl = player.querySelector('.duration');
              if (durationEl) durationEl.textContent = formatTime(audio.duration);
            }
          });
        });
      });
      
      observer.observe(editor, { childList: true, subtree: true });
      
      return () => {
        editor.removeEventListener('click', handleAudioClick);
        observer.disconnect();
      };
    }
  }, []);
  
  // Video selection handler
  useEffect(() => {
    const handleVideoClick = (e) => {
      const videoWrapper = e.target.closest('.editor-video-wrapper');
      
      if (videoWrapper) {
        e.preventDefault();
        setSelectedVideo(videoWrapper);
        setSelectedImage(null);
        setSelectedEmbed(null);
        setSelectedQuoteblock(null);
        setSelectedButton(null);
        setSelectedCodeBlock(null);
        setSelectedAudioPlayer(null);
        return;
      }
      
      // Deselect if clicking elsewhere
      if (!e.target.closest('.resize-handle')) {
        setSelectedVideo(null);
      }
    };
    
    const handleKeyDown = (e) => {
      // Delete selected video with Delete or Backspace key
      if (selectedVideo && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        selectedVideo.remove();
        setSelectedVideo(null);
        updateContent();
      }
    };
    
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('click', handleVideoClick);
    }
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      if (editor) {
        editor.removeEventListener('click', handleVideoClick);
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedVideo]);

  // Handle FAQ toggle and edit interactivity
  useEffect(() => {
    const handleFaqClick = (e) => {
      const faqWrapper = e.target.closest('.editor-faq-wrapper');
      if (!faqWrapper) return;
      
      // Check if clicking on edit/delete buttons (they have their own handlers)
      if (e.target.closest('button')) {
        return;
      }
      
      // If clicking on title area - toggle content
      const titleDiv = e.target.closest('.faq-title');
      if (titleDiv) {
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle content visibility
        let contentDiv = faqWrapper.querySelector('.faq-content');
        const chevron = faqWrapper.querySelector('.faq-chevron');
        const icon = faqWrapper.querySelector('.faq-icon');
        const isOpen = contentDiv !== null;
        
        if (isOpen) {
          // Close: remove content
          contentDiv.remove();
          faqWrapper.setAttribute('data-is-open', 'false');
          
          // Update chevron
          if (chevron) {
            chevron.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
          }
          
          // Update plus/minus icon
          if (icon) {
            icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
          }
        } else {
          // Open: add content
          const content = faqWrapper.getAttribute('data-content');
          const titleDiv = faqWrapper.querySelector('.faq-title');
          const borderColor = faqWrapper.style.borderColor;
          const padding = titleDiv.style.padding;
          
          // Get stored content styles from data attributes or use defaults
          const contentFontFamily = faqWrapper.getAttribute('data-content-font-family') || "'Inter', sans-serif";
          const contentFontSize = faqWrapper.getAttribute('data-content-font-size') || '16px';
          const contentColor = faqWrapper.getAttribute('data-content-color') || '#4a5568';
          const contentBgColor = faqWrapper.getAttribute('data-content-bg-color') || '#ffffff';
          
          contentDiv = document.createElement('div');
          contentDiv.className = 'faq-content';
          contentDiv.style.cssText = `
            font-family: ${contentFontFamily};
            font-size: ${contentFontSize};
            color: ${contentColor};
            background-color: ${contentBgColor};
            padding: ${padding};
            border-top: 1px solid ${borderColor};
            white-space: pre-wrap;
            line-height: 1.6;
            display: block;
          `;
          contentDiv.textContent = content;
          faqWrapper.appendChild(contentDiv);
          faqWrapper.setAttribute('data-is-open', 'true');
          
          // Update chevron
          if (chevron) {
            chevron.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
          }
          
          // Update plus/minus icon
          if (icon) {
            icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
          }
        }
        
        updateContent();
        return;
      }
      
      // If clicking on content area - open edit modal
      const contentDiv = e.target.closest('.faq-content');
      if (contentDiv) {
        e.preventDefault();
        e.stopPropagation();
        handleEditFaq(faqWrapper);
        return;
      }
    };
    
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('click', handleFaqClick);
    }
    
    return () => {
      if (editor) {
        editor.removeEventListener('click', handleFaqClick);
      }
    };
  }, []);

  // Handle image selection, link clicking, embed selection, and resizing
  useEffect(() => {
    const handleEditorClick = (e) => {
      let target = e.target;
      if (target.nodeType === Node.TEXT_NODE) {
        target = target.parentElement;
      }

      // Handle code block copy button click
      if (target.closest('.editor-code-copy')) {
        e.preventDefault();
        e.stopPropagation();
        const wrapper = target.closest('.editor-code-block-wrapper');
        const code = wrapper.querySelector('code')?.textContent || '';
        navigator.clipboard.writeText(code).then(() => {
          // Optional: Show feedback
          const originalIcon = target.innerHTML;
          // We can't easily change icon here without state, but we can alert or just do nothing
          // Or maybe change the button text temporarily if it was text
        });
        return;
      }

      // Handle code block selection
      let codeBlockElement = target.closest('.editor-code-block-wrapper');
      if (codeBlockElement) {
        // If clicking header (but not copy), open edit
        if (target.closest('.editor-code-header') && !target.closest('.editor-code-copy')) {
           handleEditCodeBlock(codeBlockElement);
        }
        setSelectedCodeBlock(codeBlockElement);
        setSelectedImage(null);
        setSelectedEmbed(null);
        setSelectedQuoteblock(null);
        setSelectedButton(null);
        return;
      }



      // Handle link clicks for editing - check if clicked element is a link or inside a link
      let linkElement = null;
      
      // Check if the clicked element is a link
      if (e.target.tagName === 'A') {
        linkElement = e.target;
      } else {
        // Check if clicked inside a link (traverse up the DOM)
        let element = e.target;
        while (element && element !== editorRef.current) {
          if (element.tagName === 'A') {
            linkElement = element;
            break;
          }
          element = element.parentElement;
        }
      }
      
      // If we found a link, open edit panel
      if (linkElement) {
        e.preventDefault();
        setEditingLink(linkElement);
        setLinkUrl(linkElement.href);
        setLinkTitle(linkElement.textContent);
        setLinkMode('insert');
        setShowLinkInput(true);
        return;
      }
      
      // Handle embed selection
      let embedElement = e.target.closest('.editor-embed-wrapper');
      if (embedElement) {
        e.preventDefault();
        setSelectedEmbed(embedElement);
        setEditingEmbedCode(embedElement.getAttribute('data-embed-code') || '');
        setSelectedImage(null);
        return;
      }
      
      // Video controls handled by event delegation in separate useEffect

      // Handle audio player selection
      const audioPlayerElement = e.target.closest('.editor-audio-player');
      if (audioPlayerElement) {
        // Don't select if clicking controls (buttons or progress bar)
        if (e.target.closest('button') || e.target.closest('.progress-container')) {
           return;
        }
        
        e.preventDefault();
        setSelectedAudioPlayer(audioPlayerElement);
        setSelectedImage(null);
        setSelectedEmbed(null);
        setSelectedQuoteblock(null);
        setSelectedButton(null);
        setSelectedCodeBlock(null);
        return;
      }

      // Handle photo grid selection - check BEFORE image selection
      let photoGridElement = e.target.closest('.editor-photo-grid');
      if (photoGridElement) {
        e.preventDefault();
        setSelectedPhotoGrid(photoGridElement);
        setSelectedImage(null);
        setSelectedEmbed(null);
        setSelectedQuoteblock(null);
        setSelectedButton(null);
        setSelectedCodeBlock(null);
        setSelectedAudioPlayer(null);
        setSelectedDivider(null);
        setSelectedFaq(null);
        setSelectedTable(null);
        setSelectedSocialLinks(null);
        setSelectedAuthor(null);
        setSelectedFileDownload(null);
        return;
      }

      if (e.target.tagName === 'IMG') {
        // Don't select images inside photo grids
        if (e.target.closest('.editor-photo-grid')) {
          return;
        }
        
        e.preventDefault();
        setSelectedImage(e.target);
        setSelectedEmbed(null);
        setSelectedQuoteblock(null);
        
        // Sync text wrap state
        const isWrapped = e.target.hasAttribute('data-text-wrap');
        const gap = parseInt(e.target.getAttribute('data-wrap-gap') || '10');
        setTextWrapEnabled(isWrapped);
        setTextWrapGap(gap);
        return;
      }

      // Handle quoteblock selection
      let quoteblockElement = e.target.closest('.editor-quoteblock-wrapper');
      if (quoteblockElement) {
        // Don't prevent default here to allow text selection inside if needed, 
        // but for now we treat it as a block to edit
        if (!e.target.closest('.quoteblock-content')) {
           e.preventDefault();
        }
        setSelectedQuoteblock(quoteblockElement);
        setSelectedImage(null);
        setSelectedEmbed(null);
        setSelectedButton(null);
        setSelectedCodeBlock(null);
        
        // Sync text wrap state
        const isWrapped = quoteblockElement.hasAttribute('data-text-wrap');
        const gap = parseInt(quoteblockElement.getAttribute('data-wrap-gap') || '10');
        setTextWrapEnabled(isWrapped);
        setTextWrapGap(gap);
        
        // If double click or specific action, we could open edit. 
        // For now, let's say clicking the wrapper (padding area) opens edit?
        if (e.target === quoteblockElement || e.target.parentElement === quoteblockElement) {
             handleEditQuoteblock(quoteblockElement);
        }
        return;
      }

      // Handle button selection
      let buttonElement = e.target.closest('.editor-button');
      if (buttonElement) {
        // We don't prevent default here so link selection can work too
        // But we set selected button for deletion handling
        setSelectedButton(buttonElement);
        setSelectedImage(null);
        setSelectedEmbed(null);
        setSelectedQuoteblock(null);
        setSelectedCodeBlock(null);
        setSelectedDivider(null);
        return;
      }

      // Handle divider selection
      let dividerElement = e.target.closest('.editor-divider-wrapper');
      if (dividerElement) {
        e.preventDefault();
        setSelectedDivider(dividerElement);
        setSelectedImage(null);
        setSelectedEmbed(null);
        setSelectedQuoteblock(null);
        setSelectedButton(null);
        setSelectedCodeBlock(null);
        setSelectedAudioPlayer(null);
        setSelectedFaq(null);
        return;
      }

      // Handle FAQ selection
      let faqElement = e.target.closest('.editor-faq-wrapper');
      if (faqElement) {
        // Select the FAQ (but don't prevent default to allow toggle/edit)
        setSelectedFaq(faqElement);
        setSelectedImage(null);
        setSelectedEmbed(null);
        setSelectedQuoteblock(null);
        setSelectedButton(null);
        setSelectedCodeBlock(null);
        setSelectedAudioPlayer(null);
        setSelectedDivider(null);
        setSelectedTable(null);
        return;
      }

      // Handle Social Links selection
      let socialLinksElement = e.target.closest('.editor-social-links-wrapper');
      if (socialLinksElement) {
        // If clicking on a social icon link, allow link to open
        if (e.target.closest('a')) {
          return; // Allow link click
        }
        
        // If clicking on the label text or wrapper, open edit modal
        if (e.target.closest('.social-label-text') || e.target === socialLinksElement) {
          e.preventDefault();
          handleEditSocialLinks(socialLinksElement);
          return;
        }
        
        // Otherwise just select it
        e.preventDefault();
        setSelectedSocialLinks(socialLinksElement);
        setSelectedImage(null);
        setSelectedEmbed(null);
        setSelectedQuoteblock(null);
        setSelectedButton(null);
        setSelectedCodeBlock(null);
        setSelectedAudioPlayer(null);
        setSelectedDivider(null);
        setSelectedFaq(null);
        setSelectedTable(null);
        setSelectedAuthor(null);
        return;
      }

      // Handle Author selection
      let authorElement = e.target.closest('.editor-author-wrapper');
      if (authorElement) {
        // If clicking on settings or delete button, let those handlers work
        if (e.target.closest('.author-settings-btn') || e.target.closest('.author-delete-btn')) {
          return;
        }
        
        // If clicking on the terminal or wrapper, open edit modal
        if (e.target.closest('.editor-author-terminal') || e.target === authorElement) {
          e.preventDefault();
          handleEditAuthor(authorElement);
          return;
        }
        
        // Otherwise just select it
        e.preventDefault();
        setSelectedAuthor(authorElement);
        setSelectedImage(null);
        setSelectedEmbed(null);
        setSelectedQuoteblock(null);
        setSelectedButton(null);
        setSelectedCodeBlock(null);
        setSelectedAudioPlayer(null);
        setSelectedDivider(null);
        setSelectedFaq(null);
        setSelectedTable(null);
        setSelectedSocialLinks(null);
        setSelectedFileDownload(null);
        return;
      }

      // Handle File Download selection
      let fileDownloadElement = e.target.closest('.editor-file-download-wrapper');
      if (fileDownloadElement) {
        // If clicking on settings or delete button, let those handlers work
        if (e.target.closest('.file-download-settings-btn') || e.target.closest('.file-download-delete-btn')) {
          return;
        }
        
        // If clicking on the download link, allow it to work
        if (e.target.closest('.editor-file-info')) {
          return; // Allow link click
        }
        
        // If clicking on the wrapper, open edit modal
        if (e.target === fileDownloadElement || e.target.closest('.editor-file-folder')) {
          e.preventDefault();
          handleEditFileDownload(fileDownloadElement);
          return;
        }
        
        // Otherwise just select it
        e.preventDefault();
        setSelectedFileDownload(fileDownloadElement);
        setSelectedImage(null);
        setSelectedEmbed(null);
        setSelectedQuoteblock(null);
        setSelectedButton(null);
        setSelectedCodeBlock(null);
        setSelectedAudioPlayer(null);
        setSelectedDivider(null);
        setSelectedFaq(null);
        setSelectedTable(null);
        setSelectedSocialLinks(null);
        setSelectedAuthor(null);
        return;
      }

      // Handle Table selection (only for settings button, not for editing)
      let tableElement = e.target.closest('.editor-table-wrapper');
      if (tableElement && e.target.closest('.table-settings-btn')) {
        e.preventDefault();
        e.stopPropagation();
        return; // Settings button has its own handler
      }
      
      // Don't prevent default for table cells - allow normal editing
      if (tableElement && e.target.closest('.table-cell')) {
        // Allow normal editing in cells
        return;
      }
      
      if (tableElement) {
        // Remove selected class from all tables
        document.querySelectorAll('.editor-table-wrapper').forEach(t => t.classList.remove('selected'));
        // Add selected class to this table
        tableElement.classList.add('selected');
        
        setSelectedTable(tableElement);
        setSelectedImage(null);
        setSelectedEmbed(null);
        setSelectedQuoteblock(null);
        setSelectedButton(null);
        setSelectedCodeBlock(null);
        setSelectedAudioPlayer(null);
        setSelectedDivider(null);
        setSelectedFaq(null);
        setSelectedSocialLinks(null);
        return;
      }

      // Deselect if clicking elsewhere (and not resizing)
      if (!e.target.closest('.resize-handle')) {
        // Remove selected class from all tables
        document.querySelectorAll('.editor-table-wrapper').forEach(t => t.classList.remove('selected'));
        
        setSelectedImage(null);
        setSelectedEmbed(null);
        setSelectedQuoteblock(null);
        setSelectedCodeBlock(null);
        setSelectedDivider(null);
        setSelectedFaq(null);
        setSelectedTable(null);
        setSelectedSocialLinks(null);
        setSelectedAuthor(null);
        setSelectedFileDownload(null);
        setShowTextWrapOptions(false);
      }
    };
    
    const handleKeyDown = (e) => {
      // Delete selected image with Delete or Backspace key
      if (selectedImage && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        selectedImage.remove();
        setSelectedImage(null);
        updateContent();
      }
      
      // Delete selected embed with Delete or Backspace key
      if (selectedEmbed && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        selectedEmbed.remove();
        setSelectedEmbed(null);
        updateContent();
      }

      // Delete selected quoteblock
      if (selectedQuoteblock && (e.key === 'Delete' || e.key === 'Backspace')) {
        // Only delete if we are not editing text inside it (selection is not collapsed inside)
        // But since we set contentEditable=false on wrapper, we might be fine.
        // Actually, we want to allow deleting the block.
        e.preventDefault();
        selectedQuoteblock.remove();
        setSelectedQuoteblock(null);
        updateContent();
      }

      // Delete selected button
      if (selectedButton && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        selectedButton.remove();
        setSelectedButton(null);
        updateContent();
      }

      // Delete selected code block
      if (selectedCodeBlock && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        selectedCodeBlock.remove();
        setSelectedCodeBlock(null);
        updateContent();
      }
      
      // Delete selected divider
      if (selectedDivider && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        selectedDivider.remove();
        setSelectedDivider(null);
        updateContent();
      }
      
      // Delete selected FAQ
      if (selectedFaq && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        selectedFaq.remove();
        setSelectedFaq(null);
        updateContent();
      }
      
      // Delete selected table
      if (selectedTable && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        selectedTable.remove();
        setSelectedTable(null);
        updateContent();
      }
      
      // Delete selected social links
      if (selectedSocialLinks && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        selectedSocialLinks.remove();
        setSelectedSocialLinks(null);
        updateContent();
      }
      
      // Delete selected author
      if (selectedAuthor && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        selectedAuthor.remove();
        setSelectedAuthor(null);
        updateContent();
      }
      
      // Delete selected file download
      if (selectedFileDownload && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        selectedFileDownload.remove();
        setSelectedFileDownload(null);
        updateContent();
      }
      
      // Note: Video deletion is now handled by floating delete button
    };
    
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const target = selectedImage || selectedEmbed;
      if (!target) return;
      
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;
      const handle = resizeStartRef.current.handle;
      
      let newWidth = resizeStartRef.current.width;
      let newHeight = resizeStartRef.current.height;
      
      // Calculate new dimensions based on handle
      if (handle.includes('e')) newWidth += deltaX;
      if (handle.includes('w')) newWidth -= deltaX;
      if (handle.includes('s')) newHeight += deltaY;
      if (handle.includes('n')) newHeight -= deltaY;
      
      // Maintain aspect ratio for corner handles
      if (handle.length === 2) {
        const aspectRatio = resizeStartRef.current.width / resizeStartRef.current.height;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
      }
      
      // Apply minimum size
      newWidth = Math.max(50, newWidth);
      newHeight = Math.max(50, newHeight);
      
      target.style.width = `${newWidth}px`;
      target.style.height = `${newHeight}px`;
    };
    
    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        updateContent();
      }
    };
    
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('click', handleEditorClick);
    }
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      if (editor) {
        editor.removeEventListener('click', handleEditorClick);
      }
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

  }, [isResizing, selectedImage, selectedEmbed, selectedQuoteblock, selectedButton, selectedCodeBlock, selectedDivider, selectedFaq, selectedTable, selectedSocialLinks, selectedAuthor, selectedFileDownload]);
  
  const loadCustomFontsFromDB = async () => {
    try {
      const result = await databaseService.listDocuments('custom_fonts', 100);
      if (result.success) {
        setCustomFonts(result.data.documents);
        // Load fonts into DOM
        result.data.documents.forEach(font => {
          loadCustomFont(font.fontName, font.fileUrl);
        });
      }
    } catch (error) {
      console.error('Error loading custom fonts:', error);
    }
  };

  const execCommand = (command, val = null) => {
    // Ensure editor is focused before executing command
    editorRef.current?.focus();
    // Small delay to ensure focus is set
    setTimeout(() => {
      document.execCommand(command, false, val);
      updateContent();
    }, 0);
  };

  const insertHTML = (html) => {
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, html);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Validate and fix URL format
  const validateUrl = (url) => {
    if (!url) return '';
    
    // Trim whitespace
    url = url.trim();
    
    // If URL doesn't start with http:// or https://, add https://
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }
    
    return url;
  };

  const handleInsertLink = () => {
    if (!linkUrl) return;
    
    // Validate and fix URL
    const validatedUrl = validateUrl(linkUrl);
    
    // If editing an existing link
    if (editingLink) {
      editingLink.href = validatedUrl;
      if (linkMode === 'insert' && linkTitle) {
        editingLink.textContent = linkTitle;
      }
      setEditingLink(null);
      setLinkUrl('');
      setLinkTitle('');
      setShowLinkInput(false);
      updateContent();
      return;
    }
    
    restoreSelection();
    
    if (linkMode === 'selection') {
      // Mode 1: Apply link to selected text
      const selection = window.getSelection();
      const selectedText = selection.toString();
      
      if (selectedText) {
        // Create link element
        const link = document.createElement('a');
        link.href = validatedUrl;
        link.textContent = selectedText;
        link.style.color = '#1E8479';
        link.style.textDecoration = 'underline';
        link.style.cursor = 'pointer';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'editor-link';
        
        // Replace selected text with link
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(link);
        
        // Move cursor after link
        range.setStartAfter(link);
        range.setEndAfter(link);
        selection.removeAllRanges();
        selection.addRange(range);
        
        updateContent();
      }
    } else {
      // Mode 2: Insert new link with title at cursor position
      if (linkTitle && linkUrl) {
        const link = document.createElement('a');
        link.href = validatedUrl;
        link.textContent = linkTitle;
        link.style.color = '#1E8479';
        link.style.textDecoration = 'underline';
        link.style.cursor = 'pointer';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'editor-link';
        
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.insertNode(link);
          
          // Add space after link
          const space = document.createTextNode(' ');
          range.setStartAfter(link);
          range.insertNode(space);
          
          // Move cursor after space
          range.setStartAfter(space);
          range.setEndAfter(space);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          editorRef.current?.appendChild(link);
        }
        
        updateContent();
      }
    }
    
    setLinkUrl('');
    setLinkTitle('');
    setShowLinkInput(false);
  };
  
  const handleLinkButtonClick = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    // Check if clicking on an existing link
    let element = selection.anchorNode;
    if (element && element.nodeType === Node.TEXT_NODE) {
      element = element.parentElement;
    }
    
    // Find if we're inside a link
    let linkElement = null;
    while (element && element !== editorRef.current) {
      if (element.tagName === 'A') {
        linkElement = element;
        break;
      }
      element = element.parentElement;
    }
    
    if (linkElement) {
      // Editing existing link
      setEditingLink(linkElement);
      setLinkUrl(linkElement.href);
      setLinkTitle(linkElement.textContent);
      setLinkMode('insert'); // Show both fields for editing
      setShowLinkInput(true);
    } else if (selectedText) {
      // Has selection - Mode 1
      saveSelection();
      setLinkMode('selection');
      setLinkUrl('');
      setLinkTitle('');
      setShowLinkInput(true);
    } else {
      // No selection - Mode 2
      saveSelection();
      setLinkMode('insert');
      setLinkUrl('');
      setLinkTitle('');
      setShowLinkInput(true);
    }
  };

  // Extract dimensions from embed code
  const extractDimensions = (code) => {
    const widthMatch = code.match(/width[=:"]\s*["']?(\d+)/i);
    const heightMatch = code.match(/height[=:"]\s*["']?(\d+)/i);
    
    return {
      width: widthMatch ? parseInt(widthMatch[1]) : 560,
      height: heightMatch ? parseInt(heightMatch[1]) : 315
    };
  };

  const handleInsertEmbed = () => {
    if (!embedCode.trim()) return;
    
    restoreSelection();
    
    const dimensions = extractDimensions(embedCode);
    
    // Create wrapper div for the embed
    const wrapper = document.createElement('div');
    wrapper.className = 'editor-embed-wrapper';
    wrapper.contentEditable = 'false';
    wrapper.style.cssText = `
      display: inline-block;
      width: ${dimensions.width}px;
      height: ${dimensions.height}px;
      margin: 1rem 0;
      border: 1px solid #105652;
      border-radius: 0.5rem;
      overflow: hidden;
      cursor: pointer;
      position: relative;
      vertical-align: top;
    `;
    wrapper.setAttribute('data-embed-code', embedCode);
    wrapper.setAttribute('data-original-width', dimensions.width);
    wrapper.setAttribute('data-original-height', dimensions.height);
    
    // Create iframe container with proper scaling
    const container = document.createElement('div');
    container.className = 'embed-content';
    container.style.cssText = 'width: 100%; height: 100%;';
    
    // Parse and update iframe dimensions in the embed code
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = embedCode;
    const iframe = tempDiv.querySelector('iframe');
    
    if (iframe) {
      // Set iframe to fill container
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      container.appendChild(iframe);
    } else {
      // If not an iframe, just insert the code
      container.innerHTML = embedCode;
    }
    
    wrapper.appendChild(container);
    
    // Add fullscreen button
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.className = 'embed-fullscreen-btn';
    fullscreenBtn.type = 'button';
    fullscreenBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>';
    fullscreenBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(16, 86, 82, 0.9);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px;
      cursor: pointer;
      opacity: 0;
      transition: all 0.2s ease;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    fullscreenBtn.title = 'Fullscreen';
    fullscreenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleEmbedFullscreen(wrapper);
    });
    wrapper.appendChild(fullscreenBtn);
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(wrapper);
      
      // Move cursor after embed
      range.setStartAfter(wrapper);
      range.setEndAfter(wrapper);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editorRef.current?.appendChild(wrapper);
    }
    
    updateContent();
    setEmbedCode('');
    setShowEmbedInput(false);
    setEmbedViewMode('preview');
  };

  // Embed Fullscreen Handler
  const handleEmbedFullscreen = (embedWrapper) => {
    const embedCode = embedWrapper.getAttribute('data-embed-code');
    if (embedCode) {
      setFullscreenEmbed(embedCode);
    }
  };

  const closeFullscreenEmbed = () => {
    setFullscreenEmbed(null);
  };

  // Quoteblock Handlers
  const handleInsertQuoteblock = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    // If we have a selected quoteblock, edit it
    if (selectedQuoteblock) {
      handleEditQuoteblock(selectedQuoteblock);
      return;
    }

    // Prepare initial data
    const initialData = {
      text: selectedText || '',
      styles: null // Default styles will be picked by component
    };

    setQuoteblockData(initialData);
    setEditingQuoteblock(null);
    saveSelection();
    setShowQuoteblockInput(true);
  };

  const handleEditQuoteblock = (element) => {
    const contentDiv = element.querySelector('.quoteblock-content');
    const text = contentDiv ? contentDiv.innerHTML : '';
    
    // Parse styles from element
    const styles = {
      backgroundColor: element.style.backgroundColor,
      color: element.style.color,
      borderLeft: element.style.borderLeft,
      fontFamily: element.style.fontFamily,
      fontSize: element.style.fontSize,
      padding: element.style.padding,
      fontStyle: element.style.fontStyle,
      fontWeight: element.style.fontWeight,
      borderRadius: element.style.borderRadius,
      textAlign: element.style.textAlign,
      boxShadow: element.style.boxShadow,
      backgroundImage: element.style.backgroundImage
    };

    setQuoteblockData({ text, styles });
    setEditingQuoteblock(element);
    setShowQuoteblockInput(true);
  };

  const handleSaveQuoteblock = (data) => {
    restoreSelection();
    
    let wrapper;
    if (editingQuoteblock) {
      wrapper = editingQuoteblock;
    } else {
      wrapper = document.createElement('div');
      wrapper.className = 'editor-quoteblock-wrapper';
      wrapper.contentEditable = 'false'; // Wrapper is not editable directly, use modal
      wrapper.setAttribute('data-type', 'quoteblock');
    }

    // Capture layout styles to preserve (wrapping, positioning)
    const layoutStyles = {
      display: wrapper.style.display || 'block',
      float: wrapper.style.float || 'none',
      width: wrapper.style.width || 'auto',
      marginTop: wrapper.style.marginTop || '1rem',
      marginBottom: wrapper.style.marginBottom || '1rem',
      marginLeft: wrapper.style.marginLeft || '0',
      marginRight: wrapper.style.marginRight || '0'
    };

    // Reset all inline styles to clear previous design (e.g. background images, shadows)
    wrapper.removeAttribute('style');

    // Apply new design styles
    Object.assign(wrapper.style, data.styles);

    // Re-apply layout styles
    Object.assign(wrapper.style, layoutStyles);

    // Content
    // We use a inner div for content to ensure styles apply correctly and text is contained
    let contentDiv = wrapper.querySelector('.quoteblock-content');
    if (!contentDiv) {
      contentDiv = document.createElement('div');
      contentDiv.className = 'quoteblock-content';
      wrapper.appendChild(contentDiv);
    }
    contentDiv.innerHTML = data.text;
    
    if (!editingQuoteblock) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents(); // Remove selected text if any
        range.insertNode(wrapper);
        
        // Move cursor after
        range.setStartAfter(wrapper);
        range.setEndAfter(wrapper);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current?.appendChild(wrapper);
      }
    }

    updateContent();
    setShowQuoteblockInput(false);
    setEditingQuoteblock(null);
    setQuoteblockData(null);
  };
  
  // Button Handlers
  const handleInsertButton = () => {
    // If we have a selected button, edit it
    if (selectedButton) {
      handleEditButton(selectedButton);
      return;
    }

    setButtonData(null);
    setEditingButton(null);
    saveSelection();
    setShowButtonInput(true);
  };

  const handleEditButton = (element) => {
    const text = element.textContent;
    const url = element.getAttribute('href');
    
    // Parse styles
    const styles = {
      backgroundColor: element.style.backgroundColor,
      color: element.style.color,
      fontSize: element.style.fontSize,
      fontFamily: element.style.fontFamily,
      borderRadius: element.style.borderRadius,
      padding: element.style.padding,
      border: element.style.border,
      boxShadow: element.style.boxShadow,
      backgroundImage: element.style.backgroundImage,
      textTransform: element.style.textTransform,
      letterSpacing: element.style.letterSpacing,
      backdropFilter: element.style.backdropFilter
    };
    
    // Find class name
    const className = Array.from(element.classList).find(c => c.startsWith('btn-design-'));

    setButtonData({ text, url, styles, className });
    setEditingButton(element);
    setShowButtonInput(true);
  };

  const handleSaveButton = (data) => {
    restoreSelection();
    
    let button;
    if (editingButton) {
      button = editingButton;
    } else {
      button = document.createElement('a');
      button.className = 'editor-button';
      button.target = '_blank';
      button.rel = 'noopener noreferrer';
    }

    // Set content and attributes
    button.textContent = data.text;
    button.href = data.url;
    
    // Reset classes (keep editor-button)
    button.className = 'editor-button';
    if (data.className) {
      button.classList.add(data.className);
    }

    // Reset inline styles
    button.removeAttribute('style');
    
    // Apply custom styles (overrides)
    // We only apply styles that are explicitly in the custom styles object
    // But since we merged them in the input, we can just apply them all?
    // The input component merges preset + custom.
    // Wait, if we apply ALL styles from input, we might overwrite class styles with inline styles, which is what we want for customization.
    // But we need to be careful not to apply 'undefined' styles.
    
    if (data.styles) {
      Object.assign(button.style, data.styles);
    }
    
    // Ensure display is inline-block
    button.style.display = 'inline-block';
    button.style.textDecoration = 'none';
    button.style.cursor = 'pointer';

    if (!editingButton) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(button);
        
        // Add space after
        const space = document.createTextNode(' ');
        range.setStartAfter(button);
        range.insertNode(space);
        
        range.setStartAfter(space);
        range.setEndAfter(space);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current?.appendChild(button);
      }
    }

    updateContent();
    setShowButtonInput(false);
    setEditingButton(null);
    setButtonData(null);
  };

  // Code Block Handlers
  const handleInsertCodeBlock = () => {
    if (selectedCodeBlock) {
      handleEditCodeBlock(selectedCodeBlock);
      return;
    }
    setCodeBlockData(null);
    setEditingCodeBlock(null);
    saveSelection();
    setShowCodeBlockInput(true);
  };

  const handleEditCodeBlock = (element) => {
    const codeElement = element.querySelector('code');
    const text = codeElement ? codeElement.textContent : '';
    const themeId = element.getAttribute('data-theme-id');
    const language = element.getAttribute('data-language');
    const fileName = element.getAttribute('data-filename');
    
    setCodeBlockData({ text, themeId, language, fileName });
    setEditingCodeBlock(element);
    setShowCodeBlockInput(true);
  };

  const handleSaveCodeBlock = (data) => {
    restoreSelection();
    
    let wrapper;
    if (editingCodeBlock) {
      wrapper = editingCodeBlock;
      wrapper.innerHTML = ''; // Clear content to rebuild
    } else {
      wrapper = document.createElement('div');
      wrapper.className = 'editor-code-block-wrapper';
      wrapper.contentEditable = 'false';
    }

    // Set attributes
    wrapper.setAttribute('data-theme-id', data.themeId);
    wrapper.setAttribute('data-language', data.language);
    wrapper.setAttribute('data-code', data.text);
    if (data.fileName) wrapper.setAttribute('data-filename', data.fileName);
    
    // Apply styles
    Object.assign(wrapper.style, {
      backgroundColor: data.styles.backgroundColor,
      borderColor: data.styles.borderColor || 'transparent',
      color: data.styles.color,
      borderRadius: '0.5rem',
      overflow: 'hidden',
      border: `1px solid ${data.styles.borderColor || 'transparent'}`,
      margin: '1em 0',
      ...data.syntax // Apply syntax highlighting variables
    });

    // Build Header
    const header = document.createElement('div');
    header.className = 'editor-code-header';
    header.style.backgroundColor = data.headerStyle.backgroundColor;
    header.style.color = data.headerStyle.color;

    // Dots
    const dots = document.createElement('div');
    dots.className = 'editor-code-dots';
    ['red', 'yellow', 'green'].forEach(color => {
      const dot = document.createElement('div');
      dot.className = `editor-code-dot ${color}`;
      dots.appendChild(dot);
    });
    header.appendChild(dots);

    // Title/Filename
    const title = document.createElement('div');
    title.className = 'editor-code-title';
    title.textContent = data.fileName || (data.language ? data.language : '');
    title.style.color = data.headerStyle.color;
    header.appendChild(title);

    // Copy Button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'editor-code-copy';
    copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    copyBtn.style.color = data.headerStyle.color;
    copyBtn.title = "Copy code";
    copyBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigator.clipboard.writeText(data.text).then(() => {
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = 'Copied!';
        copyBtn.style.fontSize = '11px';
        setTimeout(() => {
          copyBtn.innerHTML = originalHTML;
          copyBtn.style.fontSize = '';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    };
    header.appendChild(copyBtn);

    wrapper.appendChild(header);

    // Content
    const contentPre = document.createElement('pre');
    contentPre.className = 'editor-code-content';
    contentPre.style.backgroundColor = data.styles.backgroundColor;
    contentPre.style.color = data.styles.color;
    contentPre.style.margin = '0';
    
    const code = document.createElement('code');
    code.className = `language-${data.language}`;
    code.innerHTML = highlightCode(data.text, data.language);
    contentPre.appendChild(code);
    
    wrapper.appendChild(contentPre);

    if (!editingCodeBlock) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(wrapper);
        
        // Add space after
        const space = document.createTextNode(' ');
        range.setStartAfter(wrapper);
        range.insertNode(space);
        
        range.setStartAfter(space);
        range.setEndAfter(space);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current?.appendChild(wrapper);
      }
    }

    updateContent();
    setShowCodeBlockInput(false);
    setEditingCodeBlock(null);
    setCodeBlockData(null);
  };
  
  // Apply border settings to selected embed
  const applyBorderSettings = () => {
    if (!selectedEmbed) return;
    
    if (borderStyle === 'none') {
      selectedEmbed.style.border = 'none';
    } else {
      selectedEmbed.style.borderWidth = `${borderWidth}px`;
      selectedEmbed.style.borderColor = borderColor;
      selectedEmbed.style.borderStyle = borderStyle;
    }
    
    updateContent();
  };
  
  // Update embed code
  const updateEmbedCode = () => {
    if (!selectedEmbed || !editingEmbedCode.trim()) return;
    
    // Get current dimensions
    const currentWidth = selectedEmbed.offsetWidth;
    const currentHeight = selectedEmbed.offsetHeight;
    
    // Update the data attribute
    selectedEmbed.setAttribute('data-embed-code', editingEmbedCode);
    
    // Update the content
    const container = selectedEmbed.querySelector('.embed-content');
    if (container) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editingEmbedCode;
      const iframe = tempDiv.querySelector('iframe');
      
      if (iframe) {
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        container.innerHTML = '';
        container.appendChild(iframe);
      } else {
        container.innerHTML = editingEmbedCode;
      }
    }
    
    // Maintain dimensions
    selectedEmbed.style.width = `${currentWidth}px`;
    selectedEmbed.style.height = `${currentHeight}px`;
    
    updateContent();
    setShowEmbedCodeView(false);
  };
  
  // Start resizing embed
  const startEmbedResize = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: selectedEmbed.offsetWidth,
      height: selectedEmbed.offsetHeight,
      handle: handle
    };
  };

  const handleInsertImage = async () => {
    let finalImageUrl = imageUrl;
    
    // If file upload mode, upload the file first
    if (imageInputMode === 'upload' && imageFile) {
      try {
        setUploadingImage(true);
        
        // Upload to Appwrite storage
        const fileId = ID.unique();
        const uploadResult = await storageService.uploadFile(
          'editor-images', // Bucket ID
          fileId,
          imageFile
        );
        
        if (!uploadResult.success) {
          alert('Failed to upload image: ' + uploadResult.error);
          setUploadingImage(false);
          return;
        }
        
        // Get the file URL
        finalImageUrl = storageService.getFileView('editor-images', uploadResult.data.$id);
        
        setUploadingImage(false);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image: ' + error.message);
        setUploadingImage(false);
        return;
      }
    }
    
    if (finalImageUrl) {
      // Restore saved cursor position
      restoreSelection();
      
      const img = document.createElement('img');
      img.src = finalImageUrl;
      img.alt = 'Project image';
      img.style.cssText = 'max-width: 100%; height: auto; border-radius: 1rem; margin: 1rem 0; box-shadow: 0 10px 30px rgba(0,0,0,0.2); cursor: pointer; display: block;';
      img.className = 'editor-image';
      
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(img);
        // Move cursor after image
        range.setStartAfter(img);
        range.setEndAfter(img);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Fallback: append to editor
        editorRef.current?.appendChild(img);
      }
      
      updateContent();
      setImageUrl('');
      setImageFile(null);
      setShowImageInput(false);
      setImageInputMode('url');
    }
  };
  
  // Start resizing
  const startResize = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: selectedImage.offsetWidth,
      height: selectedImage.offsetHeight,
      handle: handle
    };
  };

  const insertHeading = (level) => {
    const color = level === 1 ? '#105652' : '#1E8479';
    const size = level === 1 ? '2rem' : level === 2 ? '1.5rem' : '1.25rem';
    const selectedText = window.getSelection().toString() || `Heading ${level}`;
    insertHTML(`<h${level} style="color: ${color}; font-size: ${size}; font-weight: bold; margin: 2rem 0 1rem;">${selectedText}</h${level}><p><br></p>`);
  };

  const insertCodeBlock = () => {
    const selectedText = window.getSelection().toString() || '// Your code here';
    insertHTML(`<pre style="background: #1a202c; color: #e2e8f0; padding: 1.5rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0;"><code>${selectedText}</code></pre><p><br></p>`);
  };

  // Save current selection
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0);
    }
  };
  
  // Restore saved selection
  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
      editorRef.current?.focus();
    }
  };
  
  // Apply font family to selected text
  const applyFont = (fontFamily) => {
    restoreSelection();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const selectedText = selection.toString();
    if (!selectedText) return;
    
    // Wrap selected text in span with font-family
    const span = document.createElement('span');
    span.style.fontFamily = fontFamily;
    span.textContent = selectedText;
    
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(span);
    
    updateContent();
    setShowFontPicker(false);
  };
  
  // Apply color to selected text
  const applyColor = (color) => {
    restoreSelection();
    execCommand('foreColor', color);
    setColorInput(color);
  };
  
  // Apply font size to selected text
  const applySize = (size) => {
    restoreSelection();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const selectedText = selection.toString();
    if (!selectedText) return;
    
    // Wrap selected text in span with font-size
    const span = document.createElement('span');
    span.style.fontSize = `${size}px`;
    span.textContent = selectedText;
    
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(span);
    
    updateContent();
    setSizeInput(size);
  };
  
  // Apply alignment to selected content or current block
  const applyAlignment = (alignment) => {
    editorRef.current?.focus();
    
    // Check if an embed is selected
    if (selectedEmbed) {
      // Get current style without display and margin properties
      const currentStyle = selectedEmbed.style.cssText;
      const baseStyle = currentStyle
        .replace(/display:[^;]+;?/g, '')
        .replace(/margin-left:[^;]+;?/g, '')
        .replace(/margin-right:[^;]+;?/g, '')
        .trim();
      
      // Apply alignment to embed and store it as data attribute
      if (alignment === 'left') {
        selectedEmbed.style.cssText = baseStyle + ' display: block; margin-left: 0; margin-right: auto;';
        selectedEmbed.setAttribute('data-alignment', 'left');
      } else if (alignment === 'center') {
        selectedEmbed.style.cssText = baseStyle + ' display: block; margin-left: auto; margin-right: auto;';
        selectedEmbed.setAttribute('data-alignment', 'center');
      } else if (alignment === 'right') {
        selectedEmbed.style.cssText = baseStyle + ' display: block; margin-left: auto; margin-right: 0;';
        selectedEmbed.setAttribute('data-alignment', 'right');
      }
      
      updateContent();
      return;
    }
    
    // Check if an image is selected
    if (selectedImage) {
      // Get current style without display and margin properties
      const currentStyle = selectedImage.style.cssText;
      const baseStyle = currentStyle
        .replace(/display:[^;]+;?/g, '')
        .replace(/margin-left:[^;]+;?/g, '')
        .replace(/margin-right:[^;]+;?/g, '')
        .trim();
      
      // Apply alignment to image and store it as data attribute
      if (alignment === 'left') {
        selectedImage.style.cssText = baseStyle + ' display: block; margin-left: 0; margin-right: auto;';
        selectedImage.setAttribute('data-alignment', 'left');
      } else if (alignment === 'center') {
        selectedImage.style.cssText = baseStyle + ' display: block; margin-left: auto; margin-right: auto;';
        selectedImage.setAttribute('data-alignment', 'center');
      } else if (alignment === 'right') {
        selectedImage.style.cssText = baseStyle + ' display: block; margin-left: auto; margin-right: 0;';
        selectedImage.setAttribute('data-alignment', 'right');
      }
      
      updateContent();
      return;
    }
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    // Get the parent element of the selection
    let element = selection.anchorNode;
    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentElement;
    }
    
    // Check if we're inside a table cell - PRIORITY CHECK
    let tableCell = element;
    while (tableCell && tableCell !== editorRef.current) {
      if (tableCell.tagName?.toLowerCase() === 'td') {
        // Apply alignment to the table cell
        if (alignment === 'justify') {
          tableCell.style.textAlign = 'justify';
        } else {
          tableCell.style.textAlign = alignment;
        }
        updateContent();
        return;
      }
      tableCell = tableCell.parentElement;
    }
    
    // Find the block-level element (p, h1-h6, blockquote, pre, div)
    while (element && element !== editorRef.current) {
      const tagName = element.tagName?.toLowerCase();
      if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'div', 'li'].includes(tagName)) {
        break;
      }
      element = element.parentElement;
    }
    
    if (element && element !== editorRef.current) {
      // Apply text-align style
      if (alignment === 'justify') {
        element.style.textAlign = 'justify';
      } else {
        element.style.textAlign = alignment;
      }
      updateContent();
    } else {
      // Fallback: use execCommand for justify
      if (alignment === 'justify') {
        document.execCommand('justifyFull', false, null);
      } else {
        document.execCommand(`justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`, false, null);
      }
      updateContent();
    }
  };
  
  // Apply text wrap to selected image or quoteblock
  const applyTextWrap = (enabled, gap) => {
    const target = selectedImage || selectedQuoteblock;
    if (!target) return;
    
    // Get current alignment from data attribute (most reliable)
    let alignment = target.getAttribute('data-alignment') || 'left';
    
    // If no data attribute, try to detect from styles
    if (!target.getAttribute('data-alignment')) {
      const inlineMarginLeft = target.style.marginLeft;
      const inlineMarginRight = target.style.marginRight;
      
      if (inlineMarginLeft === 'auto' && inlineMarginRight === 'auto') {
        alignment = 'center';
      } else if (inlineMarginLeft === 'auto' && inlineMarginRight === '0') {
        alignment = 'right';
      } else if (inlineMarginLeft === '0' && inlineMarginRight === 'auto') {
        alignment = 'left';
      }
    }
    
    // Only apply text wrap for left or right alignment
    if (alignment === 'center') {
      alert('Text wrap only works with left or right alignment');
      return;
    }
    
    if (enabled) {
      // Enable text wrapping
      if (alignment === 'left') {
        target.style.float = 'left';
        target.style.marginLeft = '0';
        target.style.marginRight = `${gap}px`;
        target.style.marginBottom = `${gap}px`;
        target.style.display = 'block';
      } else if (alignment === 'right') {
        target.style.float = 'right';
        target.style.marginRight = '0';
        target.style.marginLeft = `${gap}px`;
        target.style.marginBottom = `${gap}px`;
        target.style.display = 'block';
      }
      target.setAttribute('data-text-wrap', 'true');
      target.setAttribute('data-wrap-gap', gap.toString());
    } else {
      // Disable text wrapping
      target.style.float = 'none';
      target.style.display = 'block';
      if (alignment === 'left') {
        target.style.marginLeft = '0';
        target.style.marginRight = 'auto';
      } else if (alignment === 'right') {
        target.style.marginLeft = 'auto';
        target.style.marginRight = '0';
      }
      target.style.marginBottom = '1rem';
      target.removeAttribute('data-text-wrap');
      target.removeAttribute('data-wrap-gap');
    }
    
    updateContent();
  };
  
  // Load text wrap settings when image/quoteblock is selected
  useEffect(() => {
    const target = selectedImage || selectedQuoteblock;
    if (target) {
      const wrapEnabled = target.getAttribute('data-text-wrap') === 'true';
      const wrapGap = parseInt(target.getAttribute('data-wrap-gap') || '20');
      setTextWrapEnabled(wrapEnabled);
      setTextWrapGap(wrapGap);
    }
  }, [selectedImage, selectedQuoteblock]);

  // Handle ESC key to close fullscreen embed
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && fullscreenEmbed) {
        closeFullscreenEmbed();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [fullscreenEmbed]);

  // Add fullscreen buttons to existing embeds when content loads
  useEffect(() => {
    const addFullscreenButtons = () => {
      const embeds = editorRef.current?.querySelectorAll('.editor-embed-wrapper');
      embeds?.forEach(embed => {
        // Skip if button already exists
        if (embed.querySelector('.embed-fullscreen-btn')) return;
        
        const embedCode = embed.getAttribute('data-embed-code');
        if (!embedCode) return;
        
        // Add fullscreen button
        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.className = 'embed-fullscreen-btn';
        fullscreenBtn.type = 'button';
        fullscreenBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>';
        fullscreenBtn.style.cssText = `
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(16, 86, 82, 0.9);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s ease;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;
        fullscreenBtn.title = 'Fullscreen';
        fullscreenBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleEmbedFullscreen(embed);
        });
        embed.appendChild(fullscreenBtn);
      });
    };
    
    // Add buttons after content is loaded
    const timer = setTimeout(addFullscreenButtons, 100);
    return () => clearTimeout(timer);
  }, [value]);

  // Audio Player Handlers
  const handleInsertAudioPlayer = () => {
    if (selectedAudioPlayer) {
      handleEditAudioPlayer(selectedAudioPlayer);
      return;
    }
    setAudioPlayerData(null);
    setEditingAudioPlayer(null);
    saveSelection();
    setShowAudioInput(true);
  };

  const handleEditAudioPlayer = (element) => {
    const audioUrl = element.getAttribute('data-audio-url');
    const coverUrl = element.getAttribute('data-cover-url');
    const layoutId = element.getAttribute('data-layout-id');
    const metadata1Label = element.getAttribute('data-metadata1-label');
    const metadata1Value = element.getAttribute('data-metadata1-value');
    const metadata2Label = element.getAttribute('data-metadata2-label');
    const metadata2Value = element.getAttribute('data-metadata2-value');
    
    setAudioPlayerData({
      audioUrl,
      coverUrl,
      layoutId,
      metadata1Label,
      metadata1Value,
      metadata2Label,
      metadata2Value
    });
    setEditingAudioPlayer(element);
    setShowAudioInput(true);
  };

  const handleSaveAudioPlayer = (data) => {
    restoreSelection();
    
    let wrapper;
    if (editingAudioPlayer) {
      wrapper = editingAudioPlayer;
      wrapper.innerHTML = '';
    } else {
      wrapper = document.createElement('div');
      wrapper.className = 'editor-audio-player';
      wrapper.contentEditable = 'false';
    }

    wrapper.setAttribute('data-audio-url', data.audioUrl);
    wrapper.setAttribute('data-cover-url', data.coverUrl || '');
    wrapper.setAttribute('data-layout-id', data.layoutId);
    wrapper.setAttribute('data-metadata1-label', data.metadata1Label || '');
    wrapper.setAttribute('data-metadata1-value', data.metadata1Value || '');
    wrapper.setAttribute('data-metadata2-label', data.metadata2Label || '');
    wrapper.setAttribute('data-metadata2-value', data.metadata2Value || '');
    
    wrapper.innerHTML = renderAudioPlayer(data);
    
    const baseStyles = {
      display: 'block',
      margin: '1rem 0',
      cursor: 'pointer',
      userSelect: 'none',
      verticalAlign: 'top',
      clear: 'both'
    };
    
    if (data.layoutId === 'minimal') {
      baseStyles.width = '100%';
      baseStyles.maxWidth = '600px';
    } else if (data.layoutId === 'medium') {
      baseStyles.width = '100%';
      baseStyles.maxWidth = '400px';
    } else if (data.layoutId === 'full') {
      baseStyles.width = '400px';
      baseStyles.maxWidth = '100%';
    } else if (data.layoutId === 'cassette') {
      baseStyles.width = '420px';
      baseStyles.maxWidth = '100%';
    }
    
    Object.assign(wrapper.style, baseStyles);

    if (!editingAudioPlayer) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(wrapper);
        
        const space = document.createTextNode(' ');
        range.setStartAfter(wrapper);
        range.insertNode(space);
        
        range.setStartAfter(space);
        range.setEndAfter(space);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current?.appendChild(wrapper);
      }
    }

    updateContent();
    setShowAudioInput(false);
    setEditingAudioPlayer(null);
    setAudioPlayerData(null);
  };

  const renderAudioPlayer = (data) => {
    const { audioUrl, coverUrl, layoutId, metadata1Value, metadata2Value } = data;
    
    if (layoutId === 'minimal') {
      return `<div style="width: 100%; display: flex; align-items: center; background-color: #1f2937; border-radius: 12px; padding: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); box-sizing: border-box;"><div style="flex: 1; min-width: 0;"><audio controls style="width: 100%; height: 40px; outline: none;"><source src="${audioUrl}" type="audio/mpeg">Your browser does not support the audio element.</audio></div></div>`;
    }
    
    if (layoutId === 'medium') {
      const coverHtml = coverUrl ? `<img src="${coverUrl}" alt="Cover" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover; flex-shrink: 0; display: block;" />` : `<div style="width: 80px; height: 80px; border-radius: 8px; background-color: #f3f4f6; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></div>`;
      return `<div style="width: 100%; display: flex; gap: 16px; align-items: center; background-color: #ffffff; border-radius: 16px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border: 1px solid #e5e7eb; box-sizing: border-box;">${coverHtml}<div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center;"><div style="font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${metadata1Value || 'Song Title'}</div><div style="font-size: 12px; color: #6b7280; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${metadata2Value || 'Artist'}</div><audio controls style="width: 100%; height: 32px; outline: none;"><source src="${audioUrl}" type="audio/mpeg">Your browser does not support the audio element.</audio></div></div>`;
    }
    
    if (layoutId === 'full') {
      const coverHtml = coverUrl ? `<img src="${coverUrl}" alt="Cover" style="width: 100%; height: 352px; border-radius: 12px; object-fit: cover; display: block; margin: 0 0 16px 0;" />` : `<div style="width: 100%; height: 352px; border-radius: 12px; background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); display: flex; align-items: center; justify-content: center; margin: 0 0 16px 0;"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></div>`;
      const playIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
      const pauseIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
      const skipBackIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>`;
      const skipForwardIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>`;
      return `<div class="custom-audio-player" style="width: 100%; background: #ffffff; border-radius: 16px; padding: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); box-sizing: border-box;">${coverHtml}<div style="margin: 0 0 16px 0;"><div style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 0 0 4px 0; line-height: 1.3;">${metadata1Value || 'Song Title'}</div><div style="font-size: 14px; color: #6b7280; margin: 0; line-height: 1.3;">${metadata2Value || 'Artist'}</div></div><div class="progress-container" style="height: 4px; background: #e5e7eb; border-radius: 2px; cursor: pointer; margin: 0 0 8px 0; overflow: hidden;"><div class="progress-fill" style="height: 100%; width: 0%; background: #0d9488; border-radius: 2px; transition: width 0.1s linear;"></div></div><div style="display: flex; justify-content: space-between; margin: 0 0 20px 0;"><span class="current-time" style="font-size: 11px; color: #9ca3af; font-weight: 500;">0:00</span><span class="duration" style="font-size: 11px; color: #9ca3af; font-weight: 500;">0:00</span></div><div style="display: flex; justify-content: center; align-items: center; gap: 12px; margin: 0;"><button type="button" class="skip-back-btn" style="width: 44px; height: 44px; border-radius: 50%; background: transparent; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6b7280; transition: all 0.2s; padding: 0;">${skipBackIcon}</button><button type="button" class="play-pause-btn" style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; box-shadow: 0 4px 16px rgba(13, 148, 136, 0.4); transition: all 0.2s; padding: 0;"><span class="play-icon" style="display: flex; align-items: center; justify-content: center; margin-left: 2px;">${playIcon}</span><span class="pause-icon" style="display: none; align-items: center; justify-content: center;">${pauseIcon}</span></button><button type="button" class="skip-forward-btn" style="width: 44px; height: 44px; border-radius: 50%; background: transparent; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6b7280; transition: all 0.2s; padding: 0;">${skipForwardIcon}</button></div><audio class="hidden-audio" src="${audioUrl}" style="display: none;" preload="metadata"></audio></div>`;
    }
    
    if (layoutId === 'cassette') {
      const musicIcon = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`;
      const coverHtml = coverUrl ? `<img src="${coverUrl}" alt="Cover" style="width: 100%; height: 100%; object-fit: cover; display: block;" />` : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">${musicIcon}</div>`;
      const playIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
      const pauseIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
      const skipBackIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>`;
      const skipForwardIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>`;
      
      return `
        <style>
          @keyframes cassette-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .cassette-reel.playing {
            animation: cassette-spin 2s linear infinite;
          }
        </style>
        <div class="custom-audio-player cassette-player" style="width: 100%; background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%); border-radius: 12px; padding: 14px; box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1); box-sizing: border-box; position: relative;">
          <div style="background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%); border-radius: 8px; padding: 10px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2); position: relative;">
            <div style="background: #fef3c7; border-radius: 4px; padding: 6px 8px; margin-bottom: 8px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #fbbf24;">
              <div style="font-size: 10px; font-weight: 700; color: #78350f; margin-bottom: 2px; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">${metadata1Value || 'Song Title'}</div>
              <div style="font-size: 8px; color: #92400e; text-align: center; font-weight: 500;">${metadata2Value || 'Artist'}</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 10px;">
              <div class="cassette-reel cassette-reel-left" style="width: 45px; height: 45px; flex-shrink: 0; border-radius: 50%; background: linear-gradient(135deg, #1f2937 0%, #111827 100%); box-shadow: inset 0 2px 8px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; position: relative;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: #374151; box-shadow: inset 0 1px 4px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
                  <div style="width: 7px; height: 7px; border-radius: 50%; background: #1f2937;"></div>
                </div>
              </div>
              <div style="flex: 1; height: 60px; border-radius: 8px; overflow: hidden; box-shadow: inset 0 2px 6px rgba(0,0,0,0.3); border: 2px solid rgba(0,0,0,0.2); background: rgba(0,0,0,0.3);">${coverHtml}</div>
              <div class="cassette-reel cassette-reel-right" style="width: 45px; height: 45px; flex-shrink: 0; border-radius: 50%; background: linear-gradient(135deg, #1f2937 0%, #111827 100%); box-shadow: inset 0 2px 8px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; position: relative;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: #374151; box-shadow: inset 0 1px 4px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
                  <div style="width: 7px; height: 7px; border-radius: 50%; background: #1f2937;"></div>
                </div>
              </div>
            </div>
            <div style="height: 4px; background: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.3) 80%, transparent 100%); border-radius: 2px; margin-bottom: 5px;"></div>
          </div>
          <div class="progress-container" style="height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; cursor: pointer; margin: 10px 0 6px 0; overflow: hidden; position: relative; box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);">
            <div class="progress-fill" style="height: 100%; width: 0%; background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%); border-radius: 2px; transition: width 0.1s linear; box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);"></div>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 0 0 10px 0;">
            <span class="current-time" style="font-size: 8px; color: rgba(255,255,255,0.6); font-weight: 600; font-family: monospace;">0:00</span>
            <span class="duration" style="font-size: 8px; color: rgba(255,255,255,0.6); font-weight: 600; font-family: monospace;">0:00</span>
          </div>
          <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin: 0;">
            <button type="button" class="skip-back-btn" style="width: 36px; height: 36px; border-radius: 6px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fbbf24; transition: all 0.2s; padding: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">${skipBackIcon}</button>
            <button type="button" class="play-pause-btn" style="width: 46px; height: 46px; border-radius: 8px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border: 2px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer; color: #1a202c; box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255,255,255,0.3); transition: all 0.2s; padding: 0;">
              <span class="play-icon" style="display: flex; align-items: center; justify-content: center; margin-left: 2px;">${playIcon}</span>
              <span class="pause-icon" style="display: none; align-items: center; justify-content: center;">${pauseIcon}</span>
            </button>
            <button type="button" class="skip-forward-btn" style="width: 36px; height: 36px; border-radius: 6px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fbbf24; transition: all 0.2s; padding: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">${skipForwardIcon}</button>
          </div>
          <audio class="hidden-audio" src="${audioUrl}" style="display: none;" preload="metadata"></audio>
        </div>
      `;
    }
    
    return '';
  };


  // Video Player Handlers
  const handleInsertVideo = () => {
    if (selectedVideo) {
      handleEditVideo(selectedVideo);
      return;
    }
    setVideoData(null);
    setEditingVideoId(null);
    saveSelection();
    setShowVideoInput(true);
  };

  const handleEditVideo = (wrapper) => {
    const videoId = wrapper.getAttribute('data-video-id');
    const mode = wrapper.getAttribute('data-mode');
    const videoUrl = wrapper.getAttribute('data-video-url');
    const embedCode = decodeURIComponent(wrapper.getAttribute('data-embed-code') || '');
    const thumbnailUrl = wrapper.getAttribute('data-thumbnail-url');
    const width = wrapper.getAttribute('data-width');
    const height = wrapper.getAttribute('data-height');
    const alignment = wrapper.getAttribute('data-alignment');
    
    setVideoData({
      mode,
      videoUrl,
      embedCode,
      thumbnailUrl,
      width,
      height,
      alignment
    });
    setEditingVideoId(videoId);
    setShowVideoInput(true);
  };

  const handleSaveVideo = (data) => {
    // Store current scroll position
    const scrollTop = editorRef.current?.scrollTop || 0;
    
    restoreSelection();
    
    const videoId = editingVideoId || 'video-' + Date.now();
    const videoHTML = renderVideo({ ...data, videoId });
    
    if (editingVideoId) {
      // Editing existing video - find and replace it
      const existingVideo = editorRef.current?.querySelector(`[data-video-id="${editingVideoId}"]`);
      if (existingVideo) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = videoHTML;
        const newVideo = tempDiv.firstElementChild;
        existingVideo.replaceWith(newVideo);
      }
    } else {
      // New video - insert at cursor
      insertHTML(videoHTML);
    }

    updateContent();
    setShowVideoInput(false);
    setEditingVideoId(null);
    setVideoData(null);
    
    // Restore scroll position
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.scrollTop = scrollTop;
      }
    }, 0);
  };

  const renderVideo = (data) => {
    const { mode, videoUrl, embedCode, thumbnailUrl, width, height, alignment, videoId } = data;
    
    // Clean embed code
    let cleanedEmbedCode = embedCode || '';
    if (mode === 'embed') {
      cleanedEmbedCode = embedCode
        .replace(/\s+width\s*=\s*["'][^"']*["']/gi, '')
        .replace(/\s+height\s*=\s*["'][^"']*["']/gi, '')
        .replace(/<iframe/gi, '<iframe style="width:100%;height:100%;border:none;"');
    }
    
    // Alignment class
    const alignClass = `align-${alignment || 'center'}`;
    
    // Video content
    const videoContent = mode === 'embed' 
      ? cleanedEmbedCode 
      : `<video src="${videoUrl}" controls ${thumbnailUrl ? `poster="${thumbnailUrl}"` : ''} style="width:100%;height:100%;object-fit:contain;">
          Your browser does not support the video tag.
        </video>`;
    
    return `
      <div class="editor-video-wrapper ${alignClass}" 
           contenteditable="false"
           data-video-id="${videoId}"
           data-mode="${mode}"
           data-video-url="${videoUrl || ''}"
           data-embed-code="${encodeURIComponent(embedCode || '')}"
           data-thumbnail-url="${thumbnailUrl || ''}"
           data-width="${width}"
           data-height="${height}"
           data-alignment="${alignment}"
           style="width: ${width}; height: ${height};">
        
        <div class="video-content" style="width: 100%; height: 100%; border-radius: 8px; overflow: hidden; background: #000;">
          ${videoContent}
        </div>
        

      </div>
    `;
  };

  // FAQ Handlers
  const handleInsertFaq = () => {
    if (selectedFaq) {
      handleEditFaq(selectedFaq);
      return;
    }
    setFaqData(null);
    setEditingFaq(null);
    saveSelection();
    setShowFaqInput(true);
  };

  const handleEditFaq = (element) => {
    const title = element.getAttribute('data-title');
    const content = element.getAttribute('data-content');
    const isOpen = element.getAttribute('data-is-open') === 'true';
    
    const titleStyles = {
      fontFamily: element.querySelector('.faq-title').style.fontFamily,
      fontSize: element.querySelector('.faq-title').style.fontSize.replace('px', ''),
      color: element.querySelector('.faq-title').style.color,
      backgroundColor: element.querySelector('.faq-title').style.backgroundColor,
      fontWeight: element.querySelector('.faq-title').style.fontWeight,
    };
    
    const contentDiv = element.querySelector('.faq-content');
    const contentStyles = contentDiv ? {
      fontFamily: contentDiv.style.fontFamily,
      fontSize: contentDiv.style.fontSize.replace('px', ''),
      color: contentDiv.style.color,
      backgroundColor: contentDiv.style.backgroundColor,
    } : null;
    
    const borderColor = element.style.borderColor;
    const borderRadius = element.style.borderRadius.replace('px', '');
    const padding = element.querySelector('.faq-title').style.padding.replace('px', '');
    
    setFaqData({
      title,
      content,
      isOpen,
      titleStyles,
      contentStyles,
      borderColor,
      borderRadius,
      padding,
    });
    setEditingFaq(element);
    setShowFaqInput(true);
  };

  const handleSaveFaq = (data) => {
    restoreSelection();
    
    let wrapper;
    if (editingFaq) {
      wrapper = editingFaq;
    } else {
      wrapper = document.createElement('div');
      wrapper.className = 'editor-faq-wrapper';
      wrapper.contentEditable = 'false';
    }

    // Store data attributes
    wrapper.setAttribute('data-title', data.title);
    wrapper.setAttribute('data-content', data.content);
    wrapper.setAttribute('data-is-open', data.isOpen);
    wrapper.setAttribute('data-content-font-family', data.contentStyles.fontFamily);
    wrapper.setAttribute('data-content-font-size', data.contentStyles.fontSize);
    wrapper.setAttribute('data-content-color', data.contentStyles.color);
    wrapper.setAttribute('data-content-bg-color', data.contentStyles.backgroundColor);
    
    // Apply wrapper styles
    wrapper.style.cssText = `
      display: block;
      margin: 1rem 0;
      border: 2px solid ${data.borderColor};
      border-radius: ${data.borderRadius};
      overflow: hidden;
      cursor: pointer;
    `;
    
    // Create title section
    const titleDiv = document.createElement('div');
    titleDiv.className = 'faq-title';
    titleDiv.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: ${data.titleStyles.fontFamily};
      font-size: ${data.titleStyles.fontSize};
      color: ${data.titleStyles.color};
      background-color: ${data.titleStyles.backgroundColor};
      font-weight: ${data.titleStyles.fontWeight};
      padding: ${data.padding};
      user-select: none;
      cursor: pointer;
    `;
    
    // Create plus/minus icon (FAQ indicator)
    const iconWrapper = document.createElement('span');
    iconWrapper.className = 'faq-icon';
    iconWrapper.style.cssText = 'flex-shrink: 0; display: flex; align-items: center; transition: transform 0.3s;';
    iconWrapper.innerHTML = data.isOpen ? 
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>' :
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
    titleDiv.appendChild(iconWrapper);
    
    const titleText = document.createElement('span');
    titleText.style.cssText = 'flex: 1;';
    titleText.textContent = data.title;
    titleDiv.appendChild(titleText);
    
    // Create chevron icon (secondary indicator)
    const chevron = document.createElement('span');
    chevron.className = 'faq-chevron';
    chevron.innerHTML = data.isOpen ? 
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>' :
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    chevron.style.cssText = 'flex-shrink: 0; transition: transform 0.3s; opacity: 0.7;';
    titleDiv.appendChild(chevron);
    
    wrapper.innerHTML = '';
    wrapper.appendChild(titleDiv);
    
    // Create content section
    if (data.isOpen) {
      const contentDiv = document.createElement('div');
      contentDiv.className = 'faq-content';
      contentDiv.style.cssText = `
        font-family: ${data.contentStyles.fontFamily};
        font-size: ${data.contentStyles.fontSize};
        color: ${data.contentStyles.color};
        background-color: ${data.contentStyles.backgroundColor};
        padding: ${data.padding};
        border-top: 1px solid ${data.borderColor};
        white-space: pre-wrap;
        line-height: 1.6;
        display: block;
      `;
      contentDiv.textContent = data.content;
      wrapper.appendChild(contentDiv);
    }

    if (!editingFaq) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(wrapper);
        
        // Add space after
        const space = document.createElement('p');
        space.innerHTML = '<br>';
        range.setStartAfter(wrapper);
        range.insertNode(space);
        
        range.setStartAfter(space);
        range.setEndAfter(space);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current?.appendChild(wrapper);
      }
    }

    updateContent();
    setShowFaqInput(false);
    setEditingFaq(null);
    setFaqData(null);
  };

  // Divider Handlers
  const handleInsertDivider = () => {
    if (selectedDivider) {
      handleEditDivider(selectedDivider);
      return;
    }
    saveSelection();
    setShowDividerInput(true);
  };

  const handleEditDivider = (element) => {
    const design = element.getAttribute('data-design');
    const color = element.getAttribute('data-color');
    const width = element.getAttribute('data-width');
    const thickness = element.getAttribute('data-thickness');
    const gapTop = element.getAttribute('data-gap-top');
    const gapBottom = element.getAttribute('data-gap-bottom');
    
    setDividerDesign(design);
    setDividerColor(color);
    setDividerWidth(parseInt(width));
    setDividerThickness(parseInt(thickness));
    setDividerGapTop(parseInt(gapTop));
    setDividerGapBottom(parseInt(gapBottom));
    setShowDividerInput(true);
  };

  const handleSaveDivider = () => {
    restoreSelection();
    
    let wrapper;
    if (selectedDivider) {
      wrapper = selectedDivider;
    } else {
      wrapper = document.createElement('div');
      wrapper.className = 'editor-divider-wrapper';
      wrapper.contentEditable = 'false';
    }

    // Store data attributes
    wrapper.setAttribute('data-design', dividerDesign);
    wrapper.setAttribute('data-color', dividerColor);
    wrapper.setAttribute('data-width', dividerWidth);
    wrapper.setAttribute('data-thickness', dividerThickness);
    wrapper.setAttribute('data-gap-top', dividerGapTop);
    wrapper.setAttribute('data-gap-bottom', dividerGapBottom);
    
    // Apply base styles
    wrapper.style.cssText = `
      display: block;
      width: 100%;
      margin-top: ${dividerGapTop}px;
      margin-bottom: ${dividerGapBottom}px;
      text-align: center;
      cursor: pointer;
    `;
    
    // Create divider line
    const dividerLine = document.createElement('div');
    dividerLine.className = 'divider-line';
    dividerLine.style.cssText = `
      display: inline-block;
      width: ${dividerWidth}%;
      height: ${dividerThickness}px;
      margin: 0 auto;
    `;
    
    // Apply design-specific styles
    switch (dividerDesign) {
      case 'none':
        dividerLine.style.border = 'none';
        dividerLine.style.background = 'transparent';
        break;
      case 'solid':
        dividerLine.style.background = dividerColor;
        dividerLine.style.border = 'none';
        break;
      case 'dashed':
        dividerLine.style.border = 'none';
        dividerLine.style.borderTop = `${dividerThickness}px dashed ${dividerColor}`;
        dividerLine.style.height = '0';
        break;
      case 'dotted':
        dividerLine.style.border = 'none';
        dividerLine.style.borderTop = `${dividerThickness}px dotted ${dividerColor}`;
        dividerLine.style.height = '0';
        break;
      case 'double':
        dividerLine.style.border = 'none';
        dividerLine.style.borderTop = `${Math.max(1, Math.floor(dividerThickness / 3))}px solid ${dividerColor}`;
        dividerLine.style.borderBottom = `${Math.max(1, Math.floor(dividerThickness / 3))}px solid ${dividerColor}`;
        dividerLine.style.height = `${Math.max(2, dividerThickness - 2)}px`;
        break;
      case 'gradient':
        dividerLine.style.background = `linear-gradient(to right, transparent, ${dividerColor}, transparent)`;
        dividerLine.style.border = 'none';
        break;
      case 'wave':
        dividerLine.style.border = 'none';
        dividerLine.style.height = `${dividerThickness * 2}px`;
        dividerLine.style.background = `repeating-linear-gradient(90deg, ${dividerColor} 0px, ${dividerColor} 10px, transparent 10px, transparent 20px)`;
        dividerLine.style.WebkitMaskImage = 'radial-gradient(circle at 50% 50%, black 40%, transparent 50%)';
        dividerLine.style.maskImage = 'radial-gradient(circle at 50% 50%, black 40%, transparent 50%)';
        dividerLine.style.WebkitMaskSize = '20px 100%';
        dividerLine.style.maskSize = '20px 100%';
        dividerLine.style.WebkitMaskRepeat = 'repeat-x';
        dividerLine.style.maskRepeat = 'repeat-x';
        break;
      case 'zigzag':
        dividerLine.style.border = 'none';
        dividerLine.style.height = `${dividerThickness * 3}px`;
        dividerLine.style.background = `linear-gradient(135deg, ${dividerColor} 25%, transparent 25%), linear-gradient(225deg, ${dividerColor} 25%, transparent 25%)`;
        dividerLine.style.backgroundSize = '10px 10px';
        dividerLine.style.backgroundPosition = '0 0, 5px 0';
        dividerLine.style.backgroundRepeat = 'repeat-x';
        break;
      case 'dots':
        dividerLine.style.border = 'none';
        dividerLine.style.height = `${dividerThickness * 2}px`;
        dividerLine.style.background = `radial-gradient(circle, ${dividerColor} ${dividerThickness}px, transparent ${dividerThickness}px)`;
        dividerLine.style.backgroundSize = `${dividerThickness * 4}px ${dividerThickness * 4}px`;
        dividerLine.style.backgroundPosition = 'center';
        dividerLine.style.backgroundRepeat = 'repeat-x';
        break;
      case 'stars':
        dividerLine.innerHTML = '✦ '.repeat(Math.floor(dividerWidth / 5));
        dividerLine.style.color = dividerColor;
        dividerLine.style.fontSize = `${dividerThickness * 4}px`;
        dividerLine.style.height = 'auto';
        dividerLine.style.lineHeight = '1';
        dividerLine.style.letterSpacing = '10px';
        break;
      default:
        dividerLine.style.background = dividerColor;
    }
    
    wrapper.innerHTML = '';
    wrapper.appendChild(dividerLine);

    if (!selectedDivider) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(wrapper);
        
        // Add space after
        const space = document.createElement('p');
        space.innerHTML = '<br>';
        range.setStartAfter(wrapper);
        range.insertNode(space);
        
        range.setStartAfter(space);
        range.setEndAfter(space);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current?.appendChild(wrapper);
      }
    }

    updateContent();
    setShowDividerInput(false);
    setSelectedDivider(null);
  };

  // Table Handlers
  const handleInsertTable = () => {
    if (selectedTable) {
      handleEditTable(selectedTable);
      return;
    }
    setTableData(null);
    setEditingTable(null);
    saveSelection();
    setShowTableInput(true);
  };

  const handleEditTable = (element) => {
    const rows = parseInt(element.getAttribute('data-rows'));
    const cols = parseInt(element.getAttribute('data-cols'));
    const tableDataStr = element.getAttribute('data-table-data');
    const tableData = JSON.parse(decodeURIComponent(tableDataStr));
    const borderColor = element.getAttribute('data-border-color');
    const borderWidth = parseInt(element.getAttribute('data-border-width'));
    const headerBgColor = element.getAttribute('data-header-bg');
    const headerTextColor = element.getAttribute('data-header-text');
    const stripedRows = element.getAttribute('data-striped') === 'true';
    const stripedColor = element.getAttribute('data-striped-color');
    
    setTableData({
      rows,
      cols,
      tableData,
      borderColor,
      borderWidth,
      headerBgColor,
      headerTextColor,
      stripedRows,
      stripedColor
    });
    setEditingTable(element);
    setShowTableInput(true);
  };

  const handleSaveTable = (data) => {
    restoreSelection();
    
    let wrapper;
    if (editingTable) {
      wrapper = editingTable;
    } else {
      wrapper = document.createElement('div');
      wrapper.className = 'editor-table-wrapper';
    }

    // Store data attributes
    wrapper.setAttribute('data-rows', data.rows);
    wrapper.setAttribute('data-cols', data.cols);
    wrapper.setAttribute('data-table-data', encodeURIComponent(JSON.stringify(data.tableData)));
    wrapper.setAttribute('data-border-color', data.borderColor);
    wrapper.setAttribute('data-border-width', data.borderWidth);
    wrapper.setAttribute('data-header-bg', data.headerBgColor);
    wrapper.setAttribute('data-header-text', data.headerTextColor);
    wrapper.setAttribute('data-striped', data.stripedRows);
    wrapper.setAttribute('data-striped-color', data.stripedColor);
    
    // Apply wrapper styles
    wrapper.style.cssText = `
      display: block;
      margin: 1.5rem 0;
      overflow-x: auto;
      position: relative;
      width: 100%;
    `;
    
    // Create table
    const table = document.createElement('table');
    table.contentEditable = 'true';
    table.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      border: ${data.borderWidth}px solid ${data.borderColor};
    `;
    
    // Create tbody
    const tbody = document.createElement('tbody');
    
    data.tableData.forEach((row, rowIdx) => {
      const tr = document.createElement('tr');
      tr.className = 'table-row';
      tr.setAttribute('data-row-index', rowIdx);
      if (data.stripedRows && rowIdx % 2 === 1) {
        tr.style.backgroundColor = data.stripedColor;
      }
      

      row.forEach((cell, colIdx) => {
        const td = document.createElement('td');
        td.contentEditable = 'true';
        td.className = 'table-cell';
        td.setAttribute('data-col-index', colIdx);
        td.setAttribute('data-row-index', rowIdx);
        td.style.cssText = `
          border: ${data.borderWidth}px solid ${data.borderColor};
          padding: 12px;
          font-family: ${cell.fontFamily};
          font-size: ${cell.fontSize}px;
          color: ${rowIdx === 0 ? data.headerTextColor : cell.color};
          background-color: ${rowIdx === 0 ? data.headerBgColor : cell.bgColor};
          text-align: ${cell.alignment};
          font-weight: ${cell.bold ? 'bold' : 'normal'};
          font-style: ${cell.italic ? 'italic' : 'normal'};
          min-width: 100px;
          position: relative;
        `;
        td.innerHTML = cell.text || '<br>';
        
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    wrapper.innerHTML = '';
    wrapper.appendChild(table);
    
    // Add settings button (always visible)
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'table-settings-btn';
    settingsBtn.type = 'button';
    settingsBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m0-6l4.2-4.2"></path></svg>';
    settingsBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: #0d9488;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 8px;
      cursor: pointer;
      opacity: 1;
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    `;
    settingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleEditTable(wrapper);
    });
    wrapper.appendChild(settingsBtn);

    if (!editingTable) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(wrapper);
        
        // Add space after
        const space = document.createElement('p');
        space.innerHTML = '<br>';
        range.setStartAfter(wrapper);
        range.insertNode(space);
        
        range.setStartAfter(space);
        range.setEndAfter(space);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current?.appendChild(wrapper);
      }
    }

    updateContent();
    setShowTableInput(false);
    setEditingTable(null);
    setTableData(null);
  };

  // Social Links Handlers
  const handleInsertSocialLinks = () => {
    if (selectedSocialLinks) {
      handleEditSocialLinks(selectedSocialLinks);
      return;
    }
    setSocialLinksData(null);
    setEditingSocialLinks(null);
    saveSelection();
    setShowSocialLinksInput(true);
  };

  // Scroll Post (Project Navigation) Handler
  const handleInsertScrollPost = () => {
    restoreSelection();
    
    // Create wrapper for navigation buttons
    const wrapper = document.createElement('div');
    wrapper.className = 'editor-project-nav-wrapper';
    wrapper.contentEditable = 'false';
    wrapper.setAttribute('data-type', 'project-navigation');
    wrapper.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin: 2rem 0;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
      border: 2px dashed #105652;
      position: relative;
    `;
    
    // Create label
    const label = document.createElement('div');
    label.style.cssText = `
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: #105652;
      color: white;
      padding: 2px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
    `;
    label.textContent = 'Project Navigation (Active in Live View)';
    wrapper.appendChild(label);
    
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      display: flex;
      gap: 20px;
      align-items: center;
    `;
    
    // Previous button
    const prevBtn = document.createElement('div');
    prevBtn.className = 'editor-project-nav-btn';
    prevBtn.style.cssText = `
      display: flex;
      height: 3em;
      width: 150px;
      align-items: center;
      justify-content: center;
      background: #fff;
      border-radius: 3px;
      letter-spacing: 1px;
      border: 1px solid #e5e7eb;
      font-size: 14px;
      font-weight: 500;
      color: #105652;
      cursor: default;
      pointer-events: none;
    `;
    prevBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 5px;">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
      Previous Post
    `;
    
    // Next button
    const nextBtn = document.createElement('div');
    nextBtn.className = 'editor-project-nav-btn';
    nextBtn.style.cssText = `
      display: flex;
      height: 3em;
      width: 150px;
      align-items: center;
      justify-content: center;
      background: #fff;
      border-radius: 3px;
      letter-spacing: 1px;
      border: 1px solid #e5e7eb;
      font-size: 14px;
      font-weight: 500;
      color: #105652;
      cursor: default;
      pointer-events: none;
    `;
    nextBtn.innerHTML = `
      Next Post
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 5px;">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    `;
    
    buttonsContainer.appendChild(prevBtn);
    buttonsContainer.appendChild(nextBtn);
    wrapper.appendChild(buttonsContainer);
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(wrapper);
      
      // Add space after
      const space = document.createElement('p');
      space.innerHTML = '<br>';
      range.setStartAfter(wrapper);
      range.insertNode(space);
      
      range.setStartAfter(space);
      range.setEndAfter(space);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editorRef.current?.appendChild(wrapper);
    }
    
    updateContent();
  };

  const handleEditSocialLinks = (element) => {
    const linksDataStr = element.getAttribute('data-social-links');
    const links = JSON.parse(decodeURIComponent(linksDataStr));
    const labelText = element.getAttribute('data-label-text') || 'Follow us on';
    
    setSocialLinksData({ links, labelText });
    setEditingSocialLinks(element);
    setShowSocialLinksInput(true);
  };

  const handleSaveSocialLinks = (data) => {
    restoreSelection();
    
    let wrapper;
    if (editingSocialLinks) {
      wrapper = editingSocialLinks;
    } else {
      wrapper = document.createElement('div');
      wrapper.className = 'editor-social-links-wrapper';
      wrapper.contentEditable = 'false';
    }

    // Store data
    wrapper.setAttribute('data-social-links', encodeURIComponent(JSON.stringify(data.links)));
    wrapper.setAttribute('data-label-text', data.labelText || '');
    
    // Apply wrapper styles
    wrapper.style.cssText = `
      display: inline-flex;
      list-style: none;
      height: 120px;
      width: 100%;
      padding-top: 40px;
      font-family: "Poppins", sans-serif;
      justify-content: center;
      margin: 1rem 0;
    `;
    
    // Create social icons container
    const iconsContainer = document.createElement('div');
    iconsContainer.style.cssText = `
      display: inline-flex;
      gap: 10px;
      align-items: center;
    `;
    
    // Add label text if provided
    if (data.labelText && data.labelText.trim()) {
      const labelSpan = document.createElement('span');
      labelSpan.className = 'social-label-text';
      labelSpan.textContent = data.labelText;
      labelSpan.style.cssText = `
        font-size: 18px;
        font-weight: 500;
        color: #105652;
        margin-right: 15px;
      `;
      iconsContainer.appendChild(labelSpan);
    }
    
    // Platform icon SVGs
    const platformIcons = {
      facebook: '<path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />',
      twitter: '<path d="M42,12.429c-1.323,0.586-2.746,0.977-4.247,1.162c1.526-0.906,2.7-2.351,3.251-4.058c-1.428,0.837-3.01,1.452-4.693,1.776C34.967,9.884,33.05,9,30.926,9c-4.08,0-7.387,3.278-7.387,7.32c0,0.572,0.067,1.129,0.193,1.67c-6.138-0.308-11.582-3.226-15.224-7.654c-0.64,1.082-1,2.349-1,3.686c0,2.541,1.301,4.778,3.285,6.096c-1.211-0.037-2.351-0.374-3.349-0.914c0,0.022,0,0.055,0,0.086c0,3.551,2.547,6.508,5.923,7.181c-0.617,0.169-1.269,0.263-1.941,0.263c-0.477,0-0.942-0.054-1.392-0.135c0.94,2.902,3.667,5.023,6.898,5.086c-2.528,1.96-5.712,3.134-9.174,3.134c-0.598,0-1.183-0.034-1.761-0.104C9.268,36.786,13.152,38,17.321,38c13.585,0,21.017-11.156,21.017-20.834c0-0.317-0.01-0.633-0.025-0.945C39.763,15.197,41.013,13.905,42,12.429" />',
      instagram: '<path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />',
      linkedin: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
      youtube: '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>',
      github: '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>',
      website: '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
      email: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
    };
    
    const platformColors = {
      facebook: '#1877f2',
      twitter: '#1da1f2',
      instagram: '#e4405f',
      linkedin: '#0077b5',
      youtube: '#ff0000',
      github: '#333333',
      website: '#105652',
      email: '#ea4335',
    };
    
    const platformViewBox = {
      facebook: '0 0 320 512',
      twitter: '0 0 48 48',
      instagram: '0 0 16 16',
      linkedin: '0 0 24 24',
      youtube: '0 0 24 24',
      github: '0 0 24 24',
      website: '0 0 24 24',
      email: '0 0 24 24',
    };
    
    // Create each social icon
    data.links.forEach(link => {
      const iconWrapper = document.createElement('div');
      iconWrapper.className = `social-icon-wrapper social-${link.platform}`;
      iconWrapper.setAttribute('data-platform', link.platform);
      iconWrapper.setAttribute('data-color', platformColors[link.platform]);
      iconWrapper.style.cssText = `
        position: relative;
        background: #fff;
        border-radius: 50%;
        margin: 10px;
        width: 50px;
        height: 50px;
        font-size: 18px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      `;
      
      // Tooltip
      const tooltip = document.createElement('span');
      tooltip.className = 'social-tooltip';
      tooltip.textContent = link.platform.charAt(0).toUpperCase() + link.platform.slice(1);
      tooltip.style.cssText = `
        position: absolute;
        top: 0;
        font-size: 14px;
        background: #fff;
        color: #fff;
        padding: 5px 8px;
        border-radius: 5px;
        box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        white-space: nowrap;
        z-index: 10;
      `;
      
      // Tooltip arrow
      const tooltipArrow = document.createElement('span');
      tooltipArrow.className = 'social-tooltip-arrow';
      tooltipArrow.style.cssText = `
        position: absolute;
        content: "";
        height: 8px;
        width: 8px;
        background: #fff;
        bottom: -3px;
        left: 50%;
        transform: translate(-50%) rotate(45deg);
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      `;
      tooltip.appendChild(tooltipArrow);
      
      // Icon SVG
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', platformViewBox[link.platform] || '0 0 24 24');
      svg.setAttribute('height', '1.2em');
      svg.setAttribute('fill', 'currentColor');
      svg.innerHTML = platformIcons[link.platform] || platformIcons.website;
      
      // Link element
      const anchor = document.createElement('a');
      anchor.className = 'social-icon-link';
      anchor.href = link.url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        color: #333;
        text-decoration: none;
        transition: color 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      `;
      anchor.appendChild(svg);
      
      iconWrapper.appendChild(tooltip);
      iconWrapper.appendChild(anchor);
      iconsContainer.appendChild(iconWrapper);
    });
    
    wrapper.innerHTML = '';
    wrapper.appendChild(iconsContainer);
    
    // Add edit button (always visible)
    const editBtn = document.createElement('button');
    editBtn.className = 'social-links-edit-btn';
    editBtn.type = 'button';
    editBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
    editBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 48px;
      background: #0d9488;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 8px;
      cursor: pointer;
      opacity: 1;
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      transition: background 0.2s ease;
    `;
    editBtn.addEventListener('mouseenter', () => {
      editBtn.style.background = '#0f766e';
    });
    editBtn.addEventListener('mouseleave', () => {
      editBtn.style.background = '#0d9488';
    });
    editBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleEditSocialLinks(wrapper);
    });
    wrapper.appendChild(editBtn);
    
    // Add delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'social-links-delete-btn';
    deleteBtn.type = 'button';
    deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
    deleteBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: #dc2626;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 8px;
      cursor: pointer;
      opacity: 1;
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      transition: background 0.2s ease;
    `;
    deleteBtn.addEventListener('mouseenter', () => {
      deleteBtn.style.background = '#b91c1c';
    });
    deleteBtn.addEventListener('mouseleave', () => {
      deleteBtn.style.background = '#dc2626';
    });
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm('Are you sure you want to delete this social links section?')) {
        wrapper.remove();
        setSelectedSocialLinks(null);
        updateContent();
      }
    });
    wrapper.appendChild(deleteBtn);

    if (!editingSocialLinks) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(wrapper);
        
        // Add space after
        const space = document.createElement('p');
        space.innerHTML = '<br>';
        range.setStartAfter(wrapper);
        range.insertNode(space);
        
        range.setStartAfter(space);
        range.setEndAfter(space);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current?.appendChild(wrapper);
      }
    }

    updateContent();
    setShowSocialLinksInput(false);
    setEditingSocialLinks(null);
    setSocialLinksData(null);
  };

  // Author Handlers
  const handleInsertAuthor = () => {
    if (selectedAuthor) {
      handleEditAuthor(selectedAuthor);
      return;
    }
    setAuthorData(null);
    setEditingAuthor(null);
    saveSelection();
    setShowAuthorInput(true);
  };

  const handleEditAuthor = (element) => {
    const authorName = element.getAttribute('data-author-name');
    const alignment = element.getAttribute('data-alignment') || 'center';
    setAuthorData({ authorName, alignment });
    setEditingAuthor(element);
    setShowAuthorInput(true);
  };

  const handleSaveAuthor = (data) => {
    restoreSelection();
    
    let wrapper;
    if (editingAuthor) {
      wrapper = editingAuthor;
    } else {
      wrapper = document.createElement('div');
      wrapper.className = 'editor-author-wrapper';
      wrapper.contentEditable = 'false';
    }

    // Store author name and alignment
    wrapper.setAttribute('data-author-name', data.authorName);
    wrapper.setAttribute('data-alignment', data.alignment || 'center');
    wrapper.setAttribute('data-type', 'author');
    
    // Create terminal container
    const terminal = document.createElement('div');
    terminal.className = 'editor-author-terminal';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'editor-author-terminal-header';
    
    const title = document.createElement('span');
    title.className = 'editor-author-terminal-title';
    title.textContent = 'Author';
    
    const controls = document.createElement('div');
    controls.className = 'editor-author-terminal-controls';
    
    const closeBtn = document.createElement('div');
    closeBtn.className = 'editor-author-control close';
    const minimizeBtn = document.createElement('div');
    minimizeBtn.className = 'editor-author-control minimize';
    const maximizeBtn = document.createElement('div');
    maximizeBtn.className = 'editor-author-control maximize';
    
    controls.appendChild(closeBtn);
    controls.appendChild(minimizeBtn);
    controls.appendChild(maximizeBtn);
    
    header.appendChild(title);
    header.appendChild(controls);
    
    // Create text with typing animation
    const text = document.createElement('div');
    text.className = 'editor-author-text';
    text.textContent = data.authorName;
    
    terminal.appendChild(header);
    terminal.appendChild(text);
    
    // Add settings button (gear icon)
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'author-settings-btn';
    settingsBtn.type = 'button';
    settingsBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m0-6l4.2-4.2"></path></svg>';
    settingsBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 48px;
      background: #0d9488;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 8px;
      cursor: pointer;
      opacity: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      transition: all 0.2s ease;
    `;
    settingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleEditAuthor(wrapper);
    });
    
    // Add delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'author-delete-btn';
    deleteBtn.type = 'button';
    deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
    deleteBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: #dc2626;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 8px;
      cursor: pointer;
      opacity: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      transition: all 0.2s ease;
    `;
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm('Are you sure you want to delete this author section?')) {
        wrapper.remove();
        setSelectedAuthor(null);
        updateContent();
      }
    });
    
    wrapper.innerHTML = '';
    wrapper.style.cssText = `
      text-align: ${data.alignment || 'center'};
      margin: 1rem 0;
      display: block;
      position: relative;
    `;
    wrapper.appendChild(terminal);
    wrapper.appendChild(settingsBtn);
    wrapper.appendChild(deleteBtn);

    if (!editingAuthor) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(wrapper);
        
        // Add space after
        const space = document.createElement('p');
        space.innerHTML = '<br>';
        range.setStartAfter(wrapper);
        range.insertNode(space);
        
        range.setStartAfter(space);
        range.setEndAfter(space);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current?.appendChild(wrapper);
      }
    }

    updateContent();
    setShowAuthorInput(false);
    setEditingAuthor(null);
    setAuthorData(null);
  };

  // File Download Handlers
  const handleInsertFileDownload = () => {
    if (selectedFileDownload) {
      handleEditFileDownload(selectedFileDownload);
      return;
    }
    setFileDownloadData(null);
    setEditingFileDownload(null);
    saveSelection();
    setShowFileUploadInput(true);
  };

  const handleEditFileDownload = (element) => {
    const fileName = element.getAttribute('data-file-name');
    const buttonText = element.getAttribute('data-button-text');
    const fileUrl = element.getAttribute('data-file-url');
    
    setFileDownloadData({ fileName, buttonText, fileUrl });
    setEditingFileDownload(element);
    setShowFileUploadInput(true);
  };

  const handleSaveFileDownload = (data) => {
    restoreSelection();
    
    let wrapper;
    if (editingFileDownload) {
      wrapper = editingFileDownload;
    } else {
      wrapper = document.createElement('div');
      wrapper.className = 'editor-file-download-wrapper';
      wrapper.contentEditable = 'false';
    }

    // Store data
    wrapper.setAttribute('data-file-name', data.fileName);
    wrapper.setAttribute('data-button-text', data.buttonText);
    wrapper.setAttribute('data-file-url', data.fileUrl);
    wrapper.setAttribute('data-type', 'file-download');
    
    // Create folder icon
    const folder = document.createElement('div');
    folder.className = 'editor-file-folder';
    
    const folderTip = document.createElement('div');
    folderTip.className = 'editor-file-folder-tip';
    
    const folderCover = document.createElement('div');
    folderCover.className = 'editor-file-folder-cover';
    
    folder.appendChild(folderTip);
    folder.appendChild(folderCover);
    
    // Create file info (clickable link)
    const fileInfo = document.createElement('a');
    fileInfo.className = 'editor-file-info';
    fileInfo.href = data.fileUrl;
    fileInfo.target = '_blank';
    fileInfo.rel = 'noopener noreferrer';
    fileInfo.style.cssText = `
      font-size: 0.9em;
      color: #ffffff;
      text-align: center;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      padding: 10px 20px;
      width: 100%;
      margin-top: 80px;
      transition: background 350ms ease;
      text-decoration: none;
      display: block;
    `;
    
    const fileName = document.createElement('div');
    fileName.className = 'editor-file-name';
    fileName.textContent = data.fileName;
    
    const buttonText = document.createElement('div');
    buttonText.className = 'editor-file-button-text';
    buttonText.textContent = data.buttonText;
    
    fileInfo.appendChild(fileName);
    fileInfo.appendChild(buttonText);
    
    // Add settings button (gear icon)
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'file-download-settings-btn';
    settingsBtn.type = 'button';
    settingsBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m0-6l4.2-4.2"></path></svg>';
    settingsBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 48px;
      background: #0d9488;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 8px;
      cursor: pointer;
      opacity: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      transition: all 0.2s ease;
    `;
    settingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleEditFileDownload(wrapper);
    });
    
    // Add delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'file-download-delete-btn';
    deleteBtn.type = 'button';
    deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
    deleteBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: #dc2626;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 8px;
      cursor: pointer;
      opacity: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      transition: all 0.2s ease;
    `;
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm('Are you sure you want to delete this file download?')) {
        wrapper.remove();
        setSelectedFileDownload(null);
        updateContent();
      }
    });
    
    wrapper.innerHTML = '';
    wrapper.appendChild(folder);
    wrapper.appendChild(fileInfo);
    wrapper.appendChild(settingsBtn);
    wrapper.appendChild(deleteBtn);

    if (!editingFileDownload) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(wrapper);
        
        // Add space after
        const space = document.createElement('p');
        space.innerHTML = '<br>';
        range.setStartAfter(wrapper);
        range.insertNode(space);
        
        range.setStartAfter(space);
        range.setEndAfter(space);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current?.appendChild(wrapper);
      }
    }

    updateContent();
    setShowFileUploadInput(false);
    setEditingFileDownload(null);
    setFileDownloadData(null);
  };

  // Photo Grid Handlers
  const handleInsertPhotoGrid = () => {
    if (selectedPhotoGrid) {
      handleEditPhotoGrid(selectedPhotoGrid);
      return;
    }
    setPhotoGridData(null);
    setEditingPhotoGrid(null);
    saveSelection();
    setShowPhotoGridInput(true);
  };

  const handleEditPhotoGrid = (element) => {
    const layoutId = parseInt(element.getAttribute('data-layout-id'));
    const imagesStr = element.getAttribute('data-images');
    const images = JSON.parse(decodeURIComponent(imagesStr));
    const gridHeight = parseInt(element.getAttribute('data-grid-height')) || 400;
    
    const GRID_LAYOUTS = [
      { id: 1, name: '2 Columns', cells: 2, template: 'grid-cols-2', rows: 1 },
      { id: 2, name: '3 Columns', cells: 3, template: 'grid-cols-3', rows: 1 },
      { id: 3, name: '4 Columns', cells: 4, template: 'grid-cols-4', rows: 1 },
      { id: 4, name: '2x2 Grid', cells: 4, template: 'grid-cols-2', rows: 2 },
      { id: 5, name: '3x2 Grid', cells: 6, template: 'grid-cols-3', rows: 2 },
      { id: 6, name: 'Large Left + 2 Right', cells: 3, template: 'custom-6', rows: 2 },
      { id: 7, name: 'Large Right + 2 Left', cells: 3, template: 'custom-7', rows: 2 },
      { id: 8, name: '2 Top + 3 Bottom', cells: 5, template: 'custom-8', rows: 2 },
      { id: 9, name: '3 Top + 2 Bottom', cells: 5, template: 'custom-9', rows: 2 },
      { id: 10, name: 'Large Center + 4 Corners', cells: 5, template: 'custom-10', rows: 2 },
      { id: 11, name: 'Masonry 1', cells: 5, template: 'custom-11', rows: 2 },
      { id: 12, name: 'Masonry 2', cells: 6, template: 'custom-12', rows: 2 },
      { id: 13, name: 'Featured + 3', cells: 4, template: 'custom-13', rows: 2 },
      { id: 14, name: 'Split + 4', cells: 5, template: 'custom-14', rows: 2 },
      { id: 15, name: 'Showcase', cells: 4, template: 'custom-15', rows: 2 },
      { id: 16, name: 'Gallery 1', cells: 5, template: 'custom-16', rows: 2 },
      { id: 17, name: 'Gallery 2', cells: 6, template: 'custom-17', rows: 2 },
      { id: 18, name: 'Portfolio 1', cells: 4, template: 'custom-18', rows: 2 },
      { id: 19, name: 'Portfolio 2', cells: 5, template: 'custom-19', rows: 2 },
      { id: 20, name: 'Magazine', cells: 6, template: 'custom-20', rows: 2 },
      { id: 21, name: 'Hero + Grid', cells: 4, template: 'custom-21', rows: 2 },
      { id: 22, name: 'Spotlight', cells: 5, template: 'custom-22', rows: 2 },
      { id: 23, name: 'Collage 1', cells: 6, template: 'custom-23', rows: 2 },
      { id: 24, name: 'Collage 2', cells: 5, template: 'custom-24', rows: 2 },
    ];
    
    const layout = GRID_LAYOUTS.find(l => l.id === layoutId);
    
    setPhotoGridData({ layout, images, gridHeight });
    setEditingPhotoGrid(element);
    setShowPhotoGridInput(true);
  };

  const handleSavePhotoGrid = (data) => {
    restoreSelection();
    
    let wrapper;
    if (editingPhotoGrid) {
      wrapper = editingPhotoGrid;
    } else {
      wrapper = document.createElement('div');
      wrapper.className = 'editor-photo-grid';
      wrapper.contentEditable = 'false';
    }

    wrapper.setAttribute('data-layout-id', data.layout.id);
    wrapper.setAttribute('data-images', encodeURIComponent(JSON.stringify(data.images)));
    wrapper.setAttribute('data-grid-height', data.gridHeight || 400);
    wrapper.setAttribute('data-type', 'photo-grid');
    
    const container = document.createElement('div');
    container.className = `editor-photo-grid-container grid-layout-${data.layout.id}`;
    container.style.height = `${data.gridHeight || 400}px`;
    
    data.images.forEach((imgUrl, index) => {
      const cell = document.createElement('div');
      cell.className = 'editor-grid-cell';
      
      if (imgUrl) {
        const img = document.createElement('img');
        img.src = imgUrl;
        img.alt = `Grid image ${index + 1}`;
        cell.appendChild(img);
      }
      
      container.appendChild(cell);
    });
    
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'photo-grid-settings-btn';
    settingsBtn.type = 'button';
    settingsBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m0-6l4.2-4.2"></path></svg>';
    settingsBtn.style.cssText = `position: absolute; top: 8px; left: 8px; background: #0d9488; color: white; border: none; border-radius: 4px; padding: 6px 8px; cursor: pointer; opacity: 0; z-index: 100; display: flex; align-items: center; transition: all 0.2s ease;`;
    settingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleEditPhotoGrid(wrapper);
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'photo-grid-delete-btn';
    deleteBtn.type = 'button';
    deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
    deleteBtn.style.cssText = `position: absolute; top: 8px; left: 48px; background: #dc2626; color: white; border: none; border-radius: 4px; padding: 6px 8px; cursor: pointer; opacity: 0; z-index: 100; display: flex; align-items: center; transition: all 0.2s ease;`;
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm('Delete this photo grid?')) {
        wrapper.remove();
        setSelectedPhotoGrid(null);
        updateContent();
      }
    });
    
    wrapper.innerHTML = '';
    wrapper.appendChild(container);
    wrapper.appendChild(settingsBtn);
    wrapper.appendChild(deleteBtn);

    if (!editingPhotoGrid) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(wrapper);
        const space = document.createElement('p');
        space.innerHTML = '<br>';
        range.setStartAfter(wrapper);
        range.insertNode(space);
        range.setStartAfter(space);
        range.setEndAfter(space);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current?.appendChild(wrapper);
      }
    }

    updateContent();
    setShowPhotoGridInput(false);
    setEditingPhotoGrid(null);
    setPhotoGridData(null);
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Underline, command: 'underline', title: 'Underline' },
    { icon: Code, command: 'custom-code-block', title: 'Insert Code Block' },
    { icon: Music, command: 'insert-audio', title: 'Insert Audio Player' },
    { icon: Video, command: 'insert-video', title: 'Insert Video' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
  ];

  return (
    <div className="border rounded-lg relative" style={{ borderColor: '#105652' }}>
      {/* Sticky Toolbar Container */}
      <div className="sticky top-0 z-10 bg-white rounded-t-lg">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 p-3 border-b" style={{ borderColor: '#e5e7eb' }}>
          {/* Text Formatting */}
          {toolbarButtons.map(({ icon: Icon, command, title }) => (
            <button
              key={command}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                if (command === 'custom-code-block') {
                  handleInsertCodeBlock();
                } else if (command === 'insert-audio') {
                  handleInsertAudioPlayer();
                } else if (command === 'insert-video') {
                  handleInsertVideo();
                } else {
                  execCommand(command);
                }
              }}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              title={title}
            >
              <Icon className="w-5 h-5" style={{ color: '#105652' }} />
            </button>
          ))}

          <div className="w-px h-8 bg-gray-300 mx-1" />

          {/* Font Family */}
          <div className="relative font-picker-container">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
                setShowFontPicker(!showFontPicker);
                setShowColorPicker(false);
                setShowSizePicker(false);
              }}
              className="p-2 rounded hover:bg-gray-100 transition-colors flex items-center gap-1"
              title="Font Family"
            >
              <Type className="w-5 h-5" style={{ color: '#105652' }} />
              <span className="text-xs" style={{ color: '#105652' }}>Font</span>
            </button>
            
            {showFontPicker && (
              <div className="font-picker-container absolute top-full left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border-2 rounded-lg shadow-xl z-50" style={{ borderColor: '#105652' }}>
                <div className="sticky top-0 bg-white border-b p-2" style={{ borderColor: '#e5e7eb' }}>
                  <p className="text-sm font-semibold text-gray-700">Select Font</p>
                </div>
                
                {/* Custom Fonts */}
                {customFonts.length > 0 && (
                  <div className="border-b" style={{ borderColor: '#e5e7eb' }}>
                    <div className="px-3 py-2 bg-purple-50">
                      <p className="text-xs font-semibold text-purple-700">Custom Fonts</p>
                    </div>
                    {customFonts.map((font) => (
                      <button
                        key={font.$id}
                        type="button"
                        onClick={() => applyFont(`'${font.fontName}', sans-serif`)}
                        className="w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors border-b"
                        style={{ 
                          fontFamily: `'${font.fontName}', sans-serif`,
                          borderColor: '#f3e8ff'
                        }}
                      >
                        <span className="text-sm">{font.fontName}</span>
                        <span className="ml-2 text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded">Custom</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Google Fonts */}
                <div>
                  <div className="px-3 py-2 bg-green-50">
                    <p className="text-xs font-semibold text-green-700">Google Fonts</p>
                  </div>
                  {GOOGLE_FONTS.map((font, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        loadGoogleFont(font.name);
                        applyFont(font.value);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-green-50 transition-colors border-b"
                      style={{ 
                        fontFamily: font.value,
                        borderColor: '#f0fdf4'
                      }}
                    >
                      <span className="text-sm">{font.name}</span>
                      {font.bangla && (
                        <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">বাংলা</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Text Color */}
          <div className="relative color-picker-container">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
                setShowColorPicker(!showColorPicker);
                setShowFontPicker(false);
                setShowSizePicker(false);
              }}
              className="p-2 rounded hover:bg-gray-100 transition-colors flex items-center gap-1"
              title="Text Color"
            >
              <Palette className="w-5 h-5" style={{ color: '#105652' }} />
              <span className="text-xs" style={{ color: '#105652' }}>Color</span>
            </button>
            
            {showColorPicker && (
              <div className="color-picker-container absolute top-full left-0 mt-2 w-72 bg-white border-2 rounded-lg shadow-xl z-50 p-4" style={{ borderColor: '#105652' }}>
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Color Palette</p>
                  <div className="grid grid-cols-10 gap-2">
                    {colorPalette.map((color, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => applyColor(color)}
                        className="w-6 h-6 rounded border-2 hover:scale-110 transition-transform"
                        style={{ 
                          backgroundColor: color,
                          borderColor: colorInput === color ? '#105652' : '#e5e7eb'
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Color Picker</p>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={colorInput}
                      onChange={(e) => {
                        setColorInput(e.target.value);
                        applyColor(e.target.value);
                      }}
                      className="w-12 h-10 rounded border cursor-pointer"
                      style={{ borderColor: '#105652' }}
                    />
                    <input
                      type="text"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          applyColor(colorInput);
                        }
                      }}
                      placeholder="#000000"
                      className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2"
                      style={{ borderColor: '#105652' }}
                    />
                    <button
                      type="button"
                      onClick={() => applyColor(colorInput)}
                      className="px-4 py-2 rounded text-white text-sm"
                      style={{ backgroundColor: '#105652' }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowColorPicker(false)}
                  className="w-full px-4 py-2 rounded border text-sm"
                  style={{ borderColor: '#105652', color: '#105652' }}
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* Font Size */}
          <div className="relative size-picker-container">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
                setShowSizePicker(!showSizePicker);
                setShowFontPicker(false);
                setShowColorPicker(false);
              }}
              className="p-2 rounded hover:bg-gray-100 transition-colors flex items-center gap-1"
              title="Font Size"
            >
              <TextCursor className="w-5 h-5" style={{ color: '#105652' }} />
              <span className="text-xs" style={{ color: '#105652' }}>Size</span>
            </button>
            
            {showSizePicker && (
              <div className="size-picker-container absolute top-full left-0 mt-2 w-64 bg-white border-2 rounded-lg shadow-xl z-50 p-4" style={{ borderColor: '#105652' }}>
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Preset Sizes</p>
                  <div className="grid grid-cols-2 gap-2">
                    {fontSizes.map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => applySize(size.value)}
                        className="px-3 py-2 rounded border hover:bg-gray-50 transition-colors text-left"
                        style={{ 
                          borderColor: sizeInput === size.value ? '#105652' : '#e5e7eb',
                          backgroundColor: sizeInput === size.value ? '#f0fdfa' : 'white'
                        }}
                      >
                        <span className="text-sm font-medium">{size.label}</span>
                        <span className="text-xs text-gray-500 ml-1">({size.value}px)</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Custom Size</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          applySize(sizeInput);
                        }
                      }}
                      min="8"
                      max="200"
                      placeholder="16"
                      className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2"
                      style={{ borderColor: '#105652' }}
                    />
                    <span className="flex items-center text-sm text-gray-600">px</span>
                    <button
                      type="button"
                      onClick={() => applySize(sizeInput)}
                      className="px-4 py-2 rounded text-white text-sm"
                      style={{ backgroundColor: '#105652' }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowSizePicker(false)}
                  className="w-full px-4 py-2 rounded border text-sm"
                  style={{ borderColor: '#105652', color: '#105652' }}
                >
                  Close
                </button>
              </div>
            )}
          </div>

          <div className="w-px h-8 bg-gray-300 mx-1" />

          {/* Headings */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              insertHeading(1);
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Heading 1"
          >
            <Heading1 className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              insertHeading(2);
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Heading 2"
          >
            <Heading2 className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              insertHeading(3);
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Heading 3"
          >
            <Heading3 className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
          
          {/* Remove Formatting */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execCommand('removeFormat');
              execCommand('formatBlock', 'p');
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Remove Formatting"
          >
            <RemoveFormatting className="w-5 h-5" style={{ color: '#105652' }} />
          </button>

          <div className="w-px h-8 bg-gray-300 mx-1" />

          {/* Special Elements */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleLinkButtonClick();
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Insert Link"
          >
            <LinkIcon className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
              setShowImageInput(!showImageInput);
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Insert Image"
          >
            <ImageIcon className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
              setShowEmbedInput(!showEmbedInput);
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Insert Embed"
          >
            <FileCode className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleInsertQuoteblock();
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Insert Quoteblock"
          >
            <Quote className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleInsertButton();
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Insert Button"
          >
            <MousePointerClick className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleInsertDivider();
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Insert Divider"
          >
            <Minus className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleInsertFaq();
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Insert FAQ/Accordion"
          >
            <HelpCircle className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleInsertTable();
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Insert Table"
          >
            <TableIcon className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleInsertSocialLinks();
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Insert Social Media Links"
          >
            <Share2 className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleInsertScrollPost();
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Insert Project Navigation (Scroll Post)"
          >
            <ArrowLeftRight className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleInsertAuthor();
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Insert Author"
          >
            <User className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleInsertFileDownload();
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Insert File Download"
          >
            <FolderDown className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleInsertPhotoGrid();
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Insert Photo Grid"
          >
            <Grid3x3 className="w-5 h-5" style={{ color: '#105652' }} />
          </button>

          <div className="w-px h-8 bg-gray-300 mx-1" />

          {/* Alignment Buttons - Moved to first row */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={(e) => {
              e.preventDefault();
              applyAlignment('left');
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Align Left"
          >
            <AlignLeft className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
          
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={(e) => {
              e.preventDefault();
              applyAlignment('center');
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Align Center"
          >
            <AlignCenter className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
          
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={(e) => {
              e.preventDefault();
              applyAlignment('right');
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Align Right"
          >
            <AlignRight className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
          
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={(e) => {
              e.preventDefault();
              applyAlignment('justify');
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Justify"
          >
            <AlignJustify className="w-5 h-5" style={{ color: '#105652' }} />
          </button>
        </div>

        {/* Link Input */}
        {showLinkInput && (
          <div className="p-3 border-b bg-gray-50" style={{ borderColor: '#e5e7eb' }}>
            <div className="mb-2">
              <p className="text-sm font-semibold mb-1" style={{ color: '#105652' }}>
                {editingLink ? 'Edit Link' : linkMode === 'selection' ? 'Add Link to Selected Text' : 'Insert New Link'}
              </p>
              {linkMode === 'selection' && !editingLink && (
                <p className="text-xs text-gray-600">
                  The link will be applied to your selected text
                </p>
              )}
              {linkMode === 'insert' && !editingLink && (
                <p className="text-xs text-gray-600">
                  Enter both title and URL to insert a new link at cursor position
                </p>
              )}
              {editingLink && (
                <p className="text-xs text-gray-600">
                  Click on the link again to edit it. You can change the URL and title.
                </p>
              )}
            </div>
            
            {/* Show title field only for insert mode or when editing */}
            {(linkMode === 'insert' || editingLink) && (
              <div className="mb-2">
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Link title (e.g., Click here)"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#105652' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleInsertLink();
                    }
                  }}
                />
              </div>
            )}
            
            <div className="flex gap-2">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Enter URL (https://example.com)"
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#105652' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsertLink();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleInsertLink}
                disabled={!linkUrl || (linkMode === 'insert' && !editingLink && !linkTitle)}
                className="px-4 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#105652' }}
              >
                {editingLink ? 'Update' : 'Insert'}
              </button>
              {editingLink && editingLink.classList.contains('editor-button') && (
                 <button
                  type="button"
                  onClick={() => {
                    setShowLinkInput(false);
                    handleEditButton(editingLink);
                  }}
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: '#1E8479' }}
                >
                  Edit Design
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkUrl('');
                  setLinkTitle('');
                  setEditingLink(null);
                }}
                className="px-4 py-2 rounded-lg border"
                style={{ borderColor: '#105652', color: '#105652' }}
              >
                Cancel
              </button>
            </div>
            
            {editingLink && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (editingLink && window.confirm('Are you sure you want to remove this link?')) {
                      // Replace link with its text content
                      const textNode = document.createTextNode(editingLink.textContent);
                      editingLink.parentNode.replaceChild(textNode, editingLink);
                      setEditingLink(null);
                      setLinkUrl('');
                      setLinkTitle('');
                      setShowLinkInput(false);
                      updateContent();
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-white text-sm"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  Remove Link
                </button>
              </div>
            )}
          </div>
        )}

        {/* Image Input */}
        {showImageInput && (
          <div className="p-3 border-b bg-gray-50" style={{ borderColor: '#e5e7eb' }}>
            {/* Tab Buttons */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setImageInputMode('url')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: imageInputMode === 'url' ? '#105652' : 'white',
                  color: imageInputMode === 'url' ? 'white' : '#105652',
                  border: `2px solid #105652`,
                }}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => setImageInputMode('upload')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: imageInputMode === 'upload' ? '#105652' : 'white',
                  color: imageInputMode === 'upload' ? 'white' : '#105652',
                  border: `2px solid #105652`,
                }}
              >
                Upload
              </button>
            </div>
            
            {/* URL Input Mode */}
            {imageInputMode === 'url' && (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL (https://example.com/image.jpg)"
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#105652' }}
                />
                <button
                  type="button"
                  onClick={handleInsertImage}
                  disabled={!imageUrl}
                  className="px-4 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#105652' }}
                >
                  Insert
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImageInput(false);
                    setImageUrl('');
                  }}
                  className="px-4 py-2 rounded-lg border"
                  style={{ borderColor: '#105652', color: '#105652' }}
                >
                  Cancel
                </button>
              </div>
            )}
            
            {/* File Upload Mode */}
            {imageInputMode === 'upload' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#105652' }}
                  />
                  <button
                    type="button"
                    onClick={handleInsertImage}
                    disabled={!imageFile || uploadingImage}
                    className="px-4 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#105652' }}
                  >
                    {uploadingImage ? 'Uploading...' : 'Insert'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowImageInput(false);
                      setImageFile(null);
                    }}
                    disabled={uploadingImage}
                    className="px-4 py-2 rounded-lg border disabled:opacity-50"
                    style={{ borderColor: '#105652', color: '#105652' }}
                  >
                    Cancel
                  </button>
                </div>
                {imageFile && (
                  <div className="text-sm text-gray-600">
                    Selected: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Supported formats: JPG, PNG, GIF, WebP. Max size: 10MB
                </div>
              </div>
            )}
          </div>
        )}

        {/* Embed Input */}
        {showEmbedInput && (
          <div className="p-3 border-b bg-gray-50" style={{ borderColor: '#e5e7eb' }}>
            <div className="mb-3">
              <p className="text-sm font-semibold mb-1" style={{ color: '#105652' }}>

                Insert Embed Code
              </p>
              <p className="text-xs text-gray-600">
                Paste your embed code (iframe, video, map, etc.)
              </p>
            </div>
            
            {/* View Mode Tabs */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setEmbedViewMode('code')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: embedViewMode === 'code' ? '#105652' : 'white',
                  color: embedViewMode === 'code' ? 'white' : '#105652',
                  border: `2px solid #105652`,
                }}
              >
                <FileCode className="w-4 h-4" />
                Code View
              </button>
              <button
                type="button"
                onClick={() => setEmbedViewMode('preview')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: embedViewMode === 'preview' ? '#105652' : 'white',
                  color: embedViewMode === 'preview' ? 'white' : '#105652',
                  border: `2px solid #105652`,
                }}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>
            
            {/* Code View */}
            {embedViewMode === 'code' && (
              <div className="space-y-3">
                <textarea
                  value={embedCode}
                  onChange={(e) => setEmbedCode(e.target.value)}
                  placeholder='<iframe src="https://example.com" width="560" height="315"></iframe>'
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm"
                  style={{ borderColor: '#105652', minHeight: '120px' }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleInsertEmbed}
                    disabled={!embedCode.trim()}
                    className="px-4 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#105652' }}
                  >
                    Insert Embed
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmbedInput(false);
                      setEmbedCode('');
                      setEmbedViewMode('preview');
                    }}
                    className="px-4 py-2 rounded-lg border"
                    style={{ borderColor: '#105652', color: '#105652' }}
                  >
                    Cancel
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Tip: The embed will use dimensions from the code, or default to 560x315px
                </div>
              </div>
            )}
            
            {/* Preview View */}
            {embedViewMode === 'preview' && embedCode && (
              <div className="space-y-3">
                <div 
                  className="border-2 rounded-lg p-4 bg-white"
                  style={{ borderColor: '#105652', minHeight: '200px' }}
                  dangerouslySetInnerHTML={{ __html: embedCode }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleInsertEmbed}
                    className="px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: '#105652' }}
                  >
                    Insert Embed
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmbedViewMode('code')}
                    className="px-4 py-2 rounded-lg border"
                    style={{ borderColor: '#105652', color: '#105652' }}
                  >
                    Edit Code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmbedInput(false);
                      setEmbedCode('');
                      setEmbedViewMode('preview');
                    }}
                    className="px-4 py-2 rounded-lg border"
                    style={{ borderColor: '#105652', color: '#105652' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {embedViewMode === 'preview' && !embedCode && (
              <div className="text-center py-8 text-gray-500">
                <FileCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Switch to Code View to paste your embed code</p>
              </div>
            )}
          </div>
        )}

        {/* Divider Input */}
        {showDividerInput && (
          <div className="p-3 border-b bg-gray-50" style={{ borderColor: '#e5e7eb' }}>
            <div className="mb-3">
              <p className="text-sm font-semibold mb-1" style={{ color: '#105652' }}>
                {selectedDivider ? 'Edit Divider' : 'Insert Divider'}
              </p>
              <p className="text-xs text-gray-600">
                Choose a design and customize the divider appearance
              </p>
            </div>
            
            {/* Design Selection */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-700 block mb-2">
                Divider Design
              </label>
              <div className="grid grid-cols-2 gap-2">
                {dividerDesigns.map((design) => (
                  <button
                    key={design.id}
                    type="button"
                    onClick={() => setDividerDesign(design.id)}
                    className={`px-3 py-2 rounded border text-left transition-colors ${
                      dividerDesign === design.id ? 'bg-teal-50 border-teal-600' : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xs font-semibold" style={{ color: dividerDesign === design.id ? '#105652' : '#4a5568' }}>
                      {design.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 font-mono">
                      {design.preview}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Color Picker (hidden for 'none' design) */}
            {dividerDesign !== 'none' && (
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-700 block mb-2">
                  Divider Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={dividerColor}
                    onChange={(e) => setDividerColor(e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                    style={{ borderColor: '#105652' }}
                  />
                  <input
                    type="text"
                    value={dividerColor}
                    onChange={(e) => setDividerColor(e.target.value)}
                    placeholder="#105652"
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm"
                    style={{ borderColor: '#105652' }}
                  />
                </div>
              </div>
            )}
            
            {/* Width Slider */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-700 block mb-2">
                Width: {dividerWidth}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={dividerWidth}
                onChange={(e) => setDividerWidth(parseInt(e.target.value))}
                className="w-full"
                style={{ accentColor: '#105652' }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10%</span>
                <span>100%</span>
              </div>
            </div>
            
            {/* Thickness Slider (hidden for 'none' design) */}
            {dividerDesign !== 'none' && (
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-700 block mb-2">
                  Thickness: {dividerThickness}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={dividerThickness}
                  onChange={(e) => setDividerThickness(parseInt(e.target.value))}
                  className="w-full"
                  style={{ accentColor: '#105652' }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1px</span>
                  <span>10px</span>
                </div>
              </div>
            )}
            
            {/* Gap Top Slider */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-700 block mb-2">
                Gap Above: {dividerGapTop}px
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={dividerGapTop}
                onChange={(e) => setDividerGapTop(parseInt(e.target.value))}
                className="w-full"
                style={{ accentColor: '#105652' }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0px</span>
                <span>100px</span>
              </div>
            </div>
            
            {/* Gap Bottom Slider */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-700 block mb-2">
                Gap Below: {dividerGapBottom}px
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={dividerGapBottom}
                onChange={(e) => setDividerGapBottom(parseInt(e.target.value))}
                className="w-full"
                style={{ accentColor: '#105652' }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0px</span>
                <span>100px</span>
              </div>
            </div>
            
            {/* Preview */}
            <div className="mb-4 p-4 bg-white border rounded" style={{ borderColor: '#105652' }}>
              <p className="text-xs font-medium text-gray-700 mb-2">Preview:</p>
              <div style={{ marginTop: `${dividerGapTop}px`, marginBottom: `${dividerGapBottom}px`, textAlign: 'center' }}>
                <div style={{
                  display: 'inline-block',
                  width: `${dividerWidth}%`,
                  height: dividerDesign === 'stars' ? 'auto' : `${dividerThickness}px`,
                  background: dividerDesign === 'solid' ? dividerColor : 
                             dividerDesign === 'gradient' ? `linear-gradient(to right, transparent, ${dividerColor}, transparent)` :
                             dividerDesign === 'none' ? 'transparent' : 'none',
                  borderTop: dividerDesign === 'dashed' ? `${dividerThickness}px dashed ${dividerColor}` :
                            dividerDesign === 'dotted' ? `${dividerThickness}px dotted ${dividerColor}` : 'none',
                  borderBottom: dividerDesign === 'double' ? `${Math.max(1, Math.floor(dividerThickness / 3))}px solid ${dividerColor}` : 'none',
                  color: dividerDesign === 'stars' ? dividerColor : 'inherit',
                  fontSize: dividerDesign === 'stars' ? `${dividerThickness * 4}px` : 'inherit',
                  letterSpacing: dividerDesign === 'stars' ? '10px' : 'normal',
                }}>
                  {dividerDesign === 'stars' ? '✦ '.repeat(Math.floor(dividerWidth / 5)) : ''}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveDivider}
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: '#105652' }}
              >
                {selectedDivider ? 'Update' : 'Insert'} Divider
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDividerInput(false);
                  setSelectedDivider(null);
                  // Reset to defaults
                  setDividerDesign('solid');
                  setDividerColor('#105652');
                  setDividerWidth(100);
                  setDividerThickness(2);
                  setDividerGapTop(20);
                  setDividerGapBottom(20);
                }}
                className="px-4 py-2 rounded-lg border"
                style={{ borderColor: '#105652', color: '#105652' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Editor */}
      <style>{`
        .rich-text-editor ul {
          list-style-type: disc;
          padding-left: 2rem;
          margin: 1rem 0;
        }
        .rich-text-editor ol {
          list-style-type: decimal;
          padding-left: 2rem;
          margin: 1rem 0;
        }
        .rich-text-editor li {
          margin: 0.5rem 0;
          color: #4a5568;
          line-height: 1.8;
        }
        .rich-text-editor blockquote {
          overflow: auto;
          clear: none;
        }
        .rich-text-editor img {
          clear: none;
        }
        .rich-text-editor p,
        .rich-text-editor h1,
        .rich-text-editor h2,
        .rich-text-editor h3,
        .rich-text-editor h4,
        .rich-text-editor h5,
        .rich-text-editor h6,
        .rich-text-editor pre {
          clear: none;
        }
        .rich-text-editor a.editor-link {
          color: #1E8479;
          text-decoration: underline;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rich-text-editor a.editor-link:hover {
          color: #105652;
          text-decoration: underline;
          background-color: #f0fdfa;
        }
        .editor-quoteblock-wrapper {
          overflow: hidden;
          clear: none;
        }
        
        /* Embed Fullscreen Button */
        .editor-embed-wrapper:hover .embed-fullscreen-btn {
          opacity: 1 !important;
        }
        .embed-fullscreen-btn:hover {
          background: rgba(16, 86, 82, 1) !important;
          transform: scale(1.05);
        }
        
        /* Video Controls CSS */
        .editor-video-wrapper {
          position: relative;
          display: block;
          margin: 1rem 0;
        }
        
        .editor-video-wrapper.align-left {
          margin-left: 0;
          margin-right: auto;
        }
        
        .editor-video-wrapper.align-center {
          margin-left: auto;
          margin-right: auto;
        }
        
        .editor-video-wrapper.align-right {
          margin-left: auto;
          margin-right: 0;
        }
        
        .video-controls-overlay {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 20;
        }
        
        .editor-video-wrapper:hover .video-controls-overlay {
          opacity: 1;
        }
        
        .video-control-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transition: transform 0.2s;
        }
        
        .video-control-btn:hover {
          transform: scale(1.1);
        }
        
        .video-edit-btn {
          background: #16a34a;
          color: white;
        }
        
        .video-delete-btn {
          background: #dc2626;
          color: white;
        }
      `}</style>
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={updateContent}
          onMouseDown={(e) => {
            // Prevent any button clicks inside editor from submitting forms
            if (e.target.closest('button')) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          className="rich-text-editor min-h-[400px] p-4 focus:outline-none"
          style={{
            color: '#4a5568',
            lineHeight: '1.8',
            direction: 'ltr',
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
        />
        
        {/* Image Resize Handles */}
        {selectedImage && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: selectedImage.offsetTop + 'px',
              left: selectedImage.offsetLeft + 'px',
              width: selectedImage.offsetWidth + 'px',
              height: selectedImage.offsetHeight + 'px',
              border: '2px solid #105652',
              boxShadow: '0 0 0 1px white',
            }}
          >
            {/* Corner Handles */}
            {['nw', 'ne', 'sw', 'se'].map((handle) => (
              <div
                key={handle}
                className="resize-handle absolute pointer-events-auto cursor-pointer"
                onMouseDown={(e) => startResize(e, handle)}
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#105652',
                  border: '2px solid white',
                  borderRadius: '50%',
                  ...(handle.includes('n') ? { top: '-6px' } : { bottom: '-6px' }),
                  ...(handle.includes('w') ? { left: '-6px' } : { right: '-6px' }),
                  cursor: `${handle}-resize`,
                }}
              />
            ))}
            
            {/* Edge Handles */}
            {['n', 'e', 's', 'w'].map((handle) => (
              <div
                key={handle}
                className="resize-handle absolute pointer-events-auto cursor-pointer"
                onMouseDown={(e) => startResize(e, handle)}
                style={{
                  width: handle === 'n' || handle === 's' ? '12px' : '12px',
                  height: handle === 'e' || handle === 'w' ? '12px' : '12px',
                  backgroundColor: '#105652',
                  border: '2px solid white',
                  borderRadius: '50%',
                  ...(handle === 'n' && { top: '-6px', left: '50%', transform: 'translateX(-50%)' }),
                  ...(handle === 's' && { bottom: '-6px', left: '50%', transform: 'translateX(-50%)' }),
                  ...(handle === 'e' && { right: '-6px', top: '50%', transform: 'translateY(-50%)' }),
                  ...(handle === 'w' && { left: '-6px', top: '50%', transform: 'translateY(-50%)' }),
                  cursor: `${handle}-resize`,
                }}
              />
            ))}
            
            {/* Delete Button */}
            <button
              type="button"
              onClick={() => {
                selectedImage.remove();
                setSelectedImage(null);
                updateContent();
              }}
              className="absolute pointer-events-auto bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg transition-colors"
              style={{
                top: '-40px',
                right: '-10px',
              }}
              title="Delete Image (or press Delete/Backspace)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            {/* Text Wrap Button */}
            <button
              type="button"
              onClick={() => setShowTextWrapOptions(!showTextWrapOptions)}
              className="absolute pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2 shadow-lg transition-colors text-sm font-medium"
              style={{
                top: '-40px',
                left: '-10px',
              }}
              title="Text Wrap Options"
            >
              Text Wrap
            </button>
            
            {/* Text Wrap Options Panel */}
            {showTextWrapOptions && (
              <div
                className="absolute pointer-events-auto bg-white border-2 rounded-lg shadow-xl p-4 z-50"
                style={{
                  top: '-120px',
                  left: '-10px',
                  width: '280px',
                  borderColor: '#105652',
                }}
              >
                <h4 className="text-sm font-bold mb-3" style={{ color: '#105652' }}>
                  Text Wrap Settings
                </h4>
                
                {/* Gap Slider */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-gray-700 block mb-2">
                    Gap: {textWrapGap}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={textWrapGap}
                    onChange={(e) => {
                      const newGap = parseInt(e.target.value);
                      setTextWrapGap(newGap);
                      if (textWrapEnabled) {
                        applyTextWrap(true, newGap);
                      }
                    }}
                    className="w-full"
                    style={{ accentColor: '#105652' }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0px</span>
                    <span>50px</span>
                  </div>
                </div>
                
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Enable Wrap</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newEnabled = !textWrapEnabled;
                      setTextWrapEnabled(newEnabled);
                      applyTextWrap(newEnabled, textWrapGap);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      textWrapEnabled ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        textWrapEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-200">
                  <strong>Note:</strong> Text wrap only works with left or right aligned images. 
                  Text will flow around the image with the specified gap.
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowTextWrapOptions(false)}
                  className="mt-3 w-full px-3 py-2 rounded text-white text-sm"
                  style={{ backgroundColor: '#105652' }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Video Selection Overlay */}
        {selectedVideo && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: selectedVideo.offsetTop + 'px',
              left: selectedVideo.offsetLeft + 'px',
              width: selectedVideo.offsetWidth + 'px',
              height: selectedVideo.offsetHeight + 'px',
              border: '2px solid #105652',
              boxShadow: '0 0 0 1px white',
              zIndex: 40
            }}
          >
            {/* Delete Button */}
            <button
              type="button"
              onClick={() => {
                selectedVideo.remove();
                setSelectedVideo(null);
                updateContent();
              }}
              className="absolute pointer-events-auto bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg transition-colors"
              style={{
                top: '-40px',
                right: '-10px',
              }}
              title="Delete Video (or press Delete/Backspace)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            {/* Edit Button */}
            <button
              type="button"
              onClick={() => handleEditVideo(selectedVideo)}
              className="absolute pointer-events-auto bg-teal-600 hover:bg-teal-700 text-white rounded px-3 py-2 shadow-lg transition-colors text-sm font-medium"
              style={{
                top: '-40px',
                right: '30px',
              }}
              title="Edit Video"
            >
              <Settings className="w-4 h-4 inline mr-1" />
              Edit
            </button>
          </div>
        )}

        {/* Audio Player Overlay */}
        {selectedAudioPlayer && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: selectedAudioPlayer.offsetTop + 'px',
              left: selectedAudioPlayer.offsetLeft + 'px',
              width: selectedAudioPlayer.offsetWidth + 'px',
              height: selectedAudioPlayer.offsetHeight + 'px',
              border: '2px solid #105652',
              boxShadow: '0 0 0 1px white',
              zIndex: 40
            }}
          >
            {/* Delete Button */}
            <button
              type="button"
              onClick={() => {
                selectedAudioPlayer.remove();
                setSelectedAudioPlayer(null);
                updateContent();
              }}
              className="absolute pointer-events-auto bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg transition-colors"
              style={{
                top: '-40px',
                right: '-10px',
              }}
              title="Delete Audio Player"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            {/* Edit Button */}
            <button
              type="button"
              onClick={() => handleEditAudioPlayer(selectedAudioPlayer)}
              className="absolute pointer-events-auto bg-teal-600 hover:bg-teal-700 text-white rounded px-3 py-2 shadow-lg transition-colors text-sm font-medium"
              style={{
                top: '-40px',
                right: '30px',
              }}
              title="Edit Audio Player"
            >
              <Settings className="w-4 h-4 inline mr-1" />
              Edit
            </button>
          </div>
        )}

        {/* Quoteblock Overlay */}
        {selectedQuoteblock && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: selectedQuoteblock.offsetTop + 'px',
              left: selectedQuoteblock.offsetLeft + 'px',
              width: selectedQuoteblock.offsetWidth + 'px',
              height: selectedQuoteblock.offsetHeight + 'px',
              border: '2px solid #105652',
              boxShadow: '0 0 0 1px white',
              zIndex: 40
            }}
          >
            {/* Delete Button */}
            <button
              type="button"
              onClick={() => {
                selectedQuoteblock.remove();
                setSelectedQuoteblock(null);
                updateContent();
              }}
              className="absolute pointer-events-auto bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg transition-colors"
              style={{
                top: '-40px',
                right: '-10px',
              }}
              title="Delete Quoteblock"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            {/* Edit Button */}
            <button
              type="button"
              onClick={() => handleEditQuoteblock(selectedQuoteblock)}
              className="absolute pointer-events-auto bg-teal-600 hover:bg-teal-700 text-white rounded px-3 py-2 shadow-lg transition-colors text-sm font-medium"
              style={{
                top: '-40px',
                right: '30px',
              }}
              title="Edit Quoteblock"
            >
              <Quote className="w-4 h-4 inline mr-1" />
              Edit
            </button>
            

          </div>
        )}
        
        {/* Embed Resize Handles */}
        {selectedEmbed && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: selectedEmbed.offsetTop + 'px',
              left: selectedEmbed.offsetLeft + 'px',
              width: selectedEmbed.offsetWidth + 'px',
              height: selectedEmbed.offsetHeight + 'px',
              border: '2px solid #105652',
              boxShadow: '0 0 0 1px white',
            }}
          >
            {/* Corner Handles */}
            {['nw', 'ne', 'sw', 'se'].map((handle) => (
              <div
                key={handle}
                className="resize-handle absolute pointer-events-auto cursor-pointer"
                onMouseDown={(e) => startEmbedResize(e, handle)}
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#105652',
                  border: '2px solid white',
                  borderRadius: '50%',
                  ...(handle.includes('n') ? { top: '-6px' } : { bottom: '-6px' }),
                  ...(handle.includes('w') ? { left: '-6px' } : { right: '-6px' }),
                  cursor: `${handle}-resize`,
                }}
              />
            ))}
            
            {/* Edge Handles */}
            {['n', 'e', 's', 'w'].map((handle) => (
              <div
                key={handle}
                className="resize-handle absolute pointer-events-auto cursor-pointer"
                onMouseDown={(e) => startEmbedResize(e, handle)}
                style={{
                  width: handle === 'n' || handle === 's' ? '12px' : '12px',
                  height: handle === 'e' || handle === 'w' ? '12px' : '12px',
                  backgroundColor: '#105652',
                  border: '2px solid white',
                  borderRadius: '50%',
                  ...(handle === 'n' && { top: '-6px', left: '50%', transform: 'translateX(-50%)' }),
                  ...(handle === 's' && { bottom: '-6px', left: '50%', transform: 'translateX(-50%)' }),
                  ...(handle === 'e' && { right: '-6px', top: '50%', transform: 'translateY(-50%)' }),
                  ...(handle === 'w' && { left: '-6px', top: '50%', transform: 'translateY(-50%)' }),
                  cursor: `${handle}-resize`,
                }}
              />
            ))}
            
            {/* Delete Button */}
            <button
              type="button"
              onClick={() => {
                selectedEmbed.remove();
                setSelectedEmbed(null);
                updateContent();
              }}
              className="absolute pointer-events-auto bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg transition-colors"
              style={{
                top: '-40px',
                right: '-10px',
              }}
              title="Delete Embed (or press Delete/Backspace)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            {/* View Code Button */}
            <button
              type="button"
              onClick={() => setShowEmbedCodeView(!showEmbedCodeView)}
              className="absolute pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2 shadow-lg transition-colors text-sm font-medium"
              style={{
                top: '-40px',
                left: '-10px',
              }}
              title="View/Edit Code"
            >
              <FileCode className="w-4 h-4 inline mr-1" />
              Code
            </button>
            
            {/* Edit Button Settings */}
            {selectedButton && (
              <button
                type="button"
                onClick={() => handleEditButton(selectedButton)}
                className="absolute pointer-events-auto bg-teal-600 hover:bg-teal-700 text-white rounded px-3 py-2 shadow-lg transition-colors text-sm font-medium z-50"
                style={{
                  top: `${buttonPosition.top}px`,
                  left: `${buttonPosition.left}px`,
                  transform: 'translateX(-50%)',
                }}
                title="Edit Button"
              >
                <Settings className="w-4 h-4 inline mr-1" />
                Edit Button
              </button>
            )}

            {/* Border Settings Button */}
            <button
              type="button"
              onClick={() => setShowBorderSettings(!showBorderSettings)}
              className="absolute pointer-events-auto bg-purple-600 hover:bg-purple-700 text-white rounded px-3 py-2 shadow-lg transition-colors text-sm font-medium"
              style={{
                top: '-40px',
                left: '90px',
              }}
              title="Border Settings"
            >
              <Settings className="w-4 h-4 inline mr-1" />
              Border
            </button>
            
            {/* Interaction Hint */}
            <div
              className="absolute pointer-events-none bg-blue-600 text-white text-xs px-3 py-1 rounded shadow-lg"
              style={{
                bottom: '-35px',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
              }}
            >
              💡 Click center to interact, edges to select
            </div>
            
            {/* Code View Panel */}
            {showEmbedCodeView && (
              <div
                className="absolute pointer-events-auto bg-white border-2 rounded-lg shadow-xl p-4 z-50"
                style={{
                  top: '-250px',
                  left: '-10px',
                  width: '500px',
                  borderColor: '#105652',
                }}
              >
                <h4 className="text-sm font-bold mb-3" style={{ color: '#105652' }}>
                  Embed Code
                </h4>
                
                {/* View Mode Tabs */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setEmbedCodeViewMode('code')}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    style={{
                      backgroundColor: embedCodeViewMode === 'code' ? '#105652' : 'white',
                      color: embedCodeViewMode === 'code' ? 'white' : '#105652',
                      border: `2px solid #105652`,
                    }}
                  >
                    <FileCode className="w-4 h-4" />
                    Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmbedCodeViewMode('preview')}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    style={{
                      backgroundColor: embedCodeViewMode === 'preview' ? '#105652' : 'white',
                      color: embedCodeViewMode === 'preview' ? 'white' : '#105652',
                      border: `2px solid #105652`,
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                </div>
                
                {/* Code View */}
                {embedCodeViewMode === 'code' && (
                  <div className="space-y-3">
                    <textarea
                      value={editingEmbedCode}
                      onChange={(e) => setEditingEmbedCode(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm"
                      style={{ borderColor: '#105652', minHeight: '150px' }}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={updateEmbedCode}
                        disabled={!editingEmbedCode.trim()}
                        className="px-4 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        style={{ backgroundColor: '#105652' }}
                      >
                        Update Embed
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEmbedCodeView(false)}
                        className="px-4 py-2 rounded-lg border text-sm"
                        style={{ borderColor: '#105652', color: '#105652' }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Preview View */}
                {embedCodeViewMode === 'preview' && editingEmbedCode && (
                  <div className="space-y-3">
                    <div 
                      className="border-2 rounded-lg p-4 bg-white"
                      style={{ borderColor: '#105652', minHeight: '150px', maxHeight: '300px', overflow: 'auto' }}
                      dangerouslySetInnerHTML={{ __html: editingEmbedCode }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmbedCodeView(false)}
                      className="w-full px-4 py-2 rounded-lg border text-sm"
                      style={{ borderColor: '#105652', color: '#105652' }}
                    >
                      Close
                    </button>
                  </div>
                )}
                
                {embedCodeViewMode === 'preview' && !editingEmbedCode && (
                  <div className="text-center py-8 text-gray-500">
                    <FileCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No embed code available</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Border Settings Panel */}
            {showBorderSettings && (
              <div
                className="absolute pointer-events-auto bg-white border-2 rounded-lg shadow-xl p-4 z-50"
                style={{
                  top: '-200px',
                  left: '-10px',
                  width: '320px',
                  borderColor: '#105652',
                }}
              >
                <h4 className="text-sm font-bold mb-3" style={{ color: '#105652' }}>
                  Border Settings
                </h4>
                
                {/* Border Style */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-gray-700 block mb-2">
                    Border Style
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['solid', 'dashed', 'dotted', 'none'].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => {
                          setBorderStyle(style);
                          if (style !== 'none') {
                            applyBorderSettings();
                          }
                        }}
                        className={`px-3 py-2 rounded border text-xs font-medium transition-colors ${
                          borderStyle === style ? 'bg-green-100' : 'bg-white hover:bg-gray-50'
                        }`}
                        style={{ 
                          borderColor: borderStyle === style ? '#105652' : '#e5e7eb',
                          borderWidth: '2px',
                          color: borderStyle === style ? '#105652' : '#4a5568'
                        }}
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                {borderStyle !== 'none' && (
                  <>
                    {/* Border Width */}
                    <div className="mb-4">
                      <label className="text-xs font-medium text-gray-700 block mb-2">
                        Border Width: {borderWidth}px
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={borderWidth}
                        onChange={(e) => {
                          setBorderWidth(parseInt(e.target.value));
                        }}
                        className="w-full"
                        style={{ accentColor: '#105652' }}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1px</span>
                        <span>20px</span>
                      </div>
                    </div>
                    
                    {/* Border Color */}
                    <div className="mb-4">
                      <label className="text-xs font-medium text-gray-700 block mb-2">
                        Border Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={borderColor}
                          onChange={(e) => setBorderColor(e.target.value)}
                          className="w-12 h-10 rounded border cursor-pointer"
                          style={{ borderColor: '#105652' }}
                        />
                        <input
                          type="text"
                          value={borderColor}
                          onChange={(e) => setBorderColor(e.target.value)}
                          placeholder="#105652"
                          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm"
                          style={{ borderColor: '#105652' }}
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {/* Apply Button */}
                <button
                  type="button"
                  onClick={() => {
                    applyBorderSettings();
                    setShowBorderSettings(false);
                  }}
                  className="w-full px-3 py-2 rounded text-white text-sm font-medium"
                  style={{ backgroundColor: '#105652' }}
                >
                  Apply Border
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowBorderSettings(false)}
                  className="mt-2 w-full px-3 py-2 rounded border text-sm"
                  style={{ borderColor: '#105652', color: '#105652' }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* FAQ Selection Overlay */}
        {selectedFaq && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: selectedFaq.offsetTop + 'px',
              left: selectedFaq.offsetLeft + 'px',
              width: selectedFaq.offsetWidth + 'px',
              height: selectedFaq.offsetHeight + 'px',
              border: '2px solid #105652',
              boxShadow: '0 0 0 1px white',
              zIndex: 40
            }}
          >
            {/* Delete Button */}
            <button
              type="button"
              onClick={() => {
                selectedFaq.remove();
                setSelectedFaq(null);
                updateContent();
              }}
              className="absolute pointer-events-auto bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg transition-colors"
              style={{
                top: '-40px',
                right: '-10px',
              }}
              title="Delete FAQ (or press Delete/Backspace)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            {/* Edit Button */}
            <button
              type="button"
              onClick={() => handleEditFaq(selectedFaq)}
              className="absolute pointer-events-auto bg-teal-600 hover:bg-teal-700 text-white rounded px-3 py-2 shadow-lg transition-colors text-sm font-medium"
              style={{
                top: '-40px',
                right: '30px',
              }}
              title="Edit FAQ"
            >
              <Settings className="w-4 h-4 inline mr-1" />
              Edit
            </button>
            
            {/* Hint */}
            <div
              className="absolute pointer-events-none bg-blue-600 text-white text-xs px-3 py-1 rounded shadow-lg"
              style={{
                bottom: '-35px',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
              }}
            >
              💡 Click title to toggle | Click content to edit
            </div>
          </div>
        )}
        
        {/* Photo Grid Selection Overlay */}
        {selectedPhotoGrid && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: selectedPhotoGrid.offsetTop + 'px',
              left: selectedPhotoGrid.offsetLeft + 'px',
              width: selectedPhotoGrid.offsetWidth + 'px',
              height: selectedPhotoGrid.offsetHeight + 'px',
              border: '2px solid #105652',
              boxShadow: '0 0 0 1px white',
              zIndex: 40
            }}
          >
            {/* Delete Button */}
            <button
              type="button"
              onClick={() => {
                selectedPhotoGrid.remove();
                setSelectedPhotoGrid(null);
                updateContent();
              }}
              className="absolute pointer-events-auto bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg transition-colors"
              style={{
                top: '-40px',
                right: '-10px',
              }}
              title="Delete Photo Grid"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            {/* Edit Button */}
            <button
              type="button"
              onClick={() => handleEditPhotoGrid(selectedPhotoGrid)}
              className="absolute pointer-events-auto bg-teal-600 hover:bg-teal-700 text-white rounded px-3 py-2 shadow-lg transition-colors text-sm font-medium"
              style={{
                top: '-40px',
                right: '30px',
              }}
              title="Edit Photo Grid"
            >
              <Settings className="w-4 h-4 inline mr-1" />
              Edit
            </button>
          </div>
        )}
        
        {/* Divider Selection Overlay */}
        {selectedDivider && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: selectedDivider.offsetTop + 'px',
              left: selectedDivider.offsetLeft + 'px',
              width: selectedDivider.offsetWidth + 'px',
              height: selectedDivider.offsetHeight + 'px',
              border: '2px solid #105652',
              boxShadow: '0 0 0 1px white',
              zIndex: 40
            }}
          >
            {/* Delete Button */}
            <button
              type="button"
              onClick={() => {
                selectedDivider.remove();
                setSelectedDivider(null);
                updateContent();
              }}
              className="absolute pointer-events-auto bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg transition-colors"
              style={{
                top: '-40px',
                right: '-10px',
              }}
              title="Delete Divider (or press Delete/Backspace)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            {/* Edit Button */}
            <button
              type="button"
              onClick={() => handleEditDivider(selectedDivider)}
              className="absolute pointer-events-auto bg-teal-600 hover:bg-teal-700 text-white rounded px-3 py-2 shadow-lg transition-colors text-sm font-medium"
              style={{
                top: '-40px',
                right: '30px',
              }}
              title="Edit Divider"
            >
              <Settings className="w-4 h-4 inline mr-1" />
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="p-3 border-t bg-gray-50 text-sm text-gray-600" style={{ borderColor: '#e5e7eb' }}>
        <p>
          <strong>Tips:</strong> Select text before applying font, color, or size changes. 
          Click on images to select and resize them using the drag handles. 
          Delete selected images with Delete/Backspace key or the delete button. 
          Images are inserted at cursor position.
        </p>
      </div>
      {/* Quoteblock Input Modal */}
      {showQuoteblockInput && (
        <QuoteblockInput
          initialData={quoteblockData}
          customFonts={customFonts}
          googleFonts={GOOGLE_FONTS}
          onSave={handleSaveQuoteblock}
          onCancel={() => {
            setShowQuoteblockInput(false);
            setEditingQuoteblock(null);
            setQuoteblockData(null);
          }}
        />
      )}
      
      {/* Button Input Modal */}
      {showButtonInput && (
        <ButtonInput
          initialData={buttonData}
          customFonts={customFonts}
          googleFonts={GOOGLE_FONTS}
          onSave={handleSaveButton}
          onCancel={() => {
            setShowButtonInput(false);
            setEditingButton(null);
            setButtonData(null);
          }}
        />
      )}
      {showCodeBlockInput && (
        <CodeBlockInput
          initialData={codeBlockData}
          onSave={handleSaveCodeBlock}
          onCancel={() => {
            setShowCodeBlockInput(false);
            setEditingCodeBlock(null);
            setCodeBlockData(null);
          }}
        />
      )}
      {showAudioInput && (
        <AudioInput
          initialData={audioPlayerData}
          onSave={handleSaveAudioPlayer}
          onCancel={() => {
            setShowAudioInput(false);
            setEditingAudioPlayer(null);
            setAudioPlayerData(null);
          }}
        />
      )}
      {showVideoInput && (
        <VideoInput
          initialData={videoData}
          onSave={handleSaveVideo}
          onCancel={() => {
            setShowVideoInput(false);
            setEditingVideoId(null);
            setVideoData(null);
          }}
        />
      )}
      {showFaqInput && (
        <FaqInput
          initialData={faqData}
          customFonts={customFonts}
          onSave={handleSaveFaq}
          onCancel={() => {
            setShowFaqInput(false);
            setEditingFaq(null);
            setFaqData(null);
          }}
        />
      )}
      {showTableInput && (
        <TableInput
          initialData={tableData}
          onSave={handleSaveTable}
          onCancel={() => {
            setShowTableInput(false);
            setEditingTable(null);
            setTableData(null);
          }}
        />
      )}
      {showSocialLinksInput && (
        <SocialLinksInput
          initialData={socialLinksData}
          onSave={handleSaveSocialLinks}
          onCancel={() => {
            setShowSocialLinksInput(false);
            setEditingSocialLinks(null);
            setSocialLinksData(null);
          }}
        />
      )}
      {showAuthorInput && (
        <AuthorInput
          initialData={authorData}
          onSave={handleSaveAuthor}
          onCancel={() => {
            setShowAuthorInput(false);
            setEditingAuthor(null);
            setAuthorData(null);
          }}
        />
      )}
      {showFileUploadInput && (
        <FileUploadInput
          initialData={fileDownloadData}
          onSave={handleSaveFileDownload}
          onCancel={() => {
            setShowFileUploadInput(false);
            setEditingFileDownload(null);
            setFileDownloadData(null);
          }}
        />
      )}
      {showPhotoGridInput && (
        <PhotoGridInput
          initialData={photoGridData}
          onSave={handleSavePhotoGrid}
          onCancel={() => {
            setShowPhotoGridInput(false);
            setEditingPhotoGrid(null);
            setPhotoGridData(null);
          }}
        />
      )}
      
      {/* Fullscreen Embed Modal */}
      {fullscreenEmbed && (
        <div
          className="fixed inset-0 z-[99999] bg-black flex items-center justify-center"
          style={{ margin: 0, padding: 0 }}
          onClick={closeFullscreenEmbed}
        >
          {/* Close Button */}
          <button
            onClick={closeFullscreenEmbed}
            className="absolute top-4 right-4 z-[100000] p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-110"
            style={{ color: 'white' }}
            title="Close Fullscreen (ESC)"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          {/* Embed Content */}
          <div
            className="w-full h-full"
            style={{ maxWidth: '100vw', maxHeight: '100vh' }}
            onClick={(e) => e.stopPropagation()}
            dangerouslySetInnerHTML={{ 
              __html: fullscreenEmbed.replace(/width\s*=\s*["'][^"']*["']/gi, 'width="100%"').replace(/height\s*=\s*["'][^"']*["']/gi, 'height="100%"').replace(/<iframe/gi, '<iframe style="width:100%;height:100%;border:none;"')
            }}
          />
        </div>
      )}
    </div>
  );
}
