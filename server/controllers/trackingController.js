import Location from '../models/Location.js';
import Ride from '../models/Ride.js';
import Driver from '../models/Driver.js';

// Update driver location during a ride
export const updateDriverLocation = async (req, res) => {
  try {
    const { ride_id } = req.params;
    const { latitude, longitude, heading, speed } = req.body;
    const driverId = req.driver.id;

    // Verify the ride exists and belongs to the driver
    const ride = await Ride.findById(ride_id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        error: 'Ride not found'
      });
    }

    if (ride.driver.toString() !== driverId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update location for this ride'
      });
    }

    // Only allow location updates for active rides
    if (!['accepted', 'picked_up', 'in_progress'].includes(ride.status)) {
      return res.status(400).json({
        success: false,
        error: 'Location updates only allowed for active rides'
      });
    }

    // Create new location record
    const location = new Location({
      ride: ride_id,
      driver: driverId,
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      heading: heading || 0,
      speed: speed || 0
    });

    await location.save();

    // ALSO update the driver_location in the Ride model for faster access
    await Ride.findByIdAndUpdate(ride_id, {
      driver_location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        heading: heading || 0,
        speed: speed || 0,
        timestamp: new Date()
      }
    });

    // Emit real-time location update to customers via Socket.IO
    const io = req.app.get('socketio');
    if (io) {
      console.log(`🔥 Emitting driver location update for ride ${ride_id}`);
      io.to(`ride_${ride_id}`).emit('driver_location', {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        heading: heading || 0,
        speed: speed || 0,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        ride_id: ride._id,
        location: {
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude,
          heading: location.heading,
          speed: location.speed,
          timestamp: location.timestamp
        }
      }
    });

  } catch (error) {
    console.error('Update driver location error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update location'
    });
  }
};

// Get current driver location for a ride
export const getDriverLocation = async (req, res) => {
  try {
    const { ride_id } = req.params;

    // First try to get the location from the Ride model (faster)
    const ride = await Ride.findById(ride_id).populate('driver', 'name phone vehicle_no vehicle_type');
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        error: 'Ride not found'
      });
    }

    // Check if we have driver_location in the ride document
    if (ride.driver_location && ride.driver_location.latitude) {
      console.log(`✅ Returning driver location from Ride model for ${ride_id}`);
      return res.json({
        success: true,
        data: {
          ride_id,
          driver: ride.driver,
          location: {
            latitude: ride.driver_location.latitude,
            longitude: ride.driver_location.longitude,
            heading: ride.driver_location.heading || 0,
            speed: ride.driver_location.speed || 0,
            timestamp: ride.driver_location.timestamp || new Date()
          }
        }
      });
    }

    // Fallback: Get the most recent location from Location collection
    console.log(`⚠️ No driver_location in Ride model, checking Location collection for ${ride_id}`);
    const location = await Location.findOne({ ride: ride_id })
      .sort({ timestamp: -1 })
      .populate('driver', 'name phone vehicle_no vehicle_type');

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'No location data found for this ride'
      });
    }

    console.log(`✅ Returning driver location from Location collection for ${ride_id}`);
    res.json({
      success: true,
      data: {
        ride_id,
        driver: location.driver,
        location: {
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude,
          heading: location.heading,
          speed: location.speed,
          timestamp: location.timestamp
        }
      }
    });

  } catch (error) {
    console.error('Get driver location error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch driver location'
    });
  }
};

// Get location history for a ride
export const getRideLocationHistory = async (req, res) => {
  try {
    const { ride_id } = req.params;
    const { limit = 50 } = req.query;

    const locations = await Location.find({ ride: ride_id })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .select('coordinates heading speed timestamp');

    res.json({
      success: true,
      data: {
        ride_id,
        location_history: locations.map(loc => ({
          latitude: loc.coordinates.latitude,
          longitude: loc.coordinates.longitude,
          heading: loc.heading,
          speed: loc.speed,
          timestamp: loc.timestamp
        }))
      }
    });

  } catch (error) {
    console.error('Get ride location history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch location history'
    });
  }
};

// Simulate driver movement (for testing purposes)
export const simulateDriverMovement = async (req, res) => {
  try {
    const { ride_id } = req.params;
    const driverId = req.driver.id;

    const ride = await Ride.findById(ride_id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        error: 'Ride not found'
      });
    }

    if (ride.driver.toString() !== driverId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    // Generate simulated route from pickup to destination
    const pickup = ride.pickup_location.coordinates;
    const destination = ride.destination.coordinates;
    
    const simulatedLocations = [];
    const steps = 10; // Number of simulation steps
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const lat = pickup.latitude + (destination.latitude - pickup.latitude) * progress;
      const lng = pickup.longitude + (destination.longitude - pickup.longitude) * progress;
      
      // Add some randomness to make it more realistic
      const latJitter = (Math.random() - 0.5) * 0.001;
      const lngJitter = (Math.random() - 0.5) * 0.001;
      
      simulatedLocations.push({
        latitude: lat + latJitter,
        longitude: lng + lngJitter,
        heading: Math.floor(Math.random() * 360),
        speed: Math.floor(Math.random() * 50) + 20, // 20-70 km/h
        timestamp: new Date(Date.now() + i * 30000) // 30 seconds apart
      });
    }

    // Save simulated locations
    const locationPromises = simulatedLocations.map((loc, index) => {
      return new Location({
        ride: ride_id,
        driver: driverId,
        coordinates: {
          latitude: loc.latitude,
          longitude: loc.longitude
        },
        heading: loc.heading,
        speed: loc.speed,
        timestamp: loc.timestamp
      }).save();
    });

    await Promise.all(locationPromises);

    res.json({
      success: true,
      message: 'Simulated movement data created',
      data: {
        ride_id,
        simulated_points: simulatedLocations.length
      }
    });

  } catch (error) {
    console.error('Simulate driver movement error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to simulate movement'
    });
  }
};

// Get nearby drivers (for customer to see available drivers)
export const getNearbyDrivers = async (req, res) => {
  try {
    const { latitude, longitude, vehicle_type, radius = 5 } = req.query;

    // This is a simplified version - in a real app, you'd track driver locations in real-time
    // For now, we'll simulate by finding drivers with recent location updates
    
    // Find drivers of the specified vehicle type
    const drivers = await Driver.find({ 
      vehicle_type: vehicle_type || { $in: ['bike', 'cng', 'car'] }
    }).select('name vehicle_type vehicle_no');

    // Simulate nearby drivers with random locations within radius
    const nearbyDrivers = drivers.slice(0, 5).map(driver => {
      // Generate random location within radius
      const latOffset = (Math.random() - 0.5) * (radius / 111); // Rough conversion
      const lngOffset = (Math.random() - 0.5) * (radius / 111);
      
      return {
        driver_id: driver._id,
        name: driver.name,
        vehicle_type: driver.vehicle_type,
        vehicle_no: driver.vehicle_no,
        location: {
          latitude: parseFloat(latitude) + latOffset,
          longitude: parseFloat(longitude) + lngOffset
        },
        distance: Math.round(Math.random() * radius * 100) / 100, // Random distance within radius
        eta: Math.floor(Math.random() * 10) + 2 // 2-12 minutes ETA
      };
    });

    res.json({
      success: true,
      data: {
        nearby_drivers: nearbyDrivers,
        search_radius: radius,
        total_found: nearbyDrivers.length
      }
    });

  } catch (error) {
    console.error('Get nearby drivers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby drivers'
    });
  }
};
