# Quick Fix: 500 Error on Register/Login

## Problem
You're getting a 500 Internal Server Error when trying to register or login users.

## Root Cause
Missing `JWT_EXPIRE` environment variable in Render Dashboard.

## Solution

### Step 1: Add Missing Environment Variable
Go to your Render Dashboard and add this environment variable:

**Variable Name:** `JWT_EXPIRE`
**Value:** `7d`

### Step 2: Verify All Required Environment Variables
Make sure you have ALL these variables set in Render Dashboard:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
```

### Step 3: Redeploy
After adding the environment variable:
1. Go to your Render service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait 2-3 minutes for deployment

### Step 4: Test
Test the registration endpoint:
```bash
curl -X POST https://badminton-booking-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test123@example.com","password":"password123","role":"player"}'
```

## Expected Response
You should get a 201 response with a token:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test123@example.com",
    "role": "player"
  }
}
```

## Why This Happened
The `getSignedJwtToken()` method in the User model requires both:
- `JWT_SECRET` (you had this)
- `JWT_EXPIRE` (you were missing this)

When `JWT_EXPIRE` is undefined, the JWT signing fails and causes a 500 error.

## Additional Environment Variables (Optional)
For full functionality, you might also want to set:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

But these are optional and won't cause 500 errors if missing. 