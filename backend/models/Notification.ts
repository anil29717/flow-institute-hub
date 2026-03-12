import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['info', 'success', 'warning', 'error'], 
        default: 'info' 
    },
    isRead: { type: Boolean, default: false },
    link: { type: String }, // Optional link to redirect user
}, { timestamps: true });

// Index for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
