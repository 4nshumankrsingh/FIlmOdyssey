import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IUser extends Document { 
    _id: Types.ObjectId;
    username: string;
    email: string;
    password: string;
    isVerified: boolean;
    refreshToken?: string;
    bio?: string;
    location?: string;
    profileImage?: string;
    favoriteFilms: Array<{
        filmId: string;
        position: number;
        title: string;
        posterPath: string;
    }>;
    watchlist: Array<{
        film: Types.ObjectId;
        addedAt: Date;
    }>;
    watchedFilms: Array<{
        film: Types.ObjectId;
        watchedAt: Date;
        isRewatch: boolean;
    }>;
    likedFilms: Array<{
        film: Types.ObjectId;
        likedAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
} 

export interface IUserPublic {
    _id: string;
    username: string;
    email: string;
    isVerified: boolean;
    bio?: string;
    location?: string;
    profileImage?: string;
    favoriteFilms?: Array<{
        filmId: string;
        position: number;
        title: string;
        posterPath: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

interface UserModel extends Model<IUser> {
    findByEmail(email: string): Promise<IUser | null>;
    findByUsername(username: string): Promise<IUser | null>;
}

const UserSchema: Schema<IUser> = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        minlength: [4, "Username must be at least 4 characters"],
        maxlength: [15, "Username must be no more than 15 characters"],
        match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please use a valid email address']
    }, 
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"]
    },
    isVerified: {
        type: Boolean,
        default: true,
    },
    refreshToken: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    profileImage: {
        type: String,
        default: ""
    },
    favoriteFilms: [{
        filmId: {
            type: String,
            required: true,
            trim: true
        },
        position: {
            type: Number,
            required: true,
            min: 0,
            max: 3
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        posterPath: {
            type: String,
            default: "",
            trim: true
        }
    }],
    watchlist: [{
        film: {
            type: Schema.Types.ObjectId,
            ref: "Film",
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    watchedFilms: [{
        film: {
            type: Schema.Types.ObjectId,
            ref: "Film",
            required: true
        },
        watchedAt: {
            type: Date,
            default: Date.now
        },
        isRewatch: {
            type: Boolean,
            default: false
        }
    }],
    likedFilms: [{
        film: {
            type: Schema.Types.ObjectId,
            ref: "Film",
            required: true
        },
        likedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    strict: true
});

// Static method to find user by email
UserSchema.statics.findByEmail = async function(this: Model<IUser>, email: string): Promise<IUser | null> {
    return this.findOne({ email: email.toLowerCase() });
};

// Static method to find user by username
UserSchema.statics.findByUsername = async function(this: Model<IUser>, username: string): Promise<IUser | null> {
    return this.findOne({ username: username });
};

// Method to get public user data
UserSchema.methods.toPublicJSON = function(this: IUser): IUserPublic {
    const userObject = this.toObject();
    const { password, refreshToken, ...publicUser } = userObject;
    return publicUser as IUserPublic;
};

// Add a pre-save middleware to clean favoriteFilms data
UserSchema.pre('save', function(next) {
    if (this.favoriteFilms && Array.isArray(this.favoriteFilms)) {
        this.favoriteFilms = this.favoriteFilms.map((film: any) => {
            if (film && typeof film === 'object') {
                return {
                    filmId: String(film.filmId || '').trim(),
                    position: Number(film.position) || 0,
                    title: String(film.title || '').trim(),
                    posterPath: String(film.posterPath || '').trim()
                };
            }
            return film;
        }).filter((film: any) => film.filmId && film.filmId.trim() !== '');
    }
    next();
});

// Add a pre-update middleware with proper typing
UserSchema.pre('findOneAndUpdate', function(next) {
    const update: any = this.getUpdate();
    if (update && update.favoriteFilms && Array.isArray(update.favoriteFilms)) {
        update.favoriteFilms = update.favoriteFilms.map((film: any) => {
            if (film && typeof film === 'object') {
                return {
                    filmId: String(film.filmId || '').trim(),
                    position: Number(film.position) || 0,
                    title: String(film.title || '').trim(),
                    posterPath: String(film.posterPath || '').trim()
                };
            }
            return film;
        }).filter((film: any) => film.filmId && film.filmId.trim() !== '');
    }
    next();
});

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ 'watchlist.film': 1 });
UserSchema.index({ 'watchedFilms.film': 1 });
UserSchema.index({ 'favoriteFilms.position': 1 });
UserSchema.index({ 'likedFilms.film': 1 });
UserSchema.index({ 'watchlist.addedAt': -1 });
UserSchema.index({ 'likedFilms.likedAt': -1 });
UserSchema.index({ 'watchedFilms.watchedAt': -1 });

const User = (mongoose.models.User as UserModel) || mongoose.model<IUser, UserModel>("User", UserSchema);

export default User;