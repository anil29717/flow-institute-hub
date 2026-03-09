import express from 'express';
import { FeePayment } from '../models/FeePayment';
import { Student } from '../models/Student';
import { verifyToken, requireOwner, AuthRequest } from '../middlewares/auth';

const router = express.Router();

router.get('/', verifyToken, async (req: AuthRequest, res) => {
    try {
        const filter: any = {};
        if (req.user?.role !== 'admin') {
            filter.instituteId = req.user?.instituteId;
        } else if (req.query.instituteId) {
            filter.instituteId = req.query.instituteId;
        }

        const payments = await FeePayment.find(filter)
            .populate({
                path: 'studentId',
                select: 'firstName lastName studentId instituteId',
                populate: { path: 'instituteId', select: 'name' }
            });
        res.json(payments);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', verifyToken, requireOwner, async (req: AuthRequest, res) => {
    try {
        const { studentId, amount, paymentMode, referenceNo, remarks } = req.body;

        const payment = new FeePayment({
            instituteId: req.user?.instituteId,
            studentId, amount, paymentMode, referenceNo, remarks,
            collectedBy: req.user?.userId
        });

        await payment.save();

        // Update Student total fees paid
        const student = await Student.findById(studentId);
        if (student) {
            const newPaid = (student.feesPaid || 0) + Number(amount);
            const status = newPaid >= (student.totalFees || 0) ? 'paid' : 'partial';
            student.feesPaid = newPaid;
            student.feeStatus = status;
            await student.save();
        }

        res.json(payment);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
