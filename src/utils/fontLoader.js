// Utility for loading custom uploaded fonts
export const loadCustomFont = (fontName, fontUrl) => {
  // Check if font is already loaded
  const existingStyle = document.querySelector(`style[data-custom-font="${fontName}"]`);
  if (existingStyle) return;

  // Create @font-face rule
  const style = document.createElement('style');
  style.setAttribute('data-custom-font', fontName);
  style.textContent = `
    @font-face {
      font-family: '${fontName}';
      src: url('${fontUrl}') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
};

// Load all custom fonts from database
export const loadAllCustomFonts = (customFonts) => {
  if (!Array.isArray(customFonts)) return;
  
  customFonts.forEach(font => {
    if (font.name && font.fileUrl) {
      loadCustomFont(font.name, font.fileUrl);
    }
  });
};

// Remove custom font
export const removeCustomFont = (fontName) => {
  const existingStyle = document.querySelector(`style[data-custom-font="${fontName}"]`);
  if (existingStyle) {
    existingStyle.remove();
  }
};
