# 🚀 Railway Deployment Guide for Backend

## 📋 **Prerequisites**
- Your project is pushed to GitHub
- You have a Railway account (free tier available)

## 🔧 **Step-by-Step Railway Configuration**

### **Step 1: Push Your Code to GitHub**
```bash
# Make sure you're in the project root
cd /Users/bhushanbhonkar/Desktop/Project

# Add all files
git add .

# Commit changes
git commit -m "Add Railway configuration files"

# Push to GitHub
git push origin main
```

### **Step 2: Create Railway Project**

1. **Go to Railway Dashboard**
   - Visit [https://railway.app/dashboard](https://railway.app/dashboard)
   - Sign in with GitHub

2. **Create New Project**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your repository

### **Step 3: Configure the Service**

**Option A: Using Railway.toml (Recommended)**
- Railway will automatically detect the `railway.toml` file
- It will use the `sourceDir = "Backend"` configuration
- No manual configuration needed

**Option B: Manual Configuration**
If Railway doesn't auto-detect:

1. **Set Root Directory**
   - Go to your service settings (gear icon)
   - Find **"Root Directory"** field
   - Set it to: `Backend`

2. **Set Build Command**
   - Build Command: `npm install`
   - Start Command: `npm start`

### **Step 4: Set Environment Variables**

1. **Go to Variables Tab**
   - Click on your service
   - Go to **"Variables"** tab

2. **Add Environment Variables**
   Copy these from your `Backend/.env` file:

   ```env
   PORT=8000
   NODE_ENV=production
   MONGODB_URI=your-mongodb-atlas-uri
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

### **Step 5: Set Up MongoDB Atlas (Required)**

1. **Create MongoDB Atlas Account**
   - Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Sign up for free account

2. **Create Cluster**
   - Click **"Build a Database"**
   - Choose **"FREE"** tier
   - Select cloud provider and region
   - Click **"Create"**

3. **Set Up Database Access**
   - Go to **"Database Access"**
   - Click **"Add New Database User"**
   - Create username and password
   - Select **"Read and write to any database"**
   - Click **"Add User"**

4. **Set Up Network Access**
   - Go to **"Network Access"**
   - Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"** (for Railway)
   - Click **"Confirm"**

5. **Get Connection String**
   - Go to **"Database"**
   - Click **"Connect"**
   - Choose **"Connect your application"**
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `badminton-booking`

6. **Add to Railway Variables**
   - Add the connection string as `MONGODB_URI` in Railway

### **Step 6: Deploy**

1. **Trigger Deployment**
   - Railway will automatically deploy when you push to GitHub
   - Or click **"Deploy"** button manually

2. **Monitor Deployment**
   - Watch the build logs
   - Wait for "Deploy successful" message

3. **Get Your URL**
   - Railway will provide a URL like: `https://your-app.up.railway.app`
   - Copy this URL

### **Step 7: Test Your Deployment**

1. **Health Check**
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

2. **Test Registration**
   ```bash
   curl -X POST https://your-app.up.railway.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Admin",
       "email": "admin@test.com",
       "password": "password123",
       "role": "admin"
     }'
   ```

### **Step 8: Update Frontend**

1. **Update API URL**
   In `mydrivecloud/src/contexts/AuthContext.js`:
   ```javascript
   const API_BASE_URL = 'https://your-app.up.railway.app/api';
   ```

2. **Commit and Push**
   ```bash
   cd mydrivecloud
   # Update the API URL
   git add .
   git commit -m "Update API URL for Railway deployment"
   git push origin main
   ```

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **Build Fails**
   - Check Railway logs for errors
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **Environment Variables Missing**
   - Double-check all variables are set in Railway
   - Ensure no typos in variable names

3. **Database Connection Fails**
   - Verify MongoDB Atlas connection string
   - Check network access settings
   - Ensure database user has correct permissions

4. **Port Issues**
   - Railway sets `PORT` environment variable automatically
   - Your app should use `process.env.PORT || 5001`

### **Useful Commands:**

```bash
# Check Railway logs
railway logs

# View deployment status
railway status

# Open Railway dashboard
railway open
```

## ✅ **Success Indicators**

- ✅ Health endpoint responds
- ✅ User registration works
- ✅ JWT tokens are generated
- ✅ Database collections are created
- ✅ Frontend can connect to backend

## 🎉 **Deployment Complete!**

Your backend is now live at: `https://your-app.up.railway.app`

**Next Steps:**
1. Deploy frontend to GitHub Pages/Vercel/Netlify
2. Update frontend to use Railway backend URL
3. Test complete application flow

---

**Need help with any specific step? Let me know!** 