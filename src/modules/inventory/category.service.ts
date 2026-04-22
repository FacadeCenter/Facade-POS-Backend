import { categoryRepository } from './category.repository';
import { AppError } from '../../middlewares/error.middleware';

export class CategoryService {
  async getAllCategories(companyId: string) {
    return categoryRepository.findByCompany(companyId);
  }

  async getCategoryById(id: string, companyId: string) {
    const category = await categoryRepository.findById(id);
    if (!category || category.companyId !== companyId) {
      throw new AppError('Category not found', 404);
    }
    return category;
  }

  async createCategory(data: any, companyId: string) {
    return categoryRepository.create({
      ...data,
      companyId,
    });
  }

  async updateCategory(id: string, data: any, companyId: string) {
    await this.getCategoryById(id, companyId);
    return categoryRepository.update(id, data);
  }

  async deleteCategory(id: string, companyId: string) {
    await this.getCategoryById(id, companyId);
    return categoryRepository.delete(id);
  }
}

export const categoryService = new CategoryService();
