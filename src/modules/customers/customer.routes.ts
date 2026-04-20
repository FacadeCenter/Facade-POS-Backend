import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/db';
import { AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();

const customerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
});

// List all customers for the tenant
router.get('/', async (req: AuthRequest, res) => {
  const companyId = req.user?.companyId;
  const customers = await prisma.customer.findMany({
    where: { companyId },
  });
  res.json({ success: true, data: customers });
});

// Create a new customer for the tenant
router.post('/', async (req: AuthRequest, res) => {
  const parse = customerSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });
  
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: 'Company ID not found in token' });

  const customer = await prisma.customer.create({ 
    data: { 
      ...parse.data, 
      companyId 
    } 
  });
  res.status(201).json({ success: true, data: customer });
});

export default router;
