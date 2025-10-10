import mongoose, { ConnectOptions } from "mongoose";

// Create a proper type for the cached connection
type CachedConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Extend the global type properly
declare global {
  var mongoose: CachedConnection | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

// Initialize cached with proper type handling
let cached: CachedConnection = (global.mongoose as CachedConnection) || {
  conn: null,
  promise: null,
};

// Ensure global.mongoose is set
if (!global.mongoose) {
  global.mongoose = cached;
}

export const connectMongoDB = async (): Promise<typeof mongoose> => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ Connected to MongoDB");
    
    // Load models after connection is established
    try {
      // Use dynamic import to avoid circular dependencies
      const { loadModels } = await import('./modelLoader');
      loadModels();
    } catch (error) {
      console.warn('⚠️ Could not load models automatically:', error);
    }
    
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error("❌ Error connecting to MongoDB: ", error);
    throw error;
  }
};