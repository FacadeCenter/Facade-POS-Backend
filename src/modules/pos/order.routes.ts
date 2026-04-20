import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/db';
import { AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();

const orderSchema = z.object({
  branchId: z.string(),
  customerId: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
      unitPrice: z.number(),
    })
  ),
  total: z.number(),
  paymentType: z.enum(['CASH', 'CARD']),
});

// List all orders for the tenant
router.get('/', async (req: AuthRequest, res) => {
  const companyId = req.user?.companyId;
  const orders = await prisma.order.findMany({
    where: {
      branch: {
        companyId: companyId
      }
    },
    include: { items: true },
  });
  res.json({ success: true, data: orders });
});

// Create a new order for the tenant
router.post('/', async (req: AuthRequest, res) => {
  const parse = orderSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });
  
  const { branchId, customerId, items, total, paymentType } = parse.data;
  const companyId = req.user?.companyId;

  // Verify branch belongs to the user's company
  const branch = await prisma.branch.findFirst({
    where: { id: branchId, companyId }
  });

  if (!branch) return res.status(403).json({ error: 'Access to this branch is denied' });

  try {
    const order = await prisma.order.create({
      data: {
        branchId,
        customerId,
        total,
        paymentType,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });
    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ success: true, data: order });
});

export default router;
