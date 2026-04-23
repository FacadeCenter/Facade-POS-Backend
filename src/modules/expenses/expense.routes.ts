import { Router } from 'express';
import { expenseController } from './expense.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { ExpenseCategory } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

// List all expense categories
router.get('/categories/all', async (req, res) => {
  const categories = Object.values(ExpenseCategory).map(cat => ({
    categoryId: cat,
    category: cat.charAt(0) + cat.slice(1).toLowerCase()
  }));
  res.json({ success: true, data: categories });
});

router.get('/stats', expenseController.getStats);
router.get('/', expenseController.getAll);
router.post('/', expenseController.create);
router.delete('/:id', expenseController.delete);

export default router;
