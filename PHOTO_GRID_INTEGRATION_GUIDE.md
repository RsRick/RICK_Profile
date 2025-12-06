# Photo Grid Feature - Integration Guide

## Status: Partially Complete

### ✅ Completed:
1. **PhotoGridInput.jsx** - Modal component with 24 grid layouts
2. **CSS Styles** - All 24 grid layout styles in index.css
3. **Imports** - Added to RichTextEditor
4. **State Variables** - Added to RichTextEditor

### ⏳ Remaining Tasks:

#### 1. Add Handlers (Before `const toolbarButtons = [` at line 3783)

```javascript
// Photo Grid Handlers
const handleInsertPhotoGrid = () => {
  if (selectedPhotoGrid) {
    handleEditPhotoGrid(selectedPhotoGrid);
    return;
  }
  setPhotoGridData(null);
  setEditingPhotoGrid(null);
  saveSelection();
  setShowPhotoGridInput(true);
};

const handleEditPhotoGrid = (element) => {
  const layoutId = parseInt(element.getAttribute('data-layout-id'));
  const imagesStr = element.getAttribute('data-images');
  const images = JSON.parse(decodeURIComponent(imagesStr));
  
  // Find layout
  const GRID_LAYOUTS = [
    { id: 1, name: '2 Columns', cells: 2, template: 'grid-cols-2', rows: 1 },
    // ... (copy all 24 layouts from PhotoGridInput.jsx)
  ];
  
  const layout = GRID_LAYOUTS.find(l => l.id === layoutId);
  
  setPhotoGridData({ layout, images });
  setEditingPhotoGrid(element);
  setShowPhotoGridInput(true);
};

const handleSavePhotoGrid = (data) => {
  restoreSelection();
  
  let wrapper;
  if (editingPhotoGrid) {
    wrapper = editingPhotoGrid;
  } else {
    wrapper = document.createElement('div');
    wrapper.className = 'editor-photo-grid';
    wrapper.contentEditable = 'false';
  }

  // Store data
  wrapper.setAttribute('data-layout-id', data.layout.id);
  wrapper.setAttribute('data-images', encodeURIComponent(JSON.stringify(data.images)));
  wrapper.setAttribute('data-type', 'photo-grid');
  
  // Create grid container
  const container = document.createElement('div');
  container.className = `editor-photo-grid-container grid-layout-${data.layout.id}`;
  
  // Add cells with images
  data.images.forEach((imgUrl, index) => {
    const cell = document.createElement('div');
    cell.className = 'editor-grid-cell';
    
    if (imgUrl) {
      const img = document.createElement('img');
      img.src = imgUrl;
      img.alt = `Grid image ${index + 1}`;
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
      cell.appendChild(img);
    }
    
    container.appendChild(cell);
  });
  
  // Add settings button (gear icon)
  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'photo-grid-settings-btn';
  settingsBtn.type = 'button';
  settingsBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m0-6l4.2-4.2"></path></svg>';
  settingsBtn.style.cssText = `
    position: absolute;
    top: 8px;
    left: 8px;
    background: #0d9488;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 8px;
    cursor: pointer;
    opacity: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
  `;
  settingsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleEditPhotoGrid(wrapper);
  });
  
  // Add delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'photo-grid-delete-btn';
  deleteBtn.type = 'button';
  deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
  deleteBtn.style.cssText = `
    position: absolute;
    top: 8px;
    left: 48px;
    background: #dc2626;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 8px;
    cursor: pointer;
    opacity: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
  `;
  deleteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this photo grid?')) {
      wrapper.remove();
      setSelectedPhotoGrid(null);
      updateContent();
    }
  });
  
  wrapper.innerHTML = '';
  wrapper.appendChild(container);
  wrapper.appendChild(settingsBtn);
  wrapper.appendChild(deleteBtn);

  if (!editingPhotoGrid) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(wrapper);
      
      const space = document.createElement('p');
      space.innerHTML = '<br>';
      range.setStartAfter(wrapper);
      range.insertNode(space);
      
      range.setStartAfter(space);
      range.setEndAfter(space);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editorRef.current?.appendChild(wrapper);
    }
  }

  updateContent();
  setShowPhotoGridInput(false);
  setEditingPhotoGrid(null);
  setPhotoGridData(null);
};
```

#### 2. Add Toolbar Button (After File Upload button)

```javascript
<button
  type="button"
  onMouseDown={(e) => {
    e.preventDefault();
    handleInsertPhotoGrid();
  }}
  className="p-2 rounded hover:bg-gray-100 transition-colors"
  title="Insert Photo Grid"
>
  <Grid3x3 className="w-5 h-5" style={{ color: '#105652' }} />
</button>
```

#### 3. Add Modal Rendering (After FileUploadInput)

```javascript
{showPhotoGridInput && (
  <PhotoGridInput
    initialData={photoGridData}
    onSave={handleSavePhotoGrid}
    onCancel={() => {
      setShowPhotoGridInput(false);
      setEditingPhotoGrid(null);
      setPhotoGridData(null);
    }}
  />
)}
```

#### 4. Add Click Handler (After File Download selection)

```javascript
// Handle Photo Grid selection
let photoGridElement = e.target.closest('.editor-photo-grid');
if (photoGridElement) {
  if (e.target.closest('.photo-grid-settings-btn') || e.target.closest('.photo-grid-delete-btn')) {
    return;
  }
  
  e.preventDefault();
  handleEditPhotoGrid(photoGridElement);
  return;
}
```

#### 5. Add Keyboard Delete

```javascript
// Delete selected photo grid
if (selectedPhotoGrid && (e.key === 'Delete' || e.key === 'Backspace')) {
  e.preventDefault();
  selectedPhotoGrid.remove();
  setSelectedPhotoGrid(null);
  updateContent();
}
```

#### 6. Update Deselect & useEffect

```javascript
// Add to deselect:
setSelectedPhotoGrid(null);

// Add to useEffect dependency:
}, [isResizing, ..., selectedPhotoGrid]);
```

## Appwrite Setup

Create storage bucket:
```
Bucket ID: photo_grid_images
Permissions: Read access for all users
```

## Features

✅ 24 Different Grid Layouts
✅ Max 2 Rows Each
✅ Click Each Cell to Add Image
✅ URL or Upload Methods
✅ Images Fit with object-cover
✅ Gear Icon to Edit
✅ Delete Button
✅ Change Layout Option
✅ Responsive Design

## Grid Layouts Included

1-5: Simple grids (2, 3, 4 columns, 2x2, 3x2)
6-10: Asymmetric layouts
11-15: Creative masonry
16-20: Gallery & portfolio
21-24: Hero & collage styles

All layouts maintain aspect ratio and fit images perfectly!
