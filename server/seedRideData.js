import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Driver from './models/Driver.js';
import Customer from './models/Customer.js';
import Ride from './models/Ride.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedRideData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Sample customers for testing
    const sampleCustomers = [
      {
        name: 'John Doe',
        userName: 'johndoe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+8801234567890',
        sex: 'male',
        present_address: 'Shahbagh, Dhaka'
      },
      {
        name: 'Jane Smith',
        userName: 'janesmith',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+8801234567891',
        sex: 'Female',
        present_address: 'Dhanmondi, Dhaka'
      }
    ];

    // Sample drivers for testing
    const sampleDrivers = [
      {
        name: 'Ahmed Khan',
        userName: 'ahmedkhan',
        email: 'ahmed@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+8801234567892',
        license_no: 'DL123456789',
        age: 28,
        present_address: 'Gulshan, Dhaka',
        sex: 'male',
        vehicle_type: 'bike',
        vehicle_no: 'DHK-1234'
      },
      {
        name: 'Rahman Ali',
        userName: 'rahmanali',
        email: 'rahman@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+8801234567893',
        license_no: 'DL987654321',
        age: 32,
        present_address: 'Banani, Dhaka',
        sex: 'male',
        vehicle_type: 'cng',
        vehicle_no: 'DHK-5678'
      },
      {
        name: 'Karim Uddin',
        userName: 'karimuddin',
        email: 'karim@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+8801234567894',
        license_no: 'DL456789123',
        age: 35,
        present_address: 'Uttara, Dhaka',
        sex: 'male',
        vehicle_type: 'car',
        vehicle_no: 'DHK-9012'
      }
    ];

    // Clear existing test data and drop indexes
    await Customer.deleteMany({ email: { $regex: '@example.com' } });
    await Driver.deleteMany({ email: { $regex: '@example.com' } });
    
    // Drop the problematic index if it exists
    try {
      await Driver.collection.dropIndex('Vehicle_no_1');
      console.log('Dropped Vehicle_no index');
    } catch (error) {
      console.log('Vehicle_no index not found or already dropped');
    }
    
    console.log('Cleared existing test data');

    // Insert sample customers
    const customers = await Customer.insertMany(sampleCustomers);
    console.log(`Inserted ${customers.length} sample customers`);

    // Insert sample drivers one by one to avoid bulk insert issues
    const drivers = [];
    for (const driverData of sampleDrivers) {
      try {
        const driver = await Driver.create(driverData);
        drivers.push(driver);
        console.log(`Inserted driver: ${driver.name}`);
      } catch (error) {
        console.error(`Failed to insert driver ${driverData.name}:`, error.message);
      }
    }
    console.log(`Inserted ${drivers.length} sample drivers`);

    // Create some sample rides if we have drivers
    if (drivers.length > 0) {
      const sampleRides = [
        {
          customer: customers[0]._id,
          pickup_location: {
            address: 'Shahbagh Circle, Dhaka',
            coordinates: {
              latitude: 23.7379,
              longitude: 90.3947
            }
          },
          destination: {
            address: 'New Market, Dhaka',
            coordinates: {
              latitude: 23.7272,
              longitude: 90.3896
            }
          },
          vehicle_type: 'bike',
          status: 'requested',
          fare: {
            base_fare: 20,
            distance_fare: 16,
            time_fare: 5,
            surge_multiplier: 1.0,
            total_fare: 41
          },
          distance: 2.1,
          estimated_duration: 15,
          payment_method: 'cash',
          otp: '1234'
        }
      ];

      // Add second ride only if we have at least 2 drivers
      if (drivers.length > 1) {
        sampleRides.push({
          customer: customers[1]._id,
          driver: drivers[1]._id,
          pickup_location: {
            address: 'Dhanmondi 27, Dhaka',
            coordinates: {
              latitude: 23.7465,
              longitude: 90.3760
            }
          },
          destination: {
            address: 'Gulshan 2, Dhaka',
            coordinates: {
              latitude: 23.7925,
              longitude: 90.4078
            }
          },
          vehicle_type: 'cng',
          status: 'accepted',
          fare: {
            base_fare: 30,
            distance_fare: 72,
            time_fare: 22.5,
            surge_multiplier: 1.0,
            total_fare: 125
          },
          distance: 6.2,
          estimated_duration: 25,
          payment_method: 'bkash',
          otp: '5678'
        });
      }

      const rides = await Ride.insertMany(sampleRides);
      console.log(`Inserted ${rides.length} sample rides`);
      
      console.log('\nSample Rides:');
      rides.forEach(ride => {
        console.log(`- ${ride._id}: ${ride.pickup_location.address} -> ${ride.destination.address} (${ride.status})`);
      });
    } else {
      console.log('No drivers available, skipping ride creation');
    }

    console.log('\n=== Sample Data Created Successfully ===');
    console.log('\nSample Customers:');
    customers.forEach(customer => {
      console.log(`- ${customer.name} (${customer.email}) - Password: password123`);
    });

    console.log('\nSample Drivers:');
    drivers.forEach(driver => {
      console.log(`- ${driver.name} (${driver.email}) - Vehicle: ${driver.vehicle_type} (${driver.vehicle_no}) - Password: password123`);
    });

    console.log('\n=== Testing Instructions ===');
    console.log('1. Login as a customer using: john@example.com or jane@example.com');
    console.log('2. Login as a driver using: ahmed@example.com, rahman@example.com, or karim@example.com');
    console.log('3. Password for all accounts: password123');
    console.log('4. Test ride booking, acceptance, and tracking features');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the seed function
seedRideData();
