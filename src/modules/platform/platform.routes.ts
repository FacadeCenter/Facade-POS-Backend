import { Router } from 'express';
import { platformController } from './platform.controller';
import { authMiddleware, roleCheck } from '../../middlewares/auth.middleware';

const router = Router();

// Strict platform admin check
router.use(authMiddleware);
router.use(roleCheck(['PLATFORM_ADMIN']));

router.get('/stats', platformController.getGlobalStats);
router.get('/tenants', platformController.getAllTenants);
router.get('/users', platformController.getAllUsers);
router.get('/logs', platformController.getAuditLogs);

router.get('/billing', platformController.getBilling);
router.get('/branches', platformController.getBranches);
router.get('/devices', platformController.getDevices);
router.get('/orders', platformController.getOrders);
router.get('/support', platformController.getSupportTickets);

export default router;
