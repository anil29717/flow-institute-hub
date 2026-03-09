import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    employeeId: { type: String, required: true, unique: true },
    qualification: { type: String },
    specialization: [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    joinDate: { type: Date, default: Date.now },
}, { timestamps: true });

export const Teacher = mongoose.model('Teacher', teacherSchema);
