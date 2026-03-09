import mongoose from 'mongoose';

const instituteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    planExpiresAt: { type: Date },
}, { timestamps: true });

export const Institute = mongoose.model('Institute', instituteSchema);
