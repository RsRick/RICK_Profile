# Dynamic Project Details Fields Guide

## Overview
The project management system now supports **dynamic project detail fields** instead of fixed fields. You can add, edit, and remove custom fields for each project.

## Features

### 1. **Editable Field Labels**
- Change field names from defaults (Software, Timeframe, etc.) to anything you want
- Examples: "Tools Used", "Duration", "Client", "Budget", etc.

### 2. **Editable Field Values**
- Add custom content for each field
- No character limits

### 3. **Add/Remove Fields**
- Click "Add Field" to add more detail fields
- Click the X button to remove any field
- No minimum or maximum limit (but keep it reasonable for display)

### 4. **Auto-Adjusting Grid Layout**
The modal automatically adjusts the grid based on the number of fields:
- **1-2 fields**: 2 columns
- **3-4 fields**: 2 columns
- **5-6 fields**: 3 columns
- **7+ fields**: 4 columns
- **Portrait images**: Always 1 column (stacked)

### 5. **Pure White Design**
All detail cards now have a pure white background (#ffffff) with neumorphic shadows for a clean, modern look.

## How to Use in Admin Panel

1. **Go to Project Management** → Add/Edit Project
2. **Scroll to "Project Details" section**
3. **Edit existing fields**:
   - Change the label (left input)
   - Change the value (right input)
4. **Add new fields**:
   - Click "Add Field" button
   - Enter label and value
5. **Remove fields**:
   - Click the X button next to any field
6. **Empty fields are automatically hidden** - no need to delete them

## Examples

### Example 1: GIS Project
```
Label: Software → Value: ArcGIS Pro, QGIS
Label: Duration → Value: 3 months
Label: Client → Value: Ministry of Environment
Label: Study Area → Value: Dhaka Division
```

### Example 2: Research Project
```
Label: Methodology → Value: Mixed Methods
Label: Sample Size → Value: 500 participants
Label: Timeline → Value: Jan 2024 - Jun 2024
Label: Funding → Value: Research Grant
Label: Team Size → Value: 5 researchers
Label: Publications → Value: 2 papers submitted
```

### Example 3: Minimal Project
```
Label: Tools → Value: Python, Pandas
Label: Year → Value: 2024
```

## Technical Details

### Database Structure
Projects now store details as an array:
```json
{
  "projectDetails": [
    { "label": "Software", "value": "ArcGIS Pro" },
    { "label": "Timeframe", "value": "2023-2024" },
    { "label": "Data Source", "value": "USGS" }
  ]
}
```

### Backward Compatibility
The system automatically converts old projects with fixed fields (software, timeframe, dataSource, studyArea) to the new format when editing.

## Tips

1. **Keep labels short** (1-3 words) for better display
2. **Use consistent naming** across projects for professionalism
3. **Empty fields won't show** on the frontend, so don't worry about leaving them blank
4. **Recommended: 3-6 fields** for optimal visual balance
5. **For many fields** (7+), consider if all are necessary - the cards will get smaller

## Styling

The detail cards feature:
- Pure white background (#ffffff)
- Neumorphic shadows (6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff)
- Teal labels (#1E8479)
- Smooth hover animations
- Staggered entrance animations

---

**Last Updated**: November 19, 2025
