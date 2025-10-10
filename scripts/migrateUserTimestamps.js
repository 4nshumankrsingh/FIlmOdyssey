const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env file from root directory
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
        
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        
        envVars[key] = value;
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Could not read .env file:', error.message);
    process.exit(1);
  }
}

async function migrateUserTimestamps() {
  try {
    // Load environment variables
    const envVars = loadEnv();
    const MONGODB_URI = envVars.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env file');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Use the existing User model with strict: false to handle schema changes
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false, timestamps: true }));
    
    // Find all users that have likedFilms or watchlist
    const users = await User.find({
      $or: [
        { 'likedFilms.0': { $exists: true } },
        { 'watchlist.0': { $exists: true } }
      ]
    });

    console.log(`📊 Found ${users.length} users to migrate...`);

    let updatedCount = 0;
    let totalLikedFilms = 0;
    let totalWatchlistItems = 0;

    for (const user of users) {
      let needsUpdate = false;
      const updates = {};

      // Helper function to check if it's an ObjectId array
      const isObjectIdArray = (arr) => {
        if (!arr || !Array.isArray(arr) || arr.length === 0) return false;
        const firstItem = arr[0];
        return mongoose.Types.ObjectId.isValid(firstItem);
      };

      // Migrate likedFilms from ObjectId array to object array with timestamps
      if (isObjectIdArray(user.likedFilms)) {
        updates.likedFilms = user.likedFilms.map(filmId => ({
          film: filmId,
          likedAt: user.updatedAt || user.createdAt || new Date()
        }));
        needsUpdate = true;
        totalLikedFilms += user.likedFilms.length;
        console.log(`🔄 Migrating ${user.likedFilms.length} liked films for ${user.username}`);
      }

      // Migrate watchlist from ObjectId array to object array with timestamps
      if (isObjectIdArray(user.watchlist)) {
        updates.watchlist = user.watchlist.map(filmId => ({
          film: filmId,
          addedAt: user.updatedAt || user.createdAt || new Date()
        }));
        needsUpdate = true;
        totalWatchlistItems += user.watchlist.length;
        console.log(`🔄 Migrating ${user.watchlist.length} watchlist items for ${user.username}`);
      }

      if (needsUpdate) {
        await User.updateOne({ _id: user._id }, { $set: updates });
        updatedCount++;
        console.log(`✅ Updated user: ${user.username}`);
      }
    }

    console.log('\n🎉 Migration Summary:');
    console.log(`📝 Updated ${updatedCount} users`);
    console.log(`❤️  Migrated ${totalLikedFilms} liked films`);
    console.log(`⭐ Migrated ${totalWatchlistItems} watchlist items`);
    
    if (updatedCount === 0) {
      console.log('\n💡 No users needed migration. Your data might already be in the correct format.');
    }
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle cleanup
process.on('SIGINT', async () => {
  console.log('\n🛑 Migration interrupted by user');
  await mongoose.disconnect();
  process.exit(0);
});

migrateUserTimestamps();