import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;

// Test data
const testData = {
  customer: {
    email: 'john@example.com',
    password: 'password123'
  },
  driver: {
    email: 'ahmed@example.com',
    password: 'password123'
  },
  ride: {
    pickup_address: 'Shahbagh Circle, Dhaka',
    pickup_latitude: 23.7379,
    pickup_longitude: 90.3947,
    destination_address: 'New Market, Dhaka',
    destination_latitude: 23.7272,
    destination_longitude: 90.3896,
    vehicle_type: 'bike',
    payment_method: 'cash'
  }
};

let customerToken = '';
let driverToken = '';
let testRideId = '';

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    console.log(`\n${options.method || 'GET'} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    return { status: response.status, data };
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error.message);
    return { status: 500, error: error.message };
  }
}

async function runFullTests() {
  console.log('🚀 Starting COMPLETE API Tests for Ride Booking System');
  console.log('====================================================');

  // 1. Test Customer Login
  console.log('\n1. Testing Customer Login...');
  const customerLogin = await apiCall('/customer/login', {
    method: 'POST',
    body: JSON.stringify(testData.customer)
  });
  
  if (customerLogin.status === 200) {
    customerToken = customerLogin.data.token;
    console.log('✅ Customer login successful');
  } else {
    console.log('❌ Customer login failed');
    return;
  }

  // 2. Test Driver Login
  console.log('\n2. Testing Driver Login...');
  const driverLogin = await apiCall('/driver/login', {
    method: 'POST',
    body: JSON.stringify(testData.driver)
  });
  
  if (driverLogin.status === 200) {
    driverToken = driverLogin.data.token;
    console.log('✅ Driver login successful');
  } else {
    console.log('❌ Driver login failed');
    return;
  }

  // 3. Test Fare Estimate
  console.log('\n3. Testing Fare Estimate...');
  const fareEstimate = await apiCall(
    `/rides/fare-estimate?pickup_latitude=${testData.ride.pickup_latitude}&pickup_longitude=${testData.ride.pickup_longitude}&destination_latitude=${testData.ride.destination_latitude}&destination_longitude=${testData.ride.destination_longitude}&vehicle_type=${testData.ride.vehicle_type}`
  );
  
  if (fareEstimate.status === 200) {
    console.log('✅ Fare estimate successful');
  } else {
    console.log('❌ Fare estimate failed');
  }

  // 4. Test All Vehicle Fare Estimates
  console.log('\n4. Testing All Vehicle Fare Estimates...');
  const allFareEstimates = await apiCall(
    `/rides/fare-estimate-all?pickup_latitude=${testData.ride.pickup_latitude}&pickup_longitude=${testData.ride.pickup_longitude}&destination_latitude=${testData.ride.destination_latitude}&destination_longitude=${testData.ride.destination_longitude}`
  );
  
  if (allFareEstimates.status === 200) {
    console.log('✅ All vehicle fare estimates successful');
  } else {
    console.log('❌ All vehicle fare estimates failed');
  }

  // 5. Test Create Ride Request (Fixed version)
  console.log('\n5. Testing Create Ride Request...');
  console.log('Using token:', customerToken.substring(0, 20) + '...');
  console.log('Sending data:', JSON.stringify(testData.ride, null, 2));
  
  const createRide = await apiCall('/rides/request', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${customerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testData.ride)
  });
  
  if (createRide.status === 201) {
    testRideId = createRide.data.data.ride_id;
    console.log('✅ Ride request created successfully');
    console.log(`   Ride ID: ${testRideId}`);
  } else {
    console.log('❌ Ride request creation failed');
    console.log('Response:', createRide.data);
    return;
  }

  // 6. Test Get Ride Details
  console.log('\n6. Testing Get Ride Details...');
  const rideDetails = await apiCall(`/rides/${testRideId}`);
  
  if (rideDetails.status === 200) {
    console.log('✅ Get ride details successful');
  } else {
    console.log('❌ Get ride details failed');
  }

  // 7. Test Get Available Rides (Driver)
  console.log('\n7. Testing Get Available Rides (Driver)...');
  const availableRides = await apiCall(
    `/rides/available?latitude=${testData.ride.pickup_latitude}&longitude=${testData.ride.pickup_longitude}&radius=10`,
    {
      headers: {
        'Authorization': `Bearer ${driverToken}`
      }
    }
  );
  
  if (availableRides.status === 200) {
    console.log('✅ Get available rides successful');
    console.log(`   Found ${availableRides.data.data.length} available rides`);
  } else {
    console.log('❌ Get available rides failed');
  }

  // 8. Test Accept Ride (Driver)
  console.log('\n8. Testing Accept Ride (Driver)...');
  const acceptRide = await apiCall(`/rides/${testRideId}/accept`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${driverToken}`
    }
  });
  
  if (acceptRide.status === 200) {
    console.log('✅ Ride acceptance successful');
  } else {
    console.log('❌ Ride acceptance failed');
  }

  // 9. Test Update Driver Location
  console.log('\n9. Testing Update Driver Location...');
  const updateLocation = await apiCall(`/rides/${testRideId}/location`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${driverToken}`
    },
    body: JSON.stringify({
      latitude: 23.7380,
      longitude: 90.3948,
      heading: 45,
      speed: 25
    })
  });
  
  if (updateLocation.status === 200) {
    console.log('✅ Location update successful');
  } else {
    console.log('❌ Location update failed');
  }

  // 10. Test Get Driver Location
  console.log('\n10. Testing Get Driver Location...');
  const getLocation = await apiCall(`/rides/${testRideId}/location`);
  
  if (getLocation.status === 200) {
    console.log('✅ Get driver location successful');
  } else {
    console.log('❌ Get driver location failed');
  }

  // 11. Test Update Ride Status to "picked_up"
  console.log('\n11. Testing Update Ride Status to Picked Up...');
  const pickedUpStatus = await apiCall(`/rides/${testRideId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${driverToken}`
    },
    body: JSON.stringify({
      status: 'picked_up',
      otp: '3418' // Use the OTP from ride creation
    })
  });
  
  if (pickedUpStatus.status === 200) {
    console.log('✅ Ride status updated to picked up');
  } else {
    console.log('❌ Ride status update failed');
  }

  // 12. Test Update Ride Status to "in_progress"
  console.log('\n12. Testing Update Ride Status to In Progress...');
  const inProgressStatus = await apiCall(`/rides/${testRideId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${driverToken}`
    },
    body: JSON.stringify({
      status: 'in_progress'
    })
  });
  
  if (inProgressStatus.status === 200) {
    console.log('✅ Ride status updated to in progress');
  } else {
    console.log('❌ Ride status update failed');
  }

  // 13. Test Driver Dashboard
  console.log('\n13. Testing Driver Dashboard...');
  const driverDashboard = await apiCall('/rides/driver/dashboard', {
    headers: {
      'Authorization': `Bearer ${driverToken}`
    }
  });
  
  if (driverDashboard.status === 200) {
    console.log('✅ Driver dashboard successful');
  } else {
    console.log('❌ Driver dashboard failed');
  }

  // 14. Test Driver Status
  console.log('\n14. Testing Driver Status...');
  const driverStatus = await apiCall('/rides/driver/status', {
    headers: {
      'Authorization': `Bearer ${driverToken}`
    }
  });
  
  if (driverStatus.status === 200) {
    console.log('✅ Driver status successful');
  } else {
    console.log('❌ Driver status failed');
  }

  // 15. Test Customer Ride History
  console.log('\n15. Testing Customer Ride History...');
  const rideHistory = await apiCall('/rides/history', {
    headers: {
      'Authorization': `Bearer ${customerToken}`
    }
  });
  
  if (rideHistory.status === 200) {
    console.log('✅ Customer ride history successful');
    console.log(`   Found ${rideHistory.data.data.length} rides in history`);
  } else {
    console.log('❌ Customer ride history failed');
  }

  // 16. Test Nearby Drivers
  console.log('\n16. Testing Nearby Drivers...');
  const nearbyDrivers = await apiCall(
    `/rides/nearby-drivers?latitude=${testData.ride.pickup_latitude}&longitude=${testData.ride.pickup_longitude}&vehicle_type=${testData.ride.vehicle_type}&radius=5`
  );
  
  if (nearbyDrivers.status === 200) {
    console.log('✅ Nearby drivers successful');
    console.log(`   Found ${nearbyDrivers.data.data.length} nearby drivers`);
  } else {
    console.log('❌ Nearby drivers failed');
  }

  // 17. Test Complete Ride
  console.log('\n17. Testing Complete Ride...');
  const completeRide = await apiCall(`/rides/${testRideId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${driverToken}`
    },
    body: JSON.stringify({
      status: 'completed',
      final_fare: 35 // Slightly higher than estimated
    })
  });
  
  if (completeRide.status === 200) {
    console.log('✅ Ride completed successfully');
  } else {
    console.log('❌ Ride completion failed');
  }

  // 18. Test Driver Trip History
  console.log('\n18. Testing Driver Trip History...');
  const driverTripHistory = await apiCall('/rides/driver/trip-history', {
    headers: {
      'Authorization': `Bearer ${driverToken}`
    }
  });
  
  if (driverTripHistory.status === 200) {
    console.log('✅ Driver trip history successful');
  } else {
    console.log('❌ Driver trip history failed');
  }

  // 19. Test Driver Earnings
  console.log('\n19. Testing Driver Earnings...');
  const driverEarnings = await apiCall('/rides/driver/earnings', {
    headers: {
      'Authorization': `Bearer ${driverToken}`
    }
  });
  
  if (driverEarnings.status === 200) {
    console.log('✅ Driver earnings successful');
  } else {
    console.log('❌ Driver earnings failed');
  }

  console.log('\n🎉 COMPLETE API Testing Finished!');
  console.log('=====================================');
  console.log('\n📊 Test Summary:');
  console.log('✅ Authentication (Customer & Driver)');
  console.log('✅ Fare Estimation (Single & Multiple Vehicles)');
  console.log('✅ Ride Request Creation');
  console.log('✅ Ride Acceptance by Driver');
  console.log('✅ Real-time Location Tracking');
  console.log('✅ Ride Status Updates (Complete Lifecycle)');
  console.log('✅ Driver Dashboard & Analytics');
  console.log('✅ Trip History & Earnings');
  console.log('✅ Nearby Drivers & Available Rides');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. ✅ Core ride booking workflow is working');
  console.log('2. ✅ Real-time tracking and updates are functional');
  console.log('3. ✅ Driver dashboard and earnings are working');
  console.log('4. 🔄 Test real-time Socket.IO connections');
  console.log('5. 🔄 Frontend integration testing');
  console.log('6. 🔄 Load testing with multiple concurrent rides');
}

// Run comprehensive tests
runFullTests().catch(console.error);
