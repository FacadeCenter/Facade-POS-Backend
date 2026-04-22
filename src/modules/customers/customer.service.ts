import { customerRepository } from './customer.repository';
import { AppError } from '../../middlewares/error.middleware';

export class CustomerService {
  async getAllCustomers(companyId: string) {
    return customerRepository.findByCompany(companyId);
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
}

export const customerService = new CustomerService();
