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
  private formatOrder = (order: any) => {
    return {
      ...order,
      orderId:        order.id,
      orderStatus:    order.status,
      subTotal:       order.subtotal || 0,
      discountAmount: order.discount || 0,
      tax:            order.tax      || 0,
      serviceCharge:  0, // not in schema yet
      totalAmount:    order.total    || 0,
      cashier:        order.staff    ? { ...order.staff, cashierId: order.staff.id, cashierNo: 'N/A' } : null,
      branch:         order.branch   ? { ...order.branch, branchId: order.branch.id } : null,
      customer:       order.customer ? { ...order.customer, customerId: order.customer.id } : null,
      payments: [
        {
          paymentId:      `p-${order.id}`,
          paymentType:    order.paymentType,
          paymentStatus:  'COMPLETE',
          createdAt:      order.createdAt,
          paymentDetails: [
            {
              paymentDetailsId: `pd-${order.id}`,
              method:           order.paymentType,
              amount:           order.total,
              cashReceived:     order.total,
              changeToGive:     0,
            }
          ]
        }
      ],
      orderItems: (order.items || []).map((it: any) => ({
        ...it,
        orderItemId: it.id,
        productName: it.product?.name || 'Unknown',
        variantName: '',
        sku:         it.product?.sku  || 'N/A',
        unitPrice:   it.unitPrice     || 0,
      }))
    };
  }


  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

  getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

  getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
