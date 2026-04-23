import { Response, NextFunction } from 'express';
import { staffService } from './staff.service';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { z } from 'zod';

const staffSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['TENANT_ADMIN', 'TENANT_MANAGER', 'TENANT_CASHIER']),
  branchId: z.string().optional(),
  password: z.string().min(6).optional(),
});

export class StaffController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const staff = await staffService.getAllStaff(companyId);
      res.json({ success: true, data: staff });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const staff = await staffService.getStaffById(id, companyId);
      res.json({ success: true, data: staff });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const data = staffSchema.parse(req.body);
      const staff = await staffService.createStaff(data, companyId);
      res.status(201).json({ success: true, data: staff });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const data = staffSchema.partial().parse(req.body);
      const staff = await staffService.updateStaff(id, data, companyId);
      res.json({ success: true, data: staff });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      await staffService.deleteStaff(id, companyId);
      res.json({ success: true, message: 'Staff deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const staffController = new StaffController();
