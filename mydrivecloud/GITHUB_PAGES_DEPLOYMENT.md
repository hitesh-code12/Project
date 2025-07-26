# GitHub Pages Deployment Guide

## Prerequisites
- Your Railway backend is deployed and working
- You have your Railway app URL (e.g., `https://badminton-booking-production.up.railway.app`)

## Step 1: Update API URL

**IMPORTANT**: Before deploying, you need to update the Railway URL in the frontend code.

1. **Get your Railway URL**:
   - Go to your Railway dashboard
   - Find your service URL (e.g., `https://badminton-booking-production.up.railway.app`)
   - Your API base URL will be: `https://your-app-name.up.railway.app/api`

2. **Update the API URL in the code**:
   - Open `mydrivecloud/src/contexts/AuthContext.js`
   - Replace the placeholder URL with your actual Railway URL:
   ```javascript
   const API_BASE_URL = process.env.NODE_ENV === 'production' 
     ? 'https://YOUR-ACTUAL-RAILWAY-URL.up.railway.app/api'  // Replace this!
     : 'http://localhost:5001/api';
   ```

## Step 2: Update GitHub Pages Configuration

1. **Update homepage in package.json**:
   - Open `mydrivecloud/package.json`
   - Replace the homepage URL with your actual GitHub username and repository name:
   ```json
   "homepage": "https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO-NAME"
   ```

## Step 3: Deploy to GitHub Pages

1. **Build and deploy**:
   ```bash
   cd mydrivecloud
   npm run deploy
   ```

2. **If this is your first deployment**:
   - Go to your GitHub repository
   - Go to Settings → Pages
   - Set Source to "Deploy from a branch"
   - Select "gh-pages" branch
   - Save

## Step 4: Test Your Deployment

1. **Wait for deployment** (usually 2-5 minutes)
2. **Visit your GitHub Pages URL**: `https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO-NAME`
3. **Test the application**:
   - Try to sign up/login
   - Test booking functionality
   - Verify all API calls work

## Troubleshooting

### Common Issues:

1. **API calls failing**:
   - Check that your Railway URL is correct
   - Verify your Railway backend is running
   - Check browser console for CORS errors

2. **Build errors**:
   - Run `npm run build` locally first to check for errors
   - Fix any TypeScript/ESLint errors

3. **GitHub Pages not updating**:
   - Check the Actions tab in your GitHub repo
   - Verify the gh-pages branch was created
   - Wait a few minutes for changes to propagate

### Testing Locally with Production API:

To test your frontend locally with the production Railway API:

1. **Temporarily change the API URL**:
   ```javascript
   const API_BASE_URL = 'https://YOUR-RAILWAY-URL.up.railway.app/api';
   ```

2. **Test locally**:
   ```bash
   npm start
   ```

3. **Revert back for deployment**:
   ```javascript
   const API_BASE_URL = process.env.NODE_ENV === 'production' 
     ? 'https://YOUR-RAILWAY-URL.up.railway.app/api'
     : 'http://localhost:5001/api';
   ```

## Final Checklist

- [ ] Railway backend is deployed and working
- [ ] API URL is updated with correct Railway URL
- [ ] Homepage URL is updated in package.json
- [ ] `npm run deploy` completes successfully
- [ ] GitHub Pages is enabled in repository settings
- [ ] Application works correctly on GitHub Pages
- [ ] All features (auth, booking, etc.) work with Railway API

## Your URLs

- **Frontend (GitHub Pages)**: `https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO-NAME`
- **Backend (Railway)**: `https://YOUR-RAILWAY-URL.up.railway.app`
- **API Base**: `https://YOUR-RAILWAY-URL.up.railway.app/api` 