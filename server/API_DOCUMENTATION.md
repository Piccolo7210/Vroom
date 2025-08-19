# Ride Booking API Documentation

## Member B - Ride Booking, Tracking & Driver Features

This documentation covers all the APIs implemented for ride booking, real-time tracking, and driver dashboard features.

## Base URL
```
http://localhost:5000/api/rides
```

## Authentication
- Customer endpoints require `protectCustomer` middleware
- Driver endpoints require `protectDriver` middleware
- Include `Authorization: Bearer <token>` header for protected routes

---

## 🚗 Customer Ride APIs

### 1. Create Ride Request
**POST** `/request`
- **Auth Required**: Customer
- **Description**: Create a new ride request

**Request Body:**
```json
{
  "pickup_address": "Shahbagh Circle, Dhaka",
  "pickup_latitude": 23.7379,
  "pickup_longitude": 90.3947,
  "destination_address": "New Market, Dhaka",
  "destination_latitude": 23.7272,
  "destination_longitude": 90.3896,
  "vehicle_type": "bike",
  "payment_method": "cash",
  "bad_weather": false,
  "high_demand": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ride request created successfully",
  "data": {
    "ride_id": "ride_id_here",
    "pickup_location": {...},
    "destination": {...},
    "vehicle_type": "bike",
    "estimated_fare": 41,
    "estimated_duration": 15,
    "distance": 2.1,
    "otp": "1234",
    "status": "requested"
  }
}
```

### 2. Get Fare Estimate
**GET** `/fare-estimate`
- **Auth Required**: None
- **Description**: Get fare estimate for a trip

**Query Parameters:**
```
pickup_latitude=23.7379
pickup_longitude=90.3947
destination_latitude=23.7272
destination_longitude=90.3896
vehicle_type=bike
bad_weather=false
high_demand=false
```

**Response:**
```json
{
  "success": true,
  "data": {
    "distance": 2.1,
    "estimated_duration": 15,
    "fare": {
      "base_fare": 20,
      "distance_fare": 17,
      "time_fare": 15,
      "surge_multiplier": 1.0,
      "total_fare": 52
    },
    "surge_active": false,
    "vehicle_type": "bike"
  }
}
```

### 3. Get All Vehicle Fare Estimates
**GET** `/fare-estimate-all`
- **Auth Required**: None
- **Description**: Get fare estimates for all vehicle types

**Query Parameters:**
```
pickup_latitude=23.7379
pickup_longitude=90.3947
destination_latitude=23.7272
destination_longitude=90.3896
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bike": {
      "distance": 2.1,
      "estimated_duration": 15,
      "fare": {...},
      "surge_active": false,
      "vehicle_type": "bike"
    },
    "cng": {...},
    "car": {...}
  }
}
```

### 4. Get Customer Ride History
**GET** `/history`
- **Auth Required**: Customer
- **Description**: Get customer's ride history with pagination

**Query Parameters:**
```
page=1
limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rides": [...],
    "total": 25,
    "page": 1,
    "pages": 3
  }
}
```

