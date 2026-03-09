import express from 'express';
import { Plan } from '../models/Plan';
import { verifyToken, requireAdmin, AuthRequest } from '../middlewares/auth';

const router = express.Router();

// GET all plans
router.get('/', async (req, res) => {
    try {
        const plans = await Plan.find().sort({ price: 1 });
        res.json(plans);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST create plan (admin only)
router.post('/', verifyToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const plan = new Plan(req.body);
        await plan.save();
        res.json(plan);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update plan (admin only)
router.put('/:id', verifyToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        res.json(plan);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE plan (admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const plan = await Plan.findByIdAndDelete(req.params.id);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
