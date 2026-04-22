import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { branchController } from './branch.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', branchController.getAll);
router.get('/:id', branchController.getOne);
router.post('/', branchController.create);
router.put('/:id', branchController.update);
router.delete('/:id', branchController.delete);

export default router;
