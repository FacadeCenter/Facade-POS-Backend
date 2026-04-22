import { Router } from 'express';
import { authMiddleware, roleCheck } from '../../middlewares/auth.middleware';
import { reportController } from './report.controller';

const router = Router();

router.use(authMiddleware);
router.use(roleCheck(['OWNER', 'MANAGER']));

router.get('/summary', reportController.getSummary);
router.get('/top-products', reportController.getTopProducts);

export default router;
