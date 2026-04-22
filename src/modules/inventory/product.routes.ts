import { Router } from 'express';
import { authMiddleware, roleCheck } from '../../middlewares/auth.middleware';
import { productController } from './product.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', productController.getAll);
router.get('/:id', productController.getOne);
router.post('/', roleCheck(['OWNER', 'MANAGER']), productController.create);
router.put('/:id', roleCheck(['OWNER', 'MANAGER']), productController.update);
router.delete('/:id', roleCheck(['OWNER', 'MANAGER']), productController.delete);

export default router;
