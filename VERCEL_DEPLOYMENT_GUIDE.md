# Vercel Deployment Guide

## 🚀 Quick Fix for 404 Error

The 404 error you're seeing is because Vercel doesn't know how to handle client-side routes like `/admin`. I've created a `vercel.json` file to fix this.

## 📋 Steps to Fix the Issue

### 1. Push the New Files to GitHub
Make sure these files are committed and pushed to your GitHub repository:
- `vercel.json` (newly created)
- `.env` (moved from `.claude/.env` to root)
- Updated `src/contexts/AuthContext.jsx` (production-ready)

```bash
git add .
git commit -m "Fix Vercel routing and environment variables"
git push origin main
```

### 2. Set Environment Variables in Vercel
Go to your Vercel dashboard and add these environment variables:

**Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:
```
VITE_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=authoy
VITE_APPWRITE_DATABASE_ID=portfolio_db
VITE_APPWRITE_STORAGE_ID=reactbucket
VITE_SHORTLINK_BUCKET_ID=shortlink-previews
RESEND_API_KEY=re_2JBNZCF4_A2DQ5srEg6TEDkeHjmLzYsgi
VITE_PAYPAL_CLIENT_ID=
VITE_DOWNLOAD_SECRET=sfsdfs4fs564dfs56fd42024564654546hgcgc
```

### 3. Redeploy on Vercel
After pushing to GitHub, Vercel should automatically redeploy. If not:
- Go to Vercel Dashboard → Your Project → Deployments
- Click "Redeploy" on the latest deployment

### 4. Test the Admin Login
Once deployed, try accessing:
- `https://your-domain.vercel.app/admin` - Should show login page
- Login with: `rsrickbiswas007@gmail.com` and your password

## 🔧 What Was Fixed

### 1. Routing Issue (`vercel.json`)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This tells Vercel to serve `index.html` for all routes, allowing React Router to handle client-side routing.

### 2. Environment Variables
- Moved from `.claude/.env` to root `.env`
- Added to Vercel dashboard for production

### 3. Production-Ready Code
- Removed debug console logs from production build
- Only shows debug info in development mode

## 🚨 Common Issues & Solutions

### Issue: Still getting 404
**Solution**: Make sure `vercel.json` is in the root directory and pushed to GitHub

### Issue: Environment variables not working
**Solution**: 
1. Check Vercel dashboard environment variables
2. Make sure variable names start with `VITE_`
3. Redeploy after adding variables

### Issue: Login still fails
**Solution**:
1. Check browser console for errors
2. Verify Appwrite project settings
3. Ensure user exists in Appwrite Auth

## 📞 Support
If you still have issues after following these steps, check:
1. Browser console for error messages
2. Vercel deployment logs
3. Appwrite project settings

The admin login should work at: `https://your-domain.vercel.app/admin`