import { Customer } from '@prisma/client';
import { BaseRepository } from '../../prisma/base.repository';

export class CustomerRepository extends BaseRepository<Customer> {
  constructor() {
    super('customer');
  }

  async findByCompany(companyId: string): Promise<Customer[]> {
    return this.model.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByIdAndCompany(id: string, companyId: string): Promise<Customer | null> {
    return this.model.findFirst({
      where: { id, companyId }
    });
  }
}

export const customerRepository = new CustomerRepository();
