import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    maxStudents: { type: Number, required: true },
    maxTeachers: { type: Number, required: true },
    maxDays: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Plan = mongoose.model('Plan', planSchema);
