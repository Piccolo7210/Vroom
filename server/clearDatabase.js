import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Driver from './models/Driver.js';
import Customer from './models/Customer.js';
import Ride from './models/Ride.js';

dotenv.config();

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all collections
    await Driver.deleteMany({});
    await Customer.deleteMany({});
    await Ride.deleteMany({});
    
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

clearDatabase();
