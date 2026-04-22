import { staffRepository } from './staff.repository';
import { AppError } from '../../middlewares/error.middleware';
import bcrypt from 'bcrypt';

export class StaffService {
  async getAllStaff(companyId: string) {
    return staffRepository.findAll({ companyId });
  }

  async getStaffById(id: string, companyId: string) {
    const staff = await staffRepository.findById(id);
    if (!staff || staff.companyId !== companyId) {
      throw new AppError('Staff not found', 404);
    }
    return staff;
  }

  async createStaff(data: any, companyId: string) {
    const existing = await staffRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('Email already used', 409);
    }

    const hash = await bcrypt.hash(data.password || 'password123', 10);
    return staffRepository.create({
      ...data,
      passwordHash: hash,
      companyId,
    });
  }

  async updateStaff(id: string, data: any, companyId: string) {
    const staff = await this.getStaffById(id, companyId);
    
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }

    return staffRepository.update(id, data);
  }

  async deleteStaff(id: string, companyId: string) {
    await this.getStaffById(id, companyId);
    return staffRepository.delete(id);
  }
}

export const staffService = new StaffService();
