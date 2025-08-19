import Ride from '../models/Ride.js';
import Driver from '../models/Driver.js';
import Customer from '../models/Customer.js';
import TripHistory from '../models/TripHistory.js';
import Earnings from '../models/Earnings.js';
import { pricingService } from '../services/pricingService.js';
import { locationService } from '../services/locationService.js';
import mongoose from 'mongoose';

// Helper function to generate random OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Create a new ride request
export const createRide = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Debug log
    
    const {
      pickup_address,
      pickup_latitude,
      pickup_longitude,
      destination_address,
      destination_latitude,
      destination_longitude,
      vehicle_type,
      payment_method
    } = req.body;

    // Validate required fields
    if (!pickup_address || !pickup_latitude || !pickup_longitude || 
        !destination_address || !destination_latitude || !destination_longitude || 
        !vehicle_type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields. Please provide pickup location, destination, and vehicle type.'
      });
    }

    // Get customer from auth middleware
    const customerId = req.customer.id;

    // Validate coordinates
    const pickupValidation = locationService.validateCoordinates(pickup_latitude, pickup_longitude);
    const destinationValidation = locationService.validateCoordinates(destination_latitude, destination_longitude);

    if (!pickupValidation.isValid || !destinationValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates provided'
      });
    }

    // Calculate fare estimate using pricing service
    const estimate = pricingService.getFareEstimate(
      { latitude: pickup_latitude, longitude: pickup_longitude },
      { latitude: destination_latitude, longitude: destination_longitude },
      vehicle_type,
      { 
        badWeather: req.body.bad_weather || false,
        highDemand: req.body.high_demand || false
      }
    );

    // Generate OTP for ride verification
    const otp = generateOTP();

    // Create new ride
    const ride = new Ride({
      customer: customerId,
      pickup_location: {
        address: pickup_address,
        coordinates: {
          latitude: pickup_latitude,
          longitude: pickup_longitude
        }
      },
      destination: {
        address: destination_address,
        coordinates: {
          latitude: destination_latitude,
          longitude: destination_longitude
        }
      },
      vehicle_type,
      payment_method,
      fare: estimate.fare,
      distance: estimate.distance,
      estimated_duration: estimate.estimated_duration,
      otp,
      status: 'requested'
    });

    await ride.save();

    // Populate customer data for response
    await ride.populate('customer', 'name phone');

    res.status(201).json({
      success: true,
      message: 'Ride request created successfully',
      data: {
        ride_id: ride._id,
        pickup_location: ride.pickup_location,
        destination: ride.destination,
        vehicle_type: ride.vehicle_type,
        estimated_fare: ride.fare.total_fare,
        estimated_duration: ride.estimated_duration,
        distance: ride.distance,
        otp: ride.otp,
        status: ride.status
      }
    });

  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create ride request'
    });
  }
};

// Get available rides for drivers (within a certain radius)
export const getAvailableRides = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query; // radius in km
    const driverId = req.driver.id;

    console.log('Get available rides - params:', { latitude, longitude, radius, driverId });

    // Validate coordinates
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    // Get driver's vehicle type
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    console.log('Driver found:', { id: driver._id, vehicle_type: driver.vehicle_type });

    // Find available rides matching driver's vehicle type
    const availableRides = await Ride.find({
      status: 'requested',
      vehicle_type: driver.vehicle_type,
      driver: null
    }).populate('customer', 'name phone');

    console.log('Available rides found:', availableRides.length);

    // Filter rides within radius (using location service)
    const nearbyRides = availableRides.filter(ride => {
      const distance = locationService.calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        ride.pickup_location.coordinates.latitude,
        ride.pickup_location.coordinates.longitude
      );
      return distance <= radius;
    });

    console.log('Nearby rides after filtering:', nearbyRides.length);

    res.json({
      success: true,
      data: nearbyRides.map(ride => ({
        ride_id: ride._id,
        customer: ride.customer,
        pickup_location: ride.pickup_location,
        destination: ride.destination,
        estimated_fare: ride.fare.total_fare,
        distance: ride.distance,
        estimated_duration: ride.estimated_duration,
        payment_method: ride.payment_method
      }))
    });

  } catch (error) {
    console.error('Get available rides error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available rides',
      details: error.message
    });
  }
};

