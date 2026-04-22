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
  private formatOrder(order: any) {
    return {
      ...order,
      orderId: order.id,
      totalAmount: order.total,
      orderStatus: order.status,
      cashier: order.staff,
      payments: [
        {
          paymentType: order.paymentType,
          amount: order.total,
          createdAt: order.createdAt,
          paymentDetails: [
            {
              cashReceived: order.total,
              changeToGive: 0,
            }
          ]
        }
      ],
      orderItems: (order.items || []).map((it: any) => ({
        ...it,
        productName: it.product?.name || 'Unknown',
        variantName: '',
      }))
    };
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId;
      const branchId = req.query.branchId as string;
      if (!companyId) throw new Error('Unauthorized');
      
      const orders = await orderService.getAllOrders(companyId, branchId);
      res.json({ success: true, data: orders.map(this.formatOrder) });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId;
      const branchId = req.query.branchId as string;
      if (!companyId) throw new Error('Unauthorized');

      const stats = await orderService.getStats(companyId, branchId);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;
      if (!companyId) throw new Error('Unauthorized');
      const order = await orderService.getOrderById(id, companyId);
      res.json({ success: true, data: this.formatOrder(order) });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const branchId = req.user?.branchId || req.body.branchId;
      const staffId = req.user?.id;
      if (!branchId || !staffId) throw new Error('Unauthorized or Branch ID missing');

      const data = orderSchema.parse(req.body);
      const order = await orderService.createOrder(data, branchId, staffId);
      res.status(201).json({ success: true, data: this.formatOrder(order) });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
