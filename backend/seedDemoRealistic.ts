import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { User } from './models/User';
import { Institute } from './models/Institute';
import { Teacher } from './models/Teacher';
import { Student } from './models/Student';
import { Plan } from './models/Plan';
import { Course } from './models/Course';
import { Batch } from './models/Batch';
import { Attendance } from './models/Attendance';
import { FeePayment } from './models/FeePayment';
import { SalaryPayment } from './models/SalaryPayment';
import { Test } from './models/Test';
import { Mark } from './models/Mark';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/instiflow';

async function seedRealisticDemo() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB for realistic seeding');

        // 1. Ensure Free Plan exists
        let freePlan = await Plan.findOne();
        if (!freePlan) {
            freePlan = new Plan({ name: 'Pro Plan', price: 999, maxStudents: 500, maxTeachers: 50, maxDays: 365 });
            await freePlan.save();
        }

        const passwordHash = await bcrypt.hash('password123', 10);
        const instCode = `DEMO-REAL`;

        // Clean old realistic demo if exists
        const oldInst = await Institute.findOne({ code: instCode });
        if (oldInst) {
            console.log('Cleaning up old realistic demo data...');
            await Student.deleteMany({ instituteId: oldInst._id });
            await Teacher.deleteMany({ instituteId: oldInst._id });
            await Course.deleteMany({ instituteId: oldInst._id });
            await Batch.deleteMany({ instituteId: oldInst._id });
            await Attendance.deleteMany({ instituteId: oldInst._id });
            await FeePayment.deleteMany({ instituteId: oldInst._id });
            await SalaryPayment.deleteMany({ instituteId: oldInst._id });

            const oldTests = await Test.find({ instituteId: oldInst._id });
            await Mark.deleteMany({ testId: { $in: oldTests.map(t => t._id) } });
            await Test.deleteMany({ instituteId: oldInst._id });
            await User.deleteMany({ $or: [{ instituteId: oldInst._id }, { _id: oldInst.ownerUserId }] });
            await oldInst.deleteOne();
        }

        // A. Owner
        const ownerEmail = `owner@demoreal.com`;
        const owner = new User({ email: ownerEmail, password: passwordHash, firstName: `Demo`, lastName: `Owner`, role: 'owner' });
        await owner.save();

        // B. Institute
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 365);
        const institute = new Institute({
            name: `Global Academy Demo`,
            code: instCode,
            address: `456 Main Street, Tech City`,
            phone: `9876543210`,
            email: `contact@globalacademy.demo`,
            ownerUserId: owner._id,
            isApproved: true,
            isActive: true,
            planId: freePlan._id,
            planExpiresAt: expiry
        });
        await institute.save();

        owner.instituteId = institute._id;
        await owner.save();
        console.log(`✅ Created Institute: Global Academy Demo (Owner: ${ownerEmail})`);

        // C. Courses
        const courses = await Course.insertMany([
            { instituteId: institute._id, name: 'Foundation Mathematics', description: 'Basic math principles', durationWeeks: 12, totalFee: 15000 },
            { instituteId: institute._id, name: 'Advanced Physics', description: 'Quantum and mechanics', durationWeeks: 16, totalFee: 20000 },
        ]);
        console.log(`✅ Created Courses: ${courses.map(c => c.name).join(', ')}`);

        // D. Teachers
        const teacherUsers = await User.insertMany([
            { email: `math.teacher@demoreal.com`, password: passwordHash, firstName: `Alice`, lastName: `Smith`, role: 'teacher', instituteId: institute._id },
            { email: `physics.teacher@demoreal.com`, password: passwordHash, firstName: `Bob`, lastName: `Johnson`, role: 'teacher', instituteId: institute._id }
        ]);

        const teachers = await Teacher.insertMany([
            { userId: teacherUsers[0]._id, instituteId: institute._id, employeeId: `T-001`, qualification: 'M.Sc Math', specialization: ['Mathematics'], experienceYears: 5 },
            { userId: teacherUsers[1]._id, instituteId: institute._id, employeeId: `T-002`, qualification: 'Ph.D Physics', specialization: ['Physics'], experienceYears: 8 }
        ]);
        console.log(`✅ Created 2 Teachers: Alice (Math), Bob (Physics)`);

        // E. Batches
        const today = new Date();
        const nextMonth = new Date(); nextMonth.setMonth(nextMonth.getMonth() + 3);

        const batches = await Batch.insertMany([
            { instituteId: institute._id, courseId: courses[0]._id, name: 'Math Morning', teacherId: teachers[0]._id, startDate: today, endDate: nextMonth, maxStudents: 20, status: 'ongoing' },
            { instituteId: institute._id, courseId: courses[0]._id, name: 'Math Evening', teacherId: teachers[0]._id, startDate: today, endDate: nextMonth, maxStudents: 20, status: 'ongoing' },
            { instituteId: institute._id, courseId: courses[1]._id, name: 'Physics Weekend', teacherId: teachers[1]._id, startDate: today, endDate: nextMonth, maxStudents: 30, status: 'ongoing' },
        ]);
        console.log(`✅ Created 3 Batches assigned to respective teachers`);

        // F. Students (10 total, spread across batches)
        const studentNames = ['Charlie', 'Dana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Kevin', 'Liam'];
        const students = [];
        for (let i = 0; i < 10; i++) {
            const batch = batches[i % 3]; // Round robin across the 3 batches
            const course = courses.find(c => c._id.toString() === batch.courseId.toString());

            // Random fee payment logic
            const paid = i % 3 === 0 ? course!.totalFee : (i % 2 === 0 ? course!.totalFee / 2 : 0);
            const status = paid === 0 ? 'pending' : (paid === course!.totalFee ? 'paid' : 'partial');

            const st = new Student({
                instituteId: institute._id,
                batchId: batch._id,
                courseId: batch.courseId,
                firstName: studentNames[i],
                lastName: `Doe`,
                email: `${studentNames[i].toLowerCase()}@demoreal.com`,
                phone: `99988877${i.toString().padStart(2, '0')}`,
                studentId: `S-00${i + 1}`,
                totalFees: course!.totalFee,
                feesPaid: paid,
                feeStatus: status,
                isActive: true
            });
            await st.save();
            students.push(st);

            batch.currentStudents = (batch.currentStudents || 0) + 1;
            await batch.save();
        }
        console.log(`✅ Created 10 Students enrolled in different batches`);

        // G. Fee Payments
        const feeRecords = [];
        for (const st of students) {
            if (st.feesPaid > 0) {
                feeRecords.push({
                    instituteId: institute._id,
                    studentId: st._id,
                    amount: st.feesPaid,
                    paymentMode: 'upi',
                    referenceNo: `TXN-${Math.floor(Math.random() * 100000)}`,
                    collectedBy: owner._id
                });
            }
        }
        await FeePayment.insertMany(feeRecords);
        console.log(`✅ Created ${feeRecords.length} Fee payment records`);

        // H. Salary Payments
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const salaryRecords = teachers.map(t => ({
            instituteId: institute._id,
            teacherId: t._id,
            amount: 40000 + (t === teachers[1] ? 10000 : 0),
            paymentDate: new Date(),
            periodLabel: lastMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
            paymentMode: 'bank_transfer',
            paidBy: owner._id
        }));
        await SalaryPayment.insertMany(salaryRecords);
        console.log(`✅ Created ${salaryRecords.length} Salary records for the teachers`);

        // I. Attendance (Past 5 days)
        const attendanceRecords = [];
        for (let d = 0; d < 5; d++) {
            const date = new Date();
            date.setDate(date.getDate() - d);
            date.setHours(0, 0, 0, 0);

            // Students attendance
            for (const st of students) {
                attendanceRecords.push({
                    instituteId: institute._id,
                    batchId: st.batchId,
                    studentId: st._id,
                    date: date,
                    status: Math.random() > 0.1 ? 'present' : 'absent', // 90% present
                    markedBy: owner._id
                });
            }
        }
        await Attendance.insertMany(attendanceRecords);
        console.log(`✅ Created ${attendanceRecords.length} Attendance records for students over the last 5 days`);

        // J. Tests and Marks
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 10);

        const test1 = new Test({
            instituteId: institute._id,
            name: 'Mid-Term Mathematics',
            subject: 'Mathematics',
            totalMarks: 100,
            testDate: pastDate,
            testTime: '10:00 AM',
            batchIds: [batches[0]._id, batches[1]._id],
            createdBy: teacherUsers[0]._id
        });
        await test1.save();

        const test2 = new Test({
            instituteId: institute._id,
            name: 'Mid-Term Physics',
            subject: 'Physics',
            totalMarks: 100,
            testDate: pastDate,
            testTime: '02:00 PM',
            batchIds: [batches[2]._id],
            createdBy: teacherUsers[1]._id
        });
        await test2.save();
        console.log(`✅ Created 2 Tests by teachers`);

        const markRecords = [];
        for (const st of students) {
            let testIdsForStudent = [];
            // Assign marks based on batch enrolled
            if (st.batchId?.toString() === batches[0]._id.toString() || st.batchId?.toString() === batches[1]._id.toString()) {
                testIdsForStudent.push({ testId: test1._id, subject: 'Mathematics' });
            } else if (st.batchId?.toString() === batches[2]._id.toString()) {
                testIdsForStudent.push({ testId: test2._id, subject: 'Physics' });
            }

            for (const t of testIdsForStudent) {
                markRecords.push({
                    testId: t.testId,
                    studentId: st._id,
                    subject: t.subject,
                    totalMarks: 100,
                    marksObtained: Math.floor(Math.random() * 61) + 40, // Random marks between 40 and 100
                    remarks: 'Demo generated mark'
                });
            }
        }
        await Mark.insertMany(markRecords);
        console.log(`✅ Created ${markRecords.length} Mark records for students`);

        console.log('\n🎉 Realistic Demo Data Generation Complete!');
        console.log('--------------------------------------------------');
        console.log('Login Credentials:');
        console.log(`Owner: owner@demoreal.com | Password: password123`);
        console.log(`Teacher 1: math.teacher@demoreal.com | Password: password123`);
        console.log(`Teacher 2: physics.teacher@demoreal.com | Password: password123`);
        console.log('--------------------------------------------------');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error generating data:', err);
        process.exit(1);
    }
}

seedRealisticDemo();
