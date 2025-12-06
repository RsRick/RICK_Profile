# Appwrite Function Deployment Guide

## Complete Step-by-Step Process

Based on real experience deploying the newsletter-emails function, here's the proven workflow:

---

## Method 1: Using Appwrite CLI (Recommended)

### Step 1: Create Function Structure
```bash
# Create function directory
mkdir -p functions/your-function-name/src

# Create package.json
cd functions/your-function-name
npm init -y

# Install dependencies
npm install node-appwrite
```

### Step 2: Create Function Code
Create `functions/your-function-name/src/main.js`:
```javascript
export default async ({ req, res, log, error }) => {
  log('Function started');
  
  try {
    // Your function logic here
    return res.json({ success: true });
  } catch (err) {
    error(err.message);
    return res.json({ success: false, error: err.message }, 500);
  }
};
```

### Step 3: Add to appwrite.json
Add function definition to root `appwrite.json`:
```json
{
  "functions": [
    {
      "$id": "your-function-name",
      "name": "Your Function Name",
      "runtime": "node-18.0",
      "execute": ["any"],
      "events": [],
      "schedule": "",
      "timeout": 15,
      "enabled": true,
      "logging": true,
      "entrypoint": "src/main.js",
      "commands": "npm install",
      "path": "functions/your-function-name"
    }
  ]
}
```

### Step 4: Create Function in Appwrite
```bash
# From project root
appwrite functions create \
  --function-id your-function-name \
  --name "Your Function Name" \
  --runtime node-18.0 \
  --execute any \
  --timeout 15
```

### Step 5: Update Function Configuration
```bash
appwrite functions update \
  --function-id your-function-name \
  --name "Your Function Name" \
  --entrypoint "src/main.js" \
  --commands "npm install"
```

### Step 6: Deploy Function Code
```bash
appwrite functions create-deployment \
  --function-id your-function-name \
  --entrypoint "src/main.js" \
  --code "functions/your-function-name" \
  --activate true
```

### Step 7: Set Environment Variables
Go to Appwrite Console:
1. Functions > your-function-name > Settings > Environment Variables
2. Add required variables

---

## Method 2: Using appwrite push (Alternative)

### Prerequisites
Function must exist in Appwrite first (use Method 1 Step 4).

### Steps
```bash
# From project root
appwrite push function

# Select your function from the list
# CLI will prompt for:
# - Entrypoint: src/main.js
# - Commands: npm install
# - Code path: functions/your-function-name
```

**Note**: This method only works if the function already exists remotely.

---

## Common Issues & Solutions

### Issue 1: Function Not Showing in Push List
**Cause**: Function doesn't exist in Appwrite yet.
**Solution**: Create function first using `appwrite functions create`.

### Issue 2: "No functions were pushed" Error
**Cause**: Missing entrypoint or commands in function configuration.
**Solution**: Update function with `appwrite functions update` before pushing.

### Issue 3: Function Exists But Can't Push Code
**Cause**: CLI push is unreliable for new functions.
**Solution**: Use `appwrite functions create-deployment` directly.

### Issue 4: Deployment Stuck in "waiting" Status
**Cause**: Build process issue or missing dependencies.
**Solution**: 
- Check build logs in Appwrite Console
- Ensure `package.json` is correct
- Verify `node_modules` is NOT in the code folder

---

## Best Practices

### 1. Function Structure
```
functions/
  your-function-name/
    src/
      main.js          # Entry point
    package.json       # Dependencies
    .gitignore         # Exclude node_modules
```

### 2. Package.json Template
```json
{
  "name": "your-function-name",
  "version": "1.0.0",
  "type": "module",
  "main": "src/main.js",
  "dependencies": {
    "node-appwrite": "^11.0.0"
  }
}
```

### 3. Always Use "module" Type
Set `"type": "module"` in package.json to use ES6 imports.

### 4. Test Locally First
```bash
cd functions/your-function-name
npm install
node src/main.js  # Basic syntax check
```

### 5. Environment Variables
- Never hardcode secrets in code
- Always use environment variables
- Set them in Appwrite Console after deployment

---

## Quick Reference Commands

```bash
# Create function
appwrite functions create --function-id NAME --name "Display Name" --runtime node-18.0 --execute any --timeout 15

# Update function config
appwrite functions update --function-id NAME --name "Display Name" --entrypoint "src/main.js" --commands "npm install"

# Deploy code
appwrite functions create-deployment --function-id NAME --entrypoint "src/main.js" --code "functions/NAME" --activate true

# List functions
appwrite functions list

# Get function details
appwrite functions get --function-id NAME

# Delete function
appwrite functions delete --function-id NAME
```

---

## Deployment Checklist

- [ ] Function folder created with proper structure
- [ ] `package.json` with correct dependencies
- [ ] `src/main.js` with export default function
- [ ] Function added to `appwrite.json`
- [ ] Function created in Appwrite (`functions create`)
- [ ] Function config updated (`functions update`)
- [ ] Code deployed (`create-deployment`)
- [ ] Environment variables set in Console
- [ ] Deployment status is "ready" (check Console)
- [ ] Test function execution

---

## Example: Newsletter Function Deployment

Real example from our newsletter system:

```bash
# 1. Create function
appwrite functions create \
  --function-id newsletter-emails \
  --name "Newsletter Emails" \
  --runtime node-18.0 \
  --execute any \
  --timeout 300

# 2. Update config
appwrite functions update \
  --function-id newsletter-emails \
  --name "Newsletter Emails" \
  --entrypoint "src/main.js" \
  --commands "npm install"

# 3. Deploy code
appwrite functions create-deployment \
  --function-id newsletter-emails \
  --entrypoint "src/main.js" \
  --code "functions/newsletter-emails" \
  --activate true

# 4. Set environment variables in Console:
# - RESEND_API_KEY
# - FROM_EMAIL
# - SITE_URL
# - APPWRITE_ENDPOINT
# - APPWRITE_PROJECT_ID
# - APPWRITE_API_KEY
# - APPWRITE_DATABASE_ID
```

---

## Troubleshooting

### Check Deployment Status
```bash
appwrite functions list-deployments --function-id NAME
```

### View Build Logs
Go to Appwrite Console > Functions > Your Function > Deployments > Click deployment > View logs

### Common Build Errors
1. **Missing dependencies**: Add to package.json
2. **Syntax errors**: Check main.js syntax
3. **Import errors**: Ensure "type": "module" in package.json
4. **Timeout**: Increase timeout in function settings

---

## Key Learnings

1. **Always create function in Appwrite first** before trying to push
2. **Use `create-deployment` directly** - more reliable than `push`
3. **Set entrypoint and commands** before deploying
4. **Check Console for build status** - CLI doesn't always show errors
5. **Environment variables** must be set in Console, not in code

---

This guide is based on real deployment experience and proven to work.
