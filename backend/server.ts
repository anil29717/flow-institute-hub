import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron'; // <-- Import node-cron
import authRoutes from './routes/authRoutes';
import instituteRoutes from './routes/instituteRoutes';
import teacherRoutes from './routes/teacherRoutes';
import studentRoutes from './routes/studentRoutes';
import batchRoutes from './routes/batchRoutes';
import courseRoutes from './routes/courseRoutes';

import attendanceRoutes from './routes/attendanceRoutes';
import feeRoutes from './routes/feeRoutes';
import salaryRoutes from './routes/salaryRoutes';
import testRoutes from './routes/testRoutes';
import leaveRoutes from './routes/leaveRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import planRoutes from './routes/planRoutes';
import adminRoutes from './routes/adminRoutes';
import notificationRoutes from './routes/notificationRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/institutes', instituteRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'InstiFlow API is running' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/instiflow';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);

            // --- CRON JOB: Keep-Alive ---
            // Runs every 10 minutes (*/10 * * * *)
            cron.schedule('*/10 * * * *', () => {
                console.log('⏰ Running self-ping cron job to keep Render awake...');
                // You can change localhost to your actual Render URL if needed, 
                // but pinging localhost directly from the server itself also works!
                fetch(`http://localhost:${PORT}/api/health`)
                    .then(res => res.json())
                    .then(data => console.log(' Self-ping successful:', data.status))
                    .catch(err => console.error(' Self-ping failed:', err.message));
            });
            console.log('⏱️  Keep-alive cron job initialized (runs every 10 mins).');
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });
