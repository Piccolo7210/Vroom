'use client';

import { useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaCar } from 'react-icons/fa';

const RideMap = ({ pickup, destination, driverLocation, rideStatus }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    // Only initialize map on client side
    if (typeof window !== 'undefined' && !mapInstance.current) {
      initializeMap();
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstance.current && (pickup || destination || driverLocation)) {
      updateMapMarkers();
    }
  }, [pickup, destination, driverLocation, rideStatus]);

  const initializeMap = async () => {
    try {
      // Dynamic import of Leaflet to avoid SSR issues
      const L = (await import('leaflet')).default;
      
      // Fix default marker icons for Leaflet
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Default center (Dhaka)
      const defaultCenter = [23.8103, 90.4125];
      
      mapInstance.current = L.map(mapRef.current).setView(defaultCenter, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      updateMapMarkers();
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const updateMapMarkers = async () => {
    if (!mapInstance.current) return;

    try {
      const L = (await import('leaflet')).default;
      
      // Clear existing markers
      mapInstance.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapInstance.current.removeLayer(layer);
        }
      });

      const bounds = [];

      // Add pickup marker
      if (pickup?.coordinates) {
        const pickupMarker = L.marker([pickup.coordinates.latitude, pickup.coordinates.longitude])
          .addTo(mapInstance.current)
          .bindPopup('Pickup Location');
        bounds.push([pickup.coordinates.latitude, pickup.coordinates.longitude]);
      }

      // Add destination marker
      if (destination?.coordinates) {
        const destMarker = L.marker([destination.coordinates.latitude, destination.coordinates.longitude])
          .addTo(mapInstance.current)
          .bindPopup('Destination');
        bounds.push([destination.coordinates.latitude, destination.coordinates.longitude]);
      }

      // Add driver location marker
      if (driverLocation && ['accepted', 'picked_up', 'in_progress'].includes(rideStatus)) {
        const driverIcon = L.divIcon({
          html: '<div style="background: #3b82f6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-car"></i></div>',
          className: 'driver-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const driverMarker = L.marker([driverLocation.latitude, driverLocation.longitude], { icon: driverIcon })
          .addTo(mapInstance.current)
          .bindPopup('Driver Location');
        bounds.push([driverLocation.latitude, driverLocation.longitude]);
      }

      // Fit map to show all markers
      if (bounds.length > 0) {
        mapInstance.current.fitBounds(bounds, { padding: [20, 20] });
      }

    } catch (error) {
      console.error('Error updating map markers:', error);
    }
  };

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-lg border border-gray-300"
        style={{ minHeight: '300px' }}
      />
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs">
        <h4 className="font-semibold mb-2">Map Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <FaMapMarkerAlt className="text-green-500" />
            <span>Pickup</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaMapMarkerAlt className="text-red-500" />
            <span>Destination</span>
          </div>
          {driverLocation && (
            <div className="flex items-center space-x-2">
              <FaCar className="text-blue-500" />
              <span>Driver</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    </div>
  );
};

export default RideMap;
