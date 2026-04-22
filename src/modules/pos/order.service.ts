import prisma from '../../config/db';
import { orderRepository } from './order.repository';
import { AppError } from '../../middlewares/error.middleware';

export class OrderService {
  async getAllOrders(companyId: string, branchId?: string) {
    if (branchId) {
      return orderRepository.findByBranch(branchId);
    }
    return orderRepository.findByCompany(companyId);
  }

  async getStats(companyId: string, branchId?: string) {
    const where: any = branchId ? { branchId } : { branch: { companyId } };
    
    // Simplistic stats calculation for demonstration
    // In production, this would be a more complex aggregation query
    const orders = await prisma.order.findMany({
      where,
      select: {
        total: true,
        status: true,
        createdAt: true
      }
    });

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
    const canceledOrders = orders.filter(o => o.status === 'CANCELLED').length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.status === 'COMPLETED' ? o.total : 0), 0);

    return {
      totalOrders: { value: totalOrders, pctChange: 0 },
      completedOrders: { value: completedOrders, pctChange: 0 },
      canceledOrders: { value: canceledOrders, pctChange: 0 },
      totalRevenue: { value: totalRevenue, pctChange: 0 }
    };
  }

  async getOrderById(id: string, companyId: string) {
    const order = await orderRepository.findByIdWithDetails(id);
    if (!order || (order as any).branch.companyId !== companyId) {
      throw new AppError('Order not found', 404);
    }
    return order;
  }

  async createOrder(data: any, branchId: string, staffId: string) {
    const { items, customerId, paymentType, discount, tax, note } = data;

    // Use transaction to ensure atomicity
    return prisma.$transaction(async (tx) => {
      let subtotal = 0;

      // 1. Calculate totals and check stock
      const orderItems = [];
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new AppError(`Product ${item.productId} not found`, 404);
        }

        if (product.stock < item.quantity) {
          throw new AppError(`Insufficient stock for product ${product.name}`, 400);
        }

        const total = product.price * item.quantity;
        subtotal += total;

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
          total: total,
        });

        // 2. Deduct stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const total = subtotal - (discount || 0) + (tax || 0);
      const orderNumber = `ORD-${Date.now()}`;

      // 3. Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          branchId,
          staffId,
          customerId,
          paymentType,
          subtotal,
          discount: discount || 0,
          tax: tax || 0,
          total,
          note,
          status: 'COMPLETED',
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      return order;
    });
  }
}

export const orderService = new OrderService();
