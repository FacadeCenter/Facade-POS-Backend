import { Router } from 'express';
import prisma from '../../config/db';
import { z } from 'zod';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  plan: z.enum(['FREE','BASIC','PRO','ENTERPRISE']).optional(),
});

// List all companies (for owner)
router.get('/', async (_req, res) => {
  const companies = await prisma.company.findMany();
  res.json(companies);
});

// Create a new company (onboarding)
router.post('/', async (req, res) => {
  const parse = createSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });
  const { name, email, plan } = parse.data;
  const company = await prisma.company.create({
    data: { 
      name, 
      email,
      plan: plan as any || undefined 
    },
  });
  res.status(201).json(company);
});

export default router;
