import { Category } from '@prisma/client';
import { BaseRepository } from '../../prisma/base.repository';

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super('category');
  }

  async findByCompany(companyId: string): Promise<Category[]> {
    return this.model.findMany({
      where: { companyId },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }
}

export const categoryRepository = new CategoryRepository();
