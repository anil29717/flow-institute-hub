import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    name: { type: String, required: true },
    subject: { type: String, required: true },
    totalMarks: { type: Number, default: 100 },
    testDate: { type: Date, required: true },
    testTime: { type: String },
    batchIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
    studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const Test = mongoose.model('Test', testSchema);