### 5. Get Ride Details
**GET** `/:ride_id`
- **Auth Required**: None
- **Description**: Get detailed information about a specific ride

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ride_id",
    "customer": {...},
    "driver": {...},
    "pickup_location": {...},
    "destination": {...},
    "status": "accepted",
    "fare": {...},
    "otp": "1234"
  }
}
```

### 6. Cancel Ride
**PUT** `/:ride_id/cancel`
- **Auth Required**: Customer or Driver
- **Description**: Cancel a ride

**Request Body:**
```json
{
  "reason": "Change of plans",
  "cancelled_by": "customer"
}
```

### 7. Get Nearby Drivers
**GET** `/nearby-drivers`
- **Auth Required**: None
- **Description**: Get list of nearby available drivers

**Query Parameters:**
```
latitude=23.7379
longitude=90.3947
vehicle_type=bike
radius=5
```

---

## 🏍️ Driver Ride APIs

### 1. Get Available Rides
**GET** `/available`
- **Auth Required**: Driver
- **Description**: Get list of available rides for the driver

**Query Parameters:**
```
latitude=23.7379
longitude=90.3947
radius=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ride_id": "ride_id",
      "customer": {
        "name": "John Doe",
        "phone": "+8801234567890"
      },
      "pickup_location": {...},
      "destination": {...},
      "estimated_fare": 41,
      "distance": 2.1,
      "estimated_duration": 15,
      "payment_method": "cash"
    }
  ]
}
```

### 2. Accept Ride
**PUT** `/:ride_id/accept`
- **Auth Required**: Driver
- **Description**: Accept a ride request

**Response:**
```json
{
  "success": true,
  "message": "Ride accepted successfully",
  "data": {
    "ride_id": "ride_id",
    "customer": {...},
    "pickup_location": {...},
    "destination": {...},
    "estimated_fare": 41,
    "otp": "1234",
    "status": "accepted"
  }
}
```

### 3. Update Ride Status
**PUT** `/:ride_id/status`
- **Auth Required**: Driver
- **Description**: Update ride status (picked_up, in_progress, completed)

**Request Body:**
```json
{
  "status": "picked_up",
  "otp": "1234"
}
```

**Valid Status Transitions:**
- `accepted` → `picked_up` (requires OTP)
- `picked_up` → `in_progress`
- `in_progress` → `completed`

---

## 📍 Real-time Tracking APIs

### 1. Update Driver Location
**PUT** `/:ride_id/location`
- **Auth Required**: Driver
- **Description**: Update driver's current location during a ride

**Request Body:**
```json
{
  "latitude": 23.7380,
  "longitude": 90.3948,
  "heading": 45,
  "speed": 25
}
```

### 2. Get Driver Location
**GET** `/:ride_id/location`
- **Auth Required**: None
- **Description**: Get driver's current location for a ride

**Response:**
```json
{
  "success": true,
  "data": {
    "ride_id": "ride_id",
    "driver": {...},
    "location": {
      "latitude": 23.7380,
      "longitude": 90.3948,
      "heading": 45,
      "speed": 25,
      "timestamp": "2025-07-14T10:30:00Z"
    }
  }
}
```

### 3. Get Location History
**GET** `/:ride_id/location-history`
- **Auth Required**: None
- **Description**: Get complete location history for a ride

**Query Parameters:**
```
limit=50
```

### 4. Simulate Driver Movement (Testing)
**POST** `/:ride_id/simulate-movement`
- **Auth Required**: Driver
- **Description**: Generate simulated movement data for testing

---

## 📊 Driver Dashboard APIs

### 1. Get Driver Dashboard
**GET** `/driver/dashboard`
- **Auth Required**: Driver
- **Description**: Get comprehensive dashboard data

**Query Parameters:**
```
period=today  // today, week, month
```

**Response:**
```json
{
  "success": true,
  "data": {
    "driver_info": {...},
    "period_summary": {
      "period": "today",
      "total_earnings": 250,
      "total_trips": 5,
      "total_distance": 25.5,
      "avg_earnings_per_trip": 50,
      "commission_paid": 37.5
    },
    "active_ride": {...},
    "recent_rides": [...],
    "trip_statistics": [...]
  }
}
```

### 2. Get Trip History
**GET** `/driver/trips`
- **Auth Required**: Driver
- **Description**: Get driver's trip history

**Query Parameters:**
```
page=1
limit=10
status=completed  // all, requested, accepted, completed, cancelled
period=week      // today, week, month
```

### 3. Get Earnings Breakdown
**GET** `/driver/earnings`
- **Auth Required**: Driver
- **Description**: Get detailed earnings breakdown

**Query Parameters:**
```
period=month     // today, week, month, custom
year=2025        // for custom period
month=7          // for custom period
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period_info": {...},
    "summary": {
      "total_earnings": 1250,
      "total_trips": 25,
      "total_commission": 187.5,
      "total_fare": 1437.5,
      "avg_earnings_per_trip": 50
    },
    "daily_earnings": [...],
    "payment_breakdown": [...],
    "vehicle_breakdown": [...]
  }
}
```

### 4. Get Driver Status
**GET** `/driver/status`
- **Auth Required**: Driver
- **Description**: Get driver's current status and today's stats

**Response:**
```json
{
  "success": true,
  "data": {
    "driver_id": "driver_id",
    "is_active": false,
    "active_ride": null,
    "today_stats": {
      "earnings": 150,
      "trips_completed": 3
    },
    "availability_status": "available"
  }
}
```

### 5. Update Driver Availability
**PUT** `/driver/availability`
- **Auth Required**: Driver
- **Description**: Set driver online/offline

**Request Body:**
```json
{
  "is_available": true
}
```

---

## 🔄 Real-time Socket Events

### Customer Events
- `ride_update` - Ride status changes
- `driver_assigned` - Driver accepted the ride
- `location_update` - Driver location updates
- `ride_completed` - Ride finished
- `ride_cancelled` - Ride cancelled

### Driver Events
- `new_ride_request` - New ride requests in area
- `ride_status_changed` - Status updates from customer
- `emergency_alert` - Emergency situations

### Join Room
```javascript
socket.emit('join_ride', rideId);
```

### Location Updates
```javascript
socket.emit('location_update', {
  rideId: 'ride_id',
  latitude: 23.7380,
  longitude: 90.3948,
  heading: 45,
  speed: 25
});
```

---

## 📋 Data Models

### Ride Model
```javascript
{
  customer: ObjectId,
  driver: ObjectId,
  pickup_location: {
    address: String,
    coordinates: { latitude: Number, longitude: Number }
  },
  destination: {
    address: String,
    coordinates: { latitude: Number, longitude: Number }
  },
  vehicle_type: 'bike' | 'cng' | 'car',
  status: 'requested' | 'accepted' | 'picked_up' | 'in_progress' | 'completed' | 'cancelled',
  fare: {
    base_fare: Number,
    distance_fare: Number,
    time_fare: Number,
    surge_multiplier: Number,
    total_fare: Number
  },
  distance: Number,
  estimated_duration: Number,
  actual_duration: Number,
  payment_method: 'cash' | 'bkash',
  otp: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Location Model
```javascript
{
  ride: ObjectId,
  driver: ObjectId,
  coordinates: { latitude: Number, longitude: Number },
  heading: Number,
  speed: Number,
  timestamp: Date
}
```

### TripHistory Model
```javascript
{
  ride: ObjectId,
  driver: ObjectId,
  customer: ObjectId,
  pickup_location: Object,
  destination: Object,
  vehicle_type: String,
  total_fare: Number,
  distance: Number,
  duration: Number,
  payment_method: String,
  trip_date: Date,
  rating: {
    customer_rating: Number,
    driver_rating: Number
  }
}
```

### Earnings Model
```javascript
{
  driver: ObjectId,
  ride: ObjectId,
  date: Date,
  total_fare: Number,
  platform_commission: Number,
  driver_earnings: Number,
  trip_count: Number,
  vehicle_type: String,
  payment_method: String
}
```

---

## 🧪 Testing

### Sample Test Data
The system includes sample data for testing:

**Customers:**
- john@example.com / password123
- jane@example.com / password123

**Drivers:**
- ahmed@example.com / password123 (bike)
- rahman@example.com / password123 (cng)
- karim@example.com / password123 (car)

### Running Tests
```bash
# Start server
npm run dev

# Seed test data
node seedRideData.js

# Clear data
node clearDatabase.js
```

---

## 🔧 Configuration

### Fare Configuration
Located in `services/pricingService.js`:
- Base fares, per-km rates, per-minute rates
- Surge pricing multipliers
- Minimum fare requirements

### Location Service
Located in `services/locationService.js`:
- Dhaka city boundaries
- Landmark-based location suggestions
- Traffic level estimation
- Distance calculations

---

This completes the ride booking, tracking, and driver dashboard implementation for Member B of the ride-sharing application.
