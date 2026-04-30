import { productRepository } from './product.repository';
import { AppError } from '../../middlewares/error.middleware';
import prisma from '../../config/db';

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
    const { stock, minStock, branchId, ...productData } = data;

    const product = await productRepository.create({
      ...productData,
      companyId,
    });

    // If branchId and stock info provided, create initial inventory record
    if (branchId) {
      await prisma.inventory.create({
        data: {
          productId: product.id,
          branchId,
          quantity: stock || 0,
          minStock: minStock || 5
        }
      });
    }

    return product;
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
