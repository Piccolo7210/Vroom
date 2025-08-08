import mongoose from 'mongoose';
import Driver from './models/Driver.js';
import Earnings from './models/Earnings.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

async function testEarningsEndpoint() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a driver with earnings data
    const earningsWithDriver = await Earnings.findOne().populate('driver');
    if (!earningsWithDriver) {
      console.log('No earnings records found');
      return;
    }

    console.log('Found earnings record:');
    console.log('- Driver ID:', earningsWithDriver.driver._id);
    console.log('- Driver name:', earningsWithDriver.driver.name);
    console.log('- Earnings amount:', earningsWithDriver.driver_earnings);
    console.log('- Date:', earningsWithDriver.date);

    // Generate a JWT token for this driver
    const driverId = earningsWithDriver.driver._id;
    const token = jwt.sign(
      { id: driverId, role: 'driver' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    console.log('\nGenerated token for driver:', driverId);
    console.log('Token:', token);

    // Test the earnings query directly
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = now;

    console.log('\nQuerying earnings with date range:');
    console.log('Start:', startDate);
    console.log('End:', endDate);

    const driverObjectId = new mongoose.Types.ObjectId(driverId);
    const earnings = await Earnings.find({
      driver: driverObjectId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    console.log('\nFound earnings in current month:', earnings.length);
    
    // Try without date filter
    const allDriverEarnings = await Earnings.find({
      driver: driverObjectId
    });

    console.log('Total earnings for driver:', allDriverEarnings.length);

    if (allDriverEarnings.length > 0) {
      console.log('\nSample earnings:');
      allDriverEarnings.slice(0, 3).forEach((earning, index) => {
        console.log(`${index + 1}. Date: ${earning.date}, Amount: ${earning.driver_earnings}`);
      });
    }

    // Now test the API endpoint for different periods
    console.log('\n=== Testing API Endpoint ===');
    
    // Test month
    let response = await fetch('http://localhost:5000/api/rides/driver/earnings?period=month', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    let result = await response.json();
    console.log('Month API Response:', JSON.stringify(result, null, 2));

    // Test year 
    response = await fetch('http://localhost:5000/api/rides/driver/earnings?period=year', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    result = await response.json();
    console.log('\nYear API Response:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testEarningsEndpoint();
