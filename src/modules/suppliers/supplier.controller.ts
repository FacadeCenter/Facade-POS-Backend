import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import prisma from '../../config/db';

export class SupplierController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) return res.status(400).json({ error: 'Company ID not found' });

      const suppliers = await prisma.supplier.findMany({
        where: { companyId },
        orderBy: { name: 'asc' },
      });

      res.json({ success: true, data: suppliers });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;

      const supplier = await prisma.supplier.findFirst({
        where: { id, companyId },
      });

      if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

      res.json({ success: true, data: supplier });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) return res.status(400).json({ error: 'Company ID not found' });

      const supplier = await prisma.supplier.create({
        data: {
          ...req.body,
          companyId,
        },
      });

      res.status(201).json({ success: true, data: supplier });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;

      const supplier = await prisma.supplier.updateMany({
        where: { id, companyId },
        data: req.body,
      });

      if (supplier.count === 0) return res.status(404).json({ error: 'Supplier not found' });

      const updated = await prisma.supplier.findUnique({ where: { id } });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;

      const supplier = await prisma.supplier.deleteMany({
        where: { id, companyId },
      });

      if (supplier.count === 0) return res.status(404).json({ error: 'Supplier not found' });

      res.json({ success: true, message: 'Supplier deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const supplierController = new SupplierController();