// Driver accepts a ride
export const acceptRide = async (req, res) => {
  try {
    const { ride_id } = req.params;
    const driverId = req.driver.id;

    // Find the ride and check if it's still available
    const ride = await Ride.findById(ride_id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        error: 'Ride not found'
      });
    }

    if (ride.status !== 'requested' || ride.driver) {
      return res.status(400).json({
        success: false,
        error: 'Ride is no longer available'
      });
    }

    // Update ride with driver information
    ride.driver = driverId;
    ride.status = 'accepted';
    await ride.save();

    // Populate driver and customer data
    await ride.populate([
      { path: 'driver', select: 'name phone vehicle_no license_no' },
      { path: 'customer', select: 'name phone' }
    ]);

    res.json({
      success: true,
      message: 'Ride accepted successfully',
      data: {
        ride_id: ride._id,
        customer: ride.customer,
        pickup_location: ride.pickup_location,
        destination: ride.destination,
        estimated_fare: ride.fare.total_fare,
        otp: ride.otp,
        status: ride.status
      }
    });

  } catch (error) {
    console.error('Accept ride error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept ride'
    });
  }
};

// Update ride status
export const updateRideStatus = async (req, res) => {
  try {
    const { ride_id } = req.params;
    const { status, otp } = req.body;
    const driverId = req.driver.id;

    const ride = await Ride.findById(ride_id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        error: 'Ride not found'
      });
    }

    // Verify driver owns this ride
    if (ride.driver.toString() !== driverId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this ride'
      });
    }

    // Validate status transitions
    const validTransitions = {
      'accepted': ['picked_up', 'cancelled'],
      'picked_up': ['in_progress'],
      'in_progress': ['completed']
    };

    if (!validTransitions[ride.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status transition'
      });
    }

    // Verify OTP for pickup
    if (status === 'picked_up' && otp !== ride.otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    // Update ride status and timestamps
    ride.status = status;
    if (status === 'picked_up') {
      ride.ride_started_at = new Date();
    } else if (status === 'completed') {
      ride.ride_completed_at = new Date();
      
      // Calculate actual duration
      if (ride.ride_started_at) {
        ride.actual_duration = Math.round(
          (ride.ride_completed_at - ride.ride_started_at) / (1000 * 60)
        );
      }

      // Set payment status to pending - customer needs to select payment method
      ride.payment_status = 'pending';

      // Trip history and earnings will be created when payment is completed
      // in the updatePaymentStatus function
    }

    await ride.save();

    res.json({
      success: true,
      message: `Ride status updated to ${status}`,
      data: {
        ride_id: ride._id,
        status: ride.status,
        actual_duration: ride.actual_duration
      }
    });

  } catch (error) {
    console.error('Update ride status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update ride status'
    });
  }
};

// Get ride details
export const getRideDetails = async (req, res) => {
  try {
    const { ride_id } = req.params;

    const ride = await Ride.findById(ride_id)
      .populate('customer', 'name phone')
      .populate('driver', 'name phone vehicle_no license_no vehicle_type');

    if (!ride) {
      return res.status(404).json({
        success: false,
        error: 'Ride not found'
      });
    }

    res.json({
      success: true,
      data: ride
    });

  } catch (error) {
    console.error('Get ride details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available rides',
      details: error.message
    });
  }
};

// Get customer's ride history
export const getCustomerRideHistory = async (req, res) => {
  try {
    const customerId = req.customer.id;
    const { page = 1, limit = 10 } = req.query;

    const rides = await Ride.find({ customer: customerId })
      .populate('driver', 'name phone vehicle_no vehicle_type')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ride.countDocuments({ customer: customerId });

    res.json({
      success: true,
      data: {
        rides,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get customer ride history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ride history'
    });
  }
};

// Cancel ride
export const cancelRide = async (req, res) => {
  try {
    const { ride_id } = req.params;
    const { reason, cancelled_by } = req.body;

    const ride = await Ride.findById(ride_id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        error: 'Ride not found'
      });
    }

    // Check if ride can be cancelled
    if (!['requested', 'accepted'].includes(ride.status)) {
      return res.status(400).json({
        success: false,
        error: 'Ride cannot be cancelled at this stage'
      });
    }

    ride.status = 'cancelled';
    ride.cancelled_by = cancelled_by;
    ride.cancellation_reason = reason;
    
    await ride.save();

    res.json({
      success: true,
      message: 'Ride cancelled successfully',
      data: {
        ride_id: ride._id,
        status: ride.status
      }
    });

  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel ride'
    });
  }
};

