import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware';
import { staffRepository } from '../modules/staff/staff.repository';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    companyId?: string;
    branchId?: string;
  };
}

export const authMiddleware = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized: No token provided', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    
    // Check database for user existence, active status, and latest role/company
    const staff = await staffRepository.findById(decoded.id);
    
    if (!staff) {
      return next(new AppError('Unauthorized: User no longer exists', 401));
    }

    if (!staff.isActive) {
      return next(new AppError('Unauthorized: Account is inactive', 401));
    }

    // Update req.user with DB values to ensure latest info
    req.user = {
      id: staff.id,
      role: staff.role,
      companyId: staff.companyId || undefined,
      branchId: staff.branchId || undefined,
    };

    next();
  } catch (error) {
    return next(new AppError('Unauthorized: Invalid token', 401));
  }
};

export const roleCheck = (roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: You do not have permission to perform this action', 403));
    }

    next();
  };
};
