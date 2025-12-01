import { Request, Response } from 'express';
import { VisitorService } from '../services/visitor.service';

// Track a new visitor
export const trackVisitor = async (req: Request, res: Response) => {
  try {
    const { visitorId } = req.body;
    
    if (!visitorId || typeof visitorId !== 'string') {
      return res.status(400).json({
        error: 'Visitor ID is required'
      });
    }

    const result = await VisitorService.trackVisitor(visitorId);

    res.json({
      success: true,
      isNewVisitor: result.isNewVisitor,
      stats: {
        totalVisits: result.totalVisits,
        todayVisits: result.todayVisits
      },
      savedToDatabase: result.savedToDb
    });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    res.status(500).json({
      error: 'Failed to track visitor'
    });
  }
};

// Get current visitor stats
export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await VisitorService.getStats();

    res.json({
      totalVisits: stats.totalVisits,
      todayVisits: stats.todayVisits,
      uniqueVisitors: stats.uniqueVisitorsCount,
      lastVisitDate: stats.lastVisitDate,
      usingDatabase: stats.usingDatabase
    });
  } catch (error) {
    console.error('Error getting visitor stats:', error);
    res.status(500).json({
      error: 'Failed to get visitor stats'
    });
  }
};
