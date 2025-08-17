'use client';

import { useState, useEffect } from 'react';
import { FaCar, FaMapMarkerAlt, FaMoneyBillWave, FaSpinner, FaCheck, FaTimes, FaUser, FaPhone } from 'react-icons/fa';
import { toast } from 'react-toastify';
import RideService from '@/app/lib/rideService';
import SocketService from '@/app/lib/socketService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LocationGuide from '@/components/LocationGuide';
import IPLocationFix from '@/components/IPLocationFix';

const AvailableRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [acceptingRide, setAcceptingRide] = useState(null);
  const [locationStatus, setLocationStatus] = useState('checking'); // 'checking', 'granted', 'denied', 'unavailable'
  const [showLocationGuide, setShowLocationGuide] = useState(false);
  const [showIPFix, setShowIPFix] = useState(false);

  useEffect(() => {
    getCurrentLocation();
    setupRealTimeUpdates();
    
    // Set up permission change listener
    const checkPermissionPeriodically = setInterval(() => {
      if (locationStatus === 'denied' || locationStatus === 'unavailable') {
        checkAndRetryLocation();
      }
    }, 5000); // Check every 5 seconds
    
    return () => {
      SocketService.removeAllListeners('new_ride_request');
      clearInterval(checkPermissionPeriodically);
    };
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchAvailableRides();
    }
  }, [currentLocation]);

  const checkAndRetryLocation = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'granted' && locationStatus !== 'granted') {
        console.log('Location permission granted, retrying location access...');
        getCurrentLocation();
      }
    } catch (error) {
      // Permission API not supported, just try location access
      if (locationStatus === 'denied') {
        getCurrentLocation();
      }
    }
  };

  const getCurrentLocation = async () => {
    setLocationStatus('checking');
    
    // Check if we're on an IP address (not localhost/domain)
    const isIpAddress = /^http:\/\/\d+\.\d+\.\d+\.\d+/.test(window.location.href);
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setCurrentLocation({
        lat: 23.8103,
        lng: 90.4125
      });
      setLocationStatus('unavailable');
      toast.warn('Geolocation not supported by your browser. Using default location (Dhaka).');
      return;
    }

    // Special handling for IP addresses
    if (isIpAddress) {
      toast.info('🔍 Detected IP address access. Checking browser compatibility...');
      
      // Check if this is Chrome and suggest the fix
      const isChrome = /Chrome/.test(navigator.userAgent);
      if (isChrome) {
        console.log('Chrome detected on IP address - may need --unsafely-treat-insecure-origin-as-secure flag');
      }
    }

    // Check permission state first
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      console.log('Current permission state:', permission.state);
      console.log('Current URL:', window.location.href);
      console.log('Is IP address:', isIpAddress);
      
      if (permission.state === 'denied') {
        if (isIpAddress) {
          toast.error(
            '🚫 Location denied for IP address. For development:\n' +
            '1. Use Chrome with --unsafely-treat-insecure-origin-as-secure flag\n' +
            '2. Or add this IP to chrome://flags > "Insecure origins treated as secure"\n' +
            '3. Or use Firefox with geo.security.allowinsecure=true',
            { autoClose: 10000 }
          );
        }
        handleLocationDenied();
        return;
      }
      
      if (permission.state === 'prompt') {
        if (isIpAddress) {
          toast.warning(
            '⚠️ Browser may block location on IP addresses. If prompt doesn\'t appear, check the browser fix guide.',
            { autoClose: 8000 }
          );
        } else {
          toast.info('📍 Please allow location access to find nearby rides');
        }
      }
      
      if (permission.state === 'granted') {
        toast.success('📍 Location permission granted, getting your location...');
      }
    } catch (error) {
      console.log('Permission API not supported, proceeding with geolocation request');
      if (isIpAddress) {
        toast.warning('⚠️ Cannot check permission state on IP address. Attempting location access...');
      }
    }

    // Enhanced geolocation options
    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds timeout
      maximumAge: 30000 // 30 seconds cache
    };

    console.log('Requesting location with options:', options);
    console.log('User agent:', navigator.userAgent);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location successfully obtained:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toLocaleString(),
          url: window.location.href
        });
        
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationStatus('granted');
        toast.success(`✅ Location detected successfully! (accuracy: ${Math.round(position.coords.accuracy)}m)`);
      },
      (error) => {
        const isIpAddress = /^http:\/\/\d+\.\d+\.\d+\.\d+/.test(window.location.href);
        
        console.error('Geolocation error occurred:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          isIpAddress: isIpAddress,
          userAgent: navigator.userAgent
        });
        
        let errorMessage = 'Could not get your location';
        let toastType = 'warn';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            if (isIpAddress) {
              errorMessage = '🚫 Location denied on IP address. This is a browser security restriction.\n\n' +
                           'Quick Fix:\n' +
                           '• Chrome: Add --unsafely-treat-insecure-origin-as-secure=http://192.168.0.104:3000\n' +
                           '• Firefox: Set geo.security.allowinsecure=true in about:config\n' +
                           '• Or use HTTPS in production';
              toastType = 'error';
            } else {
              errorMessage = 'Location access was denied. Please check your browser settings.';
              toastType = 'error';
            }
            setLocationStatus('denied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable. Please check your GPS and internet connection.';
            setLocationStatus('unavailable');
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Retrying...';
            setLocationStatus('unavailable');
            // Auto-retry once after timeout
            setTimeout(() => {
              console.log('Auto-retrying location after timeout...');
              getCurrentLocation();
            }, 2000);
            break;
          default:
            errorMessage = `Location error: ${error.message || 'Unknown error'}`;
            if (isIpAddress) {
              errorMessage += '\n\nNote: IP addresses have stricter location policies in browsers.';
            }
            setLocationStatus('unavailable');
        }
        
        // Use default location
        setCurrentLocation({
          lat: 23.8103,
          lng: 90.4125
        });
        
        if (toastType === 'error') {
          toast.error(errorMessage, { autoClose: 8000 });
        } else {
          toast.warn(errorMessage + ' Using default location (Dhaka).', { autoClose: 6000 });
        }
      },
      options
    );
  };

  const handleLocationDenied = () => {
    setCurrentLocation({
      lat: 23.8103,
      lng: 90.4125
    });
    setLocationStatus('denied');
    
    toast.error(
      '🚫 Location access permanently denied. To enable: \n' +
      '1. Click the location icon in your browser address bar\n' +
      '2. Select "Always allow" for this site\n' +
      '3. Refresh the page',
      { autoClose: 8000 }
    );
  };

  const retryLocation = () => {
    console.log('Manual location retry triggered');
    setLocationStatus('checking');
    toast.info('🔄 Retrying location access...');
    getCurrentLocation();
  };

  const forceLocationRefresh = () => {
    console.log('Force location refresh triggered');
    setLocationStatus('checking');
    setCurrentLocation(null);
    toast.info('🔄 Force refreshing location...');
    
    // Clear any cached location
    if (navigator.geolocation && navigator.geolocation.clearWatch) {
      navigator.geolocation.clearWatch();
    }
    
    // Wait a moment then retry
    setTimeout(() => {
      getCurrentLocation();
    }, 500);
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
        <div className="flex items-center space-x-2">
          <Button
            onClick={fetchAvailableRides}
            variant="outline"
            size="sm"
          >
            🔄 Refresh Rides
          </Button>
          {(locationStatus === 'denied' || locationStatus === 'unavailable') && (
            <Button
              onClick={retryLocation}
              variant="outline"
              size="sm"
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              📍 Retry Location
            </Button>
          )}
          <Button
            onClick={forceLocationRefresh}
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            🎯 Force Refresh
          </Button>
        </div>
      </div>

      {/* Location Status Indicator */}
      <div className="mb-6">
        {locationStatus === 'checking' && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <FaSpinner className="animate-spin text-blue-600 mr-2" />
              <span className="text-blue-800">Checking location access...</span>
            </div>
          </div>
        )}
        
        {locationStatus === 'granted' && currentLocation && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-green-600 mr-2" />
                <span className="text-green-800">
                  ✅ Location enabled - Searching within 10km of your current location
                </span>
              </div>
              <div className="text-xs text-green-600">
                <div>📍 {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</div>
                <div>🕒 Updated: {new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        )}
        
        {locationStatus === 'denied' && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-red-600 mr-2" />
                <span className="text-red-800">
                  🚫 Location access denied - Using default location (Dhaka)
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowLocationGuide(true)}
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  📖 General Guide
                </Button>
                <Button
                  onClick={() => setShowIPFix(true)}
                  size="sm"
                  variant="outline"
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  🔧 IP Address Fix
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {locationStatus === 'unavailable' && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-yellow-600 mr-2" />
                <span className="text-yellow-800">
                  ⚠️ Location unavailable - Using default location (Dhaka)
                </span>
              </div>
              <div className="text-xs text-yellow-600">
                <div>Check GPS and internet connection</div>
                <div>Or try the "Force Refresh" button</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Debug Info - Remove this in production */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
          <div className="font-medium text-gray-700 mb-1">🔍 Debug Info:</div>
          <div className="text-gray-600 space-y-1">
            <div>Status: <span className="font-mono">{locationStatus}</span></div>
            <div>Has Location: <span className="font-mono">{currentLocation ? 'Yes' : 'No'}</span></div>
            <div>Geolocation Support: <span className="font-mono">{navigator.geolocation ? 'Yes' : 'No'}</span></div>
            <div>User Agent: <span className="font-mono text-xs">{navigator.userAgent.substring(0, 50)}...</span></div>
          </div>
        </div>
      </div>

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
      
      {/* Location Guide Modal */}
      <LocationGuide
        isOpen={showLocationGuide}
        onClose={() => setShowLocationGuide(false)}
        onRetry={() => {
          setShowLocationGuide(false);
          retryLocation();
        }}
      />
      
      {/* IP Location Fix Modal */}
      <IPLocationFix
        isOpen={showIPFix}
        onClose={() => setShowIPFix(false)}
      />
    </div>
  );
};

export default AvailableRides;
