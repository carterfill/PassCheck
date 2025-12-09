import VisitorStats, { IVisitorStats } from '../models/VisitorStats.model';
import { isConnected } from '../config/database';

interface VisitorStatsData {
  totalVisits: number;
  todayVisits: number;
  lastVisitDate: string;
  uniqueVisitors: Set<string>;
}

// In-memory fallback if MongoDB is not connected
let inMemoryStats: VisitorStatsData = {
  totalVisits: 0,
  todayVisits: 0,
  lastVisitDate: new Date().toDateString(),
  uniqueVisitors: new Set(),
};

export class VisitorService {
  /**
   * Get or create visitor stats document
   * We use a singleton pattern with a fixed ID
   */
  private static async getStatsDocument(): Promise<IVisitorStats | null> {
    if (!isConnected()) {
      return null;
    }

    try {
      // Try to find existing stats document
      let stats = await VisitorStats.findOne();

      // If no document exists, create one with initial values
      if (!stats) {
        stats = await VisitorStats.create({
          totalVisits: 0,
          todayVisits: 0,
          lastVisitDate: new Date().toDateString(),
          uniqueVisitors: [],
        });
      }

      return stats;
    } catch (error) {
      console.error('Error getting stats document:', error);
      return null;
    }
  }

  /**
   * Load visitor statistics
   */
  static async loadStats(): Promise<VisitorStatsData> {
    const stats = await this.getStatsDocument();

    if (!stats) {
      // Return in-memory stats if DB not available
      return inMemoryStats;
    }

    return {
      totalVisits: stats.totalVisits,
      todayVisits: stats.todayVisits,
      lastVisitDate: stats.lastVisitDate,
      uniqueVisitors: new Set(stats.uniqueVisitors),
    };
  }

  /**
   * Save visitor statistics
   */
  static async saveStats(stats: VisitorStatsData): Promise<boolean> {
    const doc = await this.getStatsDocument();

    if (!doc) {
      // Save to in-memory if DB not available
      inMemoryStats = { ...stats };
      return false;
    }

    try {
      doc.totalVisits = stats.totalVisits;
      doc.todayVisits = stats.todayVisits;
      doc.lastVisitDate = stats.lastVisitDate;
      doc.uniqueVisitors = Array.from(stats.uniqueVisitors);
      
      await doc.save();
      return true;
    } catch (error) {
      console.error('Error saving stats:', error);
      // Fallback to in-memory
      inMemoryStats = { ...stats };
      return false;
    }
  }

  /**
   * Track a new visitor
   */
  static async trackVisitor(visitorId: string): Promise<{
    isNewVisitor: boolean;
    totalVisits: number;
    todayVisits: number;
    savedToDb: boolean;
  }> {
    const stats = await this.loadStats();
    const today = new Date().toDateString();

    // Reset today's visits if it's a new day
    if (stats.lastVisitDate !== today) {
      stats.todayVisits = 0;
      stats.lastVisitDate = today;
    }

    // Check if this is a new visitor
    const isNewVisitor = !stats.uniqueVisitors.has(visitorId);

    if (isNewVisitor) {
      stats.uniqueVisitors.add(visitorId);
      stats.totalVisits += 1;
      stats.todayVisits += 1;

      const savedToDb = await this.saveStats(stats);

      return {
        isNewVisitor: true,
        totalVisits: stats.totalVisits,
        todayVisits: stats.todayVisits,
        savedToDb,
      };
    }

    return {
      isNewVisitor: false,
      totalVisits: stats.totalVisits,
      todayVisits: stats.todayVisits,
      savedToDb: isConnected(),
    };
  }

  /**
   * Get current statistics
   */
  static async getStats(): Promise<{
    totalVisits: number;
    todayVisits: number;
    lastVisitDate: string;
    uniqueVisitorsCount: number;
    usingDatabase: boolean;
  }> {
    const stats = await this.loadStats();

    return {
      totalVisits: stats.totalVisits,
      todayVisits: stats.todayVisits,
      lastVisitDate: stats.lastVisitDate,
      uniqueVisitorsCount: stats.uniqueVisitors.size,
      usingDatabase: isConnected(),
    };
  }

  /**
   * Reset statistics (for testing/admin purposes)
   */
  static async resetStats(): Promise<boolean> {
    const doc = await this.getStatsDocument();

    if (!doc) {
      // Reset in-memory stats
      inMemoryStats = {
        totalVisits: 0,
        todayVisits: 0,
        lastVisitDate: new Date().toDateString(),
        uniqueVisitors: new Set(),
      };
      return false;
    }

    try {
      doc.totalVisits = 0;
      doc.todayVisits = 0;
      doc.lastVisitDate = new Date().toDateString();
      doc.uniqueVisitors = [];
      await doc.save();
      return true;
    } catch (error) {
      console.error('Error resetting stats:', error);
      return false;
    }
  }
}
