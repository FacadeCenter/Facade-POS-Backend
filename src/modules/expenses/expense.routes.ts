import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/db';
import { AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();

const expenseSchema = z.object({
  title: z.string().min(1),
  amount: z.number().min(0),
});

// List all expenses for the tenant
router.get('/', async (req: AuthRequest, res) => {
  const companyId = req.user?.companyId;
  const expenses = await prisma.expense.findMany({
    where: { companyId },
  });
  res.json({ success: true, data: expenses });
});

// Create a new expense for the tenant
router.post('/', async (req: AuthRequest, res) => {
  const parse = expenseSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });
  
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: 'Company ID not found in token' });

  const expense = await prisma.expense.create({ 
    data: { 
      ...parse.data, 
      companyId 
    } 
  });
  res.status(201).json({ success: true, data: expense });
});

export default router;
