# 🚀 Deployment Checklist - Fix Network Request Failed

## ✅ Immediate Actions Required

### 1. Set Environment Variables in Vercel
**CRITICAL**: Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these **exactly** as shown:
```
VITE_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=authoy
VITE_APPWRITE_DATABASE_ID=portfolio_db
VITE_APPWRITE_STORAGE_ID=reactbucket
```

**Important**: 
- Set for "Production" environment
- Click "Save" after each variable
- Redeploy after adding all variables

### 2. Add Vercel Domain to Appwrite
1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Select project "authoy"
3. Settings → Platforms → Add Platform
4. Choose "Web"
5. Add your Vercel domain: `your-domain.vercel.app`
6. Enable HTTPS
7. Save

### 3. Verify User Exists in Appwrite
1. Go to Appwrite Console → Auth → Users
2. Check if `rsrickbiswas007@gmail.com` exists
3. If not, create it manually with a password

### 4. Push Changes and Redeploy
```bash
git add .
git commit -m "Add debug component and fix environment variables"
git push origin main
```

## 🔍 Debug Information

After deployment, the login page will show a debug box in the top-right corner showing:
- Current environment mode
- Whether environment variables are loaded
- Appwrite configuration status

## 🚨 If Still Not Working

### Check Browser Console
1. Open browser dev tools (F12)
2. Go to Console tab
3. Look for error messages
4. Take a screenshot and share

### Check Network Tab
1. Open dev tools → Network tab
2. Try to login
3. Look for failed requests
4. Check if requests are going to the right Appwrite endpoint

### Verify Appwrite Project
1. Make sure project ID is exactly: `authoy`
2. Check if the endpoint is: `https://nyc.cloud.appwrite.io/v1`
3. Verify database ID is: `portfolio_db`

## 📞 Next Steps
1. Follow checklist above
2. Deploy and test
3. Check debug info on login page
4. Share any error messages you see

The debug component will help us see exactly what's wrong with the environment variables.