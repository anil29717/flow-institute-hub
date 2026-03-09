import express from 'express';
import { SalaryPayment } from '../models/SalaryPayment';
import { Teacher } from '../models/Teacher';
import { verifyToken, requireOwner, AuthRequest } from '../middlewares/auth';

const router = express.Router();

router.get('/', verifyToken, async (req: AuthRequest, res) => {
    try {
        const filter: any = { instituteId: req.user?.instituteId };

        if (req.user?.role === 'teacher') {
            const teacher = await Teacher.findOne({ userId: req.user.userId });
            if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
            filter.teacherId = teacher._id;
        }

        const payments = await SalaryPayment.find(filter)
            .populate({
                path: 'teacherId',
                select: 'employeeId',
                populate: { path: 'userId', select: 'firstName lastName' }
            });

        res.json(payments);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', verifyToken, requireOwner, async (req: AuthRequest, res) => {
    try {
        const payment = new SalaryPayment({
            ...req.body,
            instituteId: req.user?.instituteId,
            paidBy: req.user?.userId
        });
        await payment.save();
        res.json(payment);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
