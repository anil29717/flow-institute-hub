import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { User } from './models/User';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/instiflow';

async function seedAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'admin@instiflow.com';

        const passwordHash = await bcrypt.hash('admin123', 10);

        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            existingAdmin.password = passwordHash;
            await existingAdmin.save();
            console.log(`✅ Admin user with email ${email} already exists. Password has been reset to "admin123".`);
            process.exit(0);
        }

        const admin = new User({
            email,
            password: passwordHash,
            firstName: 'Super',
            lastName: 'Admin',
            role: 'admin',
        });

        await admin.save();
        console.log(`✅ Admin user seeded successfully!`);
        console.log(`Email: ${email}`);
        console.log(`Password: admin123`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin user:', error);
        process.exit(1);
    }
}

seedAdmin();
