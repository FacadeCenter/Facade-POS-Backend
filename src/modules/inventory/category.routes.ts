import { Router } from 'express';
import { authMiddleware, roleCheck } from '../../middlewares/auth.middleware';
import { categoryController } from './category.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getOne);
router.post('/', roleCheck(['TENANT_ADMIN', 'TENANT_MANAGER']), categoryController.create);
router.put('/:id', roleCheck(['TENANT_ADMIN', 'TENANT_MANAGER']), categoryController.update);
router.delete('/:id', roleCheck(['TENANT_ADMIN', 'TENANT_MANAGER']), categoryController.delete);

export default router;
