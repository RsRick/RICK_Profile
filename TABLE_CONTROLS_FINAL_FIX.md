# Table Controls - Final Fix

## Problem
- All plus icons were showing at once when hovering over table
- Icons were duplicated
- Too cluttered and confusing

## Solution
Changed the control placement strategy:

### Row Controls
- **Before**: Each row had controls attached to the `<tr>` element
- **After**: Controls attached only to the first `<td>` in each row
- **Result**: Only one set of row controls per row, shows when hovering over the first cell

### Column Controls  
- **Before**: Each cell in first row had controls
- **After**: Each cell in first row still has controls, but only shows when hovering that specific cell
- **Result**: Column controls appear only for the hovered cell

### CSS Changes
```css
/* Show row controls when hovering first cell */
.table-cell:hover .table-row-controls {
  opacity: 1 !important;
}

/* Show column controls when hovering any first-row cell */
.table-cell:hover > .table-col-controls {
  opacity: 1 !important;
}
```

## How It Works Now

### Adding Rows
1. Hover over the **first cell** of any row (leftmost cell)
2. Plus icons appear on the left side
3. Click top + to add row above
4. Click bottom + to add row below

### Adding Columns
1. Hover over any cell in the **first row** (header row)
2. Plus icons appear on top of that cell
3. Click left + to add column before
4. Click right + to add column after

## Visual Guide

```
Hover over B1 (first row, second column):
        [+] [+] [×]  ← Controls appear here
         ↓   ↓   ↓
    ┌─────┬─────┬─────┐
    │ A1  │ B1  │ C1  │ ← Hover here
    ├─────┼─────┼─────┤
    │ A2  │ B2  │ C2  │
    └─────┴─────┴─────┘

Hover over A2 (second row, first column):
    ┌─────┬─────┬─────┐
    │ A1  │ B1  │ C1  │
    ├─────┼─────┼─────┤
[+] │ A2  │ B2  │ C2  │ ← Hover here
[+] ├─────┼─────┼─────┤
[×] │ A3  │ B3  │ C3  │
    └─────┴─────┴─────┘
     ↑
     Controls appear here
```

## Key Points

1. **Row controls**: Hover over **first cell** (leftmost) in any row
2. **Column controls**: Hover over any cell in **first row** (header)
3. **Settings button**: Always visible in top-right corner
4. **No clutter**: Only relevant controls show for hovered cell

## Testing

1. Insert a table
2. Hover over first cell of second row → See row controls on left
3. Hover over second cell of first row → See column controls on top
4. Move mouse away → Controls disappear
5. Only one set of controls visible at a time

## Status
✅ Fixed - Controls now appear only where mouse is hovering
✅ No duplicate icons
✅ Clean, intuitive interface
