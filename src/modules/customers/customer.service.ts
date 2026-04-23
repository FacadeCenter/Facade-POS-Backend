import { customerRepository } from './customer.repository';
import { AppError } from '../../middlewares/error.middleware';

export class CustomerService {
  async getAllCustomers(companyId: string) {
    return customerRepository.findByCompany(companyId);
  }

  async searchCustomers(companyId: string, query: string) {
    return customerRepository.findAll({
      companyId,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } }
      ]
    });
  }

  async getCustomerById(id: string, companyId: string) {
    const customer = await customerRepository.findByIdAndCompany(id, companyId);
    if (!customer) throw new AppError('Customer not found', 404);
    return customer;
  }

  async createCustomer(data: any, companyId: string) {
    return customerRepository.create({ ...data, companyId });
  }

  async updateCustomer(id: string, data: any, companyId: string) {
    await this.getCustomerById(id, companyId);
    return customerRepository.update(id, data);
  }

  async deleteCustomer(id: string, companyId: string) {
    await this.getCustomerById(id, companyId);
    return customerRepository.delete(id);
  }

  async getCustomerStats(companyId: string) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [total, totalLastMonth, newThisMonth] = await Promise.all([
      customerRepository.count({ companyId }),
      customerRepository.count({ companyId, createdAt: { lt: firstDayOfMonth } }),
      customerRepository.count({ companyId, createdAt: { gte: firstDayOfMonth } })
    ]);

    const pctChange = totalLastMonth > 0 ? ((total - totalLastMonth) / totalLastMonth) * 100 : 100;

    return {
      total: { value: total, pctChange: parseFloat(pctChange.toFixed(1)) },
      newThisMonth: { value: newThisMonth, pctChange: 0 } // Simplified for now
    };
  }
}

export const customerService = new CustomerService();
