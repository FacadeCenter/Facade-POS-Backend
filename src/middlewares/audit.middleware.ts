import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import prisma from '../config/db';
import { logger } from '../config/logger';

export const auditLogger = (module: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (body: any): Response {
      res.send = originalSend;
      const response = res.send(body);

      // Only log mutations and successful responses
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id || 'anonymous';
        const companyId = req.user?.companyId || 'unknown';

        prisma.auditLog.create({
          data: {
            action: req.method,
            module: module,
            userId,
            companyId,
            details: {
              path: req.originalUrl,
              body: req.body,
              statusCode: res.statusCode
            }
          }
        }).catch(err => logger.error(`Audit Log Error: ${err.message}`));
      }

      return response;
    };

    next();
  };
};
