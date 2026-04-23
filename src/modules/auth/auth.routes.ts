import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { authController } from './auth.controller';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/branch-login', authController.branchLogin);
router.get('/companies', authMiddleware, authController.getCompanies);
router.post('/select-company', authMiddleware, authController.selectCompany);
router.get('/me', authMiddleware, authController.getMe);
router.get('/store-info', authMiddleware, authController.getStoreInfo);

// Note: /branch-login and /companies routes were in the original file. 
// I'll keep them or refactor them into the controller if they are still needed.
// For now, I've refactored the main ones.

export default router;
