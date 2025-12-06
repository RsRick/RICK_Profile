# Quick Guide: Add projectDetails Attribute

## 🎯 What You Need to Do

Add **ONE** new attribute to your Appwrite database to enable dynamic project fields.

## 📋 Step-by-Step Instructions

### Step 1: Open Appwrite Console
1. Go to https://cloud.appwrite.io
2. Select your project
3. Click **Databases** in the left sidebar
4. Click on `portfolio_db` database
5. Click on `projects` collection

### Step 2: Create New Attribute
1. Click the **"Create Attribute"** button (usually at the top right)
2. Select **"String"** as the attribute type

### Step 3: Fill in the Form

```
┌─────────────────────────────────────────┐
│  Create String Attribute                │
├─────────────────────────────────────────┤
│                                         │
│  Attribute Key:  projectDetails         │
│                                         │
│  Size:          2000                    │
│                                         │
│  Required:      [ ] No (unchecked)      │
│                                         │
│  Array:         [✓] Yes (CHECKED!)      │
│                                         │
│  Default:       (leave empty)           │
│                                         │
│         [Cancel]  [Create Attribute]    │
└─────────────────────────────────────────┘
```

### Step 4: Important Settings

| Setting | Value | Why |
|---------|-------|-----|
| **Attribute Key** | `projectDetails` | Exact name (case-sensitive) |
| **Type** | String | To store JSON strings |
| **Size** | `2000` | Large enough for JSON data |
| **Required** | ❌ No | Optional field |
| **Array** | ✅ Yes | **CRITICAL!** Must be checked |
| **Default** | (empty) | No default value |

### Step 5: Verify
After creating, you should see `projectDetails` in your attributes list:
- Type: String
- Array: Yes
- Size: 2000
- Required: No

## ✅ That's It!

Once you add this attribute:
- Your existing projects will continue to work
- You can now use dynamic fields in the admin panel
- Edit any project to see the new "Project Details" section

## 🧪 Test It

1. Go to your admin panel: `/admin/projects`
2. Click "Add Project" or edit an existing one
3. Scroll to "Project Details" section
4. You should see editable label/value fields
5. Click "Add Field" to add more fields
6. Save and view the project

## ❓ FAQ

**Q: Do I need to delete the old fields (software, timeframe, etc.)?**
A: No! Keep them for backward compatibility. The system handles both formats.

**Q: What happens to my existing projects?**
A: They continue to work. When you edit them, they'll automatically convert to the new format.

**Q: Can I use JSON type instead of String Array?**
A: If your Appwrite version supports JSON attributes, yes! But String Array works everywhere.

**Q: What if I forget to check "Array"?**
A: The system won't work correctly. Delete the attribute and recreate it with Array checked.

## 🆘 Need Help?

If you see errors:
1. Make sure the attribute key is exactly `projectDetails` (case-sensitive)
2. Verify "Array" is checked
3. Check size is at least 2000
4. Clear browser cache and reload admin panel

---

**Estimated Time:** 2 minutes ⏱️
