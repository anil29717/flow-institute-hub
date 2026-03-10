import express from 'express';
import { Attendance } from '../models/Attendance';
import { verifyToken, requireOwner, AuthRequest } from '../middlewares/auth';

const router = express.Router();

router.get('/', verifyToken, async (req: AuthRequest, res) => {
    try {
        const { batchId, date, teacherId } = req.query;
        const filter: any = { instituteId: req.user?.instituteId };

        if (batchId) filter.batchId = batchId;
        if (teacherId) filter.teacherId = teacherId; // Support specific teacher filtering

        // Security check for teachers accessing their own records
        if (req.user?.role === 'teacher') {
            const teacher = await require('../models/Teacher').Teacher.findOne({ userId: req.user.userId });
            if (teacher) filter.teacherId = teacher._id;
        }

        if (date) {
            const start = new Date(date as string);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date as string);
            end.setHours(23, 59, 59, 999);
            filter.date = { $gte: start, $lte: end };
        }

        const records = await Attendance.find(filter)
            .populate('studentId', 'firstName lastName studentId')
            .populate({
                path: 'teacherId',
                populate: { path: 'userId', select: 'firstName lastName email' }
            });

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

        const bulkOps = docsToInsert.map((r: any) => {
            // Find criteria: institute, date, and EITHER studentId or teacherId
            const filter: any = {
                instituteId: req.user?.instituteId,
                date: r.date
            };
            if (r.studentId) filter.studentId = r.studentId;
            if (r.teacherId) filter.teacherId = r.teacherId;

            return {
                updateOne: {
                    filter,
                    update: {
                        $set: {
                            ...r,
                            instituteId: req.user?.instituteId,
                            markedBy: req.user?.userId
                        }
                    },
                    upsert: true
                }
            };
        });

        const result = await Attendance.bulkWrite(bulkOps);
        res.json({ success: true, count: docsToInsert.length, result });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
