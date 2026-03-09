import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    name: { type: String, required: true },
    description: { type: String },
    durationWeeks: { type: Number, default: 1 },
    totalFee: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Course = mongoose.model('Course', courseSchema);
