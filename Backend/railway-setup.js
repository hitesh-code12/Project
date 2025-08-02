#!/usr/bin/env node

// Railway Environment Setup Verification Script
console.log('🚂 Railway Environment Setup Verification');
console.log('==========================================');

// Check required environment variables
const requiredVars = {
  'MONGODB_URI': 'MongoDB connection string',
  'JWT_SECRET': 'JWT secret key for authentication',
  'NODE_ENV': 'Node environment (should be production)'
};

const optionalVars = {
  'PORT': 'Server port (Railway sets this automatically)',
  'RATE_LIMIT_WINDOW_MS': 'Rate limiting window',
  'RATE_LIMIT_MAX_REQUESTS': 'Rate limiting max requests',
  'MAX_FILE_SIZE': 'Maximum file upload size',
  'ALLOWED_FILE_TYPES': 'Allowed file types for uploads'
};

console.log('\n🔍 Checking Required Environment Variables:');
console.log('===========================================');

let allRequiredSet = true;
Object.entries(requiredVars).forEach(([varName, description]) => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    const displayValue = varName.includes('MONGODB') || varName.includes('JWT') 
      ? value.substring(0, 20) + '...' 
      : value;
    console.log(`✅ ${varName}: ${displayValue} (${description})`);
  } else {
    console.log(`❌ ${varName}: NOT SET (${description})`);
    allRequiredSet = false;
  }
});

console.log('\n🔍 Checking Optional Environment Variables:');
console.log('===========================================');

Object.entries(optionalVars).forEach(([varName, description]) => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value} (${description})`);
  } else {
    console.log(`⚠️  ${varName}: NOT SET (${description}) - will use defaults`);
  }
});

console.log('\n🔍 Railway-Specific Environment Variables:');
console.log('===========================================');

const railwayVars = Object.keys(process.env).filter(key => key.startsWith('RAILWAY_'));
railwayVars.forEach(varName => {
  console.log(`🚂 ${varName}: ${process.env[varName]}`);
});

// Summary
console.log('\n📊 Summary:');
console.log('===========');

if (allRequiredSet) {
  console.log('✅ All required environment variables are set!');
  console.log('🚀 Your Railway deployment should work correctly.');
} else {
  console.log('❌ Some required environment variables are missing!');
  console.log('🔧 Please add the missing variables in your Railway dashboard.');
  console.log('📖 See RAILWAY_ENV_SETUP.md for detailed instructions.');
}

// MongoDB URI validation
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  if (mongoUri.includes('mongodb+srv://') && mongoUri.includes('@cluster0.hlovctz.mongodb.net/')) {
    console.log('✅ MongoDB URI format looks correct');
  } else {
    console.log('⚠️  MongoDB URI format might be incorrect - check the connection string');
  }
}

console.log('\n🔗 Next Steps:');
console.log('==============');
if (allRequiredSet) {
  console.log('1. ✅ Environment variables are set correctly');
  console.log('2. 🚀 Railway should automatically redeploy');
  console.log('3. 🔍 Check Railway logs for deployment status');
  console.log('4. 🌐 Test your API: https://project-production-3188.up.railway.app/health');
} else {
  console.log('1. 🔧 Add missing environment variables in Railway dashboard');
  console.log('2. 📖 Follow the setup guide in RAILWAY_ENV_SETUP.md');
  console.log('3. 🔄 Wait for Railway to redeploy');
  console.log('4. 🔍 Check logs for any remaining issues');
} 