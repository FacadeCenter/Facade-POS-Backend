import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { customerController } from './customer.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', customerController.getAll);
router.get('/:id', customerController.getOne);
router.post('/', customerController.create);
router.put('/:id', customerController.update);
router.delete('/:id', customerController.delete);

export default router;
