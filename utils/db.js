import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB(retries = 5) {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
    };

    async function tryConnect(retriesLeft) {
      try {
        const mongoose = await import('mongoose');

        // Remove any existing listeners
        mongoose.connection.removeAllListeners();

        // Set max listeners to prevent warnings
        mongoose.connection.setMaxListeners(15);
        process.setMaxListeners(15);

        // Add event listeners for connection status
        mongoose.connection.on('connected', () => {
          console.log('MongoDB connection established');
        });

        mongoose.connection.on('error', err => {
          console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
          console.log('MongoDB connection disconnected');
        });

        // Handle process termination
        process.once('SIGINT', async () => {
          await mongoose.connection.close();
          process.exit(0);
        });

        const connection = await mongoose.connect(MONGODB_URI, opts);
        console.log('MongoDB connected successfully');
        return connection;
      } catch (error) {
        if (retriesLeft > 0) {
          console.log(`MongoDB connection failed, retrying... (${retriesLeft} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
          return tryConnect(retriesLeft - 1);
        }
        throw error;
      }
    }

    cached.promise = tryConnect(retries);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB:', e);
    throw new Error('Unable to connect to database');
  }

  return cached.conn;
}

export default connectDB;
