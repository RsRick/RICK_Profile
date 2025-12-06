# Appwrite Setup - Visual Step-by-Step Guide

## 🎯 Goal
Add two new attributes to your `projects` collection for the Link Management system.

---

## 📍 Step 1: Navigate to Your Collection

1. Open **Appwrite Console**
2. Click **Databases** in sidebar
3. Select database: **`portfolio_db`**
4. Click on collection: **`projects`**

```
Appwrite Console
├── Databases
│   └── portfolio_db
│       └── projects ← YOU ARE HERE
```

---

## ➕ Step 2: Add First Attribute (customSlug)

### Click "Create Attribute" Button

You'll see a form. Fill it out:

```
┌─────────────────────────────────────┐
│ Create Attribute                    │
├─────────────────────────────────────┤
│                                     │
│ Attribute Type:                     │
│ ○ String  ● String  ○ Integer      │
│ ○ Float   ○ Boolean ○ DateTime     │
│ ○ Email   ○ IP      ○ URL          │
│                                     │
│ Attribute Key: *                    │
│ [customSlug________________]        │
│                                     │
│ Size: *                             │
│ [100_______]                        │
│                                     │
│ Required:                           │
│ ☑ Required                          │
│                                     │
│ Array:                              │
│ ☐ Array                             │
│                                     │
│ Default Value:                      │
│ [_________________________]         │
│ (leave empty)                       │
│                                     │
│         [Cancel]  [Create]          │
└─────────────────────────────────────┘
```

### Configuration:
- **Type**: String
- **Key**: `customSlug`
- **Size**: `100`
- **Required**: ✅ Checked
- **Array**: ❌ Unchecked
- **Default**: Leave empty

### Click "Create" ✅

---

## ➕ Step 3: Add Second Attribute (useProjectPrefix)

### Click "Create Attribute" Button Again

Fill out the form:

```
┌─────────────────────────────────────┐
│ Create Attribute                    │
├─────────────────────────────────────┤
│                                     │
│ Attribute Type:                     │
│ ○ String  ○ String  ○ Integer      │
│ ○ Float   ● Boolean ○ DateTime     │
│ ○ Email   ○ IP      ○ URL          │
│                                     │
│ Attribute Key: *                    │
│ [useProjectPrefix__________]        │
│                                     │
│ Required:                           │
│ ☑ Required                          │
│                                     │
│ Array:                              │
│ ☐ Array                             │
│                                     │
│ Default Value:                      │
│ ☑ true                              │
│                                     │
│         [Cancel]  [Create]          │
└─────────────────────────────────────┘
```

### Configuration:
- **Type**: Boolean
- **Key**: `useProjectPrefix`
- **Required**: ✅ Checked
- **Array**: ❌ Unchecked
- **Default**: ✅ `true`

### Click "Create" ✅

---

## ✅ Step 4: Verify Attributes

Your `projects` collection should now have these attributes:

```
projects Collection Attributes:
┌──────────────────────┬──────────┬──────────┬─────────┐
│ Key                  │ Type     │ Required │ Default │
├──────────────────────┼──────────┼──────────┼─────────┤
│ title                │ String   │ Yes      │ -       │
│ category             │ String   │ Yes      │ -       │
│ description          │ String   │ Yes      │ -       │
│ thumbnailUrl         │ String   │ Yes      │ -       │
│ galleryUrls          │ String[] │ No       │ -       │
│ likes                │ Integer  │ Yes      │ 0       │
│ featured             │ Boolean  │ Yes      │ false   │
│ projectDetails       │ String[] │ No       │ -       │
│ projectLink          │ String   │ Yes      │ -       │
│ fullDescription      │ String   │ Yes      │ -       │
│ customSlug           │ String   │ Yes      │ -       │ ← NEW!
│ useProjectPrefix     │ Boolean  │ Yes      │ true    │ ← NEW!
└──────────────────────┴──────────┴──────────┴─────────┘
```

---

## 🔄 Step 5: Update Existing Projects

### Option A: Via Appwrite Console (Manual)

For each existing project:

1. Click on the project document
2. Click "Update Document"
3. Add the new fields:
   ```json
   {
     "customSlug": "my-project-name",
     "useProjectPrefix": true
   }
   ```
4. Click "Update"

### Option B: Via Admin Panel (Recommended)

1. Go to your admin panel
2. Navigate to Project Management
3. Click "Edit" on each project
4. Expand "Link Management" section
5. Click "Auto-generate from Title"
6. Click "Update Project"

**This is easier and faster!** ✅

---

## 🎨 Visual Checklist

```
Setup Progress:
[✅] Opened Appwrite Console
[✅] Found portfolio_db database
[✅] Found projects collection
[✅] Created customSlug attribute
[✅] Created useProjectPrefix attribute
[✅] Verified both attributes exist
[✅] Updated existing projects
[✅] Tested with new project
```

---

## 🧪 Testing

### Create a Test Project:

1. Go to Admin Panel
2. Click "Add Project"
3. Fill in basic info
4. Expand "Link Management"
5. Enter slug: `test-project`
6. Save project

### Verify in Appwrite:

1. Go to Appwrite Console
2. Open `projects` collection
3. Find your test project
4. Check fields:
   - `customSlug`: "test-project" ✅
   - `useProjectPrefix`: true ✅

### Test the URL:

Visit: `http://localhost:5173/project/test-project`

Should show your project page! 🎉

---

## 🚨 Common Issues

### Issue: "Attribute already exists"
**Solution**: Attribute was already created. Skip to next step.

### Issue: "Required attribute missing"
**Cause**: Existing projects don't have the new fields.
**Solution**: 
- Make attributes optional temporarily
- Update all projects
- Make attributes required again

### Issue: Can't create attribute
**Cause**: Permission issues
**Solution**: Check you're logged in as admin/owner

### Issue: Attribute not showing in admin
**Cause**: Browser cache
**Solution**: Hard refresh (Ctrl+F5) or clear cache

---

## 📊 Attribute Details

### customSlug (String)

**Purpose**: URL-friendly identifier for the project

**Examples:**
```
"gis-mapping-project"
"covid-19-analysis"
"portfolio-website-2024"
```

**Validation:**
- Lowercase only
- Numbers allowed
- Hyphens for spaces
- No special characters

**Size**: 100 characters (plenty for most slugs)

---

### useProjectPrefix (Boolean)

**Purpose**: Controls URL structure

**Values:**
- `true`: Uses `/project/` prefix
  - Example: `http://localhost:5173/project/my-slug`
- `false`: No prefix
  - Example: `http://localhost:5173/my-slug`

**Default**: `true` (recommended)

---

## 🎯 Quick Reference

### Attribute 1:
```
Name: customSlug
Type: String
Size: 100
Required: Yes
Default: (empty)
```

### Attribute 2:
```
Name: useProjectPrefix
Type: Boolean
Required: Yes
Default: true
```

---

## ✨ You're Done!

Your Appwrite database is now configured for the Link Management system.

**Next Steps:**
1. ✅ Update existing projects with slugs
2. ✅ Create new projects with custom URLs
3. ✅ Start sharing your projects!

**Need Help?**
- Check browser console for errors
- Verify attribute names (case-sensitive!)
- Review the main setup guide
- Test with a simple project first

---

**Happy Sharing! 🚀**
