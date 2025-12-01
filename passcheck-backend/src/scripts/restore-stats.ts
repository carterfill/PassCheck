import mongoose from 'mongoose';
import dotenv from 'dotenv';
import VisitorStats from '../models/VisitorStats.model';

dotenv.config();

/**
 * Script to restore visitor stats to 200 users
 * Run: npm run restore-stats
 */
async function restoreStats() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      console.error('Please set MONGODB_URI in .env file');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing stats
    const deleted = await VisitorStats.deleteMany({});
    console.log(`🗑️  Deleted ${deleted.deletedCount} existing documents`);

    // Create new stats with 200 users
    const stats = await VisitorStats.create({
      totalVisits: 200,
      todayVisits: 4,
      lastVisitDate: new Date().toDateString(),
      uniqueVisitors: [],
    });

    console.log('✅ Successfully restored visitor stats:');
    console.log(`   - Total Visits: ${stats.totalVisits}`);
    console.log(`   - Today Visits: ${stats.todayVisits}`);
    console.log(`   - Last Visit Date: ${stats.lastVisitDate}`);
    console.log(`   - Database ID: ${stats._id}`);

    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error restoring stats:', error);
    process.exit(1);
  }
}

restoreStats();
