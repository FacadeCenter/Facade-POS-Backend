import { productRepository } from './product.repository';
import { AppError } from '../../middlewares/error.middleware';

export class ProductService {
  async getAllProducts(companyId: string, filter: any = {}) {
    return productRepository.findByCompany(companyId, filter);
  }

  async getProductById(id: string, companyId: string) {
    const product = await productRepository.findByIdWithDetails(id);
    if (!product || product.companyId !== companyId) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async createProduct(data: any, companyId: string) {
    return productRepository.create({
      ...data,
      companyId,
    });
  }

  async updateProduct(id: string, data: any, companyId: string) {
    await this.getProductById(id, companyId);
    return productRepository.update(id, data);
  }

  async deleteProduct(id: string, companyId: string) {
    await this.getProductById(id, companyId);
    return productRepository.delete(id);
  }
}

export const productService = new ProductService();
