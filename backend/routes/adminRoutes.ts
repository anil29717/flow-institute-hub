import express from 'express';
import bcrypt from 'bcrypt';
import { Institute } from '../models/Institute';
import { Plan } from '../models/Plan';
import { User } from '../models/User';
import { Student } from '../models/Student';
import { Notification } from '../models/Notification';
import { verifyToken, requireAdmin, AuthRequest } from '../middlewares/auth';

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get('/institutes', async (req, res) => {
    try {
        const institutes = await Institute.find().populate('planId');
        res.json(institutes);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/plans', async (req, res) => {
    try {
        const plans = await Plan.find().sort({ price: 1 });
        res.json(plans);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/institutes/usage', async (req, res) => {
    try {
        const students = await Student.aggregate([{ $group: { _id: '$instituteId', count: { $sum: 1 } } }]);
        const teachers = await User.aggregate([{ $match: { role: 'teacher' } }, { $group: { _id: '$instituteId', count: { $sum: 1 } } }]);

        const usage = [];
        const institutes = await Institute.find();
        for (const inst of institutes) {
            const studentCount = students.find((s: any) => s._id?.toString() === inst._id.toString())?.count || 0;
            const teacherCount = teachers.find((t: any) => t._id?.toString() === inst._id.toString())?.count || 0;
            usage.push({ instituteId: inst._id, students: studentCount, teachers: teacherCount });
        }
        res.json(usage);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const totalInstitutes = await Institute.countDocuments();
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        res.json({ totalInstitutes, totalTeachers });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/institutes/:id/approve', async (req, res) => {
    try {
        const { isApproved } = req.body;
        const inst = await Institute.findByIdAndUpdate(req.params.id, { isApproved }, { new: true });
        
        if (inst && isApproved && inst.ownerUserId) {
            // Notify the owner
            await Notification.create({
                userId: inst.ownerUserId,
                title: 'Institute Approved! 🎉',
                message: `Congratulations! Your institute "${inst.name}" has been approved. You can now access all features.`,
                type: 'success',
                link: '/dashboard'
            });
        }
        
        res.json(inst);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/institutes/:id/plan', async (req, res) => {
    try {
        const { planId } = req.body;
        const inst = await Institute.findById(req.params.id);
        if (!inst) return res.status(404).json({ error: 'Institute not found' });

        if (planId) {
            const plan = await Plan.findById(planId);
            if (!plan) return res.status(404).json({ error: 'Plan not found' })
            inst.planId = plan._id;
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + plan.maxDays);
            inst.planExpiresAt = expiry;
        } else {
            inst.planId = undefined;
            inst.planExpiresAt = undefined;
        }
        await inst.save();
        res.json(inst);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/institutes/:id/plan-history', async (req, res) => {
    res.json([]); // Plan history placeholder
});

router.put('/institutes/:id/reset-password', async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        const inst = await Institute.findById(req.params.id);
        if (!inst || !inst.ownerUserId) {
            return res.status(404).json({ error: 'Institute or Owner not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(inst.ownerUserId, { password: hashedPassword });

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/institutes', async (req, res) => {
    try {
        const {
            instituteName, address, phone, instituteEmail,
            ownerEmail, ownerPassword, ownerFirstName, ownerLastName
        } = req.body;

        let code = '';
        let isUnique = false;
        while (!isUnique) {
            code = Math.random().toString(36).substring(2, 8).toUpperCase();
            const existingInst = await Institute.findOne({ code });
            if (!existingInst) isUnique = true;
        }

        const existingUser = await User.findOne({ email: ownerEmail });
        if (existingUser) return res.status(400).json({ error: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(ownerPassword, 10);
        const owner = new User({
            email: ownerEmail,
            password: hashedPassword,
            firstName: ownerFirstName,
            lastName: ownerLastName,
            role: 'owner'
        });
        await owner.save();

        const institute = new Institute({
            name: instituteName,
            code,
            address,
            phone,
            email: instituteEmail,
            ownerUserId: owner._id,
            isApproved: true, // Auto approve when admin creates
        });
        await institute.save();

        owner.instituteId = institute._id;
        await owner.save();

        res.json({ success: true, instituteId: institute._id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/password', async (req: AuthRequest, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }

        const adminUser = await User.findById(req.user?.userId);
        if (!adminUser) {
            return res.status(404).json({ error: 'Admin user not found' });
        }

        const isValid = await bcrypt.compare(currentPassword, adminUser.password);
        if (!isValid) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        adminUser.password = hashedPassword;
        await adminUser.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
