# 🏸 Badminton Booking & Expense Tracker - Backend API

A comprehensive Node.js/Express backend API for managing badminton venue bookings, player management, and expense tracking.

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with role-based access control
- **Admin and Player roles** with different permissions
- **Password encryption** using bcrypt
- **Token expiration** and refresh mechanisms

### 👥 User Management
- **User registration and login**
- **Profile management** (update name, phone, password)
- **Role-based access control** (Admin/Player)
- **User statistics** and analytics

### 🏟️ Venue Management
- **CRUD operations** for badminton venues
- **Geospatial queries** for nearby venue search
- **Court availability** tracking
- **Pricing management** with peak hour rates
- **Facility amenities** tracking

### 📅 Booking Management
- **Create and manage bookings** with automatic cost calculation
- **Venue availability checking** to prevent double bookings
- **Player assignment** and expense splitting
- **Booking status tracking** (pending, confirmed, cancelled, completed)
- **Date and time validation**

### 💰 Payment & Expense Tracking
- **Payment proof upload** with Cloudinary integration
- **Payment status management** (pending, approved, rejected)
- **Automatic expense calculation** per player
- **Payment method tracking** (UPI, bank transfer, cash, etc.)
- **Admin payment review** system

### 📊 Analytics & Reporting
- **Dashboard statistics** for admins
- **Revenue analytics** with date range filtering
- **Booking trends** and venue performance
- **User activity tracking**
- **Payment method breakdown**

## 🛠️ Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Morgan
- **Compression**: Compression middleware

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd Backend
npm install
```

### 2. Environment Configuration

Copy the environment example file and configure your variables:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

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

# Cloudinary Configuration
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

#### Local MongoDB
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI_PROD` in your `.env` file

### 4. Cloudinary Setup

1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Update the Cloudinary configuration in your `.env` file

### 5. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "player"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### User Management (Admin Only)

#### Get All Users
```http
GET /users?page=1&limit=10
Authorization: Bearer <admin_token>
```

#### Create User
```http
POST /users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "player",
  "phone": "+1234567890"
}
```

### Venue Management

#### Get All Venues
```http
GET /venues?city=Mumbai&minPrice=500&maxPrice=2000
Authorization: Bearer <token>
```

#### Create Venue (Admin Only)
```http
POST /venues
Authorization: Bearer <admin_token>
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

### Booking Management

#### Get All Bookings
```http
GET /bookings?status=confirmed&venue=venue_id
Authorization: Bearer <token>
```

#### Create Booking (Admin Only)
```http
POST /bookings
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "venue": "venue_id",
  "date": "2024-02-15T10:00:00.000Z",
  "startTime": "18:00",
  "endTime": "20:00",
  "duration": 2,
  "players": ["player1_id", "player2_id"],
  "courtNumber": 1,
  "hourlyRate": 800,
  "notes": "Regular session"
}
```

### Payment Management

#### Upload Payment Proof
```http
POST /payments
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "booking": "booking_id",
  "amount": 400,
  "paymentMethod": "upi",
  "transactionId": "TXN123456",
  "notes": "Payment for Friday session",
  "paymentProof": <file>
}
```

#### Approve Payment (Admin Only)
```http
PUT /payments/payment_id/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "notes": "Payment verified"
}
```

### Admin Analytics

#### Dashboard Stats
```http
GET /admin/dashboard
Authorization: Bearer <admin_token>
```

#### Revenue Analytics
```http
GET /admin/revenue?period=monthly&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <admin_token>
```

## 🔒 Security Features

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (Admin/Player)
- Password encryption with bcrypt
- Token expiration handling

### Input Validation
- Request body validation using express-validator
- File upload validation (type, size)
- MongoDB injection protection

### Security Headers
- Helmet.js for security headers
- CORS configuration
- Rate limiting to prevent abuse
- Request size limiting

### File Upload Security
- File type validation
- File size limits
- Secure file storage with Cloudinary
- Virus scanning (can be integrated)

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['admin', 'player']),
  phone: String,
  avatar: String,
  isActive: Boolean,
  lastLogin: Date,
  emailVerified: Boolean
}
```

### Venue Model
```javascript
{
  name: String,
  description: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  location: {
    type: String,
    coordinates: [Number, Number]
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String
  },
  facilities: [String],
  courts: [{
    number: Number,
    type: String,
    surface: String,
    isAvailable: Boolean
  }],
  pricing: {
    hourlyRate: Number,
    peakHourRate: Number
  },
  isActive: Boolean
}
```

### Booking Model
```javascript
{
  venue: ObjectId,
  date: Date,
  startTime: String,
  endTime: String,
  duration: Number,
  players: [ObjectId],
  courtNumber: Number,
  hourlyRate: Number,
  totalCost: Number,
  costPerPlayer: Number,
  status: String,
  paymentStatus: String,
  notes: String
}
```

### Payment Model
```javascript
{
  booking: ObjectId,
  player: ObjectId,
  amount: Number,
  paymentMethod: String,
  paymentProof: {
    url: String,
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number
  },
  status: String,
  transactionId: String,
  notes: String,
  reviewedBy: ObjectId,
  reviewedAt: Date
}
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI_PROD=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### PM2 Deployment
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

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "count": 10,
  "pagination": {
    "next": { "page": 2, "limit": 10 },
    "prev": { "page": 1, "limit": 10 }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🔧 Development

### Project Structure
```
Backend/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── uploads/         # File upload directory
├── index.js         # Main server file
├── package.json     # Dependencies
└── README.md        # Documentation
```

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run lint       # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Bhushan Bhonkar**
- Email: bhushan@example.com
- GitHub: [@bhushanbhonkar](https://github.com/bhushanbhonkar)

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@badminton-tracker.com
- Documentation: [API Docs](https://docs.badminton-tracker.com)

---

**🏸 Happy Badminton Booking!** 