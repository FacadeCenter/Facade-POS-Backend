import { Product } from '@prisma/client';
import { BaseRepository } from '../../prisma/base.repository';

export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super('product');
  }

  async findByCompany(companyId: string, filter: any = {}): Promise<Product[]> {
    return this.model.findMany({
      where: { 
        companyId,
        ...filter
      },
      include: {
        category: true,
        inventory: true
      }
    });
  }

  async findByIdWithDetails(id: string): Promise<Product | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        category: true,
        inventory: true
      }
    });
  }
}

export const productRepository = new ProductRepository();
