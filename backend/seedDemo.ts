import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { User } from './models/User';
import { Institute } from './models/Institute';
import { Teacher } from './models/Teacher';
import { Student } from './models/Student';
import { Plan } from './models/Plan';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/instiflow';

async function seedDemoData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB for seeding');

        // 1. Find the free plan
        let freePlan = await Plan.findOne(); // Assumes user created a free plan
        if (!freePlan) {
            console.log('⚠️ No plan found! Creating a default Free Plan...');
            freePlan = new Plan({
                name: 'Free Plan',
                price: 0,
                maxStudents: 50,
                maxTeachers: 5,
                maxDays: 365,
                features: ['Basic Features']
            });
            await freePlan.save();
        }

        const passwordHash = await bcrypt.hash('password123', 10);

        for (let i = 1; i <= 2; i++) {
            const instCode = `DEMO${i}`;

            // Check if institute already exists
            let existingInst = await Institute.findOne({ code: instCode });
            if (existingInst) {
                console.log(`Institute ${instCode} already exists. Skipping...`);
                continue;
            }

            // A. Create Owner
            const ownerEmail = `owner${i}@demo.com`;
            let owner = await User.findOne({ email: ownerEmail });
            if (!owner) {
                owner = new User({
                    email: ownerEmail,
                    password: passwordHash,
                    firstName: `Demo`,
                    lastName: `Owner ${i}`,
                    role: 'owner'
                });
                await owner.save();
            }

            // B. Create Institute
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + freePlan.maxDays);

            const institute = new Institute({
                name: `Demo Institute ${i}`,
                code: instCode,
                address: `123 Demo St, City ${i}`,
                phone: `987654321${i}`,
                email: `info@demo${i}.com`,
                ownerUserId: owner._id,
                isApproved: true,
                isActive: true,
                planId: freePlan._id,
                planExpiresAt: expiry
            });
            await institute.save();

            // Link owner to institute
            owner.instituteId = institute._id;
            await owner.save();

            console.log(`✅ Created Institute: ${institute.name}`);

            // C. Create 2 Teachers
            for (let t = 1; t <= 2; t++) {
                const teacherEmail = `teacher${t}.inst${i}@demo.com`;
                let tUser = await User.findOne({ email: teacherEmail });
                if (!tUser) {
                    tUser = new User({
                        email: teacherEmail,
                        password: passwordHash,
                        firstName: `Teacher ${t}`,
                        lastName: `Inst ${i}`,
                        role: 'teacher',
                        instituteId: institute._id
                    });
                    await tUser.save();
                }

                const teacherRec = new Teacher({
                    userId: tUser._id,
                    instituteId: institute._id,
                    employeeId: `T-${instCode}-${t}`,
                    qualification: ['B.Ed', 'M.Sc'][t - 1] || 'B.A.',
                    specialization: ['Mathematics', 'Science'][t - 1] || 'English',
                    experienceYears: 2 + t
                });
                await teacherRec.save();
            }
            console.log(`   - Added 2 Teachers to Institute ${i}`);

            // D. Create 10 Students
            for (let s = 1; s <= 10; s++) {
                const student = new Student({
                    firstName: `Student ${s}`,
                    lastName: `Inst ${i}`,
                    email: `student${s}.inst${i}@demo.com`,
                    phone: `555000${i}${s.toString().padStart(2, '0')}`,
                    instituteId: institute._id,
                    studentId: `S-${instCode}-${s.toString().padStart(3, '0')}`,
                    parentName: `Parent of ${s}`,
                    parentPhone: `555111${i}${s.toString().padStart(2, '0')}`,
                    address: `${s} Student Lane`,
                    totalFees: 5000,
                    feesPaid: 0,
                    feeStatus: 'pending',
                    isActive: true
                });
                await student.save();
            }
            console.log(`   - Added 10 Students to Institute ${i}`);
        }

        console.log('🎉 Demo data seeded successfully!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error seeding data:', err);
        process.exit(1);
    }
}

seedDemoData();
