'use client';

import { useState, useEffect } from 'react';
import { FaCar, FaMapMarkerAlt, FaMoneyBillWave, FaSpinner, FaCheck, FaTimes, FaUser, FaPhone } from 'react-icons/fa';
import { toast } from 'react-toastify';
import RideService from '@/app/lib/rideService';
import SocketService from '@/app/lib/socketService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AvailableRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [acceptingRide, setAcceptingRide] = useState(null);

  useEffect(() => {
    getCurrentLocation();
    setupRealTimeUpdates();
    
    return () => {
      SocketService.removeAllListeners('new_ride_request');
    };
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchAvailableRides();
    }
  }, [currentLocation]);

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
          // Default to Dhaka center if location is not available
          setCurrentLocation({
            lat: 23.8103,
            lng: 90.4125
          });
          toast.warn('Using default location (Dhaka). Please enable location services for better results.');
        }
      );
    } else {
      setCurrentLocation({
        lat: 23.8103,
        lng: 90.4125
      });
      toast.warn('Geolocation not supported. Using default location.');
    }
  };

  const setupRealTimeUpdates = () => {
    SocketService.connect();
    
    SocketService.onNewRideRequest((rideData) => {
      toast.info('New ride request nearby!');
      fetchAvailableRides(); // Refresh the list
    });
  };

  const fetchAvailableRides = async () => {
    if (!currentLocation) return;
    
    try {
      const response = await RideService.getAvailableRides(
        currentLocation.lat,
        currentLocation.lng,
        10 // 10km radius
      );
      
      if (response.success) {
        setRides(response.data);
      } else {
        toast.error('Failed to fetch available rides');
      }
    } catch (error) {
      console.error('Error fetching available rides:', error);
      toast.error('Failed to fetch available rides');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRide = async (rideId) => {
    setAcceptingRide(rideId);
    
    try {
      const response = await RideService.acceptRide(rideId);
      
      if (response.success) {
        toast.success('Ride accepted successfully!');
        // Remove the accepted ride from the list
        setRides(prev => prev.filter(ride => ride.ride_id !== rideId));
        
        // Emit socket event for real-time updates
        SocketService.updateRideStatus(rideId, 'accepted', 'Driver has accepted your ride request');
      } else {
        toast.error(response.error || 'Failed to accept ride');
      }
    } catch (error) {
      console.error('Error accepting ride:', error);
      toast.error('Failed to accept ride');
    } finally {
      setAcceptingRide(null);
    }
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

  const getDistanceToPickup = (ride) => {
    if (!currentLocation) return 0;
    
    return calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      ride.pickup_location.coordinates.latitude,
      ride.pickup_location.coordinates.longitude
    );
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Available Rides
        </h2>
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-2xl text-blue-600" />
          <span className="ml-2 text-gray-600">Finding nearby rides...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Available Rides
        </h2>
        <Button
          onClick={fetchAvailableRides}
          variant="outline"
          size="sm"
        >
          Refresh
        </Button>
      </div>

      {currentLocation && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <FaMapMarkerAlt className="inline mr-2" />
            Searching for rides within 10km of your current location
          </p>
        </div>
      )}

      {rides.length === 0 ? (
        <Card className="p-8 text-center">
          <FaCar className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No rides available</h3>
          <p className="text-gray-500">Check back in a few moments for new ride requests.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => {
            const distanceToPickup = getDistanceToPickup(ride);
            const isAccepting = acceptingRide === ride.ride_id;
            
            return (
              <Card key={ride.ride_id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{ride.customer.name}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaPhone className="mr-1" />
                        {ride.customer.phone}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ৳{ride.estimated_fare}
                    </div>
                    <div className="text-sm text-gray-500">
                      {distanceToPickup.toFixed(1)} km away
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-start space-x-2 mb-3">
                      <FaMapMarkerAlt className="text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Pickup</p>
                        <p className="font-medium">{ride.pickup_location.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <FaMapMarkerAlt className="text-red-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Destination</p>
                        <p className="font-medium">{ride.destination.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Distance</p>
                        <p className="font-medium">{ride.distance.toFixed(1)} km</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Duration</p>
                        <p className="font-medium">{ride.estimated_duration} min</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium capitalize">{ride.payment_method}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => handleAcceptRide(ride.ride_id)}
                    disabled={isAccepting}
                    className="flex-1"
                  >
                    {isAccepting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <FaCheck className="mr-2" />
                        Accept Ride
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => window.open(`tel:${ride.customer.phone}`)}
                    variant="outline"
                  >
                    <FaPhone />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvailableRides;
