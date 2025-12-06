# Coupon System Setup Guide

## Appwrite Collection Setup

Create a new collection in your `portfolio_db` database:

### Collection: `coupons`

**Attributes:**

| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| code | String | 20 | Yes | - |
| type | String | 20 | Yes | - |
| value | Float | - | Yes | - |
| applyTo | String | 20 | Yes | - |
| productId | String | 50 | No | "" |
| productName | String | 200 | No | "" |
| minPurchase | Float | - | No | 0 |
| maxUses | Integer | - | No | 0 |
| usedCount | Integer | - | No | 0 |
| expiryDate | String | 20 | No | "" |
| isActive | Boolean | - | No | true |

### Permissions

Set the following permissions for the collection:
- **Read**: Any (for coupon validation on frontend)
- **Create/Update/Delete**: Users (admin only)

## Coupon Types

1. **Percentage (`percent`)**: Discount by percentage (e.g., 20% off)
2. **Fixed Amount (`fixed`)**: Flat discount (e.g., $10 off)
3. **Product Discount (`product`)**: Discount on specific product

## Apply To Options

1. **Cart (`cart`)**: Applies to entire cart total
2. **Product (`product`)**: Applies only to a specific product

## Features

- Auto-detect and apply coupon when pasting code
- Minimum purchase requirement
- Maximum usage limit
- Expiry date support
- Product-specific coupons
- Real-time discount calculation

## Admin Dashboard

Access coupon management at: `/admin/coupons`

From here you can:
- Create new coupons
- Edit existing coupons
- Delete coupons
- Toggle coupon active status
- Copy coupon codes
- View usage statistics
