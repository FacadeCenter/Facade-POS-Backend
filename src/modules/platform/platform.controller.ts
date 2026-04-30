import { Response, NextFunction } from 'express';
import { platformService } from './platform.service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class PlatformController {
  getGlobalStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await platformService.getGlobalStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  getAllTenants = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const tenants = await platformService.getAllTenants();
      res.json({ success: true, data: tenants });
    } catch (error) {
      next(error);
    }
  }

  getAllUsers = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const users = await platformService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  getAuditLogs = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const logs = await platformService.getAuditLogs();
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  getBilling = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const billing = await platformService.getBilling();
      res.json({ success: true, data: billing });
    } catch (error) {
      next(error);
    }
  }

  getBranches = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const branches = await platformService.getBranches();
      res.json({ success: true, data: branches });
    } catch (error) {
      next(error);
    }
  }

  getDevices = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const devices = await platformService.getDevices();
      res.json({ success: true, data: devices });
    } catch (error) {
      next(error);
    }
  }

  getOrders = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orders = await platformService.getOrders();
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  getSupportTickets = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const tickets = await platformService.getSupportTickets();
      res.json({ success: true, data: tickets });
    } catch (error) {
      next(error);
    }
  }
}

export const platformController = new PlatformController();
