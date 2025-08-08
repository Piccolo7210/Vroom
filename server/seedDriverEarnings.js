import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Driver from './models/Driver.js';
import Customer from './models/Customer.js';
import Ride from './models/Ride.js';
import Earnings from './models/Earnings.js';

dotenv.config();

const seedDriverEarnings = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a test driver if doesn't exist
    const testDriverEmail = 'testdriver@example.com';
    let driver = await Driver.findOne({ email: testDriverEmail });
    
    if (!driver) {
      console.log('Creating test driver...');
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      driver = await Driver.create({
        name: 'Test Driver',
        userName: 'testdriver',
        email: testDriverEmail,
        password: hashedPassword,
        phone: '+1234567890',
        age: 30,
        vehicle_type: 'car',
        vehicle_no: 'ABC-123',
        license_no: 'DL12345678',
        sex: 'male',
        present_address: 'Test Address, Test City'
      });
      console.log('Test driver created:', driver._id);
    } else {
      console.log('Test driver already exists:', driver._id);
    }

    // Create a test customer if doesn't exist
    const testCustomerEmail = 'testcustomer@example.com';
    let customer = await Customer.findOne({ email: testCustomerEmail });
    
    if (!customer) {
      console.log('Creating test customer...');
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      customer = await Customer.create({
        name: 'Test Customer',
        userName: 'testcustomer',
        email: testCustomerEmail,
        password: hashedPassword,
        phone: '+1234567891',
        age: 25,
        sex: 'Female',
        present_address: 'Customer Address, Test City'
      });
      console.log('Test customer created:', customer._id);
    } else {
      console.log('Test customer already exists:', customer._id);
    }

    // Create some sample completed rides
    console.log('Creating sample rides...');
    const sampleRides = [];
    
    for (let i = 0; i < 10; i++) {
      const daysAgo = Math.floor(Math.random() * 30); // Random day in the last 30 days
      const rideDate = new Date();
      rideDate.setDate(rideDate.getDate() - daysAgo);
      
      const baseFare = 50 + Math.random() * 200; // 50-250 BDT base fare
      const distanceFare = Math.random() * 100; // 0-100 BDT distance fare
      const totalFare = baseFare + distanceFare;
      const distance = 2 + Math.random() * 20; // 2-22 km
      
      const ride = await Ride.create({
        customer: customer._id,
        driver: driver._id,
        pickup_location: {
          address: `Pickup Location ${i + 1}, Dhaka`,
          coordinates: {
            latitude: 23.8103 + (Math.random() - 0.5) * 0.1,
            longitude: 90.4125 + (Math.random() - 0.5) * 0.1
          }
        },
        destination: {
          address: `Destination ${i + 1}, Dhaka`,
          coordinates: {
            latitude: 23.8103 + (Math.random() - 0.5) * 0.1,
            longitude: 90.4125 + (Math.random() - 0.5) * 0.1
          }
        },
        vehicle_type: driver.vehicle_type,
        payment_method: Math.random() > 0.5 ? 'cash' : 'bkash',
        fare: {
          base_fare: baseFare,
          distance_fare: distanceFare,
          time_fare: 20,
          surge_multiplier: 1,
          total_fare: totalFare
        },
        distance: distance,
        estimated_duration: Math.ceil(distance * 3), // Rough estimate: 3 min per km
        actual_duration: Math.ceil(distance * 3) + Math.floor(Math.random() * 10),
        status: 'completed',
        otp: '1234',
        createdAt: rideDate,
        ride_started_at: new Date(rideDate.getTime() + 5 * 60000), // 5 min after creation
        ride_completed_at: new Date(rideDate.getTime() + 15 * 60000) // 15 min after creation
      });
      
      sampleRides.push(ride);
    }
    
    console.log(`Created ${sampleRides.length} sample rides`);

    // Create earnings records for each completed ride
    console.log('Creating earnings records...');
    
    for (const ride of sampleRides) {
      const platformCommission = ride.fare.total_fare * 0.15; // 15% commission
      const driverEarnings = ride.fare.total_fare - platformCommission;
      
      await Earnings.create({
        driver: driver._id,
        ride: ride._id,
        date: ride.ride_completed_at,
        total_fare: ride.fare.total_fare,
        platform_commission: platformCommission,
        driver_earnings: driverEarnings,
        trip_count: 1,
        vehicle_type: ride.vehicle_type,
        payment_method: ride.payment_method
      });
    }
    
    console.log(`Created ${sampleRides.length} earnings records`);
    
    // Calculate and display totals
    const totalEarnings = await Earnings.aggregate([
      {
        $match: { driver: driver._id }
      },
      {
        $group: {
          _id: null,
          total_earnings: { $sum: '$driver_earnings' },
          total_rides: { $sum: '$trip_count' },
          total_fare: { $sum: '$total_fare' },
          total_commission: { $sum: '$platform_commission' }
        }
      }
    ]);
    
    console.log('=== SEED DATA SUMMARY ===');
    console.log('Driver ID:', driver._id);
    console.log('Driver Email:', driver.email);
    console.log('Customer ID:', customer._id);
    console.log('Customer Email:', customer.email);
    console.log('Total Earnings Summary:', totalEarnings[0]);
    console.log('========================');
    
    console.log('\nTest driver login credentials:');
    console.log('Email: testdriver@example.com');
    console.log('Password: password123');
    
    console.log('\nTest customer login credentials:');
    console.log('Email: testcustomer@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedDriverEarnings();
