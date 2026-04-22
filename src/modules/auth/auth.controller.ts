import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { z } from 'zod';
import { AuthRequest } from '../../middlewares/auth.middleware';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  companyId: z.string(),
});

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      console.log('LOGIN ATTEMPT:', data.email);
      const result = await authService.login(data.email, data.password);
      console.log('LOGIN SUCCESS:', data.email);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('LOGIN ERROR:', error.message);
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async branchLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.branchLogin(data.email, data.password);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getCompanies(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const staffId = req.user?.id;
      if (!staffId) throw new Error('Unauthorized');
      const result = await authService.getCompanies(staffId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async selectCompany(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.body;
      const staffId = req.user?.id;
      if (!staffId) throw new Error('Unauthorized');
      
      const result = await authService.selectCompany(staffId, companyId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
  
  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const staffId = req.user?.id;
        if (!staffId) throw new Error('Unauthorized');
        res.json({ success: true, data: req.user });
    } catch (error) {
        next(error);
    }
  }
}

export const authController = new AuthController();
