# Quick Test Guide - Table Feature

## 🚀 Quick Test (2 minutes)

### Test 1: Insert Table
1. Click table icon in toolbar
2. Set rows: 3, columns: 3
3. Click "Insert Table"
4. ✅ **Expected**: Table appears, first row is bold

### Test 2: Edit Cell
1. Click any cell
2. Type "Hello World"
3. ✅ **Expected**: Text appears in cell

### Test 3: Bold Text
1. Select the text you just typed
2. Click Bold button in toolbar (or Ctrl+B)
3. ✅ **Expected**: Text becomes bold

### Test 4: Add Row
1. Hover over any row
2. Look for controls on the left side
3. Click the + button
4. ✅ **Expected**: New row added

### Test 5: Add Column
1. Hover over a cell in the first row
2. Look for controls on top
3. Click the + button
4. ✅ **Expected**: New column added

### Test 6: Settings Button
1. Hover over the table
2. Look for ⚙️ button in top-right corner
3. Click it
4. ✅ **Expected**: Modal opens, editor stays open

### Test 7: Insert Link
1. Click a cell
2. Type "Click here"
3. Select the text
4. Click link icon in toolbar
5. Enter URL: https://example.com
6. Click insert
7. ✅ **Expected**: Link created in cell

---

## 🎯 Visual Verification

### What You Should See

**When hovering over a row:**
```
[+]  ← These buttons appear
[+]     on the left side
[×]
```

**When hovering over first row cell:**
```
[+] [+] [×]  ← These buttons appear
 ↓   ↓   ↓      on top
```

**When hovering over table:**
```
                [⚙️]  ← This button appears
                        in top-right corner
```

---

## ✅ Success Criteria

All of these should work:
- ✅ Table inserts
- ✅ First row is bold
- ✅ Can type in cells
- ✅ Bold/italic/underline work
- ✅ Font/size/color work
- ✅ Links work
- ✅ Buttons work
- ✅ Row controls visible on hover
- ✅ Column controls visible on hover
- ✅ Settings button visible on hover
- ✅ Settings button opens modal
- ✅ Editor doesn't close

---

## 🐛 If Something Doesn't Work

### Controls not appearing?
- Make sure you're hovering directly over the row/cell
- Wait 0.2 seconds for transition
- Try refreshing the page

### Settings button not working?
- Make sure you're clicking the ⚙️ button
- It should be in the top-right corner of the table
- Hover over the table to make it visible

### Can't edit cells?
- Click directly on the cell content
- Make sure you're not clicking the border
- Cell should get a teal outline when focused

### Toolbar features not working?
- Select the text first
- Then use toolbar buttons
- Make sure you're inside a cell

---

## 💡 Pro Tips

1. **Header row is automatically bold** - No need to make it bold manually
2. **Select text before formatting** - Highlight text, then use toolbar
3. **Hover to reveal controls** - Controls only show when needed
4. **Use keyboard shortcuts** - Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline)
5. **Tab to navigate** - Press Tab to move between cells

---

## 🎊 You're Done!

If all tests pass, your table feature is working perfectly!

**Enjoy creating beautiful tables!** 🎉
