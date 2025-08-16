# Render 502 Bad Gateway Troubleshooting Guide

## Current Issue
Your Render deployment is showing a 502 Bad Gateway error, which means the application is failing to start properly.

## Common Causes & Solutions

### 1. **Environment Variables Missing**
The most common cause is missing required environment variables.

**Required Variables in Render Dashboard:**
```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

**Steps to Fix:**
1. Go to your Render Dashboard
2. Click on your service (badminton-booking-backend)
3. Go to "Environment" tab
4. Add the required variables above
5. Redeploy the service

### 2. **MongoDB Connection Issues**
If MongoDB URI is incorrect or MongoDB Atlas is not configured properly.

**Check MongoDB Atlas:**
1. Ensure your MongoDB Atlas cluster is running
2. Check if IP whitelist includes Render's IPs (0.0.0.0/0 for testing)
3. Verify connection string format
4. Test connection string locally

### 3. **Port Configuration**
Render automatically sets the PORT environment variable.

**Check in your code:**
```javascript
const PORT = process.env.PORT || 10000;
```

### 4. **Build/Start Command Issues**
Ensure your start command is correct.

**Current configuration:**
- Build Command: `npm install`
- Start Command: `npm start`

## Debugging Steps

### Step 1: Check Render Logs
1. Go to Render Dashboard
2. Click on your service
3. Go to "Logs" tab
4. Look for error messages during startup

### Step 2: Test Locally
```bash
cd Backend
npm install
NODE_ENV=production PORT=10000 npm start
```

### Step 3: Check Environment Variables
Create a test endpoint to verify environment variables:

```javascript
// Add this to your index.js temporarily
app.get('/api/debug', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set'
  });
});
```

### Step 4: Simplify Startup
Temporarily comment out MongoDB connection to test if that's the issue:

```javascript
// Comment out this line temporarily
// await connectDB();
```

## Quick Fix Checklist

- [ ] Set NODE_ENV=production in Render Dashboard
- [ ] Set PORT=10000 in Render Dashboard  
- [ ] Set MONGODB_URI in Render Dashboard
- [ ] Set JWT_SECRET in Render Dashboard
- [ ] Check MongoDB Atlas IP whitelist
- [ ] Verify MongoDB connection string
- [ ] Check Render logs for specific errors
- [ ] Redeploy after setting environment variables

## Test After Fixes

Once you've set the environment variables:

1. **Redeploy** your service in Render Dashboard
2. **Wait 2-3 minutes** for deployment to complete
3. **Test the health endpoint:**
   ```bash
   curl https://badminton-booking-backend.onrender.com/health
   ```

## If Still Not Working

1. **Check Render logs** for specific error messages
2. **Test MongoDB connection** locally with the same connection string
3. **Simplify the app** temporarily to isolate the issue
4. **Contact Render support** if logs don't show clear errors

## Common Error Messages

- **"MongoDB URI not found"** → Set MONGODB_URI environment variable
- **"JWT_SECRET not found"** → Set JWT_SECRET environment variable  
- **"Connection timeout"** → Check MongoDB Atlas configuration
- **"Port already in use"** → Check PORT environment variable 