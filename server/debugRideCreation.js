import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;

async function debugRideCreation() {
  try {
    // 1. Login as customer first
    console.log('1. Logging in as customer...');
    const loginResponse = await fetch(`${BASE_URL}/customer/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.success) {
      console.error('❌ Login failed');
      return;
    }
    
    const token = loginData.token;
    console.log('✅ Login successful, token:', token.substring(0, 20) + '...');
    
    // 2. Create ride request with detailed logging
    console.log('\n2. Creating ride request...');
    const rideData = {
      pickup_address: 'Shahbagh Circle, Dhaka',
      pickup_latitude: 23.7379,
      pickup_longitude: 90.3947,
      destination_address: 'New Market, Dhaka',
      destination_latitude: 23.7272,
      destination_longitude: 90.3896,
      vehicle_type: 'bike',
      payment_method: 'cash'
    };
    
    console.log('Ride data to send:', JSON.stringify(rideData, null, 2));
    
    const rideResponse = await fetch(`${BASE_URL}/rides/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(rideData)
    });
    
    console.log('Response status:', rideResponse.status);
    console.log('Response headers:', Object.fromEntries(rideResponse.headers));
    
    const rideResult = await rideResponse.json();
    console.log('Ride creation response:', JSON.stringify(rideResult, null, 2));
    
    if (rideResult.success) {
      console.log('✅ Ride created successfully!');
      console.log('Ride ID:', rideResult.data.ride_id);
    } else {
      console.log('❌ Ride creation failed');
    }
    
  } catch (error) {
    console.error('Error in debug test:', error);
  }
}

debugRideCreation();
