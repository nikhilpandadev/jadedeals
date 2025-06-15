# Netlify Deployment Guide for JadeDeals

## Method 1: Through Netlify Dashboard (Most Common)

### Step 1: Access Your Site
1. Go to https://app.netlify.com
2. Find your `jadedeals.me` site in the list
3. Click on the site name to open the site dashboard

### Step 2: Set Environment Variables
1. In your site dashboard, look for one of these options:
   - **Site settings** → **Environment variables**
   - **Build & deploy** → **Environment variables** 
   - **Site configuration** → **Environment variables**

2. Click **"Add variable"** or **"New variable"** and add:
   ```
   Key: VITE_SUPABASE_URL
   Value: https://your-project-id.supabase.co
   
   Key: VITE_SUPABASE_ANON_KEY
   Value: your_anon_key_here
   ```

### Step 3: Trigger Deployment
Look for one of these options:

**Option A: Deploys Tab**
1. Go to **"Deploys"** tab in your site dashboard
2. Look for **"Trigger deploy"** button (usually at the top right)
3. Click it and select **"Deploy site"**

**Option B: Site Overview**
1. On the main site overview page
2. Look for **"Deploy"** or **"Redeploy"** button
3. Click it to trigger a new deployment

**Option C: Production Deploys Section**
1. In the **"Deploys"** section
2. Look for **"Deploy site"** or **"Trigger deploy"**
3. Click to start a new deployment

## Method 2: Through Git Push (Alternative)

If you can't find the deploy button, you can trigger a deployment by pushing to your repository:

1. Make a small change to any file (like adding a comment)
2. Commit and push to your main branch
3. Netlify will automatically deploy

## Method 3: Using Netlify CLI

If you have access to the command line:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to your site (if not already linked)
netlify link

# Set environment variables
netlify env:set VITE_SUPABASE_URL "https://your-project-id.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your_anon_key_here"

# Deploy
netlify deploy --prod
```

## Finding Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **Project API keys** → **anon/public** → Use for `VITE_SUPABASE_ANON_KEY`

## Troubleshooting

### If you can't find the deploy button:
1. Try refreshing the Netlify dashboard
2. Check if you're in the correct site
3. Look for these alternative button names:
   - "Deploy site"
   - "Redeploy"
   - "Manual deploy"
   - "Trigger build"

### If deployment fails:
1. Check the deploy logs in the **"Deploys"** tab
2. Ensure environment variables are set correctly
3. Verify your Supabase credentials are valid

### If environment variables aren't working:
1. Make sure variable names start with `VITE_`
2. Redeploy after setting variables
3. Check for typos in variable names

## Expected Result

After successful deployment with environment variables:
- ✅ https://jadedeals.me should load without errors
- ✅ All routes should work (no 404 errors)
- ✅ Database connections should work
- ✅ User authentication should function

## Need Help?

If you're still having trouble:
1. Take a screenshot of your Netlify dashboard
2. Check the deploy logs for specific error messages
3. Verify your Supabase project is active and accessible