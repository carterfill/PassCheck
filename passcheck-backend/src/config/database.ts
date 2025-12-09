import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

export const connectDB = async (): Promise<void> => {
  try {
    if (!MONGODB_URI || MONGODB_URI.trim() === '') {
      console.warn('MONGODB_URI not found in environment variables');
      console.warn('Visitor stats will not be persisted');
      console.warn('Logging and tracking features will be limited');
      // Log this as a security/operational concern
      if (process.env.NODE_ENV === 'production') {
        console.error('WARNING: Running in production without database connection!');
        console.error('This limits abuse tracking and logging capabilities');
      }
      return;
    }

    // Validate MongoDB URI format
    if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
      console.error('Invalid MongoDB URI format');
      throw new Error('Invalid MongoDB URI format');
    }

    const options = {
      // Use new URL parser
      // These options are now default in mongoose 6+
      autoIndex: true, // Build indexes
      serverSelectionTimeoutMS: 10000, // Increased to 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Connection timeout
      maxPoolSize: 10, // Maximum number of connections
      minPoolSize: 2, // Minimum number of connections
      retryWrites: true, // Retry writes on network errors
    };

    await mongoose.connect(MONGODB_URI, options);

    console.log('MongoDB connected successfully');
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}:${mongoose.connection.port}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
      // Log error details but don't expose to client
      if (process.env.NODE_ENV === 'development') {
        console.error('Full error:', err);
      }
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      console.warn('Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    mongoose.connection.on('connecting', () => {
      console.log('Connecting to MongoDB...');
    });

  } catch (error: any) {
    console.error('MongoDB connection failed');
    console.error('Error message:', error.message);
    
    // Log full error only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }
    
    console.warn('App will continue without database');
    console.warn('Visitor stats and logging will be limited');
    
    // In production, log this as a critical issue but don't crash
    if (process.env.NODE_ENV === 'production') {
      console.error('CRITICAL: Database connection failed in production!');
      console.error('This significantly impacts monitoring and abuse detection');
    }
    
    // Don't throw error - allow app to run without DB for graceful degradation
    // But log it properly for monitoring
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

// Check if MongoDB is connected
export const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};
