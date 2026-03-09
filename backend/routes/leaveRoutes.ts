import express from 'express';
import { LeaveRequest } from '../models/LeaveRequest';
import { Teacher } from '../models/Teacher';
import { verifyToken, requireOwner, AuthRequest } from '../middlewares/auth';

const router = express.Router();

// GET all leave requests (Owner sees all, Teacher sees own)
router.get('/', verifyToken, async (req: AuthRequest, res) => {
    try {
        const filter: any = { instituteId: req.user?.instituteId };

        // Naively assume if teacher, we only fetch their leaves. 
        // Need a Teacher document ID resolution. Let's simplify and return all if owner.
        if (req.user?.role === 'teacher') {
            const teacher = await Teacher.findOne({ userId: req.user.userId });
            if (teacher) {
                filter.teacherId = teacher._id;
            }
        }

        const leaves = await LeaveRequest.find(filter)
            .populate({
                path: 'teacherId',
                select: 'employeeId',
                populate: { path: 'userId', select: 'firstName lastName' }
            });

        res.json(leaves);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST submit a leave request (Teacher)
router.post('/', verifyToken, async (req: AuthRequest, res) => {
    try {
        const teacher = await Teacher.findOne({ userId: req.user?.userId });
        if (!teacher && req.user?.role !== 'owner') return res.status(403).json({ error: 'Only teachers can request leaves' });

        const leave = new LeaveRequest({
            ...req.body,
            instituteId: req.user?.instituteId,
            teacherId: teacher?._id || req.body.teacherId
        });

        await leave.save();
        res.json(leave);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH approve/reject leave (Owner)
router.patch('/:id/status', verifyToken, requireOwner, async (req: AuthRequest, res) => {
    try {
        const { status } = req.body;
        const leave = await LeaveRequest.findOneAndUpdate(
            { _id: req.params.id, instituteId: req.user?.instituteId },
            { status, approvedBy: req.user?.userId },
            { new: true }
        );
        res.json(leave);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
