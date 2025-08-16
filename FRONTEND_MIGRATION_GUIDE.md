# Frontend Migration Guide: Railway → Render

## Overview
This guide covers all the changes needed in your frontend to migrate from Railway to Render.

## ✅ Changes Made

### 1. **AuthContext.js** - Updated API Base URL
**File:** `mydrivecloud/src/contexts/AuthContext.js`

**Before:**
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://project-production-3188.up.railway.app/api'
  : 'http://localhost:5001/api';
```

**After:**
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://badminton-booking-backend.onrender.com/api'
  : 'http://localhost:5001/api';
```

### 2. **ConnectionTest.js** - Updated All Test URLs
**File:** `mydrivecloud/src/components/common/ConnectionTest.js`

**Changes Made:**
- Updated direct fetch URL: `https://badminton-booking-backend.onrender.com/api/test`
- Updated health endpoint: `https://badminton-booking-backend.onrender.com/health`
- Updated network diagnostics: `https://badminton-booking-backend.onrender.com/api/network-test`
- Updated detailed network tests to use Render URLs
- Updated error messages to reference Render instead of Railway

## 🚀 Next Steps

### 1. **Commit and Push Changes**
```bash
cd mydrivecloud
git add .
git commit -m "Update frontend URLs from Railway to Render"
git push origin main
```

### 2. **Deploy Frontend**
If your frontend is deployed on GitHub Pages or another platform, trigger a new deployment.

### 3. **Test the Migration**
After both backend and frontend are updated:

1. **Test Backend First:**
   ```bash
   curl https://badminton-booking-backend.onrender.com/health
   curl https://badminton-booking-backend.onrender.com/api/debug
   ```

2. **Test Frontend:**
   - Open your frontend application
   - Try logging in/registering
   - Use the ConnectionTest component to verify connectivity
   - Test all major features

## 🔧 Environment Variables Required

Make sure your backend has these environment variables set in Render Dashboard:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

## 📋 Testing Checklist

- [ ] Backend health endpoint responds
- [ ] Backend debug endpoint shows correct environment variables
- [ ] Frontend can connect to backend API
- [ ] User authentication works (login/register)
- [ ] All API endpoints respond correctly
- [ ] ConnectionTest component shows successful tests
- [ ] Mobile network access works (main benefit of migration)

## 🎯 Benefits After Migration

1. **Better Mobile Network Compatibility** - Render domains are less likely to be blocked
2. **Improved Reliability** - Better uptime and performance
3. **Cost Savings** - More generous free tier
4. **Better Global CDN** - Faster loading times worldwide

## 🚨 Important Notes

1. **Backend Must Be Working First** - Ensure your backend is deployed and working on Render before testing the frontend
2. **Environment Variables** - The backend 502 error must be resolved by setting environment variables
3. **CORS Configuration** - Your backend CORS settings should allow your frontend domain
4. **Database Connection** - Ensure MongoDB Atlas is properly configured

## 🔍 Troubleshooting

If you encounter issues:

1. **Check Backend Status:**
   ```bash
   curl https://badminton-booking-backend.onrender.com/health
   ```

2. **Check Environment Variables:**
   ```bash
   curl https://badminton-booking-backend.onrender.com/api/debug
   ```

3. **Test Network Connectivity:**
   - Use the ConnectionTest component in your frontend
   - Check browser developer tools for network errors
   - Verify CORS headers in response

4. **Check Render Logs:**
   - Go to Render Dashboard → Your Service → Logs
   - Look for any error messages during startup

## 📞 Support

If you need help:
1. Check the backend troubleshooting guide: `Backend/RENDER_TROUBLESHOOTING.md`
2. Verify all environment variables are set in Render Dashboard
3. Test backend endpoints directly before testing frontend
4. Check Render documentation: https://render.com/docs 