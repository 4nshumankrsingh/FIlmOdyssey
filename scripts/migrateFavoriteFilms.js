const mongoose = require('mongoose');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
    favoriteFilms: [String]
}, { strict: false });

const User = mongoose.model('User', UserSchema);

async function migrateFavoriteFilms() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ favoriteFilms: { $exists: true } });
        console.log(`Found ${users.length} users to migrate`);

        for (const user of users) {
            const newFavoriteFilms = [];
            
            if (user.favoriteFilms && Array.isArray(user.favoriteFilms)) {
                user.favoriteFilms.forEach((filmId, index) => {
                    if (filmId && filmId !== '' && index < 4) {
                        newFavoriteFilms.push({
                            filmId: filmId,
                            position: index,
                            title: 'Unknown Film', // This will be updated when fetched
                            posterPath: ''
                        });
                    }
                });
            }

            await User.updateOne(
                { _id: user._id },
                { 
                    $set: { 
                        favoriteFilms: newFavoriteFilms 
                    } 
                }
            );
            console.log(`Migrated user: ${user.username}`);
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateFavoriteFilms();