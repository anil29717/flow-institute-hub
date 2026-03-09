import express from 'express';
import { Attendance } from '../models/Attendance';
import { verifyToken, requireOwner, AuthRequest } from '../middlewares/auth';

const router = express.Router();

router.get('/', verifyToken, async (req: AuthRequest, res) => {
    try {
        const { batchId, date } = req.query;
        const filter: any = { instituteId: req.user?.instituteId };
        if (batchId) filter.batchId = batchId;
        if (date) {
            const start = new Date(date as string);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date as string);
            end.setHours(23, 59, 59, 999);
            filter.date = { $gte: start, $lte: end };
        }

        const records = await Attendance.find(filter).populate('studentId', 'firstName lastName studentId');
        res.json(records);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', verifyToken, async (req: AuthRequest, res) => {
    try {
        const { records, ...singleRecord } = req.body; // Support array or single record

        const docsToInsert = Array.isArray(records) ? records : (Object.keys(singleRecord).length > 0 ? [singleRecord] : []);

        if (docsToInsert.length === 0) {
            return res.status(400).json({ error: 'No attendance records provided' });
        }

        const docs = docsToInsert.map((r: any) => ({
            ...r,
            instituteId: req.user?.instituteId,
            markedBy: req.user?.userId
        }));

        await Attendance.insertMany(docs);
        res.json({ success: true, count: docs.length });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
