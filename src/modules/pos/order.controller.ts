import { Request, Response, NextFunction } from 'express';
import { orderService } from './order.service';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { z } from 'zod';

const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

const orderSchema = z.object({
  customerId: z.string().optional(),
  paymentType: z.enum(['CASH', 'CARD']),
  items: z.array(orderItemSchema).min(1),
  discount: z.number().nonnegative().optional(),
  tax: z.number().nonnegative().optional(),
  note: z.string().optional(),
});

export class OrderController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const branchId = req.user?.branchId;
      if (!branchId) throw new Error('Branch ID required');
      const orders = await orderService.getAllOrders(branchId);
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const branchId = req.user?.branchId;
      if (!branchId) throw new Error('Branch ID required');
      const order = await orderService.getOrderById(id, branchId);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const branchId = req.user?.branchId;
      const staffId = req.user?.id;
      if (!branchId || !staffId) throw new Error('Unauthorized or Branch ID missing');

      const data = orderSchema.parse(req.body);
      const order = await orderService.createOrder(data, branchId, staffId);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
