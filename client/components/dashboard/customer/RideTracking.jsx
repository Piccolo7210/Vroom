'use client';

import { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaRoute, FaCar, FaPhone, FaSpinner, FaClock, FaLocationArrow } from 'react-icons/fa';
import { toast } from 'react-toastify';
import RideService from '@/app/lib/rideService';
import SocketService from '@/app/lib/socketService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PaymentSelectionModal from './PaymentSelectionModal';
import dynamic from 'next/dynamic';

// Dynamically import RideMap to avoid SSR issues
const RideMap = dynamic(
  () => import('@/components/dashboard/shared/RideMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <FaSpinner className="animate-spin text-2xl text-gray-400" />
        <span className="ml-2 text-gray-500">Loading map...</span>
      </div>
    )
  }
);

const RideTracking = ({ rideId, onRideComplete }) => {
  const [ride, setRide] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [currentDistance, setCurrentDistance] = useState(null);
  const [tripProgress, setTripProgress] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [customerProfile, setCustomerProfile] = useState(null);
  const socketConnected = useRef(false);

  useEffect(() => {
    if (rideId) {
      fetchRideDetails();
      fetchCustomerProfile();
      setupRealTimeTracking();
    } else {
      setLoading(false); // No rideId, so stop loading
    }

    return () => {
      cleanupTracking();
    };
  }, [rideId]);

  // Handle ride completion/cancellation
  useEffect(() => {
    if (ride && ride.status === 'completed' && ride.payment_status === 'pending' && customerProfile) {
      // Check if customer has multiple payment methods or only cash
      const paymentMethods = customerProfile.payment_methods || ['cash'];
      
      if (paymentMethods.length > 1 || (paymentMethods.length === 1 && !paymentMethods.includes('cash'))) {
        // Show payment selection modal if customer has multiple payment methods or only non-cash methods
        setShowPaymentModal(true);
      } else if (paymentMethods.includes('cash') && paymentMethods.length === 1) {
        // Auto-complete payment with cash if it's the only method
        handleCashPaymentAuto();
      }
    } else if (ride && ride.status === 'cancelled' && onRideComplete) {
      const timer = setTimeout(() => {
        onRideComplete();
      }, 3000); // Show cancellation message for 3 seconds before clearing
      
      return () => clearTimeout(timer);
    }
  }, [ride?.status, ride?.payment_status, customerProfile, onRideComplete]);

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

  const fetchCustomerProfile = async () => {
    try {
      // Get customer username from localStorage or ride data
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userName = userData.userName || ride?.customer?.userName;
      
      if (userName) {
        const response = await RideService.getCustomerProfile(userName);
        if (response.success) {
          setCustomerProfile(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      // Set default profile if fetch fails
      setCustomerProfile({ payment_methods: ['cash'] });
    }
  };

  const handleCashPaymentAuto = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/rides/${ride._id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethod: 'cash',
          paymentStatus: 'completed'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process cash payment');
      }

      const result = await response.json();
      
      toast.success('Cash payment completed successfully!');
      
      // Update ride state
      setRide(result.data.ride);
      
      // Clear ride after a delay
      setTimeout(() => {
        if (onRideComplete) {
          onRideComplete();
        }
      }, 2000);
      
    } catch (error) {
      console.error('Auto cash payment error:', error);
      toast.error('Failed to process cash payment. Please try again.');
    }
  };

  const handlePaymentMethodSelect = (paymentMethod) => {
    // PaymentSelectionModal handles the actual payment processing
    // This function receives the updated ride data after successful payment
    console.log('Payment method selected:', paymentMethod);
  };

  const handlePaymentComplete = (updatedRide) => {
    setRide(updatedRide);
    setShowPaymentModal(false);
    
    // Clear ride after showing success message
    setTimeout(() => {
      if (onRideComplete) {
        onRideComplete();
      }
    }, 2000);
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
        console.log('Received driver location update:', locationData);
        setDriverLocation(locationData);
        calculateEstimatedArrival(locationData);
        calculateCurrentDistance(locationData);
        calculateTripProgress(locationData);
        
        // Show subtle notification for location updates
        if (ride && ['accepted', 'picked_up', 'in_progress'].includes(ride.status)) {
          console.log('Driver location updated');
        }
      });

      // Listen for ride status changes
      SocketService.onRideStatusChange((statusData) => {
        console.log('Received ride status update:', statusData);
        setRide(prev => ({
          ...prev,
          status: statusData.status,
          [`${statusData.status}_at`]: statusData.timestamp
        }));
        
        // Show appropriate notifications based on status
        switch(statusData.status) {
          case 'accepted':
            toast.success('🚗 Driver found! Your driver is on the way');
            break;
          case 'picked_up':
            toast.success('🎉 You have been picked up! Enjoy your ride');
            break;
          case 'in_progress':
            toast.info('🚀 Ride started! Heading to destination');
            break;
          case 'completed':
            toast.success('✅ Ride completed! Please complete your payment');
            // Don't auto-call onRideComplete here, let the payment flow handle it
            break;
          case 'cancelled':
            toast.error('❌ Ride has been cancelled');
            onRideComplete && onRideComplete();
            break;
          default:
            toast.info(statusData.message || `Ride status: ${statusData.status.replace('_', ' ')}`);
        }
      });

      // Listen for driver arrival notifications
      SocketService.getSocket()?.on('driver_nearby', (data) => {
        toast.info('🚗 Your driver is nearby! Please be ready');
      });

      // Listen for ETA updates
      SocketService.getSocket()?.on('eta_update', (data) => {
        setEstimatedArrival(data.eta_minutes);
        console.log('ETA updated:', data.eta_minutes, 'minutes');
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

    // Determine target location based on ride status
    const targetLocation = ride.status === 'accepted' ? 
      ride.pickup_location.coordinates : 
      ride.destination.coordinates;

    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    );

    // More sophisticated speed estimation based on various factors
    let avgSpeed = 25; // Base speed in km/h

    // Adjust speed based on time of day (traffic patterns)
    const currentHour = new Date().getHours();
    if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)) {
      avgSpeed = 15; // Rush hour traffic
    } else if (currentHour >= 22 || currentHour <= 6) {
      avgSpeed = 35; // Night time, less traffic
    }

    // Adjust speed based on current driver speed if available
    if (location.speed && location.speed > 0) {
      // Use weighted average of current speed and estimated speed
      avgSpeed = (location.speed * 0.7) + (avgSpeed * 0.3);
    }

    // Adjust for very short distances (traffic lights, etc.)
    if (distance < 1) {
      avgSpeed = Math.min(avgSpeed, 20);
    }

    const estimatedTimeMinutes = Math.max(1, Math.round((distance / avgSpeed) * 60));
    setEstimatedArrival(estimatedTimeMinutes);

    // Calculate and display additional useful info
    const estimatedArrivalTime = new Date(Date.now() + estimatedTimeMinutes * 60000);
    console.log(`ETA: ${estimatedTimeMinutes} minutes (${estimatedArrivalTime.toLocaleTimeString()})`);
    console.log(`Distance: ${distance.toFixed(2)} km, Speed: ${avgSpeed.toFixed(1)} km/h`);
  };

  const calculateCurrentDistance = (location) => {
    if (!ride || !location) return;

    const targetLocation = ride.status === 'accepted' ? 
      ride.pickup_location.coordinates : 
      ride.destination.coordinates;

    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    );

    setCurrentDistance(distance);
  };

  const calculateTripProgress = (location) => {
    if (!ride || !location || ride.status !== 'in_progress') return;

    // Calculate progress from pickup to destination
    const totalDistance = calculateDistance(
      ride.pickup_location.coordinates.latitude,
      ride.pickup_location.coordinates.longitude,
      ride.destination.coordinates.latitude,
      ride.destination.coordinates.longitude
    );

    const remainingDistance = calculateDistance(
      location.latitude,
      location.longitude,
      ride.destination.coordinates.latitude,
      ride.destination.coordinates.longitude
    );

    const progress = Math.max(0, Math.min(100, ((totalDistance - remainingDistance) / totalDistance) * 100));
    setTripProgress(progress);
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

  // Handle case when no rideId is provided
  if (!rideId) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <FaMapMarkerAlt className="text-6xl text-gray-300" />
          <div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Ride</h3>
            <p className="text-gray-500 mb-4">
              You don't have any active rides to track. Book a ride first to see live tracking information here.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Switch to the "Book Ride" tab to start a new journey.
          </p>
        </div>
      </Card>
    );
  }

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

  // Show "No Active Ride" for completed or cancelled rides (only if payment is also completed)
  if (ride && ride.status === 'completed' && ride.payment_status === 'completed') {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-100">
            <FaCar className="text-2xl text-green-600" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Ride Completed Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              Thank you for choosing Vroom! Payment has been processed successfully.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">From:</span>
                <span className="font-medium">{ride.pickup_location.address}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">{ride.destination.address}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Fare:</span>
                <span className="font-medium text-green-600">৳{ride.fare.total_fare}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Payment:</span>
                <span className="font-medium text-green-600 capitalize">{ride.payment_method}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed:</span>
                <span className="font-medium">{formatTime(ride.ride_completed_at)}</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            Redirecting to booking page...
          </p>
        </div>
      </Card>
    );
  }

  if (ride && ride.status === 'cancelled') {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-100">
            <FaCar className="text-2xl text-red-600" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Ride Cancelled</h3>
            <p className="text-gray-600 mb-4">
              Your ride was cancelled. This page will refresh shortly.
            </p>
          </div>
          
          <p className="text-sm text-gray-500">
            Redirecting to booking page...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between bg-white border rounded-lg p-3 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            SocketService.isConnected() ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}></div>
          <span className="text-sm font-medium">
            {SocketService.isConnected() ? 'Live Tracking Active' : 'Connection Lost'}
          </span>
        </div>
        {!SocketService.isConnected() && (
          <Button
            onClick={() => {
              cleanupTracking();
              setupRealTimeTracking();
            }}
            size="sm"
            variant="outline"
          >
            Reconnect
          </Button>
        )}
      </div>

      {/* Ride Status Header */}
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Tracking Your Ride</h2>
          <p className={`text-lg font-semibold ${getStatusColor(ride.status)}`}>
            {getStatusMessage(ride.status)}
          </p>
          
          {estimatedArrival && ride.status !== 'completed' && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center space-x-3">
                <FaClock className="text-blue-600 text-lg" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-800">
                    {estimatedArrival} min
                  </div>
                  <div className="text-sm text-blue-600">
                    {ride.status === 'accepted' ? 'until pickup' : 'until destination'}
                  </div>
                  <div className="text-xs text-blue-500 mt-1">
                    ETA: {new Date(Date.now() + estimatedArrival * 60000).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
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
          Live Map Tracking
        </h3>
        <RideMap 
          pickup={ride.pickup_location}
          destination={ride.destination}
          driverLocation={driverLocation}
          rideStatus={ride.status}
        />
      </Card>

      {/* Live Tracking Stats */}
      {driverLocation && ['accepted', 'picked_up', 'in_progress'].includes(ride.status) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FaLocationArrow className="mr-2 text-purple-600" />
            Live Tracking Stats
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {driverLocation.speed ? Math.round(driverLocation.speed) : 0}
              </div>
              <div className="text-sm text-gray-600">km/h</div>
              <div className="text-xs text-gray-500">Current Speed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {currentDistance ? currentDistance.toFixed(1) : '---'}
              </div>
              <div className="text-sm text-gray-600">km</div>
              <div className="text-xs text-gray-500">
                {ride.status === 'accepted' ? 'To Pickup' : 'To Destination'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {estimatedArrival || '---'}
              </div>
              <div className="text-sm text-gray-600">min</div>
              <div className="text-xs text-gray-500">ETA</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatTime(driverLocation.timestamp)}
              </div>
              <div className="text-sm text-gray-600">Last Update</div>
              <div className="text-xs text-gray-500">
                {Math.round((Date.now() - new Date(driverLocation.timestamp)) / 1000)}s ago
              </div>
            </div>
          </div>

          {/* Trip Progress Bar (only during ride) */}
          {ride.status === 'in_progress' && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Trip Progress</span>
                <span className="text-sm text-gray-600">{Math.round(tripProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${tripProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Pickup</span>
                <span>Destination</span>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Driver Location Details */}
      {driverLocation && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FaLocationArrow className="mr-2 text-purple-600" />
            Driver Location Details
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Current Position</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                <div className="text-xs font-mono text-blue-800 mt-1">
                  {driverLocation.latitude.toFixed(6)}, {driverLocation.longitude.toFixed(6)}
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Movement</span>
                  <FaCar className="text-green-600" />
                </div>
                <div className="text-xs text-green-800 mt-1">
                  {driverLocation.heading !== undefined ? 
                    `Heading ${Math.round(driverLocation.heading)}°` : 
                    'Direction unknown'
                  }
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Location Accuracy</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  !driverLocation.accuracy || driverLocation.accuracy < 50 ? 
                    'bg-green-100 text-green-800' : 
                    driverLocation.accuracy < 100 ? 
                      'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                }`}>
                  {driverLocation.accuracy ? 
                    `±${Math.round(driverLocation.accuracy)}m` : 
                    'Good'
                  }
                </span>
              </div>
              <div className="text-xs text-gray-600">
                Last updated: {new Date(driverLocation.timestamp).toLocaleString()}
              </div>
            </div>
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

      {/* Payment Selection Modal */}
      {showPaymentModal && (
        <PaymentSelectionModal
          ride={ride}
          customerPaymentMethods={customerProfile?.payment_methods || ['cash']}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default RideTracking;
