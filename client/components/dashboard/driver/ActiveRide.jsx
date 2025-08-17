'use client';

import { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaUser, FaPhone, FaClock, FaSpinner, FaCheck, FaRoute } from 'react-icons/fa';
import { toast } from 'react-toastify';
import RideService from '@/app/lib/rideService';
import SocketService from '@/app/lib/socketService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ActiveRide = () => {
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [otp, setOtp] = useState('');
  const [finalFare, setFinalFare] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const locationInterval = useRef(null);

  useEffect(() => {
    fetchDriverStatus();
    getCurrentLocation();
    
    return () => {
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (activeRide && currentLocation) {
      setupLocationTracking();
    }
    
    return () => {
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
    };
  }, [activeRide, currentLocation]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.warn('Could not get your current location');
        }
      );
    }
  };

  const setupLocationTracking = () => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
    }

    // Update location every 10 seconds during active ride
    locationInterval.current = setInterval(() => {
      if (navigator.geolocation && activeRide) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              heading: position.coords.heading || 0,
              speed: position.coords.speed ? position.coords.speed * 3.6 : 0 // Convert m/s to km/h
            };
            
            setCurrentLocation({
              lat: newLocation.latitude,
              lng: newLocation.longitude
            });

            // Update location on server
            updateDriverLocation(newLocation);
          },
          (error) => {
            console.error('Error getting location for tracking:', error);
          }
        );
      }
    }, 10000); // Update every 10 seconds
  };

  const updateDriverLocation = async (locationData) => {
    if (!activeRide) return;
    
    try {
      const response = await RideService.updateDriverLocation(activeRide._id, locationData);
      
      if (!response.success) {
        // Location update failed - will retry on next interval
      }
      
      // Note: No need to emit socket event here anymore - backend handles it
    } catch (error) {
      // Error updating driver location - will retry on next interval
    }
  };

  const fetchDriverStatus = async () => {
    try {
      const response = await RideService.getDriverStatus();
      if (response.success && response.data.active_ride) {
        setActiveRide(response.data.active_ride);
        
        // Connect to socket and join ride room
        SocketService.connect();
        SocketService.joinRide(response.data.active_ride._id);
      }
    } catch (error) {
      console.error('Error fetching driver status:', error);
      toast.error('Failed to load active ride');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!activeRide) return;
    
    setUpdatingStatus(true);
    
    try {
      let requestData = { status: newStatus };
      
      // Add OTP for pickup verification
      if (newStatus === 'picked_up') {
        if (!otp) {
          toast.error('Please enter the OTP from customer');
          setUpdatingStatus(false);
          return;
        }
        requestData.otp = otp;
      }
      
      // Add final fare for completion
      if (newStatus === 'completed') {
        if (finalFare) {
          requestData.final_fare = parseFloat(finalFare);
        }
      }
      
      const response = await RideService.updateRideStatus(
        activeRide._id,
        newStatus,
        newStatus === 'picked_up' ? otp : null,
        newStatus === 'completed' && finalFare ? parseFloat(finalFare) : null
      );
      
      if (response.success) {
        setActiveRide(prev => ({
          ...prev,
          status: newStatus
        }));
        
        // Emit status update via socket
        const statusMessages = {
          picked_up: 'Driver has picked up the customer',
          in_progress: 'Ride is now in progress',
          completed: 'Ride has been completed successfully'
        };
        
        SocketService.updateRideStatus(
          activeRide._id, 
          newStatus, 
          statusMessages[newStatus] || `Status updated to ${newStatus}`
        );
        
        toast.success(`Ride status updated to ${newStatus.replace('_', ' ')}`);
        
        // Clear form fields
        setOtp('');
        setFinalFare('');
        
        // If ride is completed, clear active ride
        if (newStatus === 'completed') {
          setActiveRide(null);
          if (locationInterval.current) {
            clearInterval(locationInterval.current);
          }
        }
      } else {
        toast.error(response.error || 'Failed to update ride status');
      }
    } catch (error) {
      console.error('Error updating ride status:', error);
      toast.error('Failed to update ride status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getNextAction = () => {
    if (!activeRide) return null;
    
    switch (activeRide.status) {
      case 'accepted':
        return {
          action: 'picked_up',
          label: 'Mark as Picked Up',
          description: 'Customer is in the vehicle',
          requiresOtp: true
        };
      case 'picked_up':
        return {
          action: 'in_progress',
          label: 'Start Trip',
          description: 'Begin journey to destination',
          requiresOtp: false
        };
      case 'in_progress':
        return {
          action: 'completed',
          label: 'Complete Ride',
          description: 'Customer has reached destination',
          requiresOtp: false
        };
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'picked_up':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Active Ride
        </h2>
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-2xl text-blue-600" />
          <span className="ml-2 text-gray-600">Loading active ride...</span>
        </div>
      </div>
    );
  }

  if (!activeRide) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Active Ride
        </h2>
        <Card className="p-8 text-center">
          <FaRoute className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No active ride</h3>
          <p className="text-gray-500">Accept a ride request to start earning!</p>
        </Card>
      </div>
    );
  }

  const nextAction = getNextAction();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
        Active Ride
      </h2>
      
      {/* Ride Status */}
      <Card className="p-6 mb-6 border-l-4 border-l-blue-500">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Current Status</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activeRide.status)}`}>
            {activeRide.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Ride ID</p>
            <p className="font-mono text-sm">{activeRide._id.slice(-8)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Fare</p>
            <p className="font-bold text-lg text-green-600">৳{activeRide.fare.total_fare}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Distance</p>
            <p className="font-medium">{activeRide.distance.toFixed(1)} km</p>
          </div>
        </div>
      </Card>

      {/* Customer Information */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Customer Details</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaUser className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold">{activeRide.customer.name}</p>
              <p className="text-gray-600">{activeRide.customer.phone}</p>
            </div>
          </div>
          <Button
            onClick={() => window.open(`tel:${activeRide.customer.phone}`)}
            variant="outline"
            size="sm"
          >
            <FaPhone className="mr-2" />
            Call Customer
          </Button>
        </div>
        
        {/* OTP Display - Only show when driver needs to verify pickup */}
        {activeRide.status === 'accepted' && nextAction?.requiresOtp && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Customer Verification</p>
                <p className="text-xs text-blue-600">Ask the customer for their OTP to verify pickup</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-600">Customer should provide:</p>
                <p className="text-sm font-medium text-blue-800">4-digit OTP</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Route Information */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Route Details</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <FaMapMarkerAlt className="text-green-500 mt-1" />
            <div>
              <p className="text-sm text-gray-600">Pickup Location</p>
              <p className="font-medium">{activeRide.pickup_location.address}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <FaMapMarkerAlt className="text-red-500 mt-1" />
            <div>
              <p className="text-sm text-gray-600">Destination</p>
              <p className="font-medium">{activeRide.destination.address}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Section */}
      {nextAction && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Next Action</h3>
          <p className="text-gray-600 mb-4">{nextAction.description}</p>
          
          {/* OTP Input for pickup */}
          {nextAction.requiresOtp && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Verification OTP
              </label>
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Security Protocol:</strong> Ask the customer to tell you their 4-digit OTP verbally before entering it here.
                </p>
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP provided by customer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                The customer will provide this OTP when you arrive at the pickup location.
              </p>
            </div>
          )}
          
          {/* Final fare input for completion */}
          {nextAction.action === 'completed' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Final Fare (Optional)
              </label>
              <input
                type="number"
                value={finalFare}
                onChange={(e) => setFinalFare(e.target.value)}
                placeholder={`Default: ৳${activeRide.fare.total_fare}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use estimated fare: ৳{activeRide.fare.total_fare}
              </p>
            </div>
          )}
          
          <Button
            onClick={() => handleStatusUpdate(nextAction.action)}
            disabled={updatingStatus || (nextAction.requiresOtp && !otp)}
            className="w-full"
            size="lg"
          >
            {updatingStatus ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Updating...
              </>
            ) : (
              <>
                <FaCheck className="mr-2" />
                {nextAction.label}
              </>
            )}
          </Button>
        </Card>
      )}
    </div>
  );
};

export default ActiveRide;
