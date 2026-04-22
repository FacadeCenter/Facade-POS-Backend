import { Router } from 'express';
import { authMiddleware, roleCheck } from '../../middlewares/auth.middleware';
import { staffController } from './staff.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', roleCheck(['OWNER', 'MANAGER']), staffController.getAll);
router.get('/:id', roleCheck(['OWNER', 'MANAGER']), staffController.getOne);
router.post('/', roleCheck(['OWNER']), staffController.create);
router.put('/:id', roleCheck(['OWNER']), staffController.update);
router.delete('/:id', roleCheck(['OWNER']), staffController.delete);

export default router;
