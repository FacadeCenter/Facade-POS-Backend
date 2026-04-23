import prisma from '../../config/db';
import { AppError } from '../../middlewares/error.middleware';

export class ExpenseService {
  async getAllExpenses(companyId: string) {
    return prisma.expense.findMany({
      where: { companyId },
      orderBy: { date: 'desc' }
    });
  }

  async getExpenseById(id: string, companyId: string) {
    const expense = await prisma.expense.findUnique({
      where: { id }
    });
    if (!expense || expense.companyId !== companyId) {
      throw new AppError('Expense not found', 404);
    }
    return expense;
  }

  async createExpense(data: any, companyId: string) {
    return prisma.expense.create({
      data: { ...data, companyId }
    });
  }

  async updateExpense(id: string, data: any, companyId: string) {
    await this.getExpenseById(id, companyId);
    return prisma.expense.update({
      where: { id },
      data
    });
  }

  async deleteExpense(id: string, companyId: string) {
    await this.getExpenseById(id, companyId);
    return prisma.expense.delete({
      where: { id }
    });
  }

  async getExpenseStats(companyId: string) {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const [total, thisMonth] = await Promise.all([
          prisma.expense.aggregate({
              where: { companyId },
              _sum: { amount: true }
          }),
          prisma.expense.aggregate({
              where: { companyId, date: { gte: firstDayOfMonth } },
              _sum: { amount: true }
          })
      ]);

      return {
          total: total._sum.amount || 0,
          thisMonth: thisMonth._sum.amount || 0,
          categoryBreakdown: await prisma.expense.groupBy({
              by: ['category'],
              where: { companyId },
              _sum: { amount: true }
          })
      };
  }
}

export const expenseService = new ExpenseService();
