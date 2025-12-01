import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

export const connectDB = async (): Promise<void> => {
  try {
    if (!MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI not found in environment variables');
      console.warn('⚠️  Visitor stats will not be persisted');
      return;
    }

    const options = {
      // Use new URL parser
      // These options are now default in mongoose 6+
      autoIndex: true, // Build indexes
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    await mongoose.connect(MONGODB_URI, options);

    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.warn('⚠️  App will continue without database');
    // Don't throw error - allow app to run without DB
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
};

// Check if MongoDB is connected
export const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};
