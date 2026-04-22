import { Request, Response, NextFunction } from 'express';
import { categoryService } from './category.service';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export class CategoryController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const categories = await categoryService.getAllCategories(companyId);
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const category = await categoryService.getCategoryById(id, companyId);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const data = categorySchema.parse(req.body);
      const category = await categoryService.createCategory(data, companyId);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const data = categorySchema.partial().parse(req.body);
      const category = await categoryService.updateCategory(id, data, companyId);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      await categoryService.deleteCategory(id, companyId);
      res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
