import { Router } from 'express';
import { supplierController } from './supplier.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', supplierController.getAll);
router.get('/:id', supplierController.getById);
router.post('/', supplierController.create);
router.patch('/:id', supplierController.update);
router.delete('/:id', supplierController.delete);

export default router;
