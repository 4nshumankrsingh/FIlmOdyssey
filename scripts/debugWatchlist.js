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

async function debugWatchlist() {
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
    
    // Find all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users`);

    for (const user of users) {
      console.log(`\n👤 User: ${user.username} (${user.email})`);
      console.log(`   Watchlist count: ${user.watchlist?.length || 0}`);
      console.log(`   Liked films count: ${user.likedFilms?.length || 0}`);
      console.log(`   Watched films count: ${user.watchedFilms?.length || 0}`);
      
      // Check watchlist structure
      if (user.watchlist && user.watchlist.length > 0) {
        const firstItem = user.watchlist[0];
        console.log(`   First watchlist item type: ${typeof firstItem}`);
        console.log(`   Is ObjectId: ${mongoose.Types.ObjectId.isValid(firstItem)}`);
        
        if (typeof firstItem === 'object') {
          console.log(`   Has film property: ${!!firstItem.film}`);
          console.log(`   Has addedAt property: ${!!firstItem.addedAt}`);
          console.log(`   Has likedAt property: ${!!firstItem.likedAt}`);
        }
      }
    }

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  }
}

debugWatchlist();