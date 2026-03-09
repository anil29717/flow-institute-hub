import express from 'express';
import { Institute } from '../models/Institute';
import { Plan } from '../models/Plan';
import { verifyToken, requireAdmin, requireOwner, AuthRequest } from '../middlewares/auth';

const router = express.Router();

// GET all institutes (Admin only)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const institutes = await Institute.find().populate('planId', 'name price');
        res.json(institutes);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET current institute details (Owner only)
router.get('/my-institute', verifyToken, requireOwner, async (req: AuthRequest, res) => {
    try {
        if (!req.user?.instituteId) return res.status(400).json({ error: 'No institute linked to this account.' });

        const institute = await Institute.findById(req.user.instituteId).populate('planId', 'name maxStudents maxTeachers');
        if (!institute) return res.status(404).json({ error: 'Institute not found.' });

        res.json(institute);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Admin approves/activates an institute
router.patch('/:id/status', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { isApproved, isActive, planId } = req.body;
        const updateData: any = {};
        if (isApproved !== undefined) updateData.isApproved = isApproved;
        if (isActive !== undefined) updateData.isActive = isActive;

        if (planId) {
            const plan = await Plan.findById(planId);
            if (!plan) return res.status(404).json({ error: 'Plan not found.' });
            updateData.planId = plan._id;
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + plan.maxDays);
            updateData.planExpiresAt = expiry;
        }

        const institute = await Institute.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(institute);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Update institute profile (Owner)
router.put('/my-institute', verifyToken, requireOwner, async (req: AuthRequest, res) => {
    try {
        const { name, phone, address, email } = req.body;
        const institute = await Institute.findByIdAndUpdate(
            req.user?.instituteId,
            { name, phone, address, email },
            { new: true }
        );
        res.json(institute);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
