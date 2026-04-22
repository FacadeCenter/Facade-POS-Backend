import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { staffRepository } from '../staff/staff.repository';
import { AppError } from '../../middlewares/error.middleware';

export class AuthService {
  async login(email: string, password: string) {
    const staff = await staffRepository.findByEmail(email);
    if (!staff) {
      throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, staff.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = this.generateToken(staff);

    return {
      token,
      user: {
        id: staff.id,
        email: staff.email,
        name: staff.name,
        role: staff.role,
        companyId: staff.companyId,
        companyName: (staff as any).company?.name || '',
        branchId: staff.branchId || '',
        branchName: (staff as any).branch?.name || '',
      },
    };
  }

  async register(data: { name: string; email: string; password: string; companyId: string }) {
    const existing = await staffRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('Email already used', 409);
    }

    const hash = await bcrypt.hash(data.password, 10);
    const staff = await staffRepository.create({
      name: data.name,
      email: data.email,
      passwordHash: hash,
      companyId: data.companyId,
    });

    const token = this.generateToken(staff);
    return { token, staff };
  }

  async selectCompany(staffId: string, companyId: string) {
    const staff = await staffRepository.findById(staffId);
    if (!staff) {
      throw new AppError('Staff not found', 404);
    }

    // Role check logic can be added here if needed, but RBAC middleware handles it generally
    // For now, let's just ensure they belong to the company or are OWNER
    if (staff.role !== 'OWNER' && staff.companyId !== companyId) {
      throw new AppError('Forbidden', 403);
    }

    const staffWithDetails = await staffRepository.findWithDetails(staff.id);
    const token = this.generateToken(staff);

    return {
      token,
      companyName: (staffWithDetails as any).company?.name || '',
    };
  }

  private generateToken(staff: any) {
    return jwt.sign(
      { id: staff.id, role: staff.role, companyId: staff.companyId, branchId: staff.branchId },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }
}

export const authService = new AuthService();
