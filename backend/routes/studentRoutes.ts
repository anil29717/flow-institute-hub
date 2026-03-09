import express from 'express';
import { Student } from '../models/Student';
import { verifyToken, requireOwner, AuthRequest } from '../middlewares/auth';

const router = express.Router();

// GET all students for an institute (or all if admin)
router.get('/', verifyToken, async (req: AuthRequest, res) => {
    try {
        const filter: any = {};
        if (req.user?.role !== 'admin') {
            filter.instituteId = req.user?.instituteId;
        } else if (req.query.instituteId) {
            filter.instituteId = req.query.instituteId;
        }

        const students = await Student.find(filter)
            .populate('batchId', 'name')
            .populate('courseId', 'name')
            .populate('instituteId', 'name');
        res.json(students);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST create a student
router.post('/', verifyToken, requireOwner, async (req: AuthRequest, res) => {
    try {
        const studentCount = await Student.countDocuments({ instituteId: req.user?.instituteId });
        const studentId = `STU-${studentCount + 1000}`;

        const student = new Student({
            ...req.body,
            instituteId: req.user?.instituteId,
            studentId
        });

        await student.save();
        res.json({ success: true, student });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update a student
router.put('/:id', verifyToken, requireOwner, async (req: AuthRequest, res) => {
    try {
        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, instituteId: req.user?.instituteId },
            req.body,
            { new: true }
        );
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json(student);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a student
router.delete('/:id', verifyToken, requireOwner, async (req: AuthRequest, res) => {
    try {
        const student = await Student.findOneAndDelete({ _id: req.params.id, instituteId: req.user?.instituteId });
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
