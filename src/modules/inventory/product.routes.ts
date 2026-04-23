import { Router } from 'express';
import { authMiddleware, roleCheck } from '../../middlewares/auth.middleware';
import { productController } from './product.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', productController.getAll);
router.get('/:id', productController.getOne);
router.post('/', roleCheck(['TENANT_ADMIN', 'TENANT_MANAGER']), productController.create);
router.put('/:id', roleCheck(['TENANT_ADMIN', 'TENANT_MANAGER']), productController.update);
router.delete('/:id', roleCheck(['TENANT_ADMIN', 'TENANT_MANAGER']), productController.delete);

export default router;
