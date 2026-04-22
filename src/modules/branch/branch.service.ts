import { branchRepository } from './branch.repository';
import { AppError } from '../../middlewares/error.middleware';

export class BranchService {
  async getAllBranches(companyId: string) {
    return branchRepository.findByCompany(companyId);
  }

  async getBranchById(id: string, companyId: string) {
    const branch = await branchRepository.findByIdAndCompany(id, companyId);
    if (!branch) throw new AppError('Branch not found', 404);
    return branch;
  }

  async createBranch(data: any, companyId: string) {
    return branchRepository.create({ ...data, companyId });
  }

  async updateBranch(id: string, data: any, companyId: string) {
    await this.getBranchById(id, companyId);
    return branchRepository.update(id, data);
  }

  async deleteBranch(id: string, companyId: string) {
    await this.getBranchById(id, companyId);
    return branchRepository.delete(id);
  }
}

export const branchService = new BranchService();
