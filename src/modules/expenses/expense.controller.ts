import { Response, NextFunction } from 'express';
import { expenseService } from './expense.service';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { z } from 'zod';
import { ExpenseCategory } from '@prisma/client';

const expenseSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  category: z.nativeEnum(ExpenseCategory).optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
});

export class ExpenseController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const expenses = await expenseService.getAllExpenses(companyId);
      res.json({ success: true, data: expenses });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const data = expenseSchema.parse(req.body);
      const expense = await expenseService.createExpense(data, companyId);
      res.status(201).json({ success: true, data: expense });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
      try {
          const companyId = req.user?.companyId;
          if (!companyId) throw new Error('Unauthorized');
          const stats = await expenseService.getExpenseStats(companyId);
          res.json({ success: true, data: stats });
      } catch (error) {
          next(error);
      }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
      try {
          const { id } = req.params;
          const companyId = req.user?.companyId;
          if (!companyId) throw new Error('Unauthorized');
          await expenseService.deleteExpense(id, companyId);
          res.json({ success: true, message: 'Expense deleted' });
      } catch (error) {
          next(error);
      }
  }
}

export const expenseController = new ExpenseController();
