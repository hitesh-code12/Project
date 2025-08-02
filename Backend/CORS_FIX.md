# CORS Configuration Fix

## Problem
The frontend deployed on GitHub Pages was getting CORS errors when trying to communicate with the Railway backend.

## Solution
Updated the CORS configuration in `Backend/index.js` to allow requests from the GitHub Pages domain.

## Current Configuration
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://hitesh-code12.github.io'] 
    : ['http://localhost:3000'],
  credentials: true
}));
```

## What This Fixes
- ✅ Allows requests from `https://hitesh-code12.github.io` (GitHub Pages)
- ✅ Allows requests from `http://localhost:3000` (local development)
- ✅ Enables credentials for authentication

## Deployment
The fix has been committed and pushed to GitHub, which will trigger a new Railway deployment.

## Testing
After Railway redeploys (usually 2-5 minutes):
1. Visit: `https://hitesh-code12.github.io/Project`
2. Try to register/login
3. CORS errors should be resolved

## Alternative Configurations

### Option 1: Allow All Origins (Less Secure)
```javascript
app.use(cors({
  origin: true,
  credentials: true
}));
```

### Option 2: Multiple Specific Origins
```javascript
app.use(cors({
  origin: [
    'https://hitesh-code12.github.io',
    'http://localhost:3000',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

### Option 3: Environment Variable Based
```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

## Railway Environment Variables
If you want to use environment variables for CORS, add this to Railway:
```
ALLOWED_ORIGINS=https://hitesh-code12.github.io,http://localhost:3000
```

## Troubleshooting
If CORS errors persist:
1. Check Railway deployment logs
2. Verify the domain is exactly correct
3. Clear browser cache
4. Check browser console for specific error messages 