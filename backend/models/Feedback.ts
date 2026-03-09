import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String },
    reviewerName: { type: String },
    reviewDate: { type: Date, default: Date.now },
}, { timestamps: true });

export const Feedback = mongoose.model('Feedback', feedbackSchema);
