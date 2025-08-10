import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

// Load environment variables
dotenv.config({ path: './.env' }); // Adjust path if needed

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    seedAdmins();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const seedAdmins = async () => {
  try {
    const admin = [
      {
        name: 'Admin',
        userName: 'admin',
        email: 'admin@gmail.com',
        password: await bcrypt.hash('admin123', 10),
      },
    ];

    await Admin.deleteMany({});
    await Admin.insertMany(admin);
    console.log('Admins seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};
