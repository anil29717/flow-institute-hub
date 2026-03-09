import express from 'express';
import { Test } from '../models/Test';
import { Mark } from '../models/Mark';
import { verifyToken, AuthRequest } from '../middlewares/auth';

const router = express.Router();

// GET all tests
router.get('/', verifyToken, async (req: AuthRequest, res) => {
    try {
        const tests = await Test.find({ instituteId: req.user?.instituteId })
            .populate('batchIds', 'name courseId')
            .populate('studentIds', 'firstName lastName studentId')
            .populate('createdBy', 'firstName lastName');
        res.json(tests);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST create test
router.post('/', verifyToken, async (req: AuthRequest, res) => {
    try {
        const test = new Test({
            ...req.body,
            instituteId: req.user?.instituteId,
            createdBy: req.user?.userId
        });
        await test.save();
        res.json(test);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET students assigned to a test
router.get('/:id/students', verifyToken, async (req: AuthRequest, res) => {
    try {
        const test = await Test.findById(req.params.id)
            .populate({
                path: 'studentIds',
                select: 'firstName lastName studentId batchId',
                populate: { path: 'batchId', select: 'name' }
            });

        if (!test) return res.status(404).json({ error: 'Test not found' });

        // Transform to match the structure the frontend expects if necessary, 
        // or just return the populated studentIds.
        // The frontend useTestStudents hook expects an array.
        res.json(test.studentIds);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a test
router.delete('/:id', verifyToken, async (req: AuthRequest, res) => {
    try {
        await Test.deleteOne({ _id: req.params.id, instituteId: req.user?.instituteId });
        await Mark.deleteMany({ testId: req.params.id });
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET marks for a test
router.get('/:id/marks', verifyToken, async (req: AuthRequest, res) => {
    try {
        const marks = await Mark.find({ testId: req.params.id })
            .populate('studentId', 'firstName lastName studentId recordStatus');
        res.json(marks);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST submit marks
router.post('/:id/marks', verifyToken, async (req: AuthRequest, res) => {
    try {
        const { marks } = req.body; // Array of { studentId, subject, marksObtained, totalMarks, remarks }

        const operations = marks.map((m: any) => ({
            updateOne: {
                filter: { testId: req.params.id, studentId: m.studentId, subject: m.subject },
                update: {
                    $set: {
                        marksObtained: m.marksObtained,
                        totalMarks: m.totalMarks,
                        remarks: m.remarks
                    }
                },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            await Mark.collection.bulkWrite(operations);
        }

        res.json({ success: true, count: operations.length });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});


export default router;
