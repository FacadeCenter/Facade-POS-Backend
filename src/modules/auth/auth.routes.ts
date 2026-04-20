import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../../middlewares/auth.middleware';
import { z } from 'zod';
import prisma from '../../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/login', async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });
  const { email, password } = parse.data;
  const staff = await prisma.staff.findUnique({ where: { email } });
  if (!staff) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, staff.passwordHash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign(
    { id: staff.id, role: staff.role, companyId: staff.companyId },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' }
  );

  const company = await prisma.company.findUnique({ where: { id: staff.companyId } });
  const branch = staff.branchId ? await prisma.branch.findUnique({ where: { id: staff.branchId } }) : null;

  res.json({
    success: true,
    data: {
      ok: true,
      token,
      email: staff.email,
      name: staff.name,
      role: staff.role,
      companyId: staff.companyId,
      companyName: company?.name || '',
      branchId: staff.branchId || '',
      branchName: branch?.name || '',
    },
  });
});

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  companyId: z.string(),
});

router.post('/register', async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });
  const { name, email, password, companyId } = parse.data;
  const existing = await prisma.staff.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already used' });
  const hash = await bcrypt.hash(password, 10);
  const staff = await prisma.staff.create({
    data: { name, email, passwordHash: hash, companyId },
  });
  const token = jwt.sign({ id: staff.id, role: staff.role, companyId: staff.companyId }, process.env.JWT_SECRET!, { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' });
  res.status(201).json({ token });
});

router.post('/branch-login', async (req, res) => {
  const { email, password } = req.body;
  // This is a simplified branch login for the demo
  const staff = await prisma.staff.findUnique({ where: { email } });
  if (!staff) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, staff.passwordHash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const branch = await prisma.branch.findFirst({
    where: { companyId: staff.companyId }
  });

  const company = await prisma.company.findUnique({ where: { id: staff.companyId } });

  const token = jwt.sign(
    { id: staff.id, role: staff.role, companyId: staff.companyId, branchId: branch?.id },
    process.env.JWT_SECRET!,
    { expiresIn: '8h' }
  );

  res.json({
    success: true,
    data: {
      ok: true,
      token,
      branchId: branch?.id || '',
      branchName: branch?.name || '',
      companyId: staff.companyId,
      companyName: company?.name || '',
    }
  });
});
// List all companies for the logged-in staff (OWNER/ADMIN)
router.get('/companies', authMiddleware, async (req: AuthRequest, res) => {
  const staffId = req.user?.id;
  if (!staffId) return res.status(401).json({ error: 'Unauthorized' });

  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    include: { company: true }
  });

  if (!staff || !staff.company) return res.json({ success: true, data: [] });

  res.json({
    success: true,
    data: [
      {
        companyId: staff.company.id,
        name: staff.company.name,
        businessType: staff.company.plan
      }
    ]
  });
});

// Select a company and get a fresh token
router.post('/select-company', authMiddleware, async (req: AuthRequest, res) => {
  const { companyId } = req.body;
  const staffId = req.user?.id;

  if (!staffId || !companyId) return res.status(400).json({ error: 'Missing requirements' });

  const staff = await prisma.staff.findUnique({ where: { id: staffId } });
  if (!staff) return res.status(404).json({ error: 'Staff not found' });

  if (staff.role !== 'OWNER' && staff.companyId !== companyId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) return res.status(404).json({ error: 'Company not found' });

  const token = jwt.sign(
    { id: staff.id, role: staff.role, companyId: company.id },
    process.env.JWT_SECRET!,
    { expiresIn: '8h' }
  );

  res.json({
    success: true,
    data: {
      token,
      companyName: company.name
    }
  });
});

export default router;
