import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { orderController } from './order.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', orderController.getAll);
router.get('/stats', orderController.getStats);
router.get('/:id', orderController.getOne);
router.post('/', orderController.create);

export default router;
