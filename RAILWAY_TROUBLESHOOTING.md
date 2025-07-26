# 🔧 Railway Deployment Troubleshooting Guide

## 🚨 **Current Issue: MongoDB Connection Error**

**Error:** `MongooseError: The 'uri' parameter to 'openUri()' must be a string, got "undefined"`

**Root Cause:** Environment variable `MONGODB_URI` is not being received by the application.

## ✅ **What We've Fixed**

### 1. **Updated Backend Code**
- Modified `Backend/index.js` to properly handle environment variables
- Added debug logging to see what variables are being received
- Fixed the logic to use `MONGODB_URI` for both development and production

### 2. **Pushed Changes to GitHub**
- Changes are now live in your repository
- Railway will automatically redeploy with the updated code

## 🔍 **Next Steps to Fix the Issue**

### **Step 1: Verify Environment Variables in Railway**

1. **Go to Railway Dashboard**
   - Visit [https://railway.app/dashboard](https://railway.app/dashboard)
   - Click on your backend service

2. **Check Variables Tab**
   - Go to **"Variables"** tab
   - Verify that `MONGODB_URI` is set with the correct value:
   ```
   mongodb+srv://hitesh012:Aruna123@cluster0.hlovctz.mongodb.net/badminton-booking?retryWrites=true&w=majority&appName=Cluster0
   ```

3. **Add Missing Variables**
   If `MONGODB_URI` is missing, add it:
   - **Key:** `MONGODB_URI`
   - **Value:** `mongodb+srv://hitesh012:Aruna123@cluster0.hlovctz.mongodb.net/badminton-booking?retryWrites=true&w=majority&appName=Cluster0`

### **Step 2: Add Other Required Variables**

Add these variables to Railway (from your `Backend/.env` file):

```env
PORT=8000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,application/pdf
```

### **Step 3: Redeploy/Restart Service**

1. **After adding variables:**
   - Click **"Save"** or **"Deploy"**
   - Railway will automatically redeploy your service

2. **Monitor the logs:**
   - Go to **"Deployments"** tab
   - Click on the latest deployment
   - Check the logs for debug messages

### **Step 4: Check Debug Output**

The updated code will now show debug information in the logs:

```
Environment Variables Debug:
NODE_ENV: production
MONGODB_URI exists: true
MONGODB_URI_PROD exists: false
MongoDB Connected: cluster0.hlovctz.mongodb.net
```

## 🔍 **Common Issues & Solutions**

### **Issue 1: Variable Not Set**
- **Symptom:** `MONGODB_URI exists: false` in logs
- **Solution:** Add the variable in Railway Variables tab

### **Issue 2: Wrong Variable Name**
- **Symptom:** Variable exists but connection fails
- **Solution:** Ensure variable name is exactly `MONGODB_URI` (case sensitive)

### **Issue 3: Invalid Connection String**
- **Symptom:** Connection string error
- **Solution:** Verify the MongoDB Atlas connection string is correct

### **Issue 4: Network Access**
- **Symptom:** Connection timeout
- **Solution:** Ensure MongoDB Atlas allows access from anywhere (0.0.0.0/0)

## 📋 **Complete Environment Variables Checklist**

Make sure these are set in Railway:

- [ ] `MONGODB_URI` - Your MongoDB Atlas connection string
- [ ] `NODE_ENV` - Set to `production`
- [ ] `PORT` - Railway will set this automatically
- [ ] `JWT_SECRET` - A secure secret key
- [ ] `JWT_EXPIRE` - Token expiration (e.g., `7d`)
- [ ] `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- [ ] `CLOUDINARY_API_KEY` - Your Cloudinary API key
- [ ] `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- [ ] `EMAIL_HOST` - SMTP host (e.g., `smtp.gmail.com`)
- [ ] `EMAIL_PORT` - SMTP port (e.g., `587`)
- [ ] `EMAIL_USER` - Your email address
- [ ] `EMAIL_PASS` - Your email app password
- [ ] `GOOGLE_MAPS_API_KEY` - Your Google Maps API key
- [ ] `RATE_LIMIT_WINDOW_MS` - Rate limiting window (e.g., `900000`)
- [ ] `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (e.g., `100`)
- [ ] `MAX_FILE_SIZE` - Max file upload size (e.g., `5242880`)
- [ ] `ALLOWED_FILE_TYPES` - Allowed file types

## ✅ **Success Indicators**

After fixing the environment variables, you should see:

1. **In Railway Logs:**
   ```
   Environment Variables Debug:
   NODE_ENV: production
   MONGODB_URI exists: true
   MONGODB_URI_PROD exists: false
   MongoDB Connected: cluster0.hlovctz.mongodb.net
   🚀 Server running on port 8000
   📊 Environment: production
   🏸 Badminton Booking API ready!
   ```

2. **Health Check Response:**
   ```bash
   curl https://your-app.up.railway.app/health
   ```
   Should return:
   ```json
   {
     "status": "OK",
     "message": "Badminton Booking API is running",
     "timestamp": "...",
     "environment": "production"
   }
   ```

## 🎯 **Next Steps After Fix**

1. **Test the API endpoints**
2. **Update frontend to use Railway URL**
3. **Deploy frontend to GitHub Pages/Vercel**
4. **Test complete application flow**

## 🆘 **Still Having Issues?**

If you're still seeing the error after following these steps:

1. **Check Railway logs** for the debug output
2. **Verify all environment variables** are set correctly
3. **Ensure MongoDB Atlas** is accessible
4. **Contact support** with the specific error messages

---

**The key is making sure `MONGODB_URI` is properly set in Railway's environment variables!** 