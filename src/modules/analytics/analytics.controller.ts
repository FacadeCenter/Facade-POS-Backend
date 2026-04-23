import { Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class AnalyticsController {
  getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const stats = await analyticsService.getDashboardStats(companyId);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  getSalesTrends = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const trends = await analyticsService.getSalesTrends(companyId);
      res.json({ success: true, data: trends });
    } catch (error) {
      next(error);
    }
  }

  getSalesBar = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const barData = await analyticsService.getSalesBar(companyId);
      res.json({ success: true, data: barData });
    } catch (error) {
      next(error);
    }
  }

  getTopSelling = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const topSelling = await analyticsService.getTopSelling(companyId);
      res.json({ success: true, data: topSelling });
    } catch (error) {
      next(error);
    }
  }

  getStaffPerformance = async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
          const companyId = req.user?.companyId;
          if (!companyId) throw new Error('Unauthorized');
          const performance = await analyticsService.getStaffPerformance(companyId);
          res.json({ success: true, data: performance });
      } catch (error) {
          next(error);
      }
  }
}


export const analyticsController = new AnalyticsController();
