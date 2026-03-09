import express from 'express';
import { Course } from '../models/Course';
import { verifyToken, requireOwner, AuthRequest } from '../middlewares/auth';

const router = express.Router();

router.get('/', verifyToken, async (req: AuthRequest, res) => {
    try {
        const courses = await Course.find({ instituteId: req.user?.instituteId });
        res.json(courses);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', verifyToken, requireOwner, async (req: AuthRequest, res) => {
    try {
        const course = new Course({ ...req.body, instituteId: req.user?.instituteId });
        await course.save();
        res.json(course);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
