# Quote Block Customization Feature

## ✅ Feature Added

You can now customize the background color and border color of quote blocks before inserting them!

## 🎨 What You Can Customize

### 1. Background Color
- Choose any color for the quote background
- Default: `#FFFAEB` (light yellow/cream)
- Use color picker or enter hex code

### 2. Border Color (Left Side)
- Choose any color for the left border
- Default: `#1E8479` (teal)
- Use color picker or enter hex code

## 🎯 How to Use

### Step-by-Step
1. **Click Quote Button** in the toolbar (Quote icon)
2. **Customization panel opens** with color options
3. **Choose Background Color**:
   - Click color picker to select visually
   - Or type hex code (e.g., `#FFFAEB`)
4. **Choose Border Color**:
   - Click color picker to select visually
   - Or type hex code (e.g., `#1E8479`)
5. **Preview** - See how your quote will look
6. **Click "Insert Quote"** - Quote is inserted with your colors
7. **Or Click "Cancel"** - Close without inserting

## 🎨 Visual Guide

### Quote Customizer Panel
```
┌─────────────────────────────────────────────────────────────┐
│  Quote Customization                                        │
├─────────────────────────────────────────────────────────────┤
│  Background Color:                                          │
│  [🎨] [#FFFAEB]  ← Color picker + Hex input                │
│                                                             │
│  Border Color (Left Side):                                 │
│  [🎨] [#1E8479]  ← Color picker + Hex input                │
│                                                             │
│  Preview:                                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Your quote will look like this                        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [Insert Quote]  [Cancel]                                  │
└─────────────────────────────────────────────────────────────┘
```

### Quote Block Examples

#### Default Colors
```
Background: #FFFAEB (light yellow)
Border: #1E8479 (teal)

│ "This is a quote with default colors.
│  It has a light yellow background and
│  teal left border."
```

#### Custom Colors - Blue Theme
```
Background: #E3F2FD (light blue)
Border: #1976D2 (blue)

│ "This is a quote with blue theme.
│  Perfect for professional content."
```

#### Custom Colors - Green Theme
```
Background: #E8F5E9 (light green)
Border: #4CAF50 (green)

│ "This is a quote with green theme.
│  Great for success messages."
```

#### Custom Colors - Red Theme
```
Background: #FFEBEE (light red)
Border: #F44336 (red)

│ "This is a quote with red theme.
│  Good for important warnings."
```

## 📝 Technical Details

### Quote HTML Structure
```html
<div style="overflow: auto;">
  <blockquote 
    class="editor-quote" 
    style="
      border-left: 4px solid #1E8479;
      padding-left: 1.5rem;
      margin: 1rem 0;
      font-style: italic;
      color: #2d3748;
      font-size: 1.25rem;
      background: #FFFAEB;
      padding: 1.5rem;
      border-radius: 0.5rem;
    "
    data-bg-color="#FFFAEB"
    data-border-color="#1E8479"
  >
    Your quote text here
  </blockquote>
</div>
```

### Data Attributes
- `data-bg-color`: Stores background color
- `data-border-color`: Stores border color
- `class="editor-quote"`: Identifies quote blocks

### Inline Styles
All styling is inline to ensure consistency across all views:
- Editor preview
- Project cards
- Project modals
- Homepage displays

## 🎯 Use Cases

### Professional Quotes
```
Background: #F5F5F5 (light gray)
Border: #333333 (dark gray)
→ Clean, professional look
```

### Highlighted Information
```
Background: #FFF9C4 (light yellow)
Border: #FBC02D (yellow)
→ Draws attention
```

### Success Messages
```
Background: #E8F5E9 (light green)
Border: #4CAF50 (green)
→ Positive feedback
```

### Important Warnings
```
Background: #FFEBEE (light red)
Border: #F44336 (red)
→ Critical information
```

### Brand Colors
```
Background: Your brand light color
Border: Your brand primary color
→ Consistent branding
```

## 💡 Tips

### Color Selection
1. **Contrast**: Ensure text is readable on background
2. **Consistency**: Use colors that match your design
3. **Purpose**: Choose colors that convey the right mood
4. **Accessibility**: Test with different screen readers

### Best Practices
1. **Light backgrounds**: Work best for readability
2. **Bold borders**: Make quotes stand out
3. **Complementary colors**: Background and border should work together
4. **Test preview**: Always check preview before inserting

### Common Color Combinations
- **Warm**: `#FFFAEB` + `#FF9800` (yellow + orange)
- **Cool**: `#E3F2FD` + `#2196F3` (light blue + blue)
- **Nature**: `#E8F5E9` + `#4CAF50` (light green + green)
- **Professional**: `#F5F5F5` + `#607D8B` (gray + blue-gray)
- **Elegant**: `#F3E5F5` + `#9C27B0` (light purple + purple)

## 🔧 Implementation Details

### State Management
```javascript
const [showQuoteCustomizer, setShowQuoteCustomizer] = useState(false);
const [quoteBgColor, setQuoteBgColor] = useState('#FFFAEB');
const [quoteBorderColor, setQuoteBorderColor] = useState('#1E8479');
```

### Insert Function
```javascript
const insertQuote = () => {
  const selectedText = window.getSelection().toString() || 'Your quote here';
  insertHTML(`<div style="overflow: auto;">
    <blockquote 
      class="editor-quote" 
      style="border-left: 4px solid ${quoteBorderColor}; 
             background: ${quoteBgColor}; ..."
      data-bg-color="${quoteBgColor}" 
      data-border-color="${quoteBorderColor}">
      ${selectedText}
    </blockquote>
  </div>`);
};
```

## 🎉 Benefits

### Flexibility
- Choose any color combination
- Match your brand colors
- Adapt to different content types
- Create visual hierarchy

### Consistency
- Colors saved in inline styles
- Display same everywhere
- No CSS conflicts
- Reliable rendering

### User Experience
- Visual preview before inserting
- Easy color selection
- Intuitive interface
- Quick customization

### Professional Results
- Polished appearance
- Consistent branding
- Better readability
- Enhanced visual appeal

## 📚 Related Features

### Other Customizable Elements
- **Text**: Font, color, size
- **Links**: Color, style
- **Images**: Size, alignment, borders
- **Embeds**: Size, alignment, borders
- **Code Blocks**: Fixed styling
- **Headings**: Color, size

### Future Enhancements
- Save favorite color combinations
- Quote templates library
- Font customization for quotes
- Border width customization
- Border style (solid, dashed, dotted)
- Multiple border sides

## 🧪 Testing

### Test Cases
- [x] Click Quote button → Panel opens
- [x] Change background color → Preview updates
- [x] Change border color → Preview updates
- [x] Enter hex code → Color applies
- [x] Use color picker → Color applies
- [x] Click Insert → Quote inserted with colors
- [x] Click Cancel → Panel closes without inserting
- [x] Click outside → Panel closes
- [x] Colors persist in saved project
- [x] Colors display correctly in modal

## 📖 Documentation

### Quick Reference
1. Click Quote button
2. Choose colors
3. Preview
4. Insert or Cancel

### Default Colors
- Background: `#FFFAEB` (light yellow/cream)
- Border: `#1E8479` (teal)

### Color Format
- Hex codes: `#RRGGBB`
- Example: `#1E8479`
- 6 characters after #
- Case insensitive

---

**Added**: November 20, 2025
**Status**: ✅ Complete and Working
**Customizable**: Background color + Border color
