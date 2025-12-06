import React, { createContext, useContext, useEffect, useState } from 'react';
import { GOOGLE_FONTS, loadGoogleFont } from '../utils/googleFonts';
import { databaseService } from '../lib/appwrite';
import { loadCustomFont } from '../utils/fontLoader';

const FontContext = createContext();

export const useFonts = () => {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFonts must be used within a FontProvider');
  }
  return context;
};

export const FontProvider = ({ children }) => {
  const [customFonts, setCustomFonts] = useState([]);
  const [allFonts, setAllFonts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load custom fonts from database
  const loadCustomFonts = async () => {
    try {
      const result = await databaseService.listDocuments('custom_fonts', 100);
      if (result.success) {
        const fonts = result.data.documents;
        setCustomFonts(fonts);
        
        // Load custom fonts into DOM
        fonts.forEach(font => {
          loadCustomFont(font.fontName, font.fileUrl);
        });
        
        return fonts;
      }
      return [];
    } catch (error) {
      console.error('Error loading custom fonts:', error);
      return [];
    }
  };

  // Initialize fonts
  useEffect(() => {
    const initFonts = async () => {
      setLoading(true);
      const customFontsList = await loadCustomFonts();
      
      // Combine Google Fonts and Custom Fonts
      const combined = [
        ...customFontsList.map(font => ({
          name: font.fontName,
          value: `'${font.fontName}', sans-serif`,
          category: 'custom',
          bangla: false,
          isCustom: true,
          id: font.$id,
        })),
        ...GOOGLE_FONTS,
      ];
      
      setAllFonts(combined);
      setLoading(false);
    };

    initFonts();
  }, []);

  // Function to load a specific Google Font
  const loadFont = (fontName) => {
    const font = GOOGLE_FONTS.find(f => f.name === fontName);
    if (font) {
      loadGoogleFont(fontName);
    }
  };

  // Function to get fonts by category
  const getFontsByCategory = (category) => {
    return allFonts.filter(f => f.category === category);
  };

  // Function to get all Bangla fonts
  const getBanglaFonts = () => {
    return allFonts.filter(f => f.bangla);
  };

  // Function to refresh custom fonts (useful after adding/deleting)
  const refreshCustomFonts = async () => {
    const customFontsList = await loadCustomFonts();
    const combined = [
      ...customFontsList.map(font => ({
        name: font.fontName,
        value: `'${font.fontName}', sans-serif`,
        category: 'custom',
        bangla: false,
        isCustom: true,
        id: font.$id,
      })),
      ...GOOGLE_FONTS,
    ];
    setAllFonts(combined);
  };

  const value = {
    // All fonts (Google + Custom)
    allFonts,
    
    // Google Fonts only
    googleFonts: GOOGLE_FONTS,
    
    // Custom Fonts only
    customFonts,
    
    // Loading state
    loading,
    
    // Helper functions
    loadFont,
    getFontsByCategory,
    getBanglaFonts,
    refreshCustomFonts,
  };

  return <FontContext.Provider value={value}>{children}</FontContext.Provider>;
};
