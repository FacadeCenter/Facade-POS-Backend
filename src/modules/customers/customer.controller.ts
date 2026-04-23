import { Request, Response, NextFunction } from 'express';
import { customerService } from './customer.service';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export class CustomerController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const customers = await customerService.getAllCustomers(companyId);
      res.json({ success: true, data: customers });
    } catch (error) {
      next(error);
    }
  }

  async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId;
      const query = req.query.q as string;
      if (!companyId) throw new Error('Unauthorized');
      const customers = await customerService.searchCustomers(companyId, query);
      res.json({ success: true, data: customers });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const customer = await customerService.getCustomerById(id, companyId);
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const data = customerSchema.parse(req.body);
      const customer = await customerService.createCustomer(data, companyId);
      res.status(201).json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const data = customerSchema.partial().parse(req.body);
      const customer = await customerService.updateCustomer(id, data, companyId);
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      await customerService.deleteCustomer(id, companyId);
      res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const stats = await customerService.getCustomerStats(companyId);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}

export const customerController = new CustomerController();
