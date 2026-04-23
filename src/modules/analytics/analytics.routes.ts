import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/stats', analyticsController.getStats);
router.get('/sales-line', analyticsController.getSalesTrends);
router.get('/sales-bar', analyticsController.getSalesBar);
router.get('/top-selling', analyticsController.getTopSelling);
router.get('/staff-performance', analyticsController.getStaffPerformance);

export default router;
