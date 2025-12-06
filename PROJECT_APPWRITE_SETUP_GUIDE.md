# Project Management System - Appwrite Setup Guide

## Complete Backend Integration with Appwrite

This guide will help you set up the complete backend for the project management system using Appwrite.

---

## 📋 Table of Contents

1. [Database Setup](#database-setup)
2. [Storage Bucket Setup](#storage-bucket-setup)
3. [Collection Schema](#collection-schema)
4. [Permissions Configuration](#permissions-configuration)
5. [Testing the System](#testing-the-system)
6. [Admin Panel Usage](#admin-panel-usage)

---

## 🗄️ Database Setup

### Step 1: Create Database

1. Log in to your Appwrite Console
2. Navigate to **Databases**
3. Click **"Create Database"**
4. Name: `portfolio_db` (or your preferred name)
5. Click **Create**

### Step 2: Create Projects Collection

1. Inside your database, click **"Create Collection"**
2. Collection ID: `projects`
3. Collection Name: `Projects`
4. Click **Create**

---

## 📊 Collection Schema

### Projects Collection Attributes

Create the following attributes in your `projects` collection:

#### 1. **title** (String)
- Type: `String`
- Size: `255`
- Required: ✅ Yes
- Array: ❌ No
- Default: None

#### 2. **category** (String)
- Type: `String`
- Size: `50`
- Required: ✅ Yes
- Array: ❌ No
- Default: `GIS`

#### 3. **description** (String)
- Type: `String`
- Size: `500`
- Required: ✅ Yes
- Array: ❌ No
- Default: None
- *Note: Short description for card display*

#### 4. **thumbnailUrl** (String)
- Type: `String`
- Size: `2000`
- Required: ✅ Yes
- Array: ❌ No
- Default: None
- *Note: Main project image URL*

#### 5. **galleryUrls** (String Array)
- Type: `String`
- Size: `2000`
- Required: ❌ No
- Array: ✅ Yes (Multiple values)
- Default: None
- *Note: Array of gallery image URLs*

#### 6. **likes** (Integer)
- Type: `Integer`
- Min: `0`
- Max: `999999`
- Required: ❌ No
- Array: ❌ No
- Default: `0`

#### 7. **featured** (Boolean)
- Type: `Boolean`
- Required: ❌ No
- Array: ❌ No
- Default: `false`
- *Note: Show on homepage if true*

#### 8. **software** (String)
- Type: `String`
- Size: `100`
- Required: ❌ No
- Array: ❌ No
- Default: None

#### 9. **timeframe** (String)
- Type: `String`
- Size: `100`
- Required: ❌ No
- Array: ❌ No
- Default: None

#### 10. **dataSource** (String)
- Type: `String`
- Size: `100`
- Required: ❌ No
- Array: ❌ No
- Default: None

#### 11. **studyArea** (String)
- Type: `String`
- Size: `100`
- Required: ❌ No
- Array: ❌ No
- Default: None

#### 12. **projectLink** (String)
- Type: `String`
- Size: `500`
- Required: ❌ No
- Array: ❌ No
- Default: None
- *Note: External project URL*

#### 13. **fullDescription** (String)
- Type: `String`
- Size: `50000`
- Required: ✅ Yes
- Array: ❌ No
- Default: None
- *Note: Rich HTML content for modal*

#### 14. **projectDetails** (String Array) - NEW! 🆕
- Type: `String`
- Size: `2000`
- Required: ❌ No
- Array: ✅ Yes (Multiple values)
- Default: None
- *Note: Dynamic project detail fields (replaces fixed software/timeframe/dataSource/studyArea)*
- *Each element stores JSON: `{"label":"Software","value":"ArcGIS Pro"}`*

> **💡 Note on Backward Compatibility:**
> - Keep attributes 8-11 (software, timeframe, dataSource, studyArea) for backward compatibility
> - New projects will use `projectDetails` (attribute 14)
> - Old projects will automatically convert when edited
> - See `DATABASE_UPDATE_FOR_DYNAMIC_FIELDS.md` for migration details

---

## 🪣 Storage Bucket Setup

### Create Storage Bucket for Project Images

1. Navigate to **Storage** in Appwrite Console
2. Click **"Create Bucket"**
3. Bucket ID: `project_images`
4. Bucket Name: `Project Images`
5. **Permissions:**
   - Read Access: `Any` (public read)
   - Write Access: `Users` (authenticated users only)
6. **File Security:**
   - Maximum File Size: `10 MB` (adjust as needed)
   - Allowed File Extensions: `jpg, jpeg, png, webp, gif`
   - Encryption: ✅ Enabled
   - Antivirus: ✅ Enabled (if available)
7. Click **Create**

---

## 🔐 Permissions Configuration

### Projects Collection Permissions

1. Go to your `projects` collection
2. Click on **Settings** tab
3. Configure **Permissions**:

#### Read Permissions (Public)
```
Role: Any
Permission: Read
```
*This allows anyone to view projects on your website*

#### Create Permissions (Admin Only)
```
Role: Users
Permission: Create
```
*Only authenticated users can create projects*

#### Update Permissions (Admin Only)
```
Role: Users
Permission: Update
```
*Only authenticated users can update projects*

#### Delete Permissions (Admin Only)
```
Role: Users
Permission: Delete
```
*Only authenticated users can delete projects*

### Storage Bucket Permissions

1. Go to `project_images` bucket
2. Click **Settings**
3. Configure **File Permissions**:

#### Read (Public)
```
Role: Any
Permission: Read
```

#### Create/Update/Delete (Admin Only)
```
Role: Users
Permissions: Create, Update, Delete
```

---

## 🧪 Testing the System

### 1. Test Database Connection

Open browser console and run:
```javascript
// Check if projects collection exists
const result = await databaseService.listDocuments('projects');
console.log('Projects:', result);
```

### 2. Test Storage Connection

```javascript
// Check if bucket exists
const buckets = await storageService.listBuckets();
console.log('Buckets:', buckets);
```

### 3. Create Test Project

1. Log in to admin panel: `http://localhost:5173/admin`
2. Navigate to **Projects** section
3. Click **"Add Project"**
4. Fill in all fields:
   - Title: "Test Project"
   - Category: "GIS"
   - Description: "This is a test project"
   - Upload thumbnail image
   - Add gallery images
   - Fill in project details
   - Add rich text description
5. Click **"Create Project"**
6. Check if project appears in the list

### 4. Verify Frontend Display

1. Go to homepage: `http://localhost:5173`
2. Scroll to **Featured Projects** section
3. Verify test project appears (if marked as featured)
4. Click on project card
5. Verify modal opens with all details
6. Go to **Projects** page: `http://localhost:5173/projects`
7. Verify all projects are listed

---

## 👨‍💼 Admin Panel Usage

### Accessing Admin Panel

1. Navigate to: `http://localhost:5173/admin/login`
2. Enter your admin credentials
3. After login, you'll see the admin dashboard

### Managing Projects

#### Add New Project

1. Go to **Admin → Projects**
2. Click **"Add Project"** button
3. Fill in the form:

**Basic Information:**
- **Title**: Project name (required)
- **Category**: Select from GIS, R, or Remote Sensing (required)
- **Short Description**: Brief description for card (max 150 chars, required)

**Project Details:**
- **Software**: Software used (e.g., ArcGIS Pro)
- **Timeframe**: Project duration (e.g., 2023-2024)
- **Data Source**: Data source (e.g., USGS)
- **Study Area**: Geographic area (e.g., Bangladesh)
- **Project Link**: External URL (optional)

**Images:**
- **Thumbnail**: Main project image (required)
- **Gallery**: Multiple images for gallery (optional)

**Settings:**
- **Initial Likes**: Starting like count (default: 0)
- **Featured**: Check to show on homepage

**Full Description:**
- Use rich text editor to create detailed project description
- Available formatting:
  - **Bold**, *Italic*, Underline
  - Headings (H1, H2, H3)
  - Bullet lists and numbered lists
  - Links and images
  - Code blocks
  - Quotes

4. Click **"Create Project"**

#### Edit Project

1. Find project in the list
2. Click **"Edit"** button
3. Modify any fields
4. Click **"Update Project"**

#### Delete Project

1. Find project in the list
2. Click **"Delete"** button
3. Confirm deletion

---

## 🎨 Rich Text Editor Features

### Text Formatting
- **Bold**: Select text and click Bold button
- **Italic**: Select text and click Italic button
- **Underline**: Select text and click Underline button

### Headings
- **H1**: Main heading (green color, 2rem)
- **H2**: Section heading (teal color, 1.5rem)
- **H3**: Subsection heading (teal color, 1.25rem)

### Lists
- **Bullet List**: Unordered list
- **Numbered List**: Ordered list

### Special Elements

#### Insert Link
1. Select text
2. Click Link icon
3. Enter URL
4. Click Insert

#### Insert Image
1. Click Image icon
2. Enter image URL
3. Click Insert
4. Image will be styled automatically with:
   - Max width: 100%
   - Rounded corners
   - Shadow effect
   - Margin spacing

#### Code Block
1. Click Code icon
2. Paste your code
3. Styled with dark theme automatically

#### Quote
1. Select text (or click to insert empty quote)
2. Click Quote icon
3. Styled with accent border and background

---

## 📝 Database Schema Summary

```javascript
{
  "$id": "unique_id",
  "title": "Project Title",
  "category": "GIS" | "R" | "Remote Sensing",
  "description": "Short description for card",
  "thumbnailUrl": "https://cloud.appwrite.io/...",
  "galleryUrls": [
    "https://cloud.appwrite.io/...",
    "https://cloud.appwrite.io/..."
  ],
  "likes": 0,
  "featured": false,
  "software": "ArcGIS Pro",
  "timeframe": "2023-2024",
  "dataSource": "USGS",
  "studyArea": "Bangladesh",
  "projectLink": "https://example.com",
  "fullDescription": "<h2>Heading</h2><p>Content...</p>",
  "$createdAt": "2024-01-01T00:00:00.000Z",
  "$updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 🚀 Quick Start Checklist

- [ ] Create `portfolio_db` database in Appwrite
- [ ] Create `projects` collection
- [ ] Add all 13 attributes to collection
- [ ] Configure collection permissions (Any: Read, Users: Create/Update/Delete)
- [ ] Create `project_images` storage bucket
- [ ] Configure bucket permissions (Any: Read, Users: Create/Update/Delete)
- [ ] Set allowed file extensions (jpg, jpeg, png, webp, gif)
- [ ] Set maximum file size (10 MB)
- [ ] Update `.env` file with correct IDs
- [ ] Test admin login
- [ ] Create test project
- [ ] Verify project appears on homepage
- [ ] Verify project appears on projects page
- [ ] Test project modal
- [ ] Test edit functionality
- [ ] Test delete functionality

---

## 🔧 Environment Variables

Make sure your `.env` file has:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=portfolio_db
VITE_APPWRITE_BUCKET_ID=project_images
```

---

## 🐛 Troubleshooting

### Projects Not Loading
- Check browser console for errors
- Verify collection ID is `projects`
- Verify database ID in `.env`
- Check collection permissions (Any: Read)

### Images Not Uploading
- Check bucket ID is `project_images`
- Verify file size is under limit
- Check file extension is allowed
- Verify bucket permissions (Users: Create)

### Images Not Displaying
- Check bucket permissions (Any: Read)
- Verify image URLs are correct
- Check browser console for CORS errors

### Rich Text Not Saving
- Check `fullDescription` attribute size (50000)
- Verify HTML content is valid
- Check browser console for errors

---

## 📚 Additional Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Database Guide](https://appwrite.io/docs/databases)
- [Appwrite Storage Guide](https://appwrite.io/docs/storage)
- [Appwrite Permissions](https://appwrite.io/docs/permissions)

---

## ✅ Success Indicators

Your setup is complete when:
1. ✅ Admin can create projects
2. ✅ Images upload successfully
3. ✅ Projects appear on homepage (featured)
4. ✅ Projects appear on projects page (all)
5. ✅ Modal opens with full details
6. ✅ Rich text formatting displays correctly
7. ✅ Gallery images work
8. ✅ Category filtering works
9. ✅ Edit and delete functions work

---

## 🎉 You're All Set!

Your project management system is now fully integrated with Appwrite. You can:
- Add unlimited projects
- Upload images to cloud storage
- Use rich text formatting
- Filter by category
- Feature projects on homepage
- Manage everything from admin panel

Happy project showcasing! 🚀
