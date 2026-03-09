import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { Teacher } from '../models/Teacher';
import { verifyToken, requireOwner, AuthRequest } from '../middlewares/auth';

const router = express.Router();

// GET current teacher profile
router.get('/me', verifyToken, async (req: AuthRequest, res) => {
    try {
        if (req.user?.role !== 'teacher') return res.status(403).json({ error: 'Access denied' });

        const teacher = await Teacher.findOne({ userId: req.user.userId })
            .populate('userId', 'firstName lastName email phone')
            .lean();

        if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

        res.json({
            profile: {
                id: (teacher.userId as any)._id,
                firstName: (teacher.userId as any).firstName,
                lastName: (teacher.userId as any).lastName,
                email: (teacher.userId as any).email,
                phone: (teacher.userId as any).phone
            },
            teacher: {
                id: teacher._id,
                employeeId: teacher.employeeId,
                qualification: teacher.qualification,
                specialization: teacher.specialization,
                experienceYears: teacher.experienceYears,
                joinDate: teacher.joinDate
            }
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET all teachers for an institute (or all if admin)
router.get('/', verifyToken, async (req: AuthRequest, res) => {
    try {
        const filter: any = {};
        if (req.user?.role !== 'admin') {
            filter.instituteId = req.user?.instituteId;
        } else if (req.query.instituteId) {
            filter.instituteId = req.query.instituteId;
        }

        const teachers = await Teacher.find(filter)
            .populate('userId', 'firstName lastName email phone isActive')
            .populate('instituteId', 'name')
            .lean();

        const formatted = teachers.map((t: any) => ({
            id: t._id,
            userId: t.userId?._id,
            employeeId: t.employeeId,
            firstName: t.userId?.firstName,
            lastName: t.userId?.lastName,
            email: t.userId?.email,
            phone: t.userId?.phone,
            qualification: t.qualification,
            specialization: t.specialization,
            experienceYears: t.experienceYears,
            isActive: t.userId?.isActive,
            instituteName: t.instituteId?.name
        }));

        res.json(formatted);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST register a new teacher (Owner only)
router.post('/', verifyToken, requireOwner, async (req: AuthRequest, res) => {
    try {
        const { firstName, lastName, email, phone, password, qualification, specialization, experienceYears } = req.body;

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already exists.' });

        const hashedPassword = await bcrypt.hash(password || '123456', 10);
        const user = new User({
            email, password: hashedPassword, firstName, lastName, phone, role: 'teacher', instituteId: req.user?.instituteId
        });
        await user.save();

        const teacherCount = await Teacher.countDocuments({ instituteId: req.user?.instituteId });
        const employeeId = `TEA-${teacherCount + 1000}`;

        const teacher = new Teacher({
            userId: user._id,
            instituteId: req.user?.instituteId,
            employeeId,
            qualification,
            specialization,
            experienceYears
        });
        await teacher.save();

        res.json({ success: true, teacher });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
