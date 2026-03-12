import express from 'express';
import { Notification } from '../models/Notification';
import { verifyToken, AuthRequest } from '../middlewares/auth';

const router = express.Router();

router.use(verifyToken);

// GET all notifications for the current user
router.get('/', async (req: AuthRequest, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user?.userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET unread count
router.get('/unread-count', async (req: AuthRequest, res) => {
    try {
        const count = await Notification.countDocuments({ 
            userId: req.user?.userId, 
            isRead: false 
        });
        res.json({ count });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH mark as read
router.patch('/:id/read', async (req: AuthRequest, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user?.userId },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ error: 'Notification not found' });
        res.json(notification);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH mark all as read
router.patch('/read-all', async (req: AuthRequest, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user?.userId, isRead: false },
            { isRead: true }
        );
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a notification
router.delete('/:id', async (req: AuthRequest, res) => {
    try {
        const notification = await Notification.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.user?.userId 
        });
        if (!notification) return res.status(404).json({ error: 'Notification not found' });
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
