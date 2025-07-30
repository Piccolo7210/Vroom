'use client';

import { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaRoute, FaCar, FaPhone, FaSpinner, FaClock, FaLocationArrow } from 'react-icons/fa';
import { toast } from 'react-toastify';
import RideService from '@/app/lib/rideService';
import SocketService from '@/app/lib/socketService';
import RideMap from '@/components/dashboard/shared/RideMap';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const RideTracking = ({ rideId, onRideComplete }) => {
  const [ride, setRide] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const socketConnected = useRef(false);

  useEffect(() => {
    if (rideId) {
      fetchRideDetails();
      setupRealTimeTracking();
    }

    return () => {
      cleanupTracking();
    };
  }, [rideId]);

  const fetchRideDetails = async () => {
    try {
      const response = await RideService.getRideDetails(rideId);
      if (response.success) {
        setRide(response.data);
        
        // Fetch initial driver location if ride is active
        if (['accepted', 'picked_up', 'in_progress'].includes(response.data.status)) {
          fetchDriverLocation();
        }
      } else {
        toast.error('Failed to load ride details');
      }
    } catch (error) {
      console.error('Error fetching ride details:', error);
      toast.error('Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverLocation = async () => {
    try {
      const response = await RideService.getDriverLocation(rideId);
      if (response.success) {
        setDriverLocation(response.data.location);
        calculateEstimatedArrival(response.data.location);
      }
    } catch (error) {
      console.error('Error fetching driver location:', error);
    }
  };

  const setupRealTimeTracking = () => {
    if (!socketConnected.current) {
      SocketService.connect();
      SocketService.joinRide(rideId);
      socketConnected.current = true;

      // Listen for driver location updates
      SocketService.onDriverLocationUpdate((locationData) => {
        setDriverLocation(locationData);
        calculateEstimatedArrival(locationData);
        toast.info('Driver location updated');
      });

      // Listen for ride status changes
      SocketService.onRideStatusChange((statusData) => {
        setRide(prev => ({
          ...prev,
          status: statusData.status
        }));
        
        toast.success(statusData.message || `Ride status updated to ${statusData.status.replace('_', ' ')}`);
        
        if (statusData.status === 'completed') {
          onRideComplete && onRideComplete();
        }
      });
    }
  };

  const cleanupTracking = () => {
    if (socketConnected.current) {
      SocketService.removeAllListeners('driver_location');
      SocketService.removeAllListeners('ride_status_changed');
      SocketService.disconnect();
      socketConnected.current = false;
    }
  };

  const calculateEstimatedArrival = (location) => {
    if (!ride || !location) return;

    // Simple estimation based on distance and average speed
    const targetLocation = ride.status === 'accepted' ? 
      ride.pickup_location.coordinates : 
      ride.destination.coordinates;

    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    );

    // Assume average speed of 30 km/h in city traffic
    const avgSpeed = 30;
    const estimatedTimeMinutes = Math.round((distance / avgSpeed) * 60);
    setEstimatedArrival(estimatedTimeMinutes);
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toRad = (value) => {
    return value * Math.PI / 180;
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'requested':
        return 'Looking for a nearby driver...';
      case 'accepted':
        return 'Driver is on the way to pick you up';
      case 'picked_up':
        return 'You have been picked up! Enjoy your ride';
      case 'in_progress':
        return 'Ride in progress to your destination';
      case 'completed':
        return 'Ride completed successfully!';
      case 'cancelled':
        return 'Ride has been cancelled';
      default:
        return 'Ride status unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'requested':
        return 'text-yellow-600';
      case 'accepted':
        return 'text-blue-600';
      case 'picked_up':
        return 'text-green-600';
      case 'in_progress':
        return 'text-purple-600';
      case 'completed':
        return 'text-green-700';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FaSpinner className="animate-spin text-2xl text-blue-600" />
        <span className="ml-2 text-gray-600">Loading ride details...</span>
      </div>
    );
  }

  if (!ride) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Ride not found</h3>
        <p className="text-gray-500">Unable to load ride details.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ride Status Header */}
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Tracking Your Ride</h2>
          <p className={`text-lg font-semibold ${getStatusColor(ride.status)}`}>
            {getStatusMessage(ride.status)}
          </p>
          
          {estimatedArrival && ride.status !== 'completed' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                <FaClock className="text-blue-600" />
                <span className="text-blue-800 font-medium">
                  Estimated arrival: {estimatedArrival} minutes
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Driver Information */}
      {ride.driver && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Driver Information</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaCar className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="font-semibold">{ride.driver.name}</p>
                <p className="text-gray-600">Vehicle: {ride.driver.vehicle_no}</p>
                <p className="text-sm text-gray-500 capitalize">{ride.vehicle_type}</p>
              </div>
            </div>
            
            <Button
              onClick={() => window.open(`tel:${ride.driver.phone}`)}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <FaPhone />
              <span>Call Driver</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Route Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FaRoute className="mr-2 text-blue-600" />
          Route Details
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <FaMapMarkerAlt className="text-green-500 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Pickup Location</p>
              <p className="font-medium">{ride.pickup_location.address}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <FaMapMarkerAlt className="text-red-500 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Destination</p>
              <p className="font-medium">{ride.destination.address}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-600">Distance</p>
            <p className="font-semibold">{ride.distance.toFixed(1)} km</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Estimated Fare</p>
            <p className="font-semibold text-green-600">৳{ride.fare.total_fare}</p>
          </div>
        </div>
      </Card>

      {/* Live Map */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FaMapMarkerAlt className="mr-2 text-blue-600" />
          Live Map
        </h3>
        <RideMap 
          pickup={ride.pickup_location}
          destination={ride.destination}
          driverLocation={driverLocation}
          rideStatus={ride.status}
        />
      </Card>

      {/* Driver Location */}
      {driverLocation && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FaLocationArrow className="mr-2 text-purple-600" />
            Live Driver Location
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Current Speed</p>
              <p className="font-semibold">{driverLocation.speed || 0} km/h</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="font-semibold">{formatTime(driverLocation.timestamp)}</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Driver coordinates:</p>
            <p className="text-xs font-mono">
              {driverLocation.latitude.toFixed(6)}, {driverLocation.longitude.toFixed(6)}
            </p>
          </div>
        </Card>
      )}

      {/* OTP Display */}
      {ride.otp && ride.status !== 'completed' && (
        <Card className="p-6 border-l-4 border-l-blue-500">
          <h3 className="text-lg font-semibold mb-2">Ride OTP</h3>
          <p className="text-sm text-gray-600 mb-2">Share this OTP with your driver for pickup verification:</p>
          <div className="text-center">
            <span className="text-3xl font-bold text-blue-600 tracking-wider">{ride.otp}</span>
          </div>
        </Card>
      )}

      {/* Status Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ride Progress</h3>
        
        <div className="space-y-3">
          {[
            { status: 'requested', label: 'Ride Requested', time: ride.createdAt },
            { status: 'accepted', label: 'Driver Assigned', time: ride.acceptedAt },
            { status: 'picked_up', label: 'Pickup Complete', time: ride.ride_started_at },
            { status: 'in_progress', label: 'Ride in Progress', time: ride.ride_started_at },
            { status: 'completed', label: 'Ride Completed', time: ride.ride_completed_at }
          ].map((step, index) => {
            const isCompleted = ['requested', 'accepted', 'picked_up', 'in_progress', 'completed'].indexOf(ride.status) >= 
                               ['requested', 'accepted', 'picked_up', 'in_progress', 'completed'].indexOf(step.status);
            const isCurrent = ride.status === step.status;
            
            return (
              <div key={step.status} className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${
                  isCompleted 
                    ? isCurrent 
                      ? 'bg-blue-600 animate-pulse' 
                      : 'bg-green-600'
                    : 'bg-gray-300'
                }`} />
                <div className="flex-1">
                  <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.label}
                  </p>
                  {step.time && isCompleted && (
                    <p className="text-sm text-gray-500">
                      {formatTime(step.time)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default RideTracking;
