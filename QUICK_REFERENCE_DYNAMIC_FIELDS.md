# Quick Reference: Dynamic Project Fields

## 🚀 TL;DR

**What**: Dynamic, editable project detail fields instead of fixed ones
**Status**: Code is ready ✅
**Action Required**: Add ONE database attribute (2 minutes)

---

## 📋 Database Setup (Copy-Paste Values)

```
Attribute Key:  projectDetails
Type:          String
Size:          2000
Required:      No
Array:         Yes ✓  ← CRITICAL!
Default:       (empty)
```

---

## 🎯 Quick Links

| Document | Use When |
|----------|----------|
| `ADD_PROJECTDETAILS_ATTRIBUTE.md` | Setting up database |
| `APPWRITE_ATTRIBUTE_SCREENSHOT_GUIDE.md` | Need visual guide |
| `DYNAMIC_PROJECT_FIELDS_GUIDE.md` | Using the feature |
| `SETUP_SUMMARY_DYNAMIC_FIELDS.md` | Overview & testing |

---

## ✨ Features at a Glance

| Feature | Description |
|---------|-------------|
| **Editable Labels** | Change "Software" to anything |
| **Editable Values** | Custom content per field |
| **Add Fields** | Click "Add Field" button |
| **Remove Fields** | Click X button |
| **Auto Grid** | 2-4 columns based on count |
| **Pure White** | Clean neumorphic design |
| **Backward Compatible** | Old projects still work |

---

## 🎨 Grid Layout Rules

| Field Count | Columns | Example |
|-------------|---------|---------|
| 1-2 fields | 2 cols | `[■■]` |
| 3-4 fields | 2 cols | `[■■][■■]` |
| 5-6 fields | 3 cols | `[■■■][■■■]` |
| 7+ fields | 4 cols | `[■■■■][■■■■]` |
| Portrait image | 1 col | `[■][■][■][■]` |

---

## 🔄 Data Format

### In Admin Panel (Edit Mode)
```javascript
[
  { label: "Software", value: "ArcGIS Pro" },
  { label: "Client", value: "Ministry" }
]
```

### In Database (Stored)
```javascript
[
  '{"label":"Software","value":"ArcGIS Pro"}',
  '{"label":"Client","value":"Ministry"}'
]
```

### On Frontend (Display)
```
┌──────────────┐  ┌──────────────┐
│  SOFTWARE    │  │  CLIENT      │
│  ArcGIS Pro  │  │  Ministry    │
└──────────────┘  └──────────────┘
```

---

## ⚡ Quick Test

1. Add attribute to database
2. Go to `/admin/projects`
3. Click "Add Project"
4. Scroll to "Project Details"
5. Edit a label
6. Click "Add Field"
7. Save project
8. View on frontend

**Expected Time**: 5 minutes

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Attribute not found" | Create `projectDetails` attribute |
| Fields not saving | Check "Array" is enabled |
| Old format showing | Edit project to convert |
| Grid looks weird | Reduce to 6 or fewer fields |

---

## 📊 Comparison

### Before (Fixed)
```
✗ Only 4 fields
✗ Can't change labels
✗ Fixed: Software, Timeframe, Data Source, Study Area
```

### After (Dynamic)
```
✓ Unlimited fields
✓ Custom labels
✓ Add/remove anytime
✓ Auto-adjusting layout
```

---

## 💾 Backup Compatibility

| Scenario | Works? |
|----------|--------|
| Old projects without attribute | ✅ Yes |
| New projects with attribute | ✅ Yes |
| Mixed old and new | ✅ Yes |
| Edit old project | ✅ Auto-converts |

---

## 🎓 Examples

### Minimal (2 fields)
```
Tools: Python, Pandas
Year: 2024
```

### Standard (4 fields)
```
Software: ArcGIS Pro
Timeframe: 2023-2024
Data Source: USGS
Study Area: Bangladesh
```

### Extended (6 fields)
```
Software: ArcGIS Pro, QGIS
Duration: 3 months
Client: Ministry of Environment
Study Area: Dhaka Division
Team Size: 5 researchers
Budget: $50,000
```

---

## 🎯 Best Practices

1. **Keep labels short** (1-3 words)
2. **Use 3-6 fields** for optimal display
3. **Be consistent** across similar projects
4. **Empty fields auto-hide** - no need to delete
5. **Test on mobile** after adding many fields

---

## 📞 Need Help?

1. Check browser console for errors
2. Verify attribute settings in Appwrite
3. Clear browser cache
4. Try incognito mode
5. Check `projectDetails` spelling (case-sensitive)

---

**Last Updated**: November 19, 2025
**Version**: 1.0
**Status**: Production Ready ✨
