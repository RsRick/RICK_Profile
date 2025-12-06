# Table Alignment Fix

## Issues Identified

### 1. Selection Behavior in Tables
The current selection behavior doesn't work well for tables. You want:
- Select header cells → drag down → select entire column
- Select cells → drag right/left → select entire row
- Diagonal selection → select rectangular area

**Note**: This requires custom JavaScript selection handling, which is complex and may interfere with normal text editing.

### 2. Alignment Not Working in Table Cells
When you select text in a table cell and click alignment buttons, nothing happens.

**Cause**: The alignment buttons in the toolbar likely use `document.execCommand` which doesn't work well with table cells.

**Solution**: Need to detect if selection is inside a table cell and apply `text-align` CSS directly to the `<td>` element.

## Recommended Solution

### For Alignment (Simple Fix)

Since table cells are already editable, the simplest solution is to:

1. **Use the Settings Button** to set alignment for cells
   - When editing table in settings modal
   - Add alignment option for each cell
   - Apply `text-align` style to `<td>` elements

2. **Or add alignment to cell styling**
   - Right-click on cell → Cell properties
   - Set alignment there

### For Selection (Complex - Not Recommended)

Custom table selection would require:
- Intercepting mouse events
- Tracking which cells are being selected
- Highlighting selected cells
- Applying formatting to all selected cells

This is very complex and would interfere with normal text editing within cells.

## Alternative Approach

### Simple and Effective:

**Use TableInput modal for cell formatting:**

1. Click settings button (⚙️)
2. Click on the cell you want to format
3. Set alignment (left/center/right)
4. Apply to cell
5. Update table

This way:
- ✅ No complex selection logic needed
- ✅ Clear, predictable behavior
- ✅ Works reliably
- ✅ Doesn't interfere with text editing

## Current Status

The table feature currently supports:
- ✅ Editable cells (click and type)
- ✅ Text formatting (bold, italic, color, fonts)
- ✅ Links and buttons in cells
- ✅ Settings button to modify structure

What's missing:
- ❌ Alignment buttons in toolbar don't work for table cells
- ❌ Custom selection behavior for tables

## Recommendation

**Option 1: Use Settings Modal (Recommended)**
- Keep it simple
- Use settings button for cell alignment
- Reliable and predictable

**Option 2: Add Toolbar Support (More Work)**
- Detect if selection is in table cell
- Apply text-align to the cell
- May have edge cases

**Option 3: Custom Selection (Not Recommended)**
- Very complex
- May break normal editing
- Hard to maintain

## Next Steps

Please confirm which approach you prefer:
1. Use settings modal for alignment (simple, works now)
2. Make toolbar alignment buttons work for tables (moderate effort)
3. Implement custom table selection (complex, not recommended)

I recommend Option 1 or 2.
