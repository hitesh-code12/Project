#!/usr/bin/env node

// Simple script to check environment variables
console.log('🔍 Checking Environment Variables...');
console.log('=====================================');

const envVars = [
  'NODE_ENV',
  'MONGODB_URI',
  'MONGODB_URI_PROD',
  'MONGODB_URL',
  'DATABASE_URL',
  'JWT_SECRET',
  'PORT'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    const displayValue = varName.includes('MONGODB') || varName.includes('JWT') 
      ? value.substring(0, 20) + '...' 
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

console.log('\n🔍 All Environment Variables:');
console.log('=============================');
Object.keys(process.env).forEach(key => {
  if (key.includes('MONGODB') || key.includes('JWT') || key.includes('SECRET')) {
    console.log(`🔒 ${key}: [HIDDEN]`);
  } else {
    console.log(`📝 ${key}: ${process.env[key]}`);
  }
});

// Check if we have a MongoDB URI
const mongoUri = process.env.MONGODB_URI || 
                 process.env.MONGODB_URI_PROD || 
                 process.env.MONGODB_URL ||
                 process.env.DATABASE_URL;

if (mongoUri) {
  console.log('\n✅ MongoDB URI found!');
} else {
  console.log('\n❌ No MongoDB URI found!');
  console.log('Please set one of these environment variables:');
  console.log('- MONGODB_URI');
  console.log('- MONGODB_URI_PROD');
  console.log('- MONGODB_URL');
  console.log('- DATABASE_URL');
} 