// Get fare estimate
export const getFareEstimate = async (req, res) => {
  try {
    const {
      pickup_latitude,
      pickup_longitude,
      destination_latitude,
      destination_longitude,
      vehicle_type
    } = req.query;

    // Calculate fare estimate using pricing service
    const estimate = pricingService.getFareEstimate(
      { latitude: parseFloat(pickup_latitude), longitude: parseFloat(pickup_longitude) },
      { latitude: parseFloat(destination_latitude), longitude: parseFloat(destination_longitude) },
      vehicle_type,
      {
        badWeather: req.query.bad_weather === 'true',
        highDemand: req.query.high_demand === 'true'
      }
    );

    res.json({
      success: true,
      data: estimate
    });

  } catch (error) {
    console.error('Get fare estimate error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate fare estimate'
    });
  }
};

// Get fare estimate for all vehicle types
export const getAllVehicleFareEstimates = async (req, res) => {
  try {
    const {
      pickup_latitude,
      pickup_longitude,
      destination_latitude,
      destination_longitude
    } = req.query;

    // Validate coordinates
    const pickupValidation = locationService.validateCoordinates(pickup_latitude, pickup_longitude);
    const destinationValidation = locationService.validateCoordinates(destination_latitude, destination_longitude);

    if (!pickupValidation.isValid || !destinationValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates provided'
      });
    }

    // Get estimates for all vehicle types
    const estimates = pricingService.getAllVehicleEstimates(
      { latitude: parseFloat(pickup_latitude), longitude: parseFloat(pickup_longitude) },
      { latitude: parseFloat(destination_latitude), longitude: parseFloat(destination_longitude) },
      {
        badWeather: req.query.bad_weather === 'true',
        highDemand: req.query.high_demand === 'true'
      }
    );

    res.json({
      success: true,
      data: estimates
    });

  } catch (error) {
    console.error('Get all vehicle fare estimates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate fare estimates'
    });
  }
};

// Get driver earnings
export const getDriverEarnings = async (req, res) => {
  try {
    const driverId = req.driver._id;
    const { period = 'month' } = req.query;

    console.log('=== DRIVER EARNINGS REQUEST ===');
    console.log('Driver object:', req.driver);
    console.log('Driver ID (using _id):', driverId);
    console.log('Driver ID type:', typeof driverId);
    console.log('Period:', period);

    // Convert driverId to ObjectId if it's not already
    const driverObjectId = mongoose.Types.ObjectId.isValid(driverId) ? 
      new mongoose.Types.ObjectId(driverId) : driverId;

    console.log('Driver ObjectId:', driverObjectId);

    // Get ALL earnings data for the driver (no date filtering)
    const earnings = await Earnings.find({
      driver: driverObjectId
    }).populate('ride', 'pickup_location destination fare distance estimated_duration').sort({ date: -1 });

    console.log('Found earnings records:', earnings.length);
    console.log('Sample earnings record:', earnings[0]);

    // Also get all earnings for this driver regardless of date to debug
    console.log('Total earnings for driver:', earnings.length, 'records');
    if (earnings.length > 0) {
      console.log('First earning record:', {
        id: earnings[0]._id,
        driver: earnings[0].driver,
        date: earnings[0].date,
        driver_earnings: earnings[0].driver_earnings
      });
    }

    // Calculate totals
    const totalEarnings = earnings.reduce((sum, earning) => sum + earning.driver_earnings, 0);
    const totalRides = earnings.length;
    const averageFare = totalRides > 0 ? totalEarnings / totalRides : 0;

    // Calculate earnings breakdown
    const earningsBreakdown = {
      base_fare: 0,
      distance_fare: 0,
      time_fare: 0,
      surge_earnings: 0
    };

    // Since the current earnings model doesn't have breakdown, we'll estimate based on ride data
    earnings.forEach(earning => {
      if (earning.ride && earning.ride.fare) {
        earningsBreakdown.base_fare += earning.ride.fare.base_fare || 0;
        earningsBreakdown.distance_fare += earning.ride.fare.distance_fare || 0;
        earningsBreakdown.time_fare += earning.ride.fare.time_fare || 0;
        earningsBreakdown.surge_earnings += earning.ride.fare.surge_multiplier > 1 ? (earning.ride.fare.total_fare * 0.1) : 0;
      }
    });

    // Group earnings by date for recent earnings
    const earningsMap = new Map();
    earnings.forEach(earning => {
      const dateKey = earning.date.toISOString().split('T')[0];
      if (!earningsMap.has(dateKey)) {
        earningsMap.set(dateKey, {
          date: dateKey,
          amount: 0,
          rides_count: 0
        });
      }
      const dayEarning = earningsMap.get(dateKey);
      dayEarning.amount += earning.driver_earnings;
      dayEarning.rides_count += 1;
    });

    const recentEarnings = Array.from(earningsMap.values()).slice(0, 10);

    const responseData = {
      total_earnings: totalEarnings,
      total_rides: totalRides,
      average_fare: averageFare,
      earnings_breakdown: earningsBreakdown,
      recent_earnings: recentEarnings,
      period: period,
      all_earnings_count: earnings.length
    };

    console.log('Sending earnings response:', responseData);

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Get driver earnings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch driver earnings'
    });
  }
};

