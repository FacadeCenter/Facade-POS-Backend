import { Request, Response, NextFunction } from 'express';
import { branchService } from './branch.service';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { z } from 'zod';

const branchSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export class BranchController {
  private formatBranch(branch: any) {
    return {
      ...branch,
      branchId: branch.id, // Align with frontend
    };
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const branches = await branchService.getAllBranches(companyId);
      res.json({ success: true, data: branches.map(this.formatBranch) });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const branch = await branchService.getBranchById(id, companyId);
      res.json({ success: true, data: this.formatBranch(branch) });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const data = branchSchema.parse(req.body);
      const branch = await branchService.createBranch(data, companyId);
      res.status(201).json({ success: true, data: this.formatBranch(branch) });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const data = branchSchema.partial().parse(req.body);
      const branch = await branchService.updateBranch(id, data, companyId);
      res.json({ success: true, data: this.formatBranch(branch) });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      await branchService.deleteBranch(id, companyId);
      res.json({ success: true, message: 'Branch deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const branchController = new BranchController();
