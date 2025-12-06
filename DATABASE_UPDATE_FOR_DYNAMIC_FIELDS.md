# Database Update for Dynamic Project Fields

## ⚠️ IMPORTANT: Database Schema Update Required

To use the new dynamic project fields feature, you need to add a new attribute to your Appwrite database.

## 🔧 Steps to Update Your Database

### 1. Go to Appwrite Console
1. Open your Appwrite Console: https://cloud.appwrite.io
2. Navigate to your project
3. Go to **Databases** → `portfolio_db`
4. Open the `projects` collection

### 2. Add New Attribute

Click **"Create Attribute"** and add:

#### **projectDetails** (String Array)
- **Attribute Key**: `projectDetails`
- **Type**: `String`
- **Size**: `2000` (to store JSON strings)
- **Required**: ❌ No
- **Array**: ✅ Yes (Multiple values)
- **Default**: None

**Why Array?** Each array element will store a JSON string like:
```json
"{\"label\":\"Software\",\"value\":\"ArcGIS Pro\"}"
```

### 3. Alternative: Use JSON Attribute (If Available)

If your Appwrite version supports JSON attributes directly:

#### **projectDetails** (JSON)
- **Attribute Key**: `projectDetails`
- **Type**: `JSON`
- **Required**: ❌ No
- **Array**: ❌ No
- **Default**: `[]`

This is cleaner but may not be available in all Appwrite versions.

## 📝 What Happens to Old Data?

### Backward Compatibility
The code is **fully backward compatible**:

1. **Old projects** with `software`, `timeframe`, `dataSource`, `studyArea` fields will continue to work
2. When you **edit an old project**, it automatically converts to the new format
3. **New projects** will use the `projectDetails` array
4. The frontend displays both formats correctly

### Migration Strategy

You have two options:

#### Option A: Keep Both (Recommended)
- Keep the old fields: `software`, `timeframe`, `dataSource`, `studyArea`
- Add the new field: `projectDetails`
- The system will use `projectDetails` if it exists, otherwise fall back to old fields
- **Advantage**: No data loss, gradual migration

#### Option B: Full Migration
- Add `projectDetails` field
- Edit each project in the admin panel and save it (this converts it to new format)
- After all projects are converted, you can optionally delete the old fields
- **Advantage**: Cleaner database schema

## 🎯 Recommended Approach

**Use Option A (Keep Both)**:

1. Add the `projectDetails` attribute to your database
2. Your existing projects will continue to work
3. When you edit a project, it will automatically save in the new format
4. New projects will use the new format from the start

## 🧪 Testing

After adding the attribute:

1. Go to Admin Panel → Project Management
2. Edit an existing project
3. You should see the dynamic fields section
4. Add/edit/remove fields
5. Save the project
6. View it on the frontend to confirm it displays correctly

## 📊 Database Structure Comparison

### Old Format (Still Supported)
```json
{
  "title": "My Project",
  "software": "ArcGIS Pro",
  "timeframe": "2023-2024",
  "dataSource": "USGS",
  "studyArea": "Bangladesh"
}
```

### New Format (Recommended)
```json
{
  "title": "My Project",
  "projectDetails": [
    "{\"label\":\"Software\",\"value\":\"ArcGIS Pro\"}",
    "{\"label\":\"Timeframe\",\"value\":\"2023-2024\"}",
    "{\"label\":\"Data Source\",\"value\":\"USGS\"}",
    "{\"label\":\"Study Area\",\"value\":\"Bangladesh\"}",
    "{\"label\":\"Client\",\"value\":\"Ministry of Environment\"}",
    "{\"label\":\"Budget\",\"value\":\"$50,000\"}"
  ]
}
```

**Note**: Each array element is a JSON string. The code automatically:
- **Saves**: Converts `{label, value}` objects to JSON strings
- **Loads**: Parses JSON strings back to `{label, value}` objects

## ⚡ Quick Setup Commands

If you prefer to use Appwrite CLI:

```bash
# Add the attribute using Appwrite CLI
appwrite databases createStringAttribute \
  --databaseId portfolio_db \
  --collectionId projects \
  --key projectDetails \
  --size 2000 \
  --required false \
  --array true
```

## 🐛 Troubleshooting

### Error: "Attribute not found"
- Make sure you added the `projectDetails` attribute to your database
- Check the attribute key is exactly `projectDetails` (case-sensitive)

### Error: "Invalid document structure"
- The attribute must be an array type
- Size should be at least 2000 to store JSON strings

### Projects not saving
- Check browser console for errors
- Verify the attribute was created successfully in Appwrite
- Make sure collection permissions allow updates

## ✅ Verification Checklist

- [ ] Added `projectDetails` attribute to `projects` collection
- [ ] Attribute type is String with Array enabled
- [ ] Attribute size is 2000 or more
- [ ] Tested creating a new project with custom fields
- [ ] Tested editing an existing project
- [ ] Verified fields display correctly in modal
- [ ] Checked that empty fields don't show on frontend

---

**Need Help?** Check the Appwrite documentation: https://appwrite.io/docs/products/databases/collections
