# Appwrite Setup for Link Management

## Database Updates Required

You need to add two new attributes to your `projects` collection in Appwrite.

### Step-by-Step Instructions

#### 1. Open Appwrite Console
- Go to your Appwrite console
- Navigate to **Databases**
- Select your database: `portfolio_db`
- Click on the `projects` collection

#### 2. Add `customSlug` Attribute

Click **"Add Attribute"** and configure:

```
Type: String
Key: customSlug
Size: 100
Required: Yes
Default: (leave empty)
Array: No
```

**Settings:**
- ✅ Required
- ❌ Array
- Size: 100 characters (enough for most slugs)

#### 3. Add `useProjectPrefix` Attribute

Click **"Add Attribute"** again and configure:

```
Type: Boolean
Key: useProjectPrefix
Required: Yes
Default: true
Array: No
```

**Settings:**
- ✅ Required
- ❌ Array
- Default value: `true`

#### 4. Update Existing Projects (Important!)

After adding these attributes, you need to update existing projects:

**Option A: Via Appwrite Console**
1. Go to the `projects` collection
2. Click on each existing project
3. Add values:
   - `customSlug`: Generate from title (e.g., "My Project" → "my-project")
   - `useProjectPrefix`: Set to `true`
4. Save each project

**Option B: Via Admin Panel (Recommended)**
1. Go to your admin panel
2. Edit each existing project
3. Expand "Link Management" section
4. Click "Auto-generate from Title"
5. Save the project

This will automatically populate the new fields.

### Attribute Summary

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `customSlug` | String | Yes | - | URL-friendly project identifier |
| `useProjectPrefix` | Boolean | Yes | `true` | Whether to use `/project/` prefix |

### Verification

To verify the setup is correct:

1. Create a new project in admin panel
2. Expand "Link Management" section
3. Generate or enter a slug
4. Save the project
5. Visit the custom URL
6. Project should display as a standalone page

### Troubleshooting

**Error: "Attribute not found"**
- Make sure both attributes are created
- Check spelling: `customSlug` and `useProjectPrefix` (case-sensitive)
- Refresh your admin panel

**Error: "Required attribute missing"**
- Update all existing projects with the new fields
- Or temporarily make attributes optional, update projects, then make required

**Projects not loading**
- Check browser console for errors
- Verify attribute names match exactly
- Ensure all projects have valid slugs

### Migration Script (Optional)

If you have many projects, you can use this approach:

1. Make attributes **optional** initially
2. Update all projects via admin panel
3. Once all projects have values, make attributes **required**

This prevents errors during the transition period.

## Complete! 🎉

Your Appwrite database is now ready for the Link Management system.
