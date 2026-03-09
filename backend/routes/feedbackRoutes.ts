import express from 'express';
import { Feedback } from '../models/Feedback';
import { verifyToken, AuthRequest } from '../middlewares/auth';

const router = express.Router();

router.get('/', verifyToken, async (req: AuthRequest, res) => {
    try {
        const feedbacks = await Feedback.find({ instituteId: req.user?.instituteId })
            .populate('teacherId', 'employeeId')
            .populate({ path: 'teacherId', populate: { path: 'userId', select: 'firstName lastName' } });
        res.json(feedbacks);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
