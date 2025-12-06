# FAQ & Divider Features - Rich Text Editor

## Overview
Two powerful new features have been added to the Rich Text Editor:
1. **Divider** - Visual section separators with 10 different designs
2. **FAQ/Accordion** - Collapsible question-answer sections with full styling control

---

## 🔹 Divider Feature

### What is it?
A divider allows you to visually separate sections of content with customizable lines and spacing.

### How to Use
1. Click the **Minus icon (➖)** in the toolbar
2. Choose from 10 different designs
3. Customize color, width, thickness, and gaps
4. Click "Insert Divider"

### 10 Divider Designs

1. **Invisible** - Creates spacing without visible line (perfect for layout control)
2. **Solid Line** - Classic straight line
3. **Dashed Line** - Dashed border style
4. **Dotted Line** - Dotted border style
5. **Double Line** - Two parallel lines
6. **Gradient Fade** - Fades from transparent to color to transparent
7. **Wave Line** - Wavy pattern effect
8. **Zigzag Line** - Zigzag pattern
9. **Dot Pattern** - Repeating dots
10. **Star Pattern** - Decorative stars (✦)

### Customization Options

#### Design Selection
- Choose from 10 different visual styles
- Preview shown for each design

#### Color (hidden for invisible design)
- Color picker with hex input
- Quick color palette

#### Width
- Slider: 10% to 100%
- Controls how wide the divider spans

#### Thickness (hidden for invisible design)
- Slider: 1px to 10px
- Controls line thickness

#### Gap Above
- Slider: 0px to 100px
- Space above the divider

#### Gap Below
- Slider: 0px to 100px
- Space below the divider

#### Live Preview
- See changes in real-time before inserting

### Editing Dividers
1. Click on any divider to select it
2. Click the "Edit" button that appears
3. Modify settings
4. Click "Update Divider"

### Deleting Dividers
- Click the red delete button, OR
- Select divider and press Delete/Backspace key

---

## ❓ FAQ/Accordion Feature

### What is it?
An FAQ (Frequently Asked Questions) component that allows you to create collapsible question-answer sections with full control over fonts, colors, and styling.

### How to Use
1. Click the **Question Mark icon (❓)** in the toolbar
2. Enter your question/title
3. Enter your answer/content
4. Customize styling for both title and content
5. Set default state (open or closed)
6. Click "Insert FAQ"

### Features

#### Content Input
- **Title/Question** - The clickable header
- **Content/Answer** - The collapsible content area
- Supports multi-line text and paragraphs
- Use bullet points with "•" or numbers

#### Default State
- **Open by Default** - FAQ starts expanded
- **Closed by Default** - FAQ starts collapsed

#### Interactive Behavior
- Click title to toggle open/close
- Smooth chevron icon animation
- Content slides in/out

### Title Styling Options

#### Font Family
- Access to **70+ Google Fonts** organized by category:
  - Bangla Fonts (6 fonts)
  - Serif Fonts (20 fonts)
  - Sans-serif Fonts (20 fonts)
  - Display Fonts (15 fonts)
  - Certificate Fonts (12 fonts)
- Custom uploaded fonts from Font Management

#### Font Size
- Slider: 12px to 32px
- Real-time preview

#### Text Color
- Color picker with hex input
- Quick color palette (16 colors)

#### Background Color
- Color picker with hex input
- Quick color palette (8 colors)

#### Font Weight
- Light (300)
- Normal (400)
- Medium (500)
- Semibold (600)
- Bold (700)
- Extra Bold (800)

### Content Styling Options

#### Font Family
- Same 70+ Google Fonts available
- Custom fonts supported

#### Font Size
- Slider: 12px to 24px

#### Text Color
- Color picker with palette

#### Background Color
- Color picker with palette

### Border & Spacing

#### Border Color
- Color picker with hex input

#### Border Radius
- Slider: 0px to 24px
- Controls corner roundness

#### Padding
- Slider: 8px to 32px
- Controls internal spacing

### Live Preview
- See exactly how your FAQ will look
- Toggle between open/closed states
- All styling updates in real-time

### Editing FAQs
**Three ways to edit:**

1. **Click the content area** - Opens edit modal directly
2. **Click Edit button** - Select FAQ first, then click Edit button
3. **Double-click anywhere** - Quick access to edit modal

**Steps:**
1. Click on the FAQ content (answer area)
2. Edit modal opens with current settings
3. Modify any settings
4. Click "Update FAQ"

### Deleting FAQs
- Click the red delete button, OR
- Select FAQ and press Delete/Backspace key

### Interactive Usage
- **Click title bar** - Toggle open/close
- **Click content area** - Open edit modal
- **Chevron icon** - Rotates to indicate state
- **Content** - Smoothly appears/disappears
- **Edit button** - Alternative way to edit (when selected)

---

## 🎨 Global Font System

### What Changed?
All 70+ Google Fonts are now globally available throughout the project via a new `FontContext`.

### Available Fonts

#### Bangla Support (6 fonts)
- Noto Serif Bengali
- Noto Sans Bengali
- Hind Siliguri
- Tiro Bangla
- Mukta
- Baloo Da 2

