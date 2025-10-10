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

async function debugWatchlistData() {
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

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    // Find all users with watchlist items
    const users = await User.find({
      'watchlist.0': { $exists: true }
    });
    
    console.log(`📊 Found ${users.length} users with watchlist items`);

    for (const user of users) {
      console.log(`\n👤 User: ${user.username} (${user.email})`);
      console.log(`   Watchlist count: ${user.watchlist?.length || 0}`);
      
      if (user.watchlist && user.watchlist.length > 0) {
        const firstItem = user.watchlist[0];
        console.log(`   First watchlist item:`, JSON.stringify(firstItem, null, 2));
        
        // Check schema type
        if (mongoose.Types.ObjectId.isValid(firstItem)) {
          console.log(`   📋 Schema: OLD (Array of ObjectIds)`);
        } else if (firstItem && typeof firstItem === 'object') {
          if (firstItem.film) {
            console.log(`   📋 Schema: NEW (Array of objects with film property)`);
            console.log(`   🕐 Has addedAt: ${!!firstItem.addedAt}`);
          } else {
            console.log(`   📋 Schema: UNKNOWN (Array of objects without film property)`);
          }
        }
        
        // Show first 3 items
        console.log(`   Sample items (first 3):`);
        user.watchlist.slice(0, 3).forEach((item, index) => {
          if (mongoose.Types.ObjectId.isValid(item)) {
            console.log(`     ${index + 1}. ObjectId: ${item}`);
          } else if (item && typeof item === 'object' && item.film) {
            console.log(`     ${index + 1}. Film ObjectId: ${item.film}, addedAt: ${item.addedAt}`);
          } else {
            console.log(`     ${index + 1}. Unknown: ${JSON.stringify(item)}`);
          }
        });
      }
    }

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  }
}

debugWatchlistData();