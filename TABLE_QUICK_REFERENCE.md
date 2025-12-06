# Table Feature - Quick Reference

## 🚀 Quick Actions

| Action | How To |
|--------|--------|
| **Insert Table** | Click table icon → Set dimensions → Insert |
| **Edit Cell** | Click cell → Type |
| **Add Row Above** | Hover row → Click top + |
| **Add Row Below** | Hover row → Click bottom + |
| **Add Column Left** | Hover first row cell → Click left + |
| **Add Column Right** | Hover first row cell → Click right + |
| **Delete Row** | Hover row → Click × |
| **Delete Column** | Hover first row cell → Click × |
| **Open Settings** | Hover table → Click ⚙️ |
| **Insert Link** | Click cell → Select text → Link button |
| **Insert Button** | Click cell → Button icon → Configure |
| **Format Text** | Click cell → Select text → Use toolbar |
| **Delete Table** | Click wrapper → Press Delete |

## 🎨 Control Locations

```
        Column Controls (top of first row)
              [+] [+] [×]
               ↓   ↓   ↓
    ┌─────────────────────────┐
    │                  [⚙️]   │ Settings (top-right)
    │  ┌─────┬─────┬─────┐   │
[+] │  │  H  │  H  │  H  │   │
[+] │  ├─────┼─────┼─────┤   │
[×] │  │  C  │  C  │  C  │   │
    │  └─────┴─────┴─────┘   │
    └─────────────────────────┘
     ↑
     Row Controls (left side)
```

## 🎯 Common Tasks

### Create a 3x4 Table
1. Click table icon
2. Rows: 3, Columns: 4
3. Click "Insert Table"

### Style Header Row
1. Hover table → Click ⚙️
2. Change "Header Background" color
3. Change "Header Text Color"
4. Click "Update Table"

### Add Striped Rows
1. Hover table → Click ⚙️
2. Check "Striped Rows"
3. Choose stripe color
4. Click "Update Table"

### Style Individual Cell
1. Hover table → Click ⚙️
2. Click the cell you want to style
3. Change font, size, color, alignment
4. Click "Apply to Cell"
5. Click "Update Table"

### Insert Link in Cell
1. Click cell
2. Type text
3. Select text
4. Click link icon in toolbar
5. Enter URL
6. Click insert

## 🎨 Styling Options

### Per Cell
- Font family
- Font size
- Text color
- Background color
- Alignment (left/center/right)
- Bold
- Italic

### Whole Table
- Border color
- Border width
- Header background
- Header text color
- Striped rows
- Stripe color

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Next cell |
| `Shift+Tab` | Previous cell |
| `Enter` | New line in cell |
| `Delete` | Delete table (when wrapper selected) |
| `Backspace` | Delete table (when wrapper selected) |

## 🎨 Button Colors

| Button | Color | Purpose |
|--------|-------|---------|
| + (Add) | Teal | Add row/column |
| × (Delete) | Red | Delete row/column |
| ⚙️ (Settings) | Teal | Open settings |

## ⚡ Pro Tips

1. **Click cells directly** - No need to open modal for basic editing
2. **Hover to reveal controls** - Keeps interface clean
3. **Use settings for bulk changes** - Faster than cell-by-cell
4. **Tab between cells** - Quick navigation
5. **All toolbar features work** - Links, buttons, formatting, etc.

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Controls don't appear | Hover over row/cell, wait 0.2s |
| Can't edit cell | Click directly on cell content |
| Settings closes editor | Fixed - should work now |
| Can't add row/column | Hover to reveal + buttons |
| Can't delete | Need > 1 row/column to delete |

## 📊 Limits

- **Max rows**: 20 (in creation modal)
- **Max columns**: 10 (in creation modal)
- **Min rows**: 1 (can't delete last row)
- **Min columns**: 1 (can't delete last column)
- **No limit** on rows/columns added after creation

## ✅ Feature Checklist

- [x] Insert table
- [x] Edit cells
- [x] Add rows
- [x] Add columns
- [x] Delete rows
- [x] Delete columns
- [x] Cell styling
- [x] Table styling
- [x] Links in cells
- [x] Buttons in cells
- [x] Text formatting
- [x] Settings modal
- [x] Delete table
- [x] Hover controls
- [x] Keyboard navigation

## 🎉 You're Ready!

Everything is implemented and working. Start creating tables!
