import Driver from '../models/Driver.js';
import Ride from '../models/Ride.js';
import TripHistory from '../models/TripHistory.js';
import Earnings from '../models/Earnings.js';
import mongoose from 'mongoose';

// Get driver dashboard data
export const getDriverDashboard = async (req, res) => {
  try {
    const driverId = req.driver.id;
    const { period = 'today' } = req.query; // today, week, month

    // Calculate date range based on period
    const now = new Date();
    let startDate, endDate = now;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        startDate = weekStart;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Get driver info
    const driver = await Driver.findById(driverId).select('-password');

    // Get earnings for the period
    const earnings = await Earnings.aggregate([
      {
        $match: {
          driver: driver._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total_earnings: { $sum: '$driver_earnings' },
          total_trips: { $sum: '$trip_count' },
          total_fare: { $sum: '$total_fare' },
          commission_paid: { $sum: '$platform_commission' }
        }
      }
    ]);

    // Get recent rides
    const recentRides = await Ride.find({
      driver: driverId,
      createdAt: { $gte: startDate, $lte: endDate }
    })
    .populate('customer', 'name phone')
    .sort({ createdAt: -1 })
    .limit(5);

    // Get trip statistics
    const tripStats = await Ride.aggregate([
      {
        $match: {
          driver: driver._id,
          status: 'completed',
          ride_completed_at: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$vehicle_type',
          count: { $sum: 1 },
          total_distance: { $sum: '$distance' },
          avg_fare: { $avg: '$fare.total_fare' }
        }
      }
    ]);

    // Get current active ride
    const activeRide = await Ride.findOne({
      driver: driverId,
      status: { $in: ['accepted', 'picked_up', 'in_progress'] }
    }).populate('customer', 'name phone');

    // Calculate additional metrics
    const earningsData = earnings[0] || {
      total_earnings: 0,
      total_trips: 0,
      total_fare: 0,
      commission_paid: 0
    };

    const avgEarningsPerTrip = earningsData.total_trips > 0 
      ? earningsData.total_earnings / earningsData.total_trips 
      : 0;

    const totalDistance = tripStats.reduce((sum, stat) => sum + (stat.total_distance || 0), 0);

    res.json({
      success: true,
      data: {
        driver_info: {
          id: driver._id,
          name: driver.name,
          vehicle_type: driver.vehicle_type,
          vehicle_no: driver.vehicle_no,
          license_no: driver.license_no,
          phone: driver.phone
        },
        period_summary: {
          period,
          start_date: startDate,
          end_date: endDate,
          total_earnings: Math.round(earningsData.total_earnings),
          total_trips: earningsData.total_trips,
          total_distance: Math.round(totalDistance * 100) / 100,
          avg_earnings_per_trip: Math.round(avgEarningsPerTrip),
          commission_paid: Math.round(earningsData.commission_paid)
        },
        active_ride: activeRide,
        recent_rides: recentRides.map(ride => ({
          ride_id: ride._id,
          customer: ride.customer,
          pickup_location: ride.pickup_location.address,
          destination: ride.destination.address,
          fare: ride.fare.total_fare,
          status: ride.status,
          distance: ride.distance,
          created_at: ride.createdAt
        })),
        trip_statistics: tripStats
      }
    });

  } catch (error) {
    console.error('Get driver dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
};

// Get driver's trip history
export const getDriverTripHistory = async (req, res) => {
  try {
    const driverId = req.driver.id;
    const { page = 1, limit = 10, status, period } = req.query;

    // Build query filters
    const query = { driver: driverId };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (period) {
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }
      
      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    const trips = await Ride.find(query)
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ride.countDocuments(query);

    res.json({
      success: true,
      data: {
        trips: trips.map(trip => ({
          ride_id: trip._id,
          customer: trip.customer,
          pickup_location: trip.pickup_location,
          destination: trip.destination,
          vehicle_type: trip.vehicle_type,
          fare: trip.fare,
          distance: trip.distance,
          duration: trip.actual_duration || trip.estimated_duration,
          payment_method: trip.payment_method,
          status: trip.status,
          created_at: trip.createdAt,
          completed_at: trip.ride_completed_at
        })),
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get driver trip history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trip history'
    });
  }
};

// Get driver's earnings breakdown
export const getDriverEarnings = async (req, res) => {
  try {
    console.log('=== DRIVER EARNINGS REQUEST ===');
    console.log('Driver ID:', req.driver?.id);
    console.log('Driver _id:', req.driver?._id);
    console.log('Driver object:', req.driver);
    console.log('Query params:', req.query);
    
    const driverId = req.driver._id;
    const { period = 'month', year, month } = req.query;

    console.log('Processing earnings for driver:', driverId, 'period:', period);

    // Convert driverId to ObjectId for queries
    const driverObjectId = mongoose.Types.ObjectId.isValid(driverId) ? 
      new mongoose.Types.ObjectId(driverId) : driverId;

    console.log('Driver ObjectId:', driverObjectId);

    // Get ALL earnings data for the driver (no date filtering)
    const allEarnings = await Earnings.find({
      driver: driverObjectId
    }).sort({ date: -1 });

    console.log('Found total earnings records:', allEarnings.length);

    // Get daily earnings breakdown (all time)
    const dailyEarnings = await Earnings.aggregate([
      {
        $match: {
          driver: driverObjectId
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          daily_earnings: { $sum: '$driver_earnings' },
          daily_trips: { $sum: '$trip_count' },
          daily_commission: { $sum: '$platform_commission' },
          daily_total_fare: { $sum: '$total_fare' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Get payment method breakdown (all time)
    const paymentBreakdown = await Earnings.aggregate([
      {
        $match: {
          driver: driverObjectId
        }
      },
      {
        $group: {
          _id: '$payment_method',
          earnings: { $sum: '$driver_earnings' },
          trips: { $sum: '$trip_count' }
        }
      }
    ]);

    // Get vehicle type breakdown (all time)
    const vehicleBreakdown = await Earnings.aggregate([
      {
        $match: {
          driver: driverObjectId
        }
      },
      {
        $group: {
          _id: '$vehicle_type',
          earnings: { $sum: '$driver_earnings' },
          trips: { $sum: '$trip_count' },
          avg_fare: { $avg: '$total_fare' }
        }
      }
    ]);

    // Calculate totals (all time)
    const totals = await Earnings.aggregate([
      {
        $match: {
          driver: driverObjectId
        }
      },
      {
        $group: {
          _id: null,
          total_earnings: { $sum: '$driver_earnings' },
          total_trips: { $sum: '$trip_count' },
          total_commission: { $sum: '$platform_commission' },
          total_fare: { $sum: '$total_fare' }
        }
      }
    ]);

    console.log('Totals aggregation result:', totals);

    const totalData = totals[0] || {
      total_earnings: 0,
      total_trips: 0,
      total_commission: 0,
      total_fare: 0
    };

    const responseData = {
      period_info: {
        period,
        total_records: allEarnings.length
      },
      summary: {
        total_earnings: Math.round(totalData.total_earnings),
        total_trips: totalData.total_trips,
        total_commission: Math.round(totalData.total_commission),
        total_fare: Math.round(totalData.total_fare),
        avg_earnings_per_trip: totalData.total_trips > 0 
          ? Math.round(totalData.total_earnings / totalData.total_trips)
          : 0
      },
      daily_earnings: dailyEarnings.map(day => ({
        date: `${day._id.year}-${String(day._id.month).padStart(2, '0')}-${String(day._id.day).padStart(2, '0')}`,
        earnings: Math.round(day.daily_earnings),
        trips: day.daily_trips,
        commission: Math.round(day.daily_commission),
        total_fare: Math.round(day.daily_total_fare)
      })),
      payment_breakdown: paymentBreakdown.map(method => ({
        payment_method: method._id,
        earnings: Math.round(method.earnings),
        trips: method.trips
      })),
      vehicle_breakdown: vehicleBreakdown.map(vehicle => ({
        vehicle_type: vehicle._id,
        earnings: Math.round(vehicle.earnings),
        trips: vehicle.trips,
        avg_fare: Math.round(vehicle.avg_fare)
      }))
    };

    console.log('Sending driver earnings response:', responseData);

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Get driver earnings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch earnings data'
    });
  }
};

// Get driver's current status and availability
export const getDriverStatus = async (req, res) => {
  try {
    const driverId = req.driver.id;

    // Check for active ride
    const activeRide = await Ride.findOne({
      driver: driverId,
      status: { $in: ['accepted', 'picked_up', 'in_progress'] }
    }).populate('customer', 'name phone');

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await Earnings.aggregate([
      {
        $match: {
          driver: driverId,
          date: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          today_earnings: { $sum: '$driver_earnings' },
          today_trips: { $sum: '$trip_count' }
        }
      }
    ]);

    const stats = todayStats[0] || { today_earnings: 0, today_trips: 0 };

    res.json({
      success: true,
      data: {
        driver_id: driverId,
        is_active: !!activeRide,
        active_ride: activeRide,
        today_stats: {
          earnings: Math.round(stats.today_earnings),
          trips_completed: stats.today_trips
        },
        availability_status: activeRide ? 'busy' : 'available'
      }
    });

  } catch (error) {
    console.error('Get driver status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch driver status'
    });
  }
};

// Update driver availability (go online/offline)
export const updateDriverAvailability = async (req, res) => {
  try {
    const driverId = req.driver.id;
    const { is_available } = req.body;

    // Check if driver has any active rides
    const activeRide = await Ride.findOne({
      driver: driverId,
      status: { $in: ['accepted', 'picked_up', 'in_progress'] }
    });

    if (activeRide && !is_available) {
      return res.status(400).json({
        success: false,
        error: 'Cannot go offline while having an active ride'
      });
    }

    // In a real app, you'd update a driver availability status in the database
    // For now, we'll just return the status
    res.json({
      success: true,
      message: `Driver is now ${is_available ? 'online' : 'offline'}`,
      data: {
        driver_id: driverId,
        is_available,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Update driver availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update availability'
    });
  }
};
