# Adding Font Selectors to Admin Pages - Quick Guide

This guide shows you how to add font selection capability to any new admin form field.

## Step 1: Import FontSelector Component

```jsx
import FontSelector from '../../../components/FontSelector/FontSelector';
```

## Step 2: Add Font State

Add a state variable for the font alongside your text content state:

```jsx
const [myText, setMyText] = useState('Default Text');
const [myTextFont, setMyTextFont] = useState("'Open Sans', sans-serif");
```

## Step 3: Add Font Field to Database Operations

### In Load Function:
```jsx
const loadData = async () => {
  // ... existing code
  if (settings.myText) setMyText(settings.myText);
  if (settings.myTextFont) setMyTextFont(settings.myTextFont);
};
```

### In Save Function:
```jsx
const saveData = async () => {
  const data = {
    myText: myText,
    myTextFont: myTextFont,
    // ... other fields
  };
  // ... save to database
};
```

## Step 4: Add FontSelector to UI

Replace or add alongside your text input:

```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    My Text
  </label>
  <input
    type="text"
    value={myText}
    onChange={(e) => setMyText(e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
  />
  
  <FontSelector
    value={myTextFont}
    onChange={setMyTextFont}
    label="Text Font"
    previewText={myText || 'Preview Text'}
  />
</div>
```

## Step 5: Update Appwrite Collection

Add the font attribute to your collection:

**Attribute Name:** `myTextFont` (or whatever you named it)
**Type:** String
**Size:** 500 characters
**Required:** No
**Default:** `'Open Sans', sans-serif'` (or your preferred default)

## Complete Example

Here's a complete example for a "Project Title" field:

```jsx
import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { databaseService } from '../../../lib/appwrite';
import FontSelector from '../../../components/FontSelector/FontSelector';

export default function ProjectsAdmin() {
  const [projectTitle, setProjectTitle] = useState('My Project');
  const [projectTitleFont, setProjectTitleFont] = useState("'Playfair Display', serif");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const result = await databaseService.listDocuments('projects');
      if (result.success && result.data.documents.length > 0) {
        const data = result.data.documents[0];
        if (data.projectTitle) setProjectTitle(data.projectTitle);
        if (data.projectTitleFont) setProjectTitleFont(data.projectTitleFont);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const projectData = {
        projectTitle: projectTitle,
        projectTitleFont: projectTitleFont,
      };

      // Update or create document
      const result = await databaseService.updateDocument(
        'projects',
        'document-id',
        projectData
      );

      if (result.success) {
        alert('Saved successfully!');
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Projects Settings</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Title
          </label>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            placeholder="Enter project title"
          />
          
          <FontSelector
            value={projectTitleFont}
            onChange={setProjectTitleFont}
            label="Title Font"
            previewText={projectTitle}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3 bg-[#105652] text-white rounded-lg hover:bg-[#0d4240] disabled:opacity-50"
        >
          <Save className="w-5 h-5 inline mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
```

## FontSelector Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | string | Yes | Current font value (e.g., `"'Roboto', sans-serif"`) |
| `onChange` | function | Yes | Callback when font changes |
| `label` | string | No | Label text (default: "Font") |
| `previewText` | string | No | Text to preview (default: "Preview Text") |

## Common Font Defaults

Use these as default values based on content type:

```jsx
// Headings/Titles
const [titleFont, setTitleFont] = useState("'Playfair Display', serif");

// Body Text
const [bodyFont, setBodyFont] = useState("'Open Sans', sans-serif");

// Display/Hero Text
const [heroFont, setHeroFont] = useState("'Bebas Neue', cursive");

// Code/Technical
const [codeFont, setCodeFont] = useState("'Roboto Mono', monospace");

// Bangla Text
const [banglaFont, setBanglaFont] = useState("'Noto Sans Bengali', sans-serif");
```

## Tips

1. **Preview Text**: Use actual content for preview when possible
2. **Default Fonts**: Choose sensible defaults that match your design
3. **Database Fields**: Always make font fields optional with defaults
4. **Loading**: Load custom fonts on app initialization (already done in App.jsx)
5. **Testing**: Test with both English and Bangla text if applicable

## Applying Fonts in Frontend Components

When displaying content with custom fonts:

```jsx
// In your frontend component
const [content, setContent] = useState({ text: '', font: '' });

useEffect(() => {
  loadContent();
}, []);

const loadContent = async () => {
  const result = await databaseService.getDocument('collection', 'docId');
  if (result.success) {
    setContent({
      text: result.data.myText,
      font: result.data.myTextFont
    });
  }
};

return (
  <div style={{ fontFamily: content.font }}>
    {content.text}
  </div>
);
```

## Need Help?

- Check `FONT_MANAGEMENT_SETUP.md` for system setup
- See existing implementations in:
  - `src/pages/Admin/AboutMe/AboutMe.jsx`
  - `src/pages/Admin/HeaderSection/HeaderSection.jsx`
- Font selector component: `src/components/FontSelector/FontSelector.jsx`
