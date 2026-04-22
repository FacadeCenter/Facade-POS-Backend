import { Branch } from '@prisma/client';
import { BaseRepository } from '../../prisma/base.repository';

export class BranchRepository extends BaseRepository<Branch> {
  constructor() {
    super('branch');
  }

  async findByCompany(companyId: string): Promise<Branch[]> {
    return this.model.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByIdAndCompany(id: string, companyId: string): Promise<Branch | null> {
    return this.model.findFirst({
      where: { id, companyId }
    });
  }
}

export const branchRepository = new BranchRepository();
