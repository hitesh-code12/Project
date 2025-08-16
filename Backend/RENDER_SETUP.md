# Render Deployment Setup Guide

## Overview
This guide will help you deploy your Badminton Booking Backend on Render, which should resolve mobile network connectivity issues you experienced with Railway.

## Why Render?
- Better mobile network compatibility
- More reliable global CDN
- Free tier available
- Automatic HTTPS
- Better uptime

## Step 1: Prepare Your Repository

1. **Ensure your code is in a Git repository**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Verify your package.json has the correct start script**
   ```json
   {
     "scripts": {
       "start": "node index.js"
     }
   }
   ```

## Step 2: Deploy on Render

### Option A: Using render.yaml (Recommended)
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Click "Apply" to deploy

### Option B: Manual Setup
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `badminton-booking-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

## Step 3: Environment Variables

Set these environment variables in Render Dashboard:

### Required Variables
```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

### Optional Variables
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Step 4: Update Frontend Configuration

After deployment, update your frontend to use the new Render URL:

1. **Update AuthContext.js**:
   ```javascript
   const API_BASE_URL = process.env.NODE_ENV === 'production' 
     ? 'https://your-app-name.onrender.com/api'
     : 'http://localhost:5000/api';
   ```

2. **Update ConnectionTest.js**:
   ```javascript
   const RENDER_URL = 'https://your-app-name.onrender.com';
   ```

## Step 5: Test Your Deployment

1. **Health Check**: Visit `https://your-app-name.onrender.com/health`
2. **API Test**: Visit `https://your-app-name.onrender.com/api/test`
3. **Mobile Testing**: Test on mobile devices to ensure connectivity

## Step 6: Custom Domain (Optional)

1. In Render Dashboard, go to your service
2. Click "Settings" → "Custom Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Render Dashboard
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **Environment Variables**
   - Double-check all required variables are set
   - Ensure MongoDB URI is correct
   - Verify JWT_SECRET is set

3. **Database Connection**
   - Test MongoDB connection string locally
   - Ensure MongoDB Atlas IP whitelist includes Render's IPs
   - Check MongoDB Atlas cluster status

4. **CORS Issues**
   - Update CORS configuration in index.js
   - Add your frontend domain to allowed origins

### Performance Optimization

1. **Enable Caching**
   - Add appropriate cache headers
   - Use Redis for session storage (if needed)

2. **Database Optimization**
   - Add database indexes
   - Optimize queries
   - Use connection pooling

## Monitoring

1. **Logs**: View logs in Render Dashboard
2. **Metrics**: Monitor performance in Render Dashboard
3. **Uptime**: Set up uptime monitoring

## Cost Optimization

- Free tier includes 750 hours/month
- Upgrade to paid plan for unlimited usage
- Monitor usage in Render Dashboard

## Migration from Railway

1. **Backup Data**: Export your MongoDB data
2. **Update URLs**: Change all references from Railway to Render
3. **Test Thoroughly**: Test all functionality
4. **Update Documentation**: Update any documentation with new URLs

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- GitHub Issues: For code-specific issues 