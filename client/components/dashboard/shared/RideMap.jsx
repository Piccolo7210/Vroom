'use client';

import { useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaCar } from 'react-icons/fa';

const RideMap = ({ pickup, destination, driverLocation, rideStatus }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routeLayerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const driverTrailRef = useRef([]);

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
      
      // Clear existing markers and routes
      mapInstance.current.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          mapInstance.current.removeLayer(layer);
        }
      });

      const bounds = [];

      // Custom marker icons
      const pickupIcon = L.divIcon({
        html: '<div style="background: #22c55e; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="font-size: 12px;">📍</span></div>',
        className: 'pickup-marker',
        iconSize: [25, 25],
        iconAnchor: [12, 12]
      });

      const destinationIcon = L.divIcon({
        html: '<div style="background: #ef4444; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="font-size: 12px;">🏁</span></div>',
        className: 'destination-marker',
        iconSize: [25, 25],
        iconAnchor: [12, 12]
      });

      // Add pickup marker
      if (pickup?.coordinates) {
        const pickupMarker = L.marker([pickup.coordinates.latitude, pickup.coordinates.longitude], { icon: pickupIcon })
          .addTo(mapInstance.current)
          .bindPopup(`<b>Pickup Location</b><br/>${pickup.address || 'Pickup Point'}`);
        bounds.push([pickup.coordinates.latitude, pickup.coordinates.longitude]);
      }

      // Add destination marker
      if (destination?.coordinates) {
        const destMarker = L.marker([destination.coordinates.latitude, destination.coordinates.longitude], { icon: destinationIcon })
          .addTo(mapInstance.current)
          .bindPopup(`<b>Destination</b><br/>${destination.address || 'Destination Point'}`);
        bounds.push([destination.coordinates.latitude, destination.coordinates.longitude]);
      }

      // Add route line between pickup and destination
      if (pickup?.coordinates && destination?.coordinates) {
        const routeCoords = [
          [pickup.coordinates.latitude, pickup.coordinates.longitude],
          [destination.coordinates.latitude, destination.coordinates.longitude]
        ];
        
        const routeLine = L.polyline(routeCoords, {
          color: '#6366f1',
          weight: 4,
          opacity: 0.7,
          dashArray: '10, 5'
        }).addTo(mapInstance.current);

        routeLine.bindPopup('Planned Route');
      }

      // Add driver location marker with enhanced styling
      if (driverLocation && ['accepted', 'picked_up', 'in_progress'].includes(rideStatus)) {
        // Store previous driver location for trail
        if (driverMarkerRef.current) {
          const prevPos = driverMarkerRef.current.getLatLng();
          driverTrailRef.current.push([prevPos.lat, prevPos.lng]);
          
          // Keep only last 10 positions for trail
          if (driverTrailRef.current.length > 10) {
            driverTrailRef.current.shift();
          }
        }

        // Add driver trail
        if (driverTrailRef.current.length > 1) {
          L.polyline(driverTrailRef.current, {
            color: '#3b82f6',
            weight: 2,
            opacity: 0.5,
            dashArray: '5, 5'
          }).addTo(mapInstance.current);
        }

        // Driver icon with direction indicator
        const driverRotation = driverLocation.heading || 0;
        const driverIcon = L.divIcon({
          html: `<div style="background: #3b82f6; color: white; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transform: rotate(${driverRotation}deg);"><span style="font-size: 16px;">🚗</span></div>`,
          className: 'driver-marker',
          iconSize: [35, 35],
          iconAnchor: [17, 17]
        });

        driverMarkerRef.current = L.marker([driverLocation.latitude, driverLocation.longitude], { icon: driverIcon })
          .addTo(mapInstance.current);

        // Enhanced driver popup
        const speed = driverLocation.speed ? Math.round(driverLocation.speed) : 0;
        const lastUpdate = driverLocation.timestamp ? new Date(driverLocation.timestamp).toLocaleTimeString() : 'Unknown';
        
        driverMarkerRef.current.bindPopup(`
          <div style="text-align: center;">
            <b>🚗 Your Driver</b><br/>
            <small>Speed: ${speed} km/h</small><br/>
            <small>Updated: ${lastUpdate}</small>
          </div>
        `);

        bounds.push([driverLocation.latitude, driverLocation.longitude]);

        // Add route from driver to target location
        const targetLocation = rideStatus === 'accepted' ? pickup : destination;
        if (targetLocation?.coordinates) {
          const driverRouteCoords = [
            [driverLocation.latitude, driverLocation.longitude],
            [targetLocation.coordinates.latitude, targetLocation.coordinates.longitude]
          ];
          
          L.polyline(driverRouteCoords, {
            color: '#f59e0b',
            weight: 3,
            opacity: 0.8,
            dashArray: '8, 4'
          }).addTo(mapInstance.current).bindPopup('Driver Route');
        }
      }

      // Fit map to show all markers with appropriate padding
      if (bounds.length > 0) {
        const padding = bounds.length === 1 ? [50, 50] : [30, 30];
        mapInstance.current.fitBounds(bounds, { 
          padding: padding,
          maxZoom: bounds.length === 1 ? 16 : 15
        });
      }

      // Auto-refresh map every 30 seconds if ride is active
      if (['accepted', 'picked_up', 'in_progress'].includes(rideStatus)) {
        setTimeout(() => {
          if (mapInstance.current) {
            updateMapMarkers();
          }
        }, 30000);
      }

    } catch (error) {
      console.error('Error updating map markers:', error);
    }
  };

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-80 rounded-lg border border-gray-300 overflow-hidden"
        style={{ minHeight: '320px', background: '#f8fafc' }}
      />
      
      {/* Map Controls */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 text-xs space-y-1">
        <button 
          onClick={() => mapInstance.current?.zoomIn()}
          className="block w-8 h-8 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          +
        </button>
        <button 
          onClick={() => mapInstance.current?.zoomOut()}
          className="block w-8 h-8 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          −
        </button>
      </div>
      
      {/* Enhanced Map Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs max-w-xs">
        <h4 className="font-semibold mb-2 text-gray-800">Live Tracking</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Pickup Location</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Destination</span>
          </div>
          {driverLocation && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Driver (Live)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-yellow-500"></div>
                <span>Driver Route</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-blue-300 opacity-50"></div>
                <span>Driver Trail</span>
              </div>
            </>
          )}
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-indigo-500" style={{borderTop: '2px dashed'}}></div>
            <span>Planned Route</span>
          </div>
        </div>
        
        {/* Live Status Indicator */}
        {['accepted', 'picked_up', 'in_progress'].includes(rideStatus) && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 font-medium">Live Tracking</span>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {!mapInstance.current && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading interactive map...</p>
            <p className="text-xs text-gray-500 mt-1">Preparing real-time tracking</p>
          </div>
        </div>
      )}
      
      {/* Map Attribution */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white bg-opacity-75 px-2 py-1 rounded">
        © OpenStreetMap
      </div>
    </div>
  );
};

export default RideMap;
