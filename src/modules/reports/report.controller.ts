import { Request, Response, NextFunction } from 'express';
import { reportService } from './report.service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class ReportController {
  getSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');

      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
      const end = endDate ? new Date(endDate as string) : new Date();

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format' });
      }

      const summary = await reportService.getSalesSummary(companyId, start, end);
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  getTopProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');

      const { limit } = req.query;
      const topProducts = await reportService.getTopProducts(companyId, limit ? parseInt(limit as string) : 5);
      res.json({ success: true, data: topProducts });
    } catch (error) {
      next(error);
    }
  }

  getTrends = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const { days } = req.query;
      const trends = await reportService.getSalesTrends(companyId, days ? parseInt(days as string) : 7);
      res.json({ success: true, data: trends });
    } catch (error) {
      next(error);
    }
  }

  getCategoryPerformance = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const performance = await reportService.getCategoryPerformance(companyId);
      res.json({ success: true, data: performance });
    } catch (error) {
      next(error);
    }
  }
}


export const reportController = new ReportController();
