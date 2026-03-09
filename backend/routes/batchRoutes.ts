import express from 'express';
import { Batch } from '../models/Batch';
import { Teacher } from '../models/Teacher';
import { Student } from '../models/Student';
import { verifyToken, requireOwner, AuthRequest } from '../middlewares/auth';

const router = express.Router();

// GET all batches
router.get('/', verifyToken, async (req: AuthRequest, res) => {
    try {
        const filter: any = { instituteId: req.user?.instituteId };

        if (req.user?.role === 'teacher') {
            const teacher = await Teacher.findOne({ userId: req.user.userId });
            if (!teacher) return res.status(404).json({ error: 'Teacher record not found' });
            filter.teacherId = teacher._id;
        }

        const batches = await Batch.find(filter)
            .populate('courseId', 'name')
            .populate({
                path: 'teacherId',
                populate: { path: 'userId', select: 'firstName lastName' }
            });
        res.json(batches);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST create batch
router.post('/', verifyToken, requireOwner, async (req: AuthRequest, res) => {
    try {
        const batch = new Batch({
            ...req.body,
            instituteId: req.user?.instituteId
        });
        await batch.save();
        res.json(batch);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
