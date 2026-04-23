import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import prisma from './config/db';
import { logger } from './config/logger';
import { rateLimiter, authRateLimiter } from './middlewares/rate-limiter.middleware';
import authRouter from './modules/auth/auth.routes';
import staffRouter from './modules/staff/staff.routes';
import companyRouter from './modules/company/company.routes';
import branchRouter from './modules/branch/branch.routes';
import productRouter from './modules/inventory/product.routes';
import categoryRouter from './modules/inventory/category.routes';
import orderRouter from './modules/pos/order.routes';
import customerRouter from './modules/customers/customer.routes';
import expenseRouter from './modules/expenses/expense.routes';
import reportRouter from './modules/reports/report.routes';
import supplierRouter from './modules/suppliers/supplier.routes';
import discountRouter from './modules/discounts/discount.routes';
import analyticsRouter from './modules/analytics/analytics.routes';

import { authMiddleware } from './middlewares/auth.middleware';
import { errorHandler, AppError } from './middlewares/error.middleware';

dotenv.config();

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ 
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-company-id', 'x-branch-id']
}));
app.use(express.json());
app.use(rateLimiter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// API routes
app.use('/api/v1/auth', authRateLimiter, authRouter);
app.use('/api/v1/staff', staffRouter);

// Protected routes
app.use('/api/v1/companies', authMiddleware, companyRouter);
app.use('/api/v1/branches', authMiddleware, branchRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/sales', authMiddleware, orderRouter);
app.use('/api/v1/customers', authMiddleware, customerRouter);
app.use('/api/v1/expenses', authMiddleware, expenseRouter);
app.use('/api/v1/reports', reportRouter);
app.use('/api/v1/suppliers', authMiddleware, supplierRouter);
app.use('/api/v1/discounts', authMiddleware, discountRouter);
app.use('/api/v1/analytics', analyticsRouter);

// Handle 404
app.all('*', (req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
// app.listen moved to server.ts

export default app;
