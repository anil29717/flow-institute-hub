import mongoose from 'mongoose';

const markSchema = new mongoose.Schema({
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: String, required: true },
    marksObtained: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    remarks: { type: String },
}, { timestamps: true });

// Ensure one mark entry per student per test per subject
markSchema.index({ testId: 1, studentId: 1, subject: 1 }, { unique: true });

export const Mark = mongoose.model('Mark', markSchema);
