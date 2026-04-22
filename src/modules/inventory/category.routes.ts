import { Router } from 'express';
import { authMiddleware, roleCheck } from '../../middlewares/auth.middleware';
import { categoryController } from './category.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getOne);
router.post('/', roleCheck(['OWNER', 'MANAGER']), categoryController.create);
router.put('/:id', roleCheck(['OWNER', 'MANAGER']), categoryController.update);
router.delete('/:id', roleCheck(['OWNER', 'MANAGER']), categoryController.delete);

export default router;
