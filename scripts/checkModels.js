const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env file
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envFile.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        envVars[key] = value;
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Could not read .env file:', error.message);
    process.exit(1);
  }
}

async function checkModels() {
  try {
    const envVars = loadEnv();
    const MONGODB_URI = envVars.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env file');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if models are registered
    console.log('\n🔍 Checking registered models:');
    console.log('Models in mongoose:', Object.keys(mongoose.models));
    
    // Try to import and check each model
    try {
      const User = require('../src/model/User').default;
      console.log('✅ User model loaded successfully');
    } catch (error) {
      console.log('❌ User model failed:', error.message);
    }

    try {
      const Film = require('../src/model/Film').default;
      console.log('✅ Film model loaded successfully');
    } catch (error) {
      console.log('❌ Film model failed:', error.message);
    }

    try {
      const Review = require('../src/model/Review').default;
      console.log('✅ Review model loaded successfully');
    } catch (error) {
      console.log('❌ Review model failed:', error.message);
    }

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
}

checkModels();