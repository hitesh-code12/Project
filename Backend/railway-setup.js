// Railway Setup Guide for Mobile Network Compatibility
// This file contains all the environment variables you need to set in Railway

const requiredEnvVars = {
  // Database
  MONGODB_URI: "mongodb+srv://hitesh012:Aruna123@cluster0.hlovctz.mongodb.net/badminton-booking?retryWrites=true&w=majority&appName=Cluster0",
  
  // Authentication
  JWT_SECRET: "badminton-booking-secret-key-2024-production",
  JWT_EXPIRE: "7d",
  
  // Server Configuration
  NODE_ENV: "production",
  PORT: "5001", // Railway will override this automatically
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: "900000", // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: "100",
  
  // File Upload
  MAX_FILE_SIZE: "5242880", // 5MB
  ALLOWED_FILE_TYPES: "image/jpeg,image/png,image/jpg,application/pdf",
  
  // Railway-specific (optional but recommended)
  RAILWAY_STATIC_URL: "https://project-production-3188.up.railway.app",
  RAILWAY_PUBLIC_DOMAIN: "project-production-3188.up.railway.app",
  
  // CORS and Network (for mobile compatibility)
  ALLOWED_ORIGINS: "https://hitesh-code12.github.io,http://localhost:3000,*",
  CORS_ENABLED: "true",
  
  // Health Check
  HEALTH_CHECK_ENABLED: "true",
  HEALTH_CHECK_PATH: "/health"
};

const optionalEnvVars = {
  // Email (if you want to enable email notifications)
  EMAIL_HOST: "smtp.gmail.com",
  EMAIL_PORT: "587",
  EMAIL_USER: "your-email@gmail.com",
  EMAIL_PASS: "your-app-password",
  
  // Cloudinary (for file uploads)
  CLOUDINARY_CLOUD_NAME: "your-cloud-name",
  CLOUDINARY_API_KEY: "your-api-key",
  CLOUDINARY_API_SECRET: "your-api-secret"
};

console.log("🚂 Railway Environment Variables Setup Guide");
console.log("=============================================");
console.log("");
console.log("📋 REQUIRED VARIABLES (Set these in Railway Dashboard):");
console.log("");

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

console.log("");
console.log("📋 OPTIONAL VARIABLES (Set if needed):");
console.log("");

Object.entries(optionalEnvVars).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

console.log("");
console.log("🔧 SETUP INSTRUCTIONS:");
console.log("1. Go to Railway Dashboard");
console.log("2. Select your project");
console.log("3. Go to 'Variables' tab");
console.log("4. Add each variable above");
console.log("5. Deploy the project");
console.log("");
console.log("🌐 MOBILE NETWORK TROUBLESHOOTING:");
console.log("- If mobile networks can't connect, try these additional variables:");
console.log("  ALLOWED_ORIGINS=*");
console.log("  CORS_ENABLED=true");
console.log("  NODE_ENV=development (temporarily for testing)");
console.log("");
console.log("🔍 VERIFICATION:");
console.log("After deployment, test these endpoints:");
console.log("- https://project-production-3188.up.railway.app/health");
console.log("- https://project-production-3188.up.railway.app/api/ping");
console.log("- https://project-production-3188.up.railway.app/api/mobile-health");

module.exports = { requiredEnvVars, optionalEnvVars }; 