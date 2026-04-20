import { Router } from 'express';
import prisma from '../../config/db';
import { AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();

// Sales report (summarized by date) for the tenant
router.get('/sales', async (req: AuthRequest, res) => {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: 'Company ID not found in token' });

  try {
    const sales = await prisma.order.findMany({
      where: {
        branch: {
          companyId: companyId
        }
      },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      }
    });
    res.json(sales);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Expense report for the tenant
router.get('/expenses', async (req: AuthRequest, res) => {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: 'Company ID not found in token' });

  try {
    const expenses = await prisma.expense.findMany({
      where: { companyId: companyId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
