# Shop & Admin Authentication Setup Guide

This setup separates admin users from shop customers using Appwrite Teams.

---

## How It Works

- **All users** are in Appwrite Auth (single user database)
- **Admin users** are added to an "admins" Team
- **Shop customers** are regular users (not in admin team)
- Admin panel checks team membership before allowing access

---

## Step 1: Create Admin Team in Appwrite

1. Go to **Appwrite Console → Auth → Teams**
2. Click **Create Team**
3. **Team ID:** `admins` (or note the auto-generated ID)
4. **Team Name:** `Admins`
5. Click **Create**

### Add Yourself to Admin Team:
1. Click on the "admins" team
2. Click **Create Membership**
3. Enter your email (the one you use for admin login)
4. Select role: **Owner** or **Admin**
5. Click **Invite**
6. Accept the invitation from your email

---

## Step 2: Update Environment Variable (Optional)

If your team ID is not `admins`, add to your `.env`:

```
VITE_APPWRITE_ADMIN_TEAM_ID=your_team_id_here
```

---

## Step 3: Create OTP Collection

For shop customer email verification:

**Collection:** `shop_otp_codes`

| Attribute | Type | Size | Required |
|-----------|------|------|----------|
| userId | String | 50 | Yes |
| email | String | 255 | Yes |
| otp | String | 4 | Yes |
| expiresAt | String | 50 | Yes |
| verified | Boolean | - | Yes |
| name | String | 255 | No |

**Permissions:** Create=Any, Read=Users, Update=Users

---

## Step 4: Create Appwrite Function (for OTP emails)

1. Go to **Functions → Create Function**
2. Name: `send-otp-email`
3. Runtime: Node.js 18.0
4. Upload files from `appwrite-functions/send-otp-email/`
5. Add environment variables:
   - `RESEND_API_KEY`
   - `FROM_EMAIL`
   - `SITE_NAME`
6. Set Execute permission: **Any**

---

## Security Flow

### Admin Login:
```
User enters email/password
    ↓
Appwrite validates credentials
    ↓
Check if user is in "admins" team
    ↓
If YES → Access granted to admin panel
If NO → "Access Denied" message
```

### Shop Customer:
```
Customer signs up at checkout
    ↓
Account created in Appwrite Auth
    ↓
OTP sent for verification
    ↓
Customer can shop (NOT access admin)
```

---

## What Happens Now

✅ **Shop customers** who sign up at checkout:
- Created in Appwrite Auth
- Can login to checkout
- CANNOT access `/admin` (blocked by team check)

✅ **Admin users** (in "admins" team):
- Can login to `/admin/login`
- Full access to admin panel
- Can also shop if they want

---

## Testing

### Test Admin Access:
1. Make sure you're in the "admins" team
2. Go to `/admin/login`
3. Login with your credentials
4. Should access admin panel ✅

### Test Customer Blocked:
1. Create a new account at `/checkout`
2. Try to access `/admin`
3. Should see "Access Denied" ✅

---

## Managing Admins

### Add New Admin:
1. Appwrite Console → Auth → Teams → admins
2. Create Membership → Enter email
3. User receives invite and joins team

### Remove Admin:
1. Appwrite Console → Auth → Teams → admins
2. Find the member → Delete membership

---

## Troubleshooting

### "Access Denied" for legitimate admin
- Check you're in the "admins" team
- Verify team ID matches `VITE_APPWRITE_ADMIN_TEAM_ID`
- Try logging out and back in

### Shop customer can access admin
- Verify ProtectedRoute is checking `isAdmin`
- Check team membership is working
- Clear browser cache and re-login
