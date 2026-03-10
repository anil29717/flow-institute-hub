import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Institute } from '../models/Institute';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123';

// Helper to generate JWT
const generateToken = (user: any) => {
    return jwt.sign(
        { userId: user._id, role: user.role, instituteId: user.instituteId },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// 1. Seed Admin
router.post('/seed-admin', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new User({ email, password: hashedPassword, firstName, lastName, role: 'admin' });

        await admin.save();
        return res.json({ success: true, user: admin });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

// 2. Register Owner
router.post('/register-owner', async (req, res) => {
    try {
        const {
            instituteName, address, phone, instituteEmail,
            ownerEmail, ownerPassword, ownerFirstName, ownerLastName, ownerPhone
        } = req.body;

        if (!instituteName || !ownerEmail || !ownerPassword || !ownerFirstName || !ownerLastName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (ownerPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        let code = '';
        let isUnique = false;
        while (!isUnique) {
            // Generate a random 6-character alphanumeric code
            code = Math.random().toString(36).substring(2, 8).toUpperCase();
            const existingInst = await Institute.findOne({ code });
            if (!existingInst) isUnique = true;
        }

        const existingUser = await User.findOne({ email: ownerEmail });
        if (existingUser) return res.status(400).json({ error: 'Email already registered' });

        // Hash password and save user
        const hashedPassword = await bcrypt.hash(ownerPassword, 10);
        const owner = new User({
            email: ownerEmail,
            password: hashedPassword,
            firstName: ownerFirstName,
            lastName: ownerLastName,
            phone: ownerPhone,
            role: 'owner'
        });
        await owner.save();

        // Save institute
        const institute = new Institute({
            name: instituteName,
            code,
            address,
            phone,
            email: instituteEmail,
            ownerUserId: owner._id,
            isApproved: false,
        });
        await institute.save();

        // Link user to institute
        owner.instituteId = institute._id;
        await owner.save();

        return res.json({ success: true, instituteId: institute._id });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

// 3. Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        // Plan validation logic if owner/teacher
        if (user.role !== 'admin' && user.instituteId) {
            const institute = await Institute.findById(user.instituteId);
            if (!institute) return res.status(400).json({ error: 'Institute not found' });
            if (!institute.isApproved) return res.status(403).json({ error: 'Institute not approved yet' });
            if (!institute.isActive) return res.status(403).json({ error: 'Institute is deactivated' });
            if (institute.planExpiresAt && new Date(institute.planExpiresAt).getTime() < Date.now()) {
                return res.status(403).json({ error: 'NO_ACTIVE_PLAN' });
            }
        }

        const token = generateToken(user);
        return res.json({ token, role: user.role, instituteId: user.instituteId });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

// 4. Get Current User (Me)
import { verifyToken, AuthRequest } from '../middlewares/auth';
router.get('/me', verifyToken, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.user?.userId).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });

        return res.json({
            id: user._id,
            email: user.email,
            role: user.role,
            first_name: user.firstName,
            last_name: user.lastName,
            institute_id: user.instituteId
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Update Current User (Me)
router.put('/me', verifyToken, async (req: AuthRequest, res) => {
    try {
        const { firstName, lastName, password } = req.body;
        const updateData: any = {};

        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (password) {
            if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await User.findByIdAndUpdate(req.user?.userId, updateData, { new: true }).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });

        return res.json({
            id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            instituteId: user.instituteId
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
