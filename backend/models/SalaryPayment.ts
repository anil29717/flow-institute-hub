import mongoose from 'mongoose';

const salaryPaymentSchema = new mongoose.Schema({
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    periodLabel: { type: String }, // e.g. "March 2026"
    paymentMode: { type: String, enum: ['cash', 'bank_transfer', 'cheque', 'upi', 'other'], default: 'bank_transfer' },
    notes: { type: String },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const SalaryPayment = mongoose.model('SalaryPayment', salaryPaymentSchema);
