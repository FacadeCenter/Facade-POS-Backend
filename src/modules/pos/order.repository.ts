import { Order } from '@prisma/client';
import { BaseRepository } from '../../prisma/base.repository';

export class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super('order');
  }

  async findByBranch(branchId: string): Promise<Order[]> {
    return this.model.findMany({
      where: { branchId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        staff: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByIdWithDetails(id: string): Promise<Order | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        staff: true,
        branch: true
      }
    });
  }
}

export const orderRepository = new OrderRepository();
