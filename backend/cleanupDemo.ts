import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User';
import { Institute } from './models/Institute';
import { Teacher } from './models/Teacher';
import { Student } from './models/Student';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/instiflow';

async function cleanupDemoData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB for cleanup');

        const demoInstitutes = await Institute.find({ code: { $in: ['DEMO1', 'DEMO2'] } });

        for (const inst of demoInstitutes) {
            console.log(`Cleaning up ${inst.name}...`);

            // Delete Students
            const studentResult = await Student.deleteMany({ instituteId: inst._id });
            console.log(`   - Deleted ${studentResult.deletedCount} students`);

            // Delete Teachers
            const teacherResult = await Teacher.deleteMany({ instituteId: inst._id });
            console.log(`   - Deleted ${teacherResult.deletedCount} teacher records`);

            // Delete Users (Teachers and Owner)
            // The owner's email ends with @demo.com, teachers with @demo.com
            const userResult = await User.deleteMany({
                $or: [
                    { instituteId: inst._id },
                    { _id: inst.ownerUserId }
                ]
            });
            console.log(`   - Deleted ${userResult.deletedCount} user accounts (teachers + owner)`);

            // Delete Institute
            await Institute.findByIdAndDelete(inst._id);
            console.log(`✅ Removed Institute: ${inst.name}`);
        }

        console.log('🎉 Demo data cleaned up successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error cleaning up data:', err);
        process.exit(1);
    }
}

cleanupDemoData();
