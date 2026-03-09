import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    studentId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    guardianName: { type: String },
    guardianPhone: { type: String },
    school: { type: String },
    class: { type: String },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    feeStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
    totalFees: { type: Number, default: 0 },
    feesPaid: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Student = mongoose.model('Student', studentSchema);