// Update payment status for a ride
export const updatePaymentStatus = async (req, res) => {
  try {
    const { ride_id } = req.params;
    const { paymentMethod, paymentStatus, transactionId } = req.body;
    const customerId = req.customer.id;

    console.log(`Updating payment for ride ${ride_id}:`, {
      paymentMethod,
      paymentStatus,
      transactionId,
      customerId
    });

    // Validate ride ID
    if (!mongoose.Types.ObjectId.isValid(ride_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ride ID'
      });
    }

    // Find the ride and verify ownership
    const ride = await Ride.findById(ride_id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        error: 'Ride not found'
      });
    }

    // Verify that the customer owns this ride
    if (ride.customer.toString() !== customerId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update this ride payment'
      });
    }

    // Verify ride is completed
    if (ride.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Can only update payment for completed rides'
      });
    }

    // Update payment information
    const updateData = {
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      updated_at: new Date()
    };

    // Add transaction ID if provided (for online payments)
    if (transactionId) {
      updateData.transaction_id = transactionId;
    }

    const updatedRide = await Ride.findByIdAndUpdate(
      ride_id,
      updateData,
      { new: true }
    ).populate('customer', 'name email phone')
     .populate('driver', 'name email phone vehicle_type vehicle_number');

    console.log('Payment updated successfully:', updatedRide);

    // If payment is completed, update driver earnings and create trip history
    if (paymentStatus === 'completed') {
      try {
        // Create trip history record
        await TripHistory.create({
          ride: ride._id,
          driver: ride.driver,
          customer: ride.customer,
          pickup_location: ride.pickup_location,
          destination: ride.destination,
          vehicle_type: ride.vehicle_type,
          total_fare: ride.fare.total_fare,
          distance: ride.distance,
          duration: ride.actual_duration || ride.estimated_duration,
          payment_method: paymentMethod,
          trip_date: ride.ride_completed_at
        });

        // Create earnings record
        const platformCommission = ride.fare.total_fare * 0.15; // 15% commission
        const driverEarnings = ride.fare.total_fare - platformCommission;

        await Earnings.create({
          driver: ride.driver,
          ride: ride._id,
          date: ride.ride_completed_at,
          total_fare: ride.fare.total_fare,
          platform_commission: platformCommission,
          driver_earnings: driverEarnings,
          vehicle_type: ride.vehicle_type,
          payment_method: paymentMethod
        });

        console.log('Trip history and driver earnings created for completed payment');
      } catch (earningsError) {
        console.error('Error creating trip history and earnings:', earningsError);
        // Don't fail the payment update if earnings creation fails
      }
    }

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: {
        ride: updatedRide
      }
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payment status'
    });
  }
};

// Helper function to update driver earnings
const updateDriverEarnings = async (ride) => {
  try {
    if (!ride.driver) {
      console.log('No driver assigned to ride, skipping earnings update');
      return;
    }

    const driverId = ride.driver._id || ride.driver;
    const fare = ride.fare.total_fare;
    const driverEarnings = fare * 0.8; // Driver gets 80% of the fare
    const platformFee = fare * 0.2; // Platform takes 20%

    // Create or update earnings record
    await Earnings.findOneAndUpdate(
      {
        driver: driverId,
        date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
      },
      {
        $inc: {
          total_earnings: driverEarnings,
          platform_fee: platformFee,
          total_rides: 1
        },
        $setOnInsert: {
          driver: driverId,
          date: new Date().toISOString().split('T')[0]
        }
      },
      { upsert: true, new: true }
    );

    console.log(`Updated earnings for driver ${driverId}: +${driverEarnings}`);
  } catch (error) {
    console.error('Error updating driver earnings:', error);
    throw error;
  }
};
