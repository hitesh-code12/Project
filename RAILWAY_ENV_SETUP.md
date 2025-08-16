# Railway Environment Variables Setup Guide

## 🚨 Current Issue
Your Railway deployment is crashing because the MongoDB URI environment variable is missing.

## 🔧 How to Fix

### Step 1: Go to Railway Dashboard
1. Open https://railway.app/dashboard
2. Select your project
3. Click on your service (the one that's crashing)

### Step 2: Add Environment Variables
Go to the **"Variables"** tab and add these variables:

#### Required Variables:
```
MONGODB_URI = mongodb+srv://hitesh012:Aruna123@cluster0.hlovctz.mongodb.net/badminton-booking?retryWrites=true&w=majority&appName=Cluster0
```

```
JWT_SECRET = badminton-booking-secret-key-2024-production
```

```
NODE_ENV = production
```

#### Optional Variables:
```
PORT = 5001
```

```
RATE_LIMIT_WINDOW_MS = 900000
```

```
RATE_LIMIT_MAX_REQUESTS = 100
```

```
MAX_FILE_SIZE = 5242880
```

```
ALLOWED_FILE_TYPES = image/jpeg,image/png,image/jpg,application/pdf
```

### Step 3: Save and Redeploy
1. Click "Save" after adding the variables
2. Railway will automatically redeploy your service
3. Check the logs to see if the deployment is successful

### Step 4: Verify Deployment
1. Check the Railway logs for success messages
2. Test the health endpoint: https://project-production-3188.up.railway.app/health
3. Test the API: https://project-production-3188.up.railway.app/api/test

## 🔍 Troubleshooting

### If still crashing:
1. Check Railway logs for detailed error messages
2. Verify MongoDB Atlas connection string is correct
3. Make sure all required variables are set
4. Check if MongoDB Atlas IP whitelist allows Railway IPs

### Common Issues:
- **MongoDB URI format**: Make sure it includes the database name
- **Network access**: MongoDB Atlas might need to allow Railway IPs
- **Authentication**: Verify username/password in connection string

## 📞 Need Help?
If you're still having issues, check:
1. Railway logs for specific error messages
2. MongoDB Atlas dashboard for connection issues
3. Network connectivity between Railway and MongoDB Atlas 