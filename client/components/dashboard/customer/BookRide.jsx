'use client';

import { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaSearch, FaCar, FaClock, FaMotorcycle, FaTruck, FaSpinner, FaLocationArrow, FaMap } from 'react-icons/fa';
import { toast } from 'react-toastify';
import RideService from '@/app/lib/rideService';
import MapLocationSelector from './MapLocationSelector';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import dynamic from 'next/dynamic';
const BookRide = ({ userName }) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [fareEstimates, setFareEstimates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingRide, setBookingRide] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [mapMode, setMapMode] = useState('pickup'); // 'pickup' or 'destination'
  const [gettingLocation, setGettingLocation] = useState(false);

  // Dhaka landmarks for quick selection
  const landmarks = [
    { name: "Shahbagh", lat: 23.7379, lng: 90.3947 },
    { name: "Dhanmondi", lat: 23.7465, lng: 90.3760 },
    { name: "Gulshan", lat: 23.7925, lng: 90.4078 },
    { name: "Banani", lat: 23.7937, lng: 90.4007 },
    { name: "Uttara", lat: 23.8759, lng: 90.3795 },
    { name: "Motijheel", lat: 23.7330, lng: 90.4172 },
    { name: "New Market", lat: 23.7272, lng: 90.3896 },
    { name: "Farmgate", lat: 23.7583, lng: 90.3897 }
  ];

  const vehicleTypes = [
    {
      type: 'bike',
      name: 'Bike',
      icon: FaMotorcycle,
      description: 'Quick & Economical',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      type: 'cng',
      name: 'CNG',
      icon: FaTruck,
      description: 'Comfortable Ride',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      type: 'car',
      name: 'Car',
      icon: FaCar,
      description: 'Premium Comfort',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  // Get current location and set as default pickup
  useEffect(() => {
    if (navigator.geolocation) {
      setGettingLocation(true);
      
      // Enhanced geolocation options for better accuracy
      const options = {
        enableHighAccuracy: true,
        timeout: 15000, // 15 seconds timeout
        maximumAge: 30000 // 30 seconds cache max age
      };
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log('GPS Location detected:', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp).toLocaleString()
          });
          
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setCurrentLocation(location);
          
          // Automatically set current location as pickup with address lookup
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=18&addressdetails=1&accept-language=en`
            );
            const data = await response.json();
            console.log('Address lookup result:', data);
            
            const address = data?.display_name || `Current Location (${location.lat.toFixed(6)}, ${location.lng.toFixed(6)})`;
            
            setPickupCoords(location);
            setPickup(address);
            toast.success(`Current location set (accuracy: ${Math.round(location.accuracy)}m)`);
          } catch (error) {
            console.error('Address lookup failed:', error);
            const fallbackAddress = `Current Location (${location.lat.toFixed(6)}, ${location.lng.toFixed(6)})`;
            setPickupCoords(location);
            setPickup(fallbackAddress);
            toast.success(`Current location set (accuracy: ${Math.round(location.accuracy)}m)`);
          }
          setGettingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Could not detect your current location automatically';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please try again.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location detection timed out. Please try again.';
              break;
          }
          
          toast.warn(errorMessage);
          setGettingLocation(false);
        },
        options
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  }, []);

  // Check for active rides on component mount
  useEffect(() => {
    checkActiveRide();
  }, []);

  const checkActiveRide = async () => {
    try {
      const response = await RideService.getRideHistory();
      if (response.success) {
        const activeRideItem = response.data.rides.find(
          ride => ['requested', 'accepted', 'picked_up', 'in_progress'].includes(ride.status)
        );
        if (activeRideItem) {
          setActiveRide(activeRideItem);
        }
      }
    } catch (error) {
      console.error('Error checking active ride:', error);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }
    
    setGettingLocation(true);
    toast.info('Getting your precise location...');
    
    // Enhanced geolocation options for manual location request
    const options = {
      enableHighAccuracy: true,
      timeout: 20000, // 20 seconds timeout for manual request
      maximumAge: 0 // Force fresh location reading
    };
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log('Manual GPS Location:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toLocaleString()
        });
        
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        setCurrentLocation(location);
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=18&addressdetails=1&accept-language=en`
          );
          const data = await response.json();
          console.log('Manual address lookup:', data);
          
          const address = data?.display_name || `Current Location (${location.lat.toFixed(6)}, ${location.lng.toFixed(6)})`;
          
          setPickupCoords(location);
          setPickup(address);
          toast.success(`Location updated! Accuracy: ${Math.round(location.accuracy)} meters`);
        } catch (error) {
          console.error('Address lookup failed:', error);
          const fallbackAddress = `Current Location (${location.lat.toFixed(6)}, ${location.lng.toFixed(6)})`;
          setPickupCoords(location);
          setPickup(fallbackAddress);
          toast.success(`Location updated! Accuracy: ${Math.round(location.accuracy)} meters`);
        }
        
        setGettingLocation(false);
      },
      (error) => {
        console.error('Manual geolocation error:', error);
        let errorMessage = 'Failed to get your current location';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable. Please check your GPS/internet connection.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again or check your connection.';
            break;
        }
        
        toast.error(errorMessage);
        setGettingLocation(false);
      },
      options
    );
  };

  const openMapSelector = (mode) => {
    setMapMode(mode);
    setShowMapSelector(true);
  };

  const handleMapLocationConfirm = (locationData) => {
    if (mapMode === 'pickup') {
      setPickupCoords({ lat: locationData.lat, lng: locationData.lng });
      setPickup(locationData.address);
      toast.success('Pickup location selected from map');
    } else {
      setDestinationCoords({ lat: locationData.lat, lng: locationData.lng });
      setDestination(locationData.address);
      toast.success('Destination selected from map');
    }
    setShowMapSelector(false);
  };

  const selectLandmark = (landmark, isPickup = true) => {
    const coords = { lat: landmark.lat, lng: landmark.lng };
    if (isPickup) {
      setPickupCoords(coords);
      setPickup(landmark.name);
    } else {
      setDestinationCoords(coords);
      setDestination(landmark.name);
    }
  };

  const handleGetFareEstimates = async () => {
    if (!pickupCoords || !destinationCoords) {
      toast.error('Please select both pickup and destination locations');
      return;
    }

    setLoading(true);
    try {
      const response = await RideService.getAllFareEstimates(
        pickupCoords.lat,
        pickupCoords.lng,
        destinationCoords.lat,
        destinationCoords.lng
      );

      if (response.success) {
        setFareEstimates(response.data);
        toast.success('Fare estimates loaded!');
      } else {
        toast.error('Failed to get fare estimates');
      }
    } catch (error) {
      console.error('Error getting fare estimates:', error);
      toast.error('Failed to get fare estimates');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = async () => {
    if (!selectedVehicle || !pickupCoords || !destinationCoords) {
      toast.error('Please select vehicle type and locations');
      return;
    }

    setBookingRide(true);
    try {
      const rideData = {
        pickup_address: pickup,
        pickup_latitude: pickupCoords.lat,
        pickup_longitude: pickupCoords.lng,
        destination_address: destination,
        destination_latitude: destinationCoords.lat,
        destination_longitude: destinationCoords.lng,
        vehicle_type: selectedVehicle,
        payment_method: 'cash'
      };

      const response = await RideService.createRideRequest(rideData);

      if (response.success) {
        toast.success('Ride booked successfully!');
        setActiveRide({
          _id: response.data.ride_id,
          status: 'requested',
          otp: response.data.otp,
          pickup_location: { address: pickup },
          destination: { address: destination },
          vehicle_type: selectedVehicle,
          fare: { total_fare: response.data.estimated_fare }
        });
        
        // Reset form
        setPickup('');
        setDestination('');
        setPickupCoords(null);
        setDestinationCoords(null);
        setSelectedVehicle(null);
        setFareEstimates(null);
      } else {
        toast.error(response.error || 'Failed to book ride');
      }
    } catch (error) {
      console.error('Error booking ride:', error);
      toast.error('Failed to book ride');
    } finally {
      setBookingRide(false);
    }
  };

  if (activeRide) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Active Ride
        </h2>
        
        <Card className="p-6 mb-6 border-l-4 border-l-blue-500">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Ride Status: {activeRide.status.replace('_', ' ').toUpperCase()}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                activeRide.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                activeRide.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                activeRide.status === 'picked_up' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {activeRide.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">From</p>
                <p className="font-medium">{activeRide.pickup_location.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">To</p>
                <p className="font-medium">{activeRide.destination.address}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Vehicle Type</p>
                <p className="font-medium capitalize">{activeRide.vehicle_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fare</p>
                <p className="font-medium">৳{activeRide.fare.total_fare}</p>
              </div>
              {activeRide.otp && (
                <div>
                  <p className="text-sm text-gray-600">OTP</p>
                  <p className="font-bold text-lg text-blue-600">{activeRide.otp}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
        
        <Button 
          onClick={() => setActiveRide(null)}
          variant="outline"
          className="w-full"
        >
          Book Another Ride
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
        Book a Ride
      </h2>
      
      {/* Location Selection */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          {/* Debug info */}
          {currentLocation && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Current Location Detected:</strong><br/>
                📍 Coordinates: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}<br/>
                🎯 Accuracy: {currentLocation.accuracy ? `${Math.round(currentLocation.accuracy)} meters` : 'Unknown'}<br/>
                <span className="text-xs text-blue-600">
                  {currentLocation.accuracy < 50 ? '✅ High accuracy' : 
                   currentLocation.accuracy < 200 ? '⚠️ Medium accuracy' : 
                   '❌ Low accuracy - consider moving closer to a window'}
                </span>
              </div>
            </div>
          )}
          
          {/* Pickup Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-3 text-green-500" />
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full pl-10 pr-24 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={gettingLocation ? "Getting your location..." : "Enter pickup location"}
                disabled={gettingLocation}
              />
              <div className="absolute right-1 top-1 flex space-x-1">
                <Button
                  onClick={useCurrentLocation}
                  variant="outline"
                  size="sm"
                  disabled={gettingLocation || !currentLocation}
                  className="p-1"
                >
                  {gettingLocation ? (
                    <FaSpinner className="animate-spin w-4 h-4" />
                  ) : (
                    <FaLocationArrow className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={() => openMapSelector('pickup')}
                  variant="outline"
                  size="sm"
                  className="p-1"
                >
                  <FaMap className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Quick Landmark Selection for Pickup */}
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Quick select:</p>
              <div className="flex flex-wrap gap-1">
                {landmarks.slice(0, 4).map((landmark) => (
                  <button
                    key={landmark.name}
                    onClick={() => selectLandmark(landmark, true)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    {landmark.name}
                  </button>
                ))}
              </div>
              
              {/* Location accuracy indicator */}
              {pickupCoords && (
                <div className="mt-2 text-xs text-gray-600">
                  📍 Selected: {pickupCoords.lat.toFixed(6)}, {pickupCoords.lng.toFixed(6)}
                  {pickupCoords.accuracy && (
                    <span className="ml-2">
                      (±{Math.round(pickupCoords.accuracy)}m)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Destination Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-3 text-red-500" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter destination"
              />
              <Button
                onClick={() => openMapSelector('destination')}
                variant="outline"
                size="sm"
                className="absolute right-1 top-1 p-1"
              >
                <FaMap className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Quick Landmark Selection for Destination */}
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Quick select:</p>
              <div className="flex flex-wrap gap-1">
                {landmarks.slice(4).map((landmark) => (
                  <button
                    key={landmark.name}
                    onClick={() => selectLandmark(landmark, false)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    {landmark.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleGetFareEstimates}
            disabled={loading || !pickupCoords || !destinationCoords}
            className="w-full"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Getting Estimates...
              </>
            ) : (
              <>
                <FaSearch className="mr-2" />
                Get Fare Estimates
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Fare Estimates */}
      {fareEstimates && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Choose Your Ride</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vehicleTypes.map((vehicle) => {
              const fareData = fareEstimates[vehicle.type];
              const IconComponent = vehicle.icon;
              
              return (
                <div
                  key={vehicle.type}
                  onClick={() => setSelectedVehicle(vehicle.type)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedVehicle === vehicle.type
                      ? `${vehicle.borderColor} ${vehicle.bgColor} shadow-md`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <IconComponent className={`text-2xl ${vehicle.color}`} />
                    <span className="text-lg font-bold">৳{fareData.fare.total_fare}</span>
                  </div>
                  <h4 className="font-semibold">{vehicle.name}</h4>
                  <p className="text-sm text-gray-600">{vehicle.description}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Distance: {fareData.distance.toFixed(1)} km</span>
                      <span>ETA: {fareData.estimated_duration} min</span>
                    </div>
                    {fareData.surge_active && (
                      <p className="text-orange-600 font-medium">Surge pricing active</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            onClick={handleBookRide}
            disabled={bookingRide || !selectedVehicle}
            className="w-full mt-6"
            size="lg"
          >
            {bookingRide ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Booking Ride...
              </>
            ) : (
              <>
                <FaCar className="mr-2" />
                Book {selectedVehicle && vehicleTypes.find(v => v.type === selectedVehicle)?.name} - ৳{selectedVehicle && fareEstimates[selectedVehicle]?.fare.total_fare}
              </>
            )}
          </Button>
        </Card>
      )}

      {/* Map Location Selector Modal */}
      <MapLocationSelector
        isOpen={showMapSelector}
        onClose={() => setShowMapSelector(false)}
        onLocationConfirm={handleMapLocationConfirm}
        mode={mapMode}
        initialLocation={mapMode === 'pickup' ? pickupCoords : destinationCoords}
        currentLocation={currentLocation}
      />
    </div>
  );
};

export default BookRide;