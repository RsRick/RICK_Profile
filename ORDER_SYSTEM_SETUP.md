# Order System Setup Guide

## Appwrite Collection Setup

Create a new collection in your `portfolio_db` database:

### Collection: `orders`

**Attributes:**

| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| orderId | String | 100 | Yes | - |
| customerId | String | 50 | Yes | - |
| customerName | String | 200 | No | "" |
| customerEmail | String | 200 | Yes | - |
| customerPhone | String | 50 | No | "" |
| customerAltEmail | String | 200 | No | "" |
| items | String | 10000 | Yes | - |
| subtotal | Float | - | Yes | - |
| discount | Float | - | No | 0 |
| couponCode | String | 50 | No | "" |
| total | Float | - | Yes | - |
| status | String | 20 | Yes | "placed" |
| paypalOrderId | String | 100 | No | "" |
| paypalPayerId | String | 100 | No | "" |
| paypalPayerEmail | String | 200 | No | "" |
| step1Time | String | 100 | No | "" |
| step1Notes | String | 500 | No | "" |
| step2Time | String | 100 | No | "" |
| step2Notes | String | 500 | No | "" |
| step3Time | String | 100 | No | "" |
| step3Notes | String | 500 | No | "" |
| deliveryFiles | String | 10000 | No | "" |

### Storage Bucket: `order-files`

Create a storage bucket for delivery files:
1. Go to Appwrite Console → Storage
2. Create bucket with ID: `order-files`
3. Set permissions:
   - Read: Users (authenticated users only)
   - Create/Update/Delete: Users (admin only)

## How the Status System Works

### Order Status Values
- `placed` - Step 1 (Order Placed) - Default when order is created
- `processing` - Step 2 (Processing)
- `completed` - Step 3 (Completed)
- `cancelled` - Order cancelled

### Stepper Logic
The stepper shows checkmarks based on the main `status` field:

| Status | Step 1 | Step 2 | Step 3 |
|--------|--------|--------|--------|
| placed | ✓ Active | Pending | Pending |
| processing | ✓ Completed | ✓ Active | Pending |
| completed | ✓ Completed | ✓ Completed | ✓ Completed |
| cancelled | Shows cancellation notice |

### Admin Dashboard Features
- Select status from dropdown (Placed → Processing → Completed → Cancelled)
- Step fields only become editable when that step is reached
- Each step has Time/Date and Notes fields
- Notes are visible to customers under each step

### Customer Dashboard Features
- Shows order summary with items
- Visual stepper with checkmarks for completed steps
- Displays admin notes under each step
- Shows cancellation notice if order is cancelled

## Adding New Attributes

If you already have the orders collection, add these new attributes:
1. `step1Notes` - String, Size: 500
2. `step2Notes` - String, Size: 500
3. `step3Notes` - String, Size: 500

You can remove these old attributes if they exist:
- `step1Status`
- `step2Status`
- `step3Status`
- `adminNotes`

---

## 🔒 Secure File Download System

### How It Works

The file delivery system uses encrypted, time-limited tokens to ensure:

1. **Authentication Required** - User must be logged in to download
2. **Order Ownership Verification** - Only the customer who placed the order can download
3. **Token Expiration** - Download links expire after 15 minutes
4. **No URL Sharing** - Copying the URL won't work in another browser/session
5. **Blob-based Downloads** - Files are fetched and served as blobs, not direct links

### Security Flow

```
User clicks Download → Generate Token → Validate:
  ├── Is user logged in? ❌ → Error: "Please log in"
  ├── Does email match order? ❌ → Error: "Not authorized"
  ├── Is token expired? ❌ → Error: "Link expired"
  └── All valid? ✅ → Fetch file as blob → Trigger download
```

### Token Structure

```javascript
{
  fid: "file-id",           // File ID in storage
  oid: "order-id",          // Order ID
  email: "user@email.com",  // User's email (must match)
  uid: "user-id",           // User's ID (must match)
  exp: 1701234567890,       // Expiration timestamp
  iat: 1701233667890,       // Issued at timestamp
  sig: "abc123xyz"          // Signature hash
}
```

### Environment Variable (Optional)

Add to `.env` for custom secret key:
```
VITE_DOWNLOAD_SECRET=your-custom-secret-key-here
```

### What Happens If Someone Copies the URL?

1. **Direct Appwrite URL** - Won't work because bucket requires authentication
2. **Blob URL** - Expires after 1 minute and is session-specific
3. **Token URL** - Validates user email/ID, so won't work for different user

### Files Location

- `src/lib/secureDownload.js` - Token generation and validation
- `src/pages/Dashboard/OrderStatus.jsx` - Secure download UI
