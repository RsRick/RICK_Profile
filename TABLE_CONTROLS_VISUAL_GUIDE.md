# Table Controls Visual Guide

## Control Locations

```
                    [+] [+] [×]  ← Column controls (hover over first row cells)
                     ↓   ↓   ↓
    ┌─────────────────────────────────────────────┐
    │                                    [⚙️]     │ ← Settings button (top-right)
    │  ┌──────────┬──────────┬──────────┐        │
[+] │  │ Header 1 │ Header 2 │ Header 3 │        │
[+] │  ├──────────┼──────────┼──────────┤        │
[×] │  │  Cell 1  │  Cell 2  │  Cell 3  │        │
    │  ├──────────┼──────────┼──────────┤        │
    │  │  Cell 4  │  Cell 5  │  Cell 6  │        │
    │  └──────────┴──────────┴──────────┘        │
    └─────────────────────────────────────────────┘
     ↑
     Row controls (hover over any row)
```

## Control Buttons

### Row Controls (Left Side)
```
[+]  ← Add row above
[+]  ← Add row below  
[×]  ← Delete this row (only if > 1 row)
```

### Column Controls (Top)
```
[+] [+] [×]
 ↓   ↓   ↓
Left Right Delete
```

### Settings Button (Top-Right)
```
[⚙️] ← Opens table editor modal
```

## Interaction Flow

### Adding a Row
1. Hover over any row
   ```
   [+] ← Appears here
   [+]
   [×]
   ```
2. Click top [+] to add row above
3. Click bottom [+] to add row below
4. New row appears with same styling

### Adding a Column
1. Hover over a cell in the first row
   ```
        [+] [+] [×]
         ↓   ↓   ↓
   ┌──────────┬──────────┐
   │ Header 1 │ Header 2 │
   ```
2. Click left [+] to add column left
3. Click right [+] to add column right
4. New column appears with same styling

### Editing Cell Content
1. Click any cell
   ```
   ┌──────────┐
   │ Cell |   │ ← Cursor appears
   └──────────┘
   ```
2. Type content directly
3. Use toolbar for formatting
4. Press Enter for new line

### Opening Settings
1. Hover over table
   ```
   ┌─────────────────────┐
   │              [⚙️]   │ ← Button appears
   │  Table content...   │
   ```
2. Click settings button
3. Modal opens with all options
4. Make changes and click "Update Table"

## Visual States

### Normal State
```
┌──────────┬──────────┐
│ Header 1 │ Header 2 │
├──────────┼──────────┤
│  Cell 1  │  Cell 2  │
└──────────┴──────────┘
```

### Hover State (Row)
```
[+] ┌──────────┬──────────┐
[+] │ Header 1 │ Header 2 │
[×] ├──────────┼──────────┤
    │  Cell 1  │  Cell 2  │ ← Controls visible
    └──────────┴──────────┘
```

### Hover State (Column)
```
    [+] [+] [×]
     ↓   ↓   ↓
┌──────────┬──────────┐
│ Header 1 │ Header 2 │ ← Controls visible
├──────────┼──────────┤
│  Cell 1  │  Cell 2  │
└──────────┴──────────┘
```

### Focus State (Cell)
```
┌──────────┬──────────┐
│ Header 1 │ Header 2 │
├══════════╪──────────┤ ← Blue outline
║  Cell 1  ║  Cell 2  │
└══════════╧──────────┘
```

### Selected State (Table)
```
╔═══════════════════════╗ ← Teal outline
║ ┌──────────┬──────────┐║
║ │ Header 1 │ Header 2 │║
║ ├──────────┼──────────┤║
║ │  Cell 1  │  Cell 2  │║
║ └──────────┴──────────┘║
╚═══════════════════════╝
```

## Button Styling

### Add Buttons
- Color: Teal (#0d9488)
- Icon: Plus (+)
- Hover: Darker teal (#0f766e)

### Delete Buttons
- Color: Red (#ef4444)
- Icon: X (×)
- Hover: Darker red (#dc2626)

### Settings Button
- Color: Teal (#0d9488)
- Icon: Gear (⚙️)
- Position: Top-right corner
- Appears on table hover

## Keyboard Navigation

```
┌──────────┬──────────┬──────────┐
│ Cell 1   │→ Tab →   │ Cell 3   │
├──────────┼──────────┼──────────┤
│ Cell 4   │← Shift+Tab│ Cell 6  │
└──────────┴──────────┴──────────┘

Enter: New line in cell
Delete/Backspace: Delete table (when wrapper selected)
```

## Tips

1. **Controls appear on hover** - Move mouse away to hide them
2. **Click cells to edit** - No need to open modal for text
3. **Use settings for styling** - Bulk changes and initial setup
4. **Minimum 1 row and 1 column** - Delete buttons disabled at minimum
5. **Controls don't interfere** - Positioned outside table boundaries
