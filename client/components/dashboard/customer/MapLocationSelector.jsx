'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaCrosshairs, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for pickup and destination
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks
function LocationPicker({ onLocationSelect, mode, selectedLocation }) {
  const map = useMapEvents({
    click(e) {
      onLocationSelect(e.latlng, mode);
    },
  });

  return selectedLocation ? (
    <Marker 
      position={[selectedLocation.lat, selectedLocation.lng]} 
      icon={mode === 'pickup' ? pickupIcon : destinationIcon}
    >
      <Popup>
        {mode === 'pickup' ? 'Pickup Location' : 'Destination'}
        <br />
        {selectedLocation.address || `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`}
      </Popup>
    </Marker>
  ) : null;
}

const MapLocationSelector = ({ 
  isOpen, 
  onClose, 
  onLocationConfirm, 
  mode, // 'pickup' or 'destination'
  initialLocation,
  currentLocation 
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef();

  // Default center (Dhaka, Bangladesh)
  const defaultCenter = [23.8103, 90.4125];
  const mapCenter = currentLocation ? [currentLocation.lat, currentLocation.lng] : 
                   initialLocation ? [initialLocation.lat, initialLocation.lng] : 
                   defaultCenter;

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
      setAddress(initialLocation.address || '');
    }
  }, [initialLocation]);

  // Reverse geocoding to get address from coordinates
  const getAddressFromCoords = async (lat, lng) => {
    try {
      setLoading(true);
      // Using OpenStreetMap Nominatim API for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        return data.display_name;
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Error getting address:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = async (latlng, locMode) => {
    if (locMode === mode) {
      const newLocation = {
        lat: latlng.lat,
        lng: latlng.lng
      };
      
      setSelectedLocation(newLocation);
      
      // Get address for the selected location
      const locationAddress = await getAddressFromCoords(latlng.lat, latlng.lng);
      setAddress(locationAddress);
      
      newLocation.address = locationAddress;
      setSelectedLocation(newLocation);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }
    
    setLoading(true);
    
    // Enhanced geolocation options for map selector
    const options = {
      enableHighAccuracy: true,
      timeout: 20000, // 20 seconds timeout
      maximumAge: 0 // Force fresh reading
    };
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLocation = {
          lat: latitude,
          lng: longitude,
          accuracy: accuracy
        };
        
        const locationAddress = await getAddressFromCoords(latitude, longitude);
        newLocation.address = locationAddress;
        
        setSelectedLocation(newLocation);
        setAddress(locationAddress);
        
        // Center map on current location with appropriate zoom based on accuracy
        if (mapRef.current) {
          const zoom = accuracy < 50 ? 18 : accuracy < 100 ? 17 : accuracy < 500 ? 16 : 15;
          mapRef.current.setView([latitude, longitude], zoom);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Map geolocation error:', error);
        let errorMessage = 'Failed to get current location';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable. Please check your GPS/internet connection.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
        
        alert(errorMessage);
        setLoading(false);
      },
      options
    );
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationConfirm({
        ...selectedLocation,
        address: address
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center">
            <FaMapMarkerAlt className={`mr-2 ${mode === 'pickup' ? 'text-green-600' : 'text-red-600'}`} />
            Select {mode === 'pickup' ? 'Pickup' : 'Destination'} Location
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCurrentLocation}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaCrosshairs className="mr-2" />
              )}
              Use Current Location
            </button>
            
            <div className="flex-1">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address will appear here when you click on the map"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-2">
            Click on the map to select {mode === 'pickup' ? 'pickup' : 'destination'} location, or use current location button
          </p>
        </div>

        {/* Map */}
        <div className="h-96 relative">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Current location marker */}
            {currentLocation && (
              <Marker position={[currentLocation.lat, currentLocation.lng]}>
                <Popup>Your Current Location</Popup>
              </Marker>
            )}
            
            {/* Location picker */}
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              mode={mode}
              selectedLocation={selectedLocation}
            />
          </MapContainer>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaCheck className="mr-2" />
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapLocationSelector;
