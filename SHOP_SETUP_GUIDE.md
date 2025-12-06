# Shop Section Setup Guide

Complete guide to set up the Shop section with Appwrite.

## 1. Create Storage Bucket

1. Go to **Appwrite Console** → **Storage**
2. Click **Create Bucket**
3. Set the following:
   - **Bucket ID**: `shop-images`
   - **Name**: Shop Images
   - **Permissions**: 
     - Check "Any" for Read access
   - **Maximum File Size**: 10MB
   - **Allowed File Extensions**: jpg, jpeg, png, gif, webp
4. Click **Create**

## 2. Create Products Collection

1. Go to **Appwrite Console** → **Databases**
2. Select your database: `portfolio_db`
3. Click **Create Collection**
4. Set:
   - **Collection ID**: `products`
   - **Name**: Products
5. Click **Create**

## 3. Add Products Collection Attributes

Add ALL these attributes to the `products` collection:

| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| `name` | String | 255 | Yes | - |
| `price` | Float | - | Yes | - |
| `discountedPrice` | Float | - | No | - |
| `onSale` | Boolean | - | No | false |
| `featured` | Boolean | - | No | false |
| `imageUrl` | String | 2048 | No | - |
| `imageId` | String | 255 | No | - |
| `fullImageUrl` | String | 2048 | No | - |
| `fullImageId` | String | 255 | No | - |
| `category` | String | 255 | No | - |
| `tags` | String[] | - | No | - |
| `description` | String | 10000 | No | - |
| `additionalInfo` | String | 10000 | No | - |
| `galleryUrls` | String[] | - | No | - |
| `galleryIds` | String[] | - | No | - |

### Step-by-step attribute creation:

#### name (String)
- Click **Create Attribute** → **String**
- Attribute Key: `name`
- Size: `255`
- Required: ✅ Yes
- Click **Create**

#### price (Float)
- Click **Create Attribute** → **Float**
- Attribute Key: `price`
- Required: ✅ Yes
- Click **Create**

#### discountedPrice (Float)
- Click **Create Attribute** → **Float**
- Attribute Key: `discountedPrice`
- Required: ❌ No
- Click **Create**

#### onSale (Boolean)
- Click **Create Attribute** → **Boolean**
- Attribute Key: `onSale`
- Default Value: `false`
- Required: ❌ No
- Click **Create**

#### featured (Boolean)
- Click **Create Attribute** → **Boolean**
- Attribute Key: `featured`
- Default Value: `false`
- Required: ❌ No
- Click **Create**

#### imageUrl (String)
- Click **Create Attribute** → **String**
- Attribute Key: `imageUrl`
- Size: `2048`
- Required: ❌ No
- Click **Create**

#### imageId (String)
- Click **Create Attribute** → **String**
- Attribute Key: `imageId`
- Size: `255`
- Required: ❌ No
- Click **Create**

#### fullImageUrl (String)
- Click **Create Attribute** → **String**
- Attribute Key: `fullImageUrl`
- Size: `2048`
- Required: ❌ No
- Click **Create**

#### fullImageId (String)
- Click **Create Attribute** → **String**
- Attribute Key: `fullImageId`
- Size: `255`
- Required: ❌ No
- Click **Create**

#### category (String)
- Click **Create Attribute** → **String**
- Attribute Key: `category`
- Size: `255`
- Required: ❌ No
- Click **Create**

#### tags (String Array)
- Click **Create Attribute** → **String[]**
- Attribute Key: `tags`
- Required: ❌ No
- Click **Create**

#### description (String) - For Rich Text
- Click **Create Attribute** → **String**
- Attribute Key: `description`
- Size: `10000`
- Required: ❌ No
- Click **Create**

#### additionalInfo (String) - For Rich Text
- Click **Create Attribute** → **String**
- Attribute Key: `additionalInfo`
- Size: `10000`
- Required: ❌ No
- Click **Create**

#### galleryUrls (String Array) - For Gallery Images
- Click **Create Attribute** → **String[]**
- Attribute Key: `galleryUrls`
- Required: ❌ No
- Click **Create**

#### galleryIds (String Array) - For Gallery Image IDs
- Click **Create Attribute** → **String[]**
- Attribute Key: `galleryIds`
- Required: ❌ No
- Click **Create**

## 4. Set Products Collection Permissions

1. Go to **Settings** tab in the `products` collection
2. Under **Permissions**, add:
   - **Any** → Read ✅
   - **Users** → Create ✅, Read ✅, Update ✅, Delete ✅

## 5. Create Shop Categories Collection

1. Go to **Appwrite Console** → **Databases** → `portfolio_db`
2. Click **Create Collection**
3. Set:
   - **Collection ID**: `shop_categories`
   - **Name**: Shop Categories
4. Add these attributes:

| Attribute | Type | Size | Required |
|-----------|------|------|----------|
| `name` | String | 255 | Yes |
| `color` | String | 20 | No |
| `order` | Integer | - | No |

5. Set Permissions: Any → Read ✅, Users → All ✅

---

## Features Summary

### Admin Product Management
- Upload main product image with crop/zoom editor
- Upload multiple gallery images (shown as thumbnails)
- Rich text editor for Description (bold, italic, underline, colors, lists, alignment)
- Rich text editor for Additional Info
- Category selection
- Tags management
- On Sale toggle with discounted price
- Featured toggle for homepage display

### Product Modal (Customer View)
- Main image with gallery thumbnails below
- Click thumbnails to preview in main area
- Navigation arrows for image gallery
- Quantity selector (+/-)
- Add to Cart button
- Full-width tabs below image section:
  - Description (rich text formatted)
  - Additional Info (rich text formatted)
  - Reviews
- Related products section

### Cart System
- Persistent cart (localStorage)
- Add/remove items
- Update quantities
- Cart context available app-wide

---

## Quick Test

1. Create bucket and collections as described above
2. Go to Admin → Shop → Products
3. Add a test product:
   - Name: "Test Product"
   - Price: 99.99
   - Toggle "On Sale"
   - Discounted Price: 79.99
   - Toggle "Featured"
   - Upload main image
   - Upload 2-3 gallery images
   - Add description with formatting (bold, lists, etc.)
   - Add additional info
4. Visit homepage to see Shop section
5. Click product to open modal
6. Verify gallery thumbnails work
7. Verify tabs show formatted content
