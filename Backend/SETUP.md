# 🚀 Backend Setup Guide

## Quick Start

### 1. Environment Setup

```bash
# Copy environment file
cp env.example .env

# Edit the .env file with your configuration
nano .env
```

### 2. Required Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/badminton-booking
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/badminton-booking

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Limits
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,application/pdf
```

### 3. Database Setup

#### Option A: Local MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
# Follow instructions at: https://docs.mongodb.com/manual/installation/
```

#### Option B: MongoDB Atlas (Recommended for Production)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update `MONGODB_URI_PROD` in your `.env` file

### 4. Cloudinary Setup (for file uploads)
1. Go to [Cloudinary](https://cloudinary.com/)
2. Create a free account
3. Get your cloud name, API key, and API secret
4. Update the Cloudinary configuration in your `.env` file

### 5. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Testing

### Using Postman or similar tool:

#### 1. Register an Admin User
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

#### 2. Login
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

#### 3. Create a Venue
```http
POST http://localhost:5000/api/venues
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "name": "Sports Complex",
  "description": "Premium badminton courts",
  "address": {
    "street": "123 Sports Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001"
  },
  "location": {
    "coordinates": [72.8777, 19.0760]
  },
  "contactInfo": {
    "phone": "+912234567890",
    "email": "info@sportscomplex.com"
  },
  "pricing": {
    "hourlyRate": 800,
    "peakHourRate": 1000
  },
  "facilities": ["parking", "shower", "locker"],
  "courts": [
    {
      "number": 1,
      "type": "indoor",
      "surface": "wooden"
    }
  ]
}
```

## Health Check

Visit `http://localhost:5000/health` to verify the server is running.

## Common Issues & Solutions

### 1. MongoDB Connection Error
- Ensure MongoDB is running
- Check your connection string in `.env`
- For Atlas: Ensure your IP is whitelisted

### 2. Cloudinary Upload Error
- Verify your Cloudinary credentials
- Check file size limits
- Ensure file types are allowed

### 3. JWT Token Issues
- Check JWT_SECRET is set
- Verify token expiration time
- Ensure proper Authorization header format

### 4. Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

## Development Workflow

### 1. Code Structure
```
Backend/
├── models/          # Database models
│   ├── User.js
│   ├── Venue.js
│   ├── Booking.js
│   └── Payment.js
├── routes/          # API routes
│   ├── auth.js
│   ├── users.js
│   ├── venues.js
│   ├── bookings.js
│   ├── payments.js
│   └── admin.js
├── middleware/      # Custom middleware
│   ├── auth.js
│   ├── errorHandler.js
│   ├── notFound.js
│   └── upload.js
├── uploads/         # File upload directory
├── index.js         # Main server file
├── package.json     # Dependencies
└── README.md        # Documentation
```

### 2. Adding New Features
1. Create model in `models/` directory
2. Create routes in `routes/` directory
3. Add middleware if needed
4. Update main `index.js` to include new routes
5. Test thoroughly

### 3. Database Migrations
For production, consider using a migration tool like `migrate-mongo`:

```bash
npm install -g migrate-mongo
migrate-mongo init
migrate-mongo up
```

## Production Deployment

### 1. Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI_PROD=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 2. PM2 Deployment
```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start index.js --name "badminton-api"

# Monitor the application
pm2 monit

# View logs
pm2 logs badminton-api
```

### 3. Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB connection uses authentication
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] File upload validation is in place
- [ ] Input validation is implemented
- [ ] Error handling doesn't expose sensitive data
- [ ] HTTPS is enabled in production
- [ ] Environment variables are secure

## Monitoring & Logging

### 1. Application Logs
```bash
# View application logs
pm2 logs badminton-api

# View error logs
pm2 logs badminton-api --err
```

### 2. Database Monitoring
- Monitor MongoDB performance
- Set up alerts for connection issues
- Track query performance

### 3. API Monitoring
- Set up health checks
- Monitor response times
- Track error rates

## Support

For issues and questions:
1. Check the logs for error messages
2. Verify environment variables
3. Test database connectivity
4. Check API documentation
5. Create an issue on GitHub

---

**🏸 Happy Coding!** 

---

## 🚀 **Deploying Only the Backend Folder to Railway (Monorepo)**

### 1. **Push Your Repo to GitHub**
- Make sure your project is on GitHub (with both `Backend/` and `mydrivecloud/` folders).

### 2. **Create a New Railway Project**
- Go to [https://railway.app/](https://railway.app/) and log in.
- Click **“New Project”** → **“Deploy from GitHub repo”**.
- Select your repo.

### 3. **Configure the Service to Use the Backend Folder**
- After import, Railway will try to auto-detect your project.
- **If it asks for a root directory, select `Backend/`.**
- If not, go to the **Service settings** (the gear icon), and set the **Root Directory** to `Backend`.

### 4. **Set Build and Start Commands**
- **Build Command:**  
  ```
  npm install
  ```
- **Start Command:**  
  ```
  npm start
  ```
- **Root Directory:**  
  ```
  Backend
  ```

### 5. **Set Environment Variables**
- In Railway, go to the **Variables** tab for your service.
- Add all the variables from your `Backend/.env` file (except comments).
- Example:
  ```
  PORT=8000
  MONGODB_URI=your-mongodb-atlas-uri
  JWT_SECRET=your-secret
  CLOUDINARY_CLOUD_NAME=...
  CLOUDINARY_API_KEY=...
  CLOUDINARY_API_SECRET=...
  ```
- **Tip:** Use MongoDB Atlas for your database (free tier).

### 6. **Deploy**
- Click **“Deploy”** or wait for Railway to auto-deploy.
- After a few minutes, you’ll get a public URL like `https://your-app.up.railway.app`.

### 7. **Update Your Frontend API URL**
- In your frontend code (`mydrivecloud/src/contexts/AuthContext.js`), change:
  ```js
  const API_BASE_URL = 'https://your-app.up.railway.app/api';
  ```
- Commit and push this change to GitHub.

### 8. **(Optional) Deploy Frontend Separately**
- You can deploy your React frontend to GitHub Pages, Vercel, or Netlify.
- Make sure it points to your Railway backend URL.

---

## ⚠️ **Common Issues & Tips**

- **Wrong Root Directory:**  
  If you see errors about missing `package.json`, double-check the root directory is set to `Backend`.

- **Environment Variables:**  
  All secrets must be set in Railway’s Variables tab.

- **CORS:**  
  Your backend should allow requests from your frontend’s domain.

---

## 📝 **Summary**

- Set Railway’s root directory to `Backend`
- Set build/start commands and environment variables
- Deploy and get your backend URL
- Update frontend to use the new backend URL

---

**If you want, I can give you exact Railway UI steps with screenshots, or help you with MongoDB Atlas setup. Just let me know!** 