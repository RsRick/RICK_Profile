# Table Controls Fix

## Changes Made

### 1. CSS Hover Trigger Changed
**Before:**
```css
.table-row:hover .table-row-controls { display: flex !important; }
.table-cell:hover .table-col-controls { display: flex !important; }
```

**After:**
```css
.editor-table-wrapper:hover .table-row-controls { display: flex !important; }
.editor-table-wrapper:hover .table-col-controls { display: flex !important; }
```

**Why**: Controls now show when hovering anywhere on the table, not just specific rows/cells

---

### 2. Wrapper Spacing Added
**Before:**
```css
margin: 1.5rem 0;
overflow-x: auto;
width: 100%;
```

**After:**
```css
margin: 1.5rem 0;
margin-left: 50px;
margin-top: 50px;
overflow: visible;
width: calc(100% - 50px);
```

**Why**: Creates space for controls to be visible outside the table

---

## How It Works Now

1. **Hover anywhere on the table** → All controls become visible
2. **Controls positioned outside table** → Won't overlap content
3. **Settings button always visible** → Top-right corner

---

## Testing

1. Insert a table
2. Hover your mouse anywhere over the table
3. You should see:
   - Plus icons on the left (for rows)
   - Plus icons on top (for columns)
   - Settings icon in top-right (always visible)

---

## Visual Layout

```
        [+] [+] [×]  ← Column controls (show on table hover)
         ↓   ↓   ↓
    ┌─────────────────────────┐
    │                  [⚙️]   │ ← Settings (always visible)
    │  ┌─────┬─────┬─────┐   │
[+] │  │  H  │  H  │  H  │   │
[+] │  ├─────┼─────┼─────┤   │
[×] │  │  C  │  C  │  C  │   │
    │  └─────┴─────┴─────┘   │
    └─────────────────────────┘
     ↑
     Row controls (show on table hover)
```

---

## If Controls Still Don't Show

Try these steps:
1. Refresh the page (Ctrl+F5)
2. Clear browser cache
3. Check browser console for errors
4. Make sure you're hovering over the table area
5. Try clicking inside a cell first, then hover

---

## Status

✅ CSS updated to show controls on table hover
✅ Wrapper spacing added for control visibility
✅ Settings button always visible
✅ Ready to test
