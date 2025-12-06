# Rich Text Editor - Table Feature Guide

## Overview
The table feature allows you to insert and customize fully-featured tables in your rich text editor with live editing, dynamic row/column management, and advanced styling capabilities.

## Features

### 1. **Insert Table**
- Click the table icon (grid icon) in the toolbar
- A modal opens where you can:
  - Set initial number of rows and columns (1-20 rows, 1-10 columns)
  - Configure cell styling (font, size, color, alignment)
  - Set table-wide settings (borders, header colors, striped rows)
- Click "Insert Table" to add it to your content

### 2. **Edit Cells Directly**
- **Click any cell** to start typing immediately
- All cells are fully editable with rich text support
- You can:
  - Type text, numbers, or any content
  - Use existing toolbar features (bold, italic, links, buttons, etc.)
  - Format text with different fonts, sizes, and colors
  - Add links and buttons inside cells
  - Align text within cells

### 3. **Dynamic Row Management**
- **Hover over any row** to see row control buttons appear on the left side
- **Add Row Above**: Click the top + button
- **Add Row Below**: Click the bottom + button  
- **Delete Row**: Click the × button (only if more than 1 row exists)
- Rows are added with the same styling as existing rows

### 4. **Dynamic Column Management**
- **Hover over cells in the first row** to see column control buttons appear at the top
- **Add Column Left**: Click the left + button
- **Add Column Right**: Click the right + button
- **Delete Column**: Click the × button (only if more than 1 column exists)
- Columns are added with the same styling as existing columns

### 5. **Table Settings**
- **Hover over the table** to see a settings icon (⚙️) in the top-right corner
- Click to open the table editor modal where you can:
  - Modify cell content and individual cell styling
  - Change border color and width
  - Update header row colors
  - Enable/disable striped rows
  - Adjust all table-wide settings
- Click "Update Table" to apply changes

### 6. **Cell Styling (via Settings)**
When editing a table through settings:
- Click any cell to select it
- Apply custom styling:
  - Font family (Google Fonts)
  - Font size
  - Text color
  - Background color
  - Text alignment (left, center, right)
  - Bold and italic formatting
- Click "Apply to Cell" to save cell-specific styles

### 7. **Table-Wide Styling**
Configure these settings when creating or editing a table:
- **Border Color**: Choose any color for table borders
- **Border Width**: Adjust border thickness (0-10px)
- **Header Background**: Set background color for the first row
- **Header Text Color**: Set text color for header row
- **Striped Rows**: Enable alternating row colors for better readability
- **Stripe Color**: Choose the color for alternate rows

### 8. **Insert Rich Content in Cells**
Inside any table cell, you can:
- Type regular text
- Add **links** using the link toolbar button
- Insert **buttons** using the button toolbar button
- Apply **text formatting** (bold, italic, underline)
- Use **headings** and other text styles
- All existing editor features work within cells

### 9. **Delete Table**
- Click anywhere on the table wrapper (outside cells)
- Press `Delete` or `Backspace` key to remove the entire table
- Or use the settings modal to delete the table

## Usage Tips

1. **Header Row**: The first row is automatically styled as a header with distinct background and text colors
2. **Live Editing**: Click any cell and start typing - no need to open a modal for basic text editing
3. **Hover Controls**: Row and column controls appear on hover - no clutter when not needed
4. **Settings for Advanced Changes**: Use the settings button for bulk changes or initial setup
5. **Responsive Design**: Tables are scrollable horizontally on smaller screens
6. **Data Persistence**: All table data, including cell content and styling, is saved with your content

## Workflow Examples

### Creating a Simple Table
1. Click table icon in toolbar
2. Set rows/columns (e.g., 3 rows, 4 columns)
3. Click "Insert Table"
4. Click cells and type content directly
5. Use hover controls to add/remove rows/columns as needed

### Creating a Styled Table
1. Click table icon in toolbar
2. Set dimensions and configure styling in the modal
3. Click "Insert Table"
4. Edit cell content directly in the editor
5. Use settings button to adjust styling later

### Adding Dynamic Content
1. Create your table
2. Click inside a cell
3. Use toolbar buttons to add links, buttons, or formatting
4. Content is added directly to the cell

## Technical Details

### Data Storage
Tables are stored as HTML elements with data attributes containing:
- Row and column counts
- Cell data (text, fonts, colors, alignment)
- Border settings
- Header styling
- Striped row configuration

### Editing Capabilities
- **Cells**: Fully editable with contentEditable
- **Rows/Columns**: Dynamic add/remove via hover controls
- **Styling**: Per-cell or table-wide via settings modal
- **Rich Content**: Full support for links, buttons, and formatting

### Keyboard Shortcuts
- `Delete` or `Backspace`: Delete selected table (when table wrapper is selected)
- `Enter` in cell: New line within cell
- `Tab`: Navigate to next cell (standard browser behavior)
- `Shift+Tab`: Navigate to previous cell

## Example Use Cases

1. **Data Tables**: Display structured data with headers and formatted cells
2. **Comparison Tables**: Compare features, prices, or specifications side-by-side
3. **Schedules**: Create timetables or event schedules with time slots
4. **Product Catalogs**: List products with images, descriptions, and prices
5. **Pricing Tables**: Showcase pricing tiers with styled headers and call-to-action buttons
6. **Documentation**: Create reference tables with code examples and descriptions

## Browser Compatibility
The table feature works in all modern browsers that support:
- HTML5 contentEditable
- CSS3 (flexbox, positioning)
- ES6 JavaScript

## Performance
- Tables are rendered as native HTML `<table>` elements for optimal performance
- Controls are shown/hidden with CSS for smooth interactions
- Large tables (20+ rows/columns) are fully supported
- No performance impact on the rest of the editor
