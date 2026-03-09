import mongoose from 'mongoose';

const feePaymentSchema = new mongoose.Schema({
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMode: { type: String, enum: ['cash', 'upi', 'bank_transfer', 'card', 'other'], default: 'cash' },
    referenceNo: { type: String },
    remarks: { type: String },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const FeePayment = mongoose.model('FeePayment', feePaymentSchema);
