import express from 'express';
import {
  createRide,
  getAvailableRides,
  acceptRide,
  updateRideStatus,
  getRideDetails,
  getCustomerRideHistory,
  cancelRide,
  getFareEstimate,
  getAllVehicleFareEstimates
} from '../controllers/rideController.js';
import {
  updateDriverLocation,
  getDriverLocation,
  getRideLocationHistory,
  simulateDriverMovement,
  getNearbyDrivers
} from '../controllers/trackingController.js';
import {
  getDriverDashboard,
  getDriverTripHistory,
  getDriverEarnings,
  getDriverStatus,
  updateDriverAvailability
} from '../controllers/driverDashboardController.js';
import { protectCustomer, protectDriver } from '../middlewares/auth.js';

const router = express.Router();

// ============= CUSTOMER RIDE ROUTES =============
// Create a new ride request
router.post('/request', protectCustomer, createRide);

// Get fare estimate
router.get('/fare-estimate', getFareEstimate);

// Get fare estimates for all vehicle types
router.get('/fare-estimate-all', getAllVehicleFareEstimates);

// Get customer's ride history
router.get('/history', protectCustomer, getCustomerRideHistory);

// Get nearby drivers
router.get('/nearby-drivers', getNearbyDrivers);

// ============= DRIVER RIDE ROUTES =============
// Get available rides for driver
router.get('/available', protectDriver, getAvailableRides);

// ============= TRACKING ROUTES =============
// Get location history for a ride
router.get('/:ride_id/location-history', getRideLocationHistory);

// Get driver location for a ride
router.get('/:ride_id/location', getDriverLocation);

// Get ride details (MUST come after specific routes)
router.get('/:ride_id', getRideDetails);

// Accept a ride
router.put('/:ride_id/accept', protectDriver, acceptRide);

// Update ride status
router.put('/:ride_id/status', protectDriver, updateRideStatus);

// Update driver location
router.put('/:ride_id/location', protectDriver, updateDriverLocation);

// Cancel a ride
router.put('/:ride_id/cancel', cancelRide);

// Simulate driver movement (for testing)
router.post('/:ride_id/simulate-movement', protectDriver, simulateDriverMovement);

// ============= DRIVER DASHBOARD ROUTES =============
// Get driver dashboard data
router.get('/driver/dashboard', protectDriver, getDriverDashboard);

// Get driver trip history
router.get('/driver/trips', protectDriver, getDriverTripHistory);

// Get driver earnings
router.get('/driver/earnings', protectDriver, getDriverEarnings);

// Get driver status
router.get('/driver/status', protectDriver, getDriverStatus);

// Update driver availability
router.put('/driver/availability', protectDriver, updateDriverAvailability);

export default router;
