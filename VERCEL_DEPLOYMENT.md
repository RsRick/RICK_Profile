# Vercel Deployment Guide

## Issue: Database Not Loading in Production

If your header and menu are showing in "basic mode" on Vercel but work fine on localhost, it's because **environment variables are not configured in Vercel**.

## Solution: Add Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard
1. Navigate to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Required Environment Variables

Add the following environment variables (same as your local `.env` file):

```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_STORAGE_ID=your_storage_bucket_id
```

**Important Notes:**
- All variables must start with `VITE_` prefix for Vite to expose them to the client
- Replace `your_project_id`, `your_database_id`, and `your_storage_bucket_id` with your actual Appwrite values
- You can find these values in your local `.env` file

### Step 3: Set Environment for All Environments

Make sure to add these variables for:
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

### Step 4: Configure CORS in Appwrite (IMPORTANT!)

**This is required for your Vercel site to access Appwrite!**

1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Select your project
3. Go to **Settings** → **Web Platform**
4. In **Platform Origins**, add:
   - `https://react-portfolio-henna-tau.vercel.app` (your specific Vercel domain)
   - `https://*.vercel.app` (to cover all Vercel preview deployments)
   - Your custom domain if you have one (e.g., `https://yourdomain.com`)
5. Click **Save**

**Note:** Make sure to keep `https://localhost` if you want local development to work too.

### Step 5: Redeploy

After adding the environment variables and configuring CORS:
1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on your latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

## Verify Your Environment Variables

To check if your environment variables are set correctly:

1. In Vercel Dashboard → Settings → Environment Variables
2. Make sure all `VITE_APPWRITE_*` variables are listed
3. Check the browser console on your deployed site - you should NOT see warnings about Appwrite not being configured

## Common Issues

### Issue: Variables not working after adding them
**Solution:** You must redeploy after adding environment variables. They are only available in new deployments.

### Issue: Still seeing "basic mode"
**Solution:** 
1. Check browser console for errors
2. Verify all variables are set correctly (no typos)
3. Make sure variables start with `VITE_` prefix
4. Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: CORS errors
**Solution:** Make sure your Appwrite project allows requests from your Vercel domain. Check Appwrite Console → Settings → Web Platform.

## Quick Checklist

- [ ] Added `VITE_APPWRITE_ENDPOINT` in Vercel
- [ ] Added `VITE_APPWRITE_PROJECT_ID` in Vercel
- [ ] Added `VITE_APPWRITE_DATABASE_ID` in Vercel
- [ ] Added `VITE_APPWRITE_STORAGE_ID` in Vercel (optional)
- [ ] Set variables for Production, Preview, and Development
- [ ] **Added Vercel domain to Appwrite Web Platform settings (CORS)** ⚠️ CRITICAL
- [ ] Redeployed the application
- [ ] Checked browser console for errors

## Debugging Steps

After deploying with environment variables, check the browser console (F12) on your Vercel site. You should see:

### ✅ If Working Correctly:
```
🔍 Appwrite Configuration Check:
   Endpoint: ✅ Set
   Project ID: ✅ Set (xxxxx...)
   Database ID: ✅ Set (xxxxx...)
📡 Fetching documents from collection: menubar_settings
✅ Successfully fetched 1 document(s) from menubar_settings
```

### ❌ If Not Working:

**1. Environment Variables Not Set:**
```
❌ Missing
   VITE_APPWRITE_ENDPOINT exists: false
```
**Solution:** Go back to Vercel → Settings → Environment Variables and verify they're added correctly.

**2. CORS Error (Most Common):**
```
Access to XMLHttpRequest at 'https://sgp.cloud.appwrite.io/v1/...' from origin 'https://react-portfolio-henna-tau.vercel.app' 
has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header has a value 'https://localhost' 
that is not equal to the supplied origin.
```
**Solution:** 
1. Go to [Appwrite Console](https://cloud.appwrite.io) → Your Project → **Settings** → **Web Platform**
2. In **Platform Origins**, add:
   - `https://react-portfolio-henna-tau.vercel.app` (your specific domain)
   - `https://*.vercel.app` (for all Vercel preview deployments)
   - Your custom domain if applicable
3. Click **Save**
4. **Important:** Keep `https://localhost` if you want local development to work
5. Wait a few seconds for changes to propagate, then refresh your Vercel site

**3. Collection Not Found:**
```
⚠️ Collection or database not found - check collection ID
Error Code: 404
```
**Solution:** Verify the collection `menubar_settings` exists in your Appwrite database.

**4. Authentication Error:**
```
⚠️ Authentication issue - check Appwrite project settings
Error Code: 401
```
**Solution:** Check Appwrite Console → Settings → API Keys and verify your project is set up correctly.

## Need Help?

If you're still having issues:
1. **Open browser console (F12)** on your Vercel site and copy all error messages
2. Check the debug logs - they will tell you exactly what's missing
3. Verify your Appwrite project is accessible
4. Make sure your Appwrite database and collections exist
5. Check Appwrite Console → Settings → Web Platform for CORS settings
6. Verify environment variables are set for **Production** environment in Vercel

