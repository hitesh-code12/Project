const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const venueRoutes = require('./routes/venues');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const availabilityRoutes = require('./routes/availability');
const leagueRoutes = require('./routes/leagues');
const uploadRoutes = require('./routes/upload');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

// Import utilities
const { scheduleWeeklyNotification } = require('./utils/weeklyNotification');

const app = express();

// Trust proxy for deployment (fixes rate-limit X-Forwarded-For error)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://hitesh-code12.github.io',
      'https://hitesh-code12.github.io/',
      'https://hitesh-code12.github.io/Project',
      'https://hitesh-code12.github.io/Project/',
      'http://localhost:3000',
      'http://localhost:3000/',
      // Allow all origins for testing (remove in production)
      '*'
    ];
    
    // For testing, allow all origins
    if (process.env.NODE_ENV === 'development' || allowedOrigins.includes('*')) {
      callback(null, true);
    } else if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Trust Railway's proxy
  trustProxy: true
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint (required for deployment platforms)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Badminton Booking API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodbConfigured: !!(process.env.MONGODB_URI || process.env.MONGODB_URI_PROD || process.env.MONGODB_URL || process.env.DATABASE_URL),
    port: process.env.PORT,
    platform: process.env.RENDER_EXTERNAL_URL ? 'Render' : (process.env.RAILWAY_STATIC_URL ? 'Railway' : 'Other'),
    url: process.env.RENDER_EXTERNAL_URL || process.env.RAILWAY_STATIC_URL || 'Not set'
  });
});

// Root endpoint for Railway
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Badminton Booking API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for CORS debugging
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is accessible',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    headers: {
      'user-agent': req.headers['user-agent'],
      'accept': req.headers['accept'],
      'content-type': req.headers['content-type']
    },
    environment: process.env.NODE_ENV
  });
});

// Network diagnostics endpoint
app.get('/api/network-test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Network test successful',
    timestamp: new Date().toISOString(),
    clientIP: req.ip,
    forwardedFor: req.headers['x-forwarded-for'],
    userAgent: req.headers['user-agent'],
    origin: req.headers.origin,
    referer: req.headers.referer,
    host: req.headers.host
  });
});

// Simple ping endpoint for mobile networks
app.get('/api/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// Alternative health check for mobile networks
app.get('/api/mobile-health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mobile network health check',
    timestamp: new Date().toISOString(),
    platform: process.env.RENDER_EXTERNAL_URL ? 'Render' : (process.env.RAILWAY_STATIC_URL ? 'Railway' : 'Other'),
    environment: process.env.NODE_ENV
  });
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    // Debug: Log environment variables
    console.log('🔍 Environment Variables Debug:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('MONGODB_URI_PROD exists:', !!process.env.MONGODB_URI_PROD);
    console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('MONGODB')));
    
    // Try different environment variable names
    let mongoUri = process.env.MONGODB_URI || 
                   process.env.MONGODB_URI_PROD || 
                   process.env.MONGODB_URL ||
                   process.env.DATABASE_URL;
    
    if (!mongoUri) {
      console.error('❌ No MongoDB URI found in environment variables');
      console.error('Available environment variables:', Object.keys(process.env));
      throw new Error('MongoDB URI not found in environment variables. Please check your deployment platform environment variables.');
    }
    
    console.log('✅ MongoDB URI found, attempting connection...');
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    console.error('Please check your deployment platform environment variables and MongoDB connection string.');
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    console.log('🚀 Starting server...');
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔌 Port: ${PORT}`);
    console.log(`🌐 Platform URL: ${process.env.RENDER_EXTERNAL_URL || process.env.RAILWAY_STATIC_URL || 'Not set'}`);
    console.log(`🔗 Public Domain: ${process.env.RAILWAY_PUBLIC_DOMAIN || 'Not set'}`);
    
    await connectDB();
    
    // Listen on all interfaces for deployment
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Listening on all interfaces (0.0.0.0:${PORT})`);
      console.log(`🏸 Badminton Booking API ready!`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      }
      process.exit(1);
    });
    
    // Schedule weekly availability notifications
    if (process.env.NODE_ENV === 'production') {
      scheduleWeeklyNotification();
    } else {
      console.log('🕐 Weekly notifications disabled in development mode');
    }
    
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;
