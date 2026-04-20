import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/db';
import { AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1),
});

// List all branches for the tenant
router.get('/', async (req: AuthRequest, res) => {
  const companyId = req.user?.companyId;
  const branches = await prisma.branch.findMany({
    where: { companyId },
  });
  res.json({ success: true, data: branches });
});

// Create a new branch for the tenant
router.post('/', async (req: AuthRequest, res) => {
  const parse = createSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });
  
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: 'Company ID not found in token' });

  const branch = await prisma.branch.create({ 
    data: { 
      ...parse.data, 
      companyId 
    } 
  });
  res.status(201).json({ success: true, data: branch });
});

export default router;
