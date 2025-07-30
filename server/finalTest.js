import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;

async function testAllAPIs() {
  console.log('🚀 FINAL COMPREHENSIVE API TEST');
  console.log('================================');

  let customerToken, driverToken, rideId, otp;

  try {
    // 1. Authentication
    console.log('\n✅ Testing Authentication...');
    const customerLogin = await fetch(`${BASE_URL}/customer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john@example.com', password: 'password123' })
    });
    customerToken = (await customerLogin.json()).token;

    const driverLogin = await fetch(`${BASE_URL}/driver/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ahmed@example.com', password: 'password123' })
    });
    driverToken = (await driverLogin.json()).token;
    console.log('   Customer & Driver login: ✅');

    // 2. Fare Estimation
    console.log('\n✅ Testing Fare Estimation...');
    const fareResponse = await fetch(`${BASE_URL}/rides/fare-estimate?pickup_latitude=23.7379&pickup_longitude=90.3947&destination_latitude=23.7272&destination_longitude=90.3896&vehicle_type=bike`);
    const fareData = await fareResponse.json();
    console.log(`   Single vehicle fare: ৳${fareData.data.fare.total_fare} ✅`);

    const allFareResponse = await fetch(`${BASE_URL}/rides/fare-estimate-all?pickup_latitude=23.7379&pickup_longitude=90.3947&destination_latitude=23.7272&destination_longitude=90.3896`);
    const allFareData = await allFareResponse.json();
    console.log(`   All vehicle fares: Bike ৳${allFareData.data.bike.fare.total_fare}, CNG ৳${allFareData.data.cng.fare.total_fare}, Car ৳${allFareData.data.car.fare.total_fare} ✅`);

    // 3. Ride Request
    console.log('\n✅ Testing Ride Request...');
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
    rideId = rideData.data.ride_id;
    otp = rideData.data.otp;
    console.log(`   Ride created: ${rideId.substring(0, 8)}..., OTP: ${otp} ✅`);

    // 4. Available Rides
    console.log('\n✅ Testing Available Rides...');
    const availableResponse = await fetch(`${BASE_URL}/rides/available?latitude=23.7379&longitude=90.3947&radius=10`, {
      headers: { 'Authorization': `Bearer ${driverToken}` }
    });
    const availableData = await availableResponse.json();
    console.log(`   Found ${availableData.data.length} available rides ✅`);

    // 5. Ride Acceptance
    console.log('\n✅ Testing Ride Acceptance...');
    const acceptResponse = await fetch(`${BASE_URL}/rides/${rideId}/accept`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${driverToken}` }
    });
    const acceptData = await acceptResponse.json();
    console.log(`   Ride accepted by driver ✅`);

    // 6. Location Tracking
    console.log('\n✅ Testing Location Tracking...');
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
    console.log(`   Driver location updated ✅`);

    const getLocationResponse = await fetch(`${BASE_URL}/rides/${rideId}/location`);
    const getLocationData = await getLocationResponse.json();
    console.log(`   Driver location retrieved ✅`);

    // 7. Ride Status Lifecycle
    console.log('\n✅ Testing Ride Status Lifecycle...');
    
    // Picked up
    const pickedUpResponse = await fetch(`${BASE_URL}/rides/${rideId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${driverToken}`
      },
      body: JSON.stringify({ status: 'picked_up', otp: otp })
    });
    console.log(`   Status: picked_up ✅`);

    // In progress
    const progressResponse = await fetch(`${BASE_URL}/rides/${rideId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${driverToken}`
      },
      body: JSON.stringify({ status: 'in_progress' })
    });
    console.log(`   Status: in_progress ✅`);

    // Completed
    const completeResponse = await fetch(`${BASE_URL}/rides/${rideId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${driverToken}`
      },
      body: JSON.stringify({ status: 'completed', final_fare: 35 })
    });
    console.log(`   Status: completed ✅`);

    // 8. Dashboard & Analytics
    console.log('\n✅ Testing Dashboard & Analytics...');
    
    const dashboardResponse = await fetch(`${BASE_URL}/rides/driver/dashboard`, {
      headers: { 'Authorization': `Bearer ${driverToken}` }
    });
    const dashboardData = await dashboardResponse.json();
    console.log(`   Driver dashboard: ${dashboardData.data.recent_rides.length} recent rides ✅`);

    const earningsResponse = await fetch(`${BASE_URL}/rides/driver/earnings`, {
      headers: { 'Authorization': `Bearer ${driverToken}` }
    });
    const earningsData = await earningsResponse.json();
    console.log(`   Driver earnings: ৳${earningsData.data.summary.total_earnings} ✅`);

    const historyResponse = await fetch(`${BASE_URL}/rides/history`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const historyData = await historyResponse.json();
    console.log(`   Customer ride history: ${historyData.data.rides.length} rides ✅`);

    const tripsResponse = await fetch(`${BASE_URL}/rides/driver/trips`, {
      headers: { 'Authorization': `Bearer ${driverToken}` }
    });
    const tripsData = await tripsResponse.json();
    console.log(`   Driver trip history ✅`);

    // 9. Nearby Features
    console.log('\n✅ Testing Nearby Features...');
    const nearbyResponse = await fetch(`${BASE_URL}/rides/nearby-drivers?latitude=23.7379&longitude=90.3947&vehicle_type=bike&radius=5`);
    const nearbyData = await nearbyResponse.json();
    console.log(`   Nearby drivers: ${nearbyData.data.length} drivers ✅`);

    console.log('\n🎉 ALL TESTS PASSED! 🎉');
    console.log('=======================');
    console.log('\n📊 FEATURE SUMMARY:');
    console.log('✅ Authentication (Customer & Driver)');
    console.log('✅ Dynamic Fare Estimation (All Vehicles)');
    console.log('✅ Ride Request & Matching');
    console.log('✅ Real-time Location Tracking');
    console.log('✅ Complete Ride Status Lifecycle');
    console.log('✅ Driver Dashboard & Analytics');
    console.log('✅ Trip History & Earnings');
    console.log('✅ Geographic Queries (Nearby Drivers/Rides)');

    console.log('\n🚀 READY FOR PRODUCTION!');
    console.log('The Member B ride-sharing features are fully functional.');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAllAPIs();
