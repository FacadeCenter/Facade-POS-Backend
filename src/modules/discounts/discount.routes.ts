import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Minimal dummy implementation to satisfy the frontend
router.get('/', (req, res) => {
    res.json({ success: true, data: [] });
});

router.post('/', (req, res) => {
    res.status(201).json({ success: true, data: { id: 'mock-id', ...req.body } });
});

router.delete('/:id', (req, res) => {
    res.json({ success: true, message: 'Discount deleted' });
});

router.get('/branches', (req, res) => {
    res.json({ success: true, data: [] });
});

export default router;