#### Serif Fonts (20 fonts)
- Playfair Display, Merriweather, Crimson Text
- Libre Baskerville, Old Standard TT, Cormorant Garamond
- EB Garamond, Lora, Cinzel, Spectral
- PT Serif, Georgia, Bitter, Cardo
- Vollkorn, Alegreya, Crimson Pro, Literata
- Source Serif Pro, Zilla Slab

#### Sans-serif Fonts (20 fonts)
- Roboto, Open Sans, Lato, Montserrat
- Raleway, Poppins, Inter, Work Sans
- Nunito, Rubik, Karla, Quicksand
- Josefin Sans, Barlow, DM Sans, Manrope
- Outfit, Space Grotesk, Plus Jakarta Sans, Lexend

#### Display Fonts (15 fonts)
- Bebas Neue, Oswald, Abril Fatface
- Righteous, Lobster, Pacifico, Anton
- Archivo Black, Bungee, Fredoka One
- Permanent Marker, Alfa Slab One, Bangers
- Righteous, Shadows Into Light

#### Certificate Fonts (12 fonts)
- Great Vibes, Tangerine, Dancing Script
- Satisfy, Allura, Pinyon Script
- Alex Brush, Italianno, Kaushan Script
- Parisienne, Sacramento, Yellowtail

### Using Fonts in Your Code

```javascript
import { useFonts } from '../contexts/FontContext';

function MyComponent() {
  const { allFonts, googleFonts, customFonts, loadFont } = useFonts();
  
  // Access all fonts (Google + Custom)
  console.log(allFonts);
  
  // Load a specific font
  loadFont('Poppins');
  
  // Get fonts by category
  const { getFontsByCategory } = useFonts();
  const serifFonts = getFontsByCategory('serif');
  
  return <div>...</div>;
}
```

### Font Context API

#### Properties
- `allFonts` - Array of all fonts (Google + Custom)
- `googleFonts` - Array of Google Fonts only
- `customFonts` - Array of custom uploaded fonts
- `loading` - Boolean loading state

#### Methods
- `loadFont(fontName)` - Load a specific Google Font
- `getFontsByCategory(category)` - Get fonts by category
- `getBanglaFonts()` - Get all Bangla-supported fonts
- `refreshCustomFonts()` - Reload custom fonts from database

---

## 📁 Files Created/Modified

### New Files
- `src/pages/Admin/ProjectManagement/FaqInput.jsx` - FAQ input modal component
- `src/contexts/FontContext.jsx` - Global font context provider

### Modified Files
- `src/pages/Admin/ProjectManagement/RichTextEditor.jsx` - Added divider and FAQ features
- `src/App.jsx` - Added FontProvider wrapper

---

## 🎯 Use Cases

### Dividers
- Separate different sections of a project description
- Create visual breaks in long content
- Add decorative elements between paragraphs
- Control spacing without visible lines (invisible divider)

### FAQ/Accordion
- Create FAQ sections for projects
- Add collapsible "Read More" sections
- Organize long content into digestible chunks
- Create interactive documentation
- Build step-by-step guides with expandable details

---

## 💡 Tips & Best Practices

### Dividers
1. Use **invisible dividers** for precise spacing control
2. **Gradient** and **star** designs work great for decorative sections
3. Match divider colors to your project theme
4. Use thicker dividers (8-10px) for major section breaks
5. Use thinner dividers (1-2px) for subtle separations

### FAQ
1. Keep titles concise and clear (questions)
2. Use consistent styling across all FAQs in a project
3. Start with closed state for long content
4. Use different title colors to categorize FAQs
5. Leverage the 70+ fonts to match your brand
6. Use bullet points in content for better readability
7. Test both open and closed states in preview

### Fonts
1. Bangla fonts are marked with "(Bangla)" label
2. Custom fonts show "(Custom)" label
3. Fonts are organized by category for easy selection
4. Preview fonts in the dropdown (they render in their own style)
5. Mix and match fonts for title and content for visual hierarchy

---

## 🚀 Getting Started

1. Open any project in Project Management
2. Click the rich text editor
3. Look for the new toolbar icons:
   - **➖ (Minus)** for Dividers
   - **❓ (Question Mark)** for FAQ
4. Click to insert and customize
5. Save your project

---

## 🔧 Technical Details

### Divider Implementation
- Stored as `<div class="editor-divider-wrapper">`
- Data attributes store all settings
- CSS-based designs (no images)
- Fully responsive

### FAQ Implementation
- Stored as `<div class="editor-faq-wrapper">`
- JavaScript-based toggle functionality
- Data attributes preserve all styling
- Content stored in data attribute for toggle
- Smooth animations via CSS transitions

### Font System
- React Context API for global state
- Lazy loading of Google Fonts
- Custom fonts loaded from Appwrite storage
- Automatic font loading on selection
- Cached to prevent duplicate loads

---

## 📝 Notes

- All features work seamlessly with existing editor features
- Dividers and FAQs can be mixed with images, videos, quotes, etc.
- Fonts are automatically loaded when selected
- All styling is preserved when editing projects
- Mobile-responsive by default

---

## 🎉 Summary

You now have:
- ✅ 10 different divider designs with full customization
- ✅ Interactive FAQ/Accordion component
- ✅ 70+ Google Fonts globally available
- ✅ Custom font support throughout the project
- ✅ Full styling control for all elements
- ✅ Live preview for all features
- ✅ Easy editing and deletion

Enjoy creating beautiful, interactive content! 🚀
