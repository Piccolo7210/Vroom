import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;

async function testRideStatusUpdates() {
  console.log('🔄 Testing Ride Status Updates...');

  try {
    // 1. Login as customer and driver
    console.log('\n1. Logging in...');
    
    const customerLogin = await fetch(`${BASE_URL}/customer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john@example.com', password: 'password123' })
    });
    const customerData = await customerLogin.json();
    const customerToken = customerData.token;

    const driverLogin = await fetch(`${BASE_URL}/driver/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ahmed@example.com', password: 'password123' })
    });
    const driverData = await driverLogin.json();
    const driverToken = driverData.token;

    console.log('✅ Both users logged in');

    // 2. Create a ride
    console.log('\n2. Creating a ride...');
    const rideResponse = await fetch(`${BASE_URL}/rides/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        pickup_address: 'Shahbagh Circle, Dhaka',
        pickup_latitude: 23.7379,
        pickup_longitude: 90.3947,
        destination_address: 'New Market, Dhaka',
        destination_latitude: 23.7272,
        destination_longitude: 90.3896,
        vehicle_type: 'bike',
        payment_method: 'cash'
      })
    });
    
    const rideData = await rideResponse.json();
    console.log('Ride created:', rideData);
    
    const rideId = rideData.data.ride_id;
    const otp = rideData.data.otp;
    console.log(`✅ Ride created with ID: ${rideId}, OTP: ${otp}`);

    // 3. Accept the ride
    console.log('\n3. Driver accepting ride...');
    const acceptResponse = await fetch(`${BASE_URL}/rides/${rideId}/accept`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${driverToken}` }
    });
    const acceptData = await acceptResponse.json();
    console.log('Accept response:', acceptData);
    console.log('✅ Ride accepted');

    // 4. Test available rides (should work now)
    console.log('\n4. Testing available rides...');
    const availableResponse = await fetch(`${BASE_URL}/rides/available?latitude=23.7379&longitude=90.3947&radius=10`, {
      headers: { 'Authorization': `Bearer ${driverToken}` }
    });
    const availableData = await availableResponse.json();
    console.log('Available rides:', availableData);

    // 5. Update driver location
    console.log('\n5. Updating driver location...');
    const locationResponse = await fetch(`${BASE_URL}/rides/${rideId}/location`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${driverToken}`
      },
      body: JSON.stringify({
        latitude: 23.7380,
        longitude: 90.3948,
        heading: 45,
        speed: 25
      })
    });
    const locationData = await locationResponse.json();
    console.log('Location update response:', locationData);

    // 6. Update status to picked_up
    console.log('\n6. Updating status to picked_up...');
    const pickedUpResponse = await fetch(`${BASE_URL}/rides/${rideId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${driverToken}`
      },
      body: JSON.stringify({
        status: 'picked_up',
        otp: otp
      })
    });
    const pickedUpData = await pickedUpResponse.json();
    console.log('Picked up response:', pickedUpData);

    if (pickedUpData.success) {
      console.log('✅ Status updated to picked_up');

      // 7. Update status to in_progress
      console.log('\n7. Updating status to in_progress...');
      const progressResponse = await fetch(`${BASE_URL}/rides/${rideId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${driverToken}`
        },
        body: JSON.stringify({
          status: 'in_progress'
        })
      });
      const progressData = await progressResponse.json();
      console.log('In progress response:', progressData);

      if (progressData.success) {
        console.log('✅ Status updated to in_progress');

        // 8. Complete the ride
        console.log('\n8. Completing the ride...');
        const completeResponse = await fetch(`${BASE_URL}/rides/${rideId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${driverToken}`
          },
          body: JSON.stringify({
            status: 'completed',
            final_fare: 35
          })
        });
        const completeData = await completeResponse.json();
        console.log('Complete response:', completeData);

        if (completeData.success) {
          console.log('✅ Ride completed successfully!');
        } else {
          console.log('❌ Failed to complete ride');
        }
      } else {
        console.log('❌ Failed to update to in_progress');
      }
    } else {
      console.log('❌ Failed to update to picked_up');
    }

    console.log('\n🎉 Status update testing complete!');

  } catch (error) {
    console.error('Error in status update test:', error);
  }
}

testRideStatusUpdates();
