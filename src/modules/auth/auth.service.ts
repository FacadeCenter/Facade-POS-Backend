import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { staffRepository } from '../staff/staff.repository';
import { AppError } from '../../middlewares/error.middleware';
import prisma from '../../config/db';

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

    const staffWithDetails = await staffRepository.findWithDetails(staff.id);
    const token = this.generateToken(staff);

    return {
      ok: true,
      token,
      email: staff.email,
      name: staff.name,
      role: staff.role,
      companyId: staff.companyId || '',
      companyName: (staffWithDetails as any).company?.name || '',
      branchId: staff.branchId || '',
      branchName: (staffWithDetails as any).branch?.name || '',
    };
  }

  async register(data: { name: string; email: string; password: string; companyId?: string; role?: string }) {
    const existing = await staffRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('Email already used', 409);
    }

    const hash = await bcrypt.hash(data.password, 10);
    
    let finalCompanyId = data.companyId;

    // If no companyId provided, create a new company
    if (!finalCompanyId) {
      const company = await prisma.company.create({
        data: {
          name: data.name, // Use user's name as initial company name
          email: data.email,
        }
      });
      finalCompanyId = company.id;
    }

    const staff = await staffRepository.create({
      name: data.name,
      email: data.email,
      passwordHash: hash,
      companyId: finalCompanyId,
      role: (data.role as any) || 'TENANT_ADMIN',
    });

    const token = this.generateToken(staff);
    return { token, staff };
  }

  async branchLogin(email: string, password: string) {
    const staff = await staffRepository.findByEmail(email);
    if (!staff) {
      throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, staff.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    // For branch login, we pick the first branch if none assigned, or the assigned one
    const branch = staff.branchId 
      ? await prisma.branch.findUnique({ where: { id: staff.branchId } })
      : await prisma.branch.findFirst({ where: { companyId: staff.companyId as string } });

    const staffWithDetails = await staffRepository.findWithDetails(staff.id);
    const token = jwt.sign(
      { id: staff.id, role: staff.role, companyId: staff.companyId, branchId: branch?.id },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );

    return {
      ok: true,
      token,
      branchId: branch?.id || '',
      branchName: branch?.name || '',
      companyId: staff.companyId,
      companyName: (staffWithDetails as any).company?.name || '',
    };
  }

  async getCompanies(staffId: string) {
    const staff = await staffRepository.findWithDetails(staffId);
    if (!staff || !(staff as any).company) return [];

    return [
      {
        companyId: (staff as any).company.id,
        name: (staff as any).company.name,
        businessType: (staff as any).company.plan,
      }
    ];
  }

  async selectCompany(staffId: string, companyId: string) {
    const staff = await staffRepository.findById(staffId);
    if (!staff) {
      throw new AppError('Staff not found', 404);
    }

    if (staff.role !== 'PLATFORM_ADMIN' && staff.role !== 'TENANT_ADMIN' && staff.companyId !== companyId) {
      throw new AppError('Forbidden', 403);
    }

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new AppError('Company not found', 404);
    }

    const token = jwt.sign(
      { id: staff.id, role: staff.role, companyId: company.id },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );

    return {
      token,
      companyName: company.name,
    };
  }

  private generateToken(staff: any) {
    return jwt.sign(
      { id: staff.id, role: staff.role, companyId: staff.companyId, branchId: staff.branchId },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' }
    );
  }

  async getStoreInfo(companyId: string) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new AppError('Company not found', 404);

    return {
      logoUrl: company.logoUrl,
      telephone: company.phone || '',
      businessType: 'RETAIL', // Hardcoded for now as it's not in schema
      businessTypeId: company.id,
      subscription: {
          plan: company.plan,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
  }

  async getMe(staffId: string) {
    const staff = await staffRepository.findById(staffId);
    if (!staff) throw new AppError('Staff not found', 404);
    
    return {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      companyId: staff.companyId,
      branchId: staff.branchId
    };
  }
}

export const authService = new AuthService();
