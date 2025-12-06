# Rich Text Editor - Font, Color & Size Features

## Overview
The Rich Text Editor now includes three powerful formatting options that allow you to customize selected text with different fonts, colors, and sizes.

## Features Added

### 1. Link Insertion & Editing (ENHANCED! 🎉)
The link feature now supports two powerful modes with full editing capabilities:

#### Mode 1: Link Selected Text
- **Select any text** from anywhere in the editor:
  - Regular paragraph text
  - Text inside code blocks
  - Text inside quote blocks
  - Headings (H1, H2, H3)
  - List items
- **Click Insert Link button** (chain icon)
- **Paste URL** and click Insert
- The selected text becomes a clickable hyperlink

#### Mode 2: Insert New Link with Title
- **Click Insert Link** without selecting any text
- **Enter Link Title** - The text that will be displayed
- **Enter URL** - The destination link
- **Click Insert** - Link appears at cursor position
- The inserted link can be **fully edited** like any other text:
  - Change to H1, H2, H3
  - Apply different colors
  - Change font family
  - Adjust font size
  - Apply bold, italic, underline
  - Change alignment

#### Edit Existing Links
- **Click on any link** in the editor
- Link editing panel opens automatically
- **Modify URL** - Change the destination
- **Modify Title** - Change the display text
- **Remove Link** - Button to unlink text completely
- Press Enter or click Update to save changes

