import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive(),
  cost: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative(),
  minStock: z.number().int().nonnegative().optional(),
  categoryId: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export class ProductController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      
      const { search, categoryId } = req.query;
      const filter: any = {};
      if (search) filter.name = { contains: search as string, mode: 'insensitive' };
      if (categoryId) filter.categoryId = categoryId as string;

      const products = await productService.getAllProducts(companyId, filter);
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const product = await productService.getProductById(id, companyId);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const data = productSchema.parse(req.body);
      const product = await productService.createProduct(data, companyId);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const data = productSchema.partial().parse(req.body);
      const product = await productService.updateProduct(id, data, companyId);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      await productService.deleteProduct(id, companyId);
      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
