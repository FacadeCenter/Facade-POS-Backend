import { Router } from 'express';
import { authMiddleware, roleCheck } from '../../middlewares/auth.middleware';
import { staffController } from './staff.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', roleCheck(['TENANT_ADMIN', 'TENANT_MANAGER']), staffController.getAll);
router.get('/:id', roleCheck(['TENANT_ADMIN', 'TENANT_MANAGER']), staffController.getOne);
router.post('/', roleCheck(['TENANT_ADMIN']), staffController.create);
router.put('/:id', roleCheck(['TENANT_ADMIN']), staffController.update);
router.delete('/:id', roleCheck(['TENANT_ADMIN']), staffController.delete);

export default router;