**Link Features:**
- Teal color (#1E8479) with underline
- Hover effect with background highlight
- Opens in new tab (target="_blank")
- Security: rel="noopener noreferrer"
- Fully editable after insertion
- Click to edit anytime
- Press Enter to quickly insert/update

### 2. Embed Code Insertion & Customization (NEW! 🎬)
The editor now supports embedding external content (videos, maps, widgets) with full customization:

#### Insert Embed Code
- **Click Embed button** (FileCode icon in toolbar)
- **Two view modes for inserting**:
  - **Code View**: Paste your embed HTML/iframe code
  - **Preview**: See how it will render before inserting
- **Auto-dimension detection**: Automatically extracts width/height from your code
- **Default size**: 560x315px if no dimensions specified
- **Supports**: YouTube, Vimeo, Google Maps, Twitter, CodePen, Instagram, and any iframe/HTML

#### View/Edit Embed Code
- **Click on embed** to select it
- **Click "Code" button** (blue) above the selected embed
- **Two tabs available**:
  - **Code Tab**: View and edit the raw HTML
  - **Preview Tab**: See the rendered content
- **Update button**: Apply changes to the embed
- **Maintains size**: Your resize settings are preserved when updating code

#### Resize Embeds
- **Click to select** any embedded content (blue border appears)
- **8 resize handles** (4 corners + 4 edges)
- **Corner handles**: Maintain aspect ratio while resizing
- **Edge handles**: Resize width or height independently
- **Minimum size**: 50x50px to prevent too-small embeds
- **Size override**: Your manual resize overrides code dimensions
- **Live preview**: See size changes in real-time

#### Border Customization
- **Border button** (purple) appears when embed is selected
- **Border Style**: Choose from Solid, Dashed, Dotted, or None
- **Border Width**: 1-20px with slider control
- **Border Color**: Color picker + hex input (#105652 default)
- **Apply button**: Save border settings
- **Visual feedback**: See border preview before applying

#### Embed Features
- **Alignment**: Left, Center, Right (use toolbar alignment buttons)
  - Select embed first, then click alignment button
  - Left: Embed aligns to left edge
  - Center: Embed centers horizontally
  - Right: Embed aligns to right edge
  - Justify: Not applicable to embeds (text only)
- **Delete**: Click delete button or press Delete/Backspace key
- **Keyboard shortcuts**: Same as images for consistency
- **Interactive**: Fully functional in project displays (play videos, interact with maps)
- **Fixed dimensions**: Size specified in code is maintained across all views
- **Interaction hint**: "Click center to interact, edges to select"

### 3. Image Insertion, Selection & Resizing
- **Two Ways to Insert Images**:
  - **URL Mode**: Paste an image URL from the internet
  - **Upload Mode**: Upload images directly from your computer to Appwrite Storage
  
- **Image Selection & Resizing**:
  - Click on any inserted image to select it
  - Selected images show a green border with 8 resize handles
  - **4 Corner Handles**: Drag to resize while maintaining aspect ratio
  - **4 Edge Handles**: Drag to resize width or height independently
    - Top/Bottom handles: Adjust height
    - Left/Right handles: Adjust width
  - Live preview while resizing
  - Images are inserted at the current cursor position (not at the top)
  - Minimum size constraint prevents images from becoming too small
  
- **Delete Images**: 
  - Press Delete or Backspace key when image is selected
  - Click the red delete button (trash icon) that appears above selected images
  
- **Text Wrap Feature** (NEW!):
  - Click "Text Wrap" button (blue) when image is selected
  - **Gap Slider**: Set distance (0-50px) between image and wrapped text
  - **Enable Wrap Toggle**: Turn text wrapping on/off
  - **How it works**:
    - Text and content flow around the image instead of appearing below
    - Free space beside the image is utilized efficiently
    - Content wraps until the image height ends, then continues normally
    - Other images below are NOT affected by wrapping (only text content wraps)
  - **Requirements**:
    - Only works with left or right aligned images
    - Center-aligned images cannot use text wrap
    - Must be enabled manually for each image
  
- **Upload Details**:
  - Supported formats: JPG, PNG, GIF, WebP, SVG
  - Max file size: 10 MB (configurable in Appwrite)
  - Images stored in Appwrite Storage bucket: `editor-images`
  - Cursor position is preserved when inserting images

### 4. Font Family Selector
- **Icon**: Type icon with "Font" label
- **Functionality**: 
  - Select any text in the editor
  - Click the Font button to open the font picker
  - Choose from:
    - **Custom Fonts**: Fonts uploaded via Font Management (marked with purple "Custom" badge)
    - **Google Fonts**: 60+ beautiful fonts including Bangla support (marked with green "বাংলা" badge)
  - The selected text will be wrapped with the chosen font family

### 5. Color Picker
- **Icon**: Palette icon with "Color" label
- **Functionality**:
  - Select any text in the editor
  - Click the Color button to open the color picker
  - Three ways to choose colors:
    1. **Color Palette**: 20 predefined colors including brand colors (#105652, #1E8479)
    2. **Color Dropper**: Native browser color picker for visual selection
    3. **Hex Code Input**: Enter any hex color code (e.g., #FF5733)
  - Press Enter or click Apply to change the selected text color

### 6. Font Size Selector
- **Icon**: TextCursor icon with "Size" label
- **Functionality**:
  - Select any text in the editor
  - Click the Size button to open the size picker
  - Two ways to set size:
    1. **Preset Sizes**: 8 common sizes from Tiny (12px) to Huge (48px)
    2. **Custom Size**: Enter any size between 8px and 200px
  - Press Enter or click Apply to resize the selected text

### 7. Quote Block Customization (NEW! 🎨)
The editor now allows you to customize quote block colors before inserting:

#### Customizable Properties
- **Background Color**: Choose any color for the quote background
  - Default: `#FFFAEB` (light yellow/cream)
  - Use color picker or enter hex code
- **Border Color**: Choose any color for the left border
  - Default: `#1E8479` (teal)
  - Use color picker or enter hex code

#### How to Use

**Method 1: Insert New Quote**
1. Click Quote button (no text selected)
2. Panel opens with text input field
3. Type your quote text
4. Choose background and border colors
5. Preview updates in real-time
6. Click "Insert Quote"

**Method 2: Convert Text to Quote**
1. Select text in the editor
2. Click Quote button
3. Panel opens with selected text
4. Customize colors if desired
5. Click "Insert Quote"

**Method 3: Edit Existing Quote**
1. Click on any existing quote block
2. Panel opens with current text and colors
3. Edit text and/or colors
4. Click "Update Quote" or "Delete"

#### Features
- **Live Preview**: See how your quote will look before inserting
- **Color Picker**: Visual color selection
- **Hex Input**: Enter specific color codes
- **Default Colors**: Pre-set with brand colors
- **Inline Styles**: Colors persist across all views

#### Common Color Combinations
- **Professional**: Gray background + Dark gray border
- **Success**: Light green + Green border
- **Warning**: Light red + Red border
- **Info**: Light blue + Blue border
- **Brand**: Your brand colors

### 8. Text Alignment
- **Location**: Second toolbar row with gray background
- **Four Alignment Options**:
  1. **Align Left**: Aligns content to the left edge
  2. **Align Center**: Centers content horizontally
  3. **Align Right**: Aligns content to the right edge
  4. **Justify**: Distributes text evenly (text only, like Microsoft Word)
  
- **Works With**:
  - Regular text and paragraphs
  - Headings (H1, H2, H3)
  - Blockquotes
  - Code blocks
  - Images (left, center, right only)
  - List items
  
- **How to Use**:
  - Place cursor in text/block you want to align
  - Or select an image
  - Click the desired alignment button
  - Alignment applies immediately

## How to Use

### Inserting Links

#### Quick Link (Mode 1)
1. **Select Text**: Highlight any text you want to turn into a link
2. **Click Link Button**: Chain icon in the toolbar
3. **Paste URL**: Enter the destination URL
4. **Press Enter or Click Insert**: Link is created instantly

#### Insert New Link (Mode 2)
1. **Click Link Button**: Without selecting any text
2. **Enter Title**: Type the text you want to display
3. **Enter URL**: Type or paste the destination URL
4. **Press Enter or Click Insert**: Link appears at cursor position
5. **Style It**: Apply any formatting (color, size, font, heading, etc.)

#### Edit Existing Links
1. **Click the Link**: Click on any link in the editor
2. **Edit Panel Opens**: Shows current URL and title
3. **Make Changes**: Update URL or title as needed
4. **Update or Remove**: Click Update to save, or Remove Link to unlink
5. **Press Enter**: Quick save shortcut

### Inserting Embeds

1. **Click Embed Button**: FileCode icon in the toolbar
2. **Choose View Mode**:
   - **Code View**: For pasting and editing code
   - **Preview**: For seeing how it will look
3. **Paste Embed Code**: In Code View, paste your iframe or embed HTML
   - Example: `<iframe src="https://www.youtube.com/embed/VIDEO_ID" width="560" height="315"></iframe>`
4. **Preview (Optional)**: Switch to "Preview" tab to verify it looks correct
5. **Insert**: Click "Insert Embed" button
6. **Customize After Insertion**:
   - Click embed to select it (blue border appears)
   - Drag corner/edge handles to resize
   - Click "Code" button to view/edit the embed code
   - Click "Border" button for border customization
   - Use alignment buttons to position (left, center, right)
7. **Delete**: Select and press Delete/Backspace, or click trash button

### Inserting Images
1. **Click Image Button**: Camera icon in the toolbar
2. **Choose Method**:
   - **URL Tab**: Paste an image URL and click Insert
   - **Upload Tab**: Select a file from your computer and click Insert
3. **Image Appears**: At your cursor position with resize handles

### Using Text Wrap
1. **Select Image**: Click on the image
2. **Align Image**: Use left or right alignment (not center)
3. **Click "Text Wrap"**: Blue button above the image
4. **Adjust Gap**: Use slider to set spacing (0-50px)
5. **Enable Wrap**: Toggle the switch to ON
6. **Result**: Text flows around the image, filling the free space

### Formatting Text
1. **Select Text**: Highlight the text you want to format (can be multiple lines or headings)
2. **Choose Format**: Click Font, Color, or Size button
3. **Apply Style**: Select from the picker or enter custom values
4. **Continue Editing**: The picker closes automatically, and you can continue editing

### Tips
- **Embeds**: Use Code View to paste, Preview to verify before inserting
- **Embed Borders**: Customize with solid, dashed, dotted styles or remove border entirely
- **Embed Sizing**: The size in your code determines display size everywhere (editor, cards, modals)
- **Embed Resizing**: Drag handles after insertion to override code dimensions
- **Embed Interaction**: Click center of embed to interact, click edges to select for editing
- **Embed Code Editing**: Click "Code" button to view/edit HTML after insertion
- **Trusted Sources**: Only embed content from websites you trust for security
- **Links**: Select text first for quick linking, or use title+URL for new styled links
- **Link Editing**: Click any link to edit its URL or title - no need to recreate it
- **Link Styling**: Links inserted with Mode 2 can be styled like any other text (headings, colors, fonts)
- **Keyboard Shortcuts**: Press Enter in link fields to quickly insert/update
- You can apply multiple formats to the same text (font + color + size + alignment)
- Works with headings (H1, H2, H3) and regular text
- Custom fonts from Font Management are automatically available
- All Google Fonts are loaded on-demand for better performance
- Click outside the picker or press the Close button to dismiss
- **Selection is preserved**: When you open a picker, your text selection is saved and restored when applying changes, so you can type custom values without losing your selection
- **Image Resizing**: Click any image to select it, then drag the handles to resize. Corner handles maintain aspect ratio, edge handles resize in one direction
- **Image Positioning**: Images are inserted at your cursor position, not at the top of the document
- **Alignment**: Works on the current block/element where your cursor is, or on selected images. Justify only works for text content
- **Justify Alignment**: Like Microsoft Word, distributes text evenly across the line width for a clean, professional look

## Technical Details

### Font Loading
- **Custom Fonts**: Loaded from Appwrite storage via Font Management
- **Google Fonts**: Dynamically loaded from Google Fonts CDN when selected
- Fonts are cached in the browser for better performance

### Color System
- Uses native `foreColor` command for text coloring
- Supports all valid CSS color formats (hex, rgb, named colors)
- Default palette includes brand colors and common web colors

### Size System
- Wraps selected text in `<span>` with inline `font-size` style
- Supports pixel values from 8px to 200px
- Preset sizes cover most common use cases

## Integration with Font Management

The editor automatically syncs with the Font Management system:
- New custom fonts appear immediately in the font picker
- Deleted fonts are removed from the picker
- Font previews use the actual font for accurate representation

## Browser Compatibility

All features work in modern browsers:
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Touch-friendly interface

## Image Control Guide

```
   [Text Wrap]          [🗑️ Delete]
     nw -------- n -------- ne
     |                       |
     |                       |
     w        IMAGE          e
     |                       |
     |                       |
     sw -------- s -------- se
```

### Resize Handles
- **nw, ne, sw, se** (corners): Resize maintaining aspect ratio
- **n, s** (top/bottom): Resize height only
- **e, w** (left/right): Resize width only

All handles are draggable and show live preview while resizing.

### Control Buttons
- **Text Wrap** (blue, left): Opens text wrap settings panel
- **🗑️ Delete** (red, right): Deletes the image

### Deleting Images
- **Method 1**: Select image and press Delete or Backspace key
- **Method 2**: Click the red delete button (trash icon) above the selected image

### Text Wrap Panel
When you click "Text Wrap", a panel appears with:
- **Gap Slider**: 0-50px spacing between image and text
- **Enable Wrap Toggle**: ON/OFF switch
- **Note**: Only works with left/right aligned images
- **Close Button**: Closes the panel

## Embed Control Guide

```
   [Code]  [Border]         [🗑️ Delete]
     nw -------- n -------- ne
     |                       |
     |                       |
     w       EMBED           e
     |                       |
     |                       |
     sw -------- s -------- se
   💡 Click center to interact, edges to select
```

### Resize Handles
- **nw, ne, sw, se** (corners): Resize maintaining aspect ratio
- **n, s** (top/bottom): Resize height only
- **e, w** (left/right): Resize width only

All handles are draggable and show live preview while resizing.

### Control Buttons
- **Code** (blue, left): Opens code view/edit panel
- **Border** (purple, middle): Opens border customization panel
- **🗑️ Delete** (red, right): Deletes the embed

### Deleting Embeds
- **Method 1**: Select embed and press Delete or Backspace key
- **Method 2**: Click the red delete button (trash icon) above the selected embed

### Code View Panel
When you click "Code", a panel appears with:
- **Code Tab**: View and edit the raw HTML/iframe code
- **Preview Tab**: See the rendered embed content
- **Update Embed Button**: Apply code changes
- **Close Button**: Closes the panel

### Border Settings Panel
When you click "Border", a panel appears with:
- **Border Style**: Solid, Dashed, Dotted, None (4 buttons)
- **Border Width**: 1-20px slider (only if style is not "None")
- **Border Color**: Color picker + hex input (only if style is not "None")
- **Apply Border Button**: Save border settings
- **Close Button**: Closes the panel

### Interaction Hint
- **Click center**: Interact with the embed (play video, use map, etc.)
- **Click edges**: Select the embed for editing/resizing

## Alignment Examples

### Embed Alignment
Embeds can be aligned just like images:

- **Left Aligned**: 
  - Embed on left edge
  - Content appears below
  
- **Center Aligned**: 
  - Embed centered horizontally
  - Content appears below
  
- **Right Aligned**: 
  - Embed on right edge
  - Content appears below

**How to align embeds:**
1. Click on the embed to select it (blue border appears)
2. Click the desired alignment button in the toolbar (Left, Center, or Right)
3. Embed repositions immediately
4. Alignment is saved with the project

**Note**: Justify alignment doesn't apply to embeds (text only).

### Text Alignment
```
Left Aligned Text
This text is aligned to the left edge.

        Centered Text
    This text is centered.

                Right Aligned Text
            This text is aligned right.

Justified Text Justified Text Justified
Text Justified Text Justified Text Just
ified Text Justified Text Justified Tex
(Text distributed evenly across width)
```

### Image Alignment & Text Wrap
- **Left Aligned**: 
  - Image on left edge
  - With text wrap: Content flows on the right side
  - Without text wrap: Content appears below
  
- **Center Aligned**: 
  - Image centered horizontally
  - Text wrap NOT available
  - Content always appears below
  
- **Right Aligned**: 
  - Image on right edge
  - With text wrap: Content flows on the left side
  - Without text wrap: Content appears below

### Text Wrap Example
```
┌─────────┐  This text flows around
│         │  the image on the left.
│  IMAGE  │  The gap setting controls
│         │  the space between image
└─────────┘  and text. When the image
height ends, text continues normally
across the full width.
```

## Future Enhancements

Potential improvements:
- Font weight selector (bold, light, etc.)
- Text background color
- Font style (italic, oblique)
- Recently used fonts/colors
- Favorite fonts/colors
- Image rotation
- Image filters and effects
- Line spacing options
- Paragraph spacing controls
