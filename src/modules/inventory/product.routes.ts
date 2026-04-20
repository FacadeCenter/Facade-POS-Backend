import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/db';
import { AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();

const productSchema = z.object({
  name: z.string().min(1),
  price: z.number(),
  stock: z.number().int(),
});

// List all products for the tenant
router.get('/', async (req: AuthRequest, res) => {
  const companyId = req.user?.companyId;
  const products = await prisma.product.findMany({
    where: { companyId },
  });
  res.json({ success: true, data: products });
});

// Create a new product for the tenant
router.post('/', async (req: AuthRequest, res) => {
  const parse = productSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });
  
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: 'Company ID not found in token' });

  const product = await prisma.product.create({ 
    data: { 
      ...parse.data, 
      companyId 
    } 
  });
  res.status(201).json({ success: true, data: product });
});

// Update a product
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const parse = productSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });
  const product = await prisma.product.update({ where: { id }, data: parse.data });
  res.json({ success: true, data: product });
});

// Delete a product
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.product.delete({ where: { id } });
  res.status(204).send();
});

export default router;
