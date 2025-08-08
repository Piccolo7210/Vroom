'use client';

import { useState, useEffect } from 'react';
import { FaHistory, FaMapMarkerAlt, FaCar, FaCalendarAlt, FaMoneyBillWave, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import RideService from '@/app/lib/rideService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const RideHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRideHistory();
  }, []);

  const fetchRideHistory = async () => {
    setLoading(true);
    try {
      console.log('Fetching ride history...');
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      
      // Try to decode the token to see what's inside
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Token payload:', payload);
          console.log('Token role:', payload.role);
          console.log('Token id:', payload.id);
          console.log('Token exp:', payload.exp ? new Date(payload.exp * 1000) : 'No expiration');
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
        }
      }
      
      const response = await RideService.getRideHistory();
      console.log('Ride history response:', response);
      
      if (response.success) {
        setRides(response.data.rides);
        console.log('Rides loaded successfully:', response.data.rides.length);
      } else {
        console.error('API returned error:', response.error || 'Unknown error');
        toast.error(`Failed to load ride history: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching ride history:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast.error(`Failed to load ride history: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-yellow-100 text-yellow-800';
      case 'requested':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVehicleIcon = (vehicleType) => {
    switch (vehicleType) {
      case 'bike':
        return '🏍️';
      case 'cng':
        return '🛺';
      case 'car':
        return '🚗';
      default:
        return '🚗';
    }
  };

  const filteredRides = rides.filter(ride => {
    if (filter === 'all') return true;
    return ride.status === filter;
  });

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Ride History
        </h2>
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-2xl text-blue-600" />
          <span className="ml-2 text-gray-600">Loading your rides...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Ride History
        </h2>
        <div className="flex items-center space-x-2">
          <FaHistory className="text-blue-600" />
          <span className="text-sm text-gray-600">{rides.length} total rides</span>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'completed', 'cancelled', 'in_progress', 'accepted', 'requested'].map((status) => (
          <Button
            key={status}
            onClick={() => setFilter(status)}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            className="capitalize"
          >
            {status === 'all' ? 'All Rides' : status.replace('_', ' ')}
            {status !== 'all' && (
              <span className="ml-1 text-xs">
                ({rides.filter(ride => ride.status === status).length})
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Rides List */}
      {filteredRides.length === 0 ? (
        <Card className="p-8 text-center">
          <FaHistory className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {filter === 'all' ? 'No rides found' : `No ${filter.replace('_', ' ')} rides found`}
          </h3>
          <p className="text-gray-500">
            {filter === 'all' ? 'Start booking rides to see your history here.' : 'Try selecting a different filter.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRides.map((ride) => (
            <Card key={ride._id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getVehicleIcon(ride.vehicle_type)}</div>
                  <div>
                    <h3 className="font-semibold capitalize">{ride.vehicle_type} Ride</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCalendarAlt className="mr-1" />
                      {new Date(ride.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ride.status)}`}>
                    {ride.status.replace('_', ' ')}
                  </span>
                  <div className="flex items-center mt-2 text-lg font-bold">
                    <FaMoneyBillWave className="mr-1 text-green-600" />
                    ৳{ride.fare.total_fare}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
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

                <div className="space-y-2">
                  {ride.driver && (
                    <div>
                      <p className="text-sm text-gray-600">Driver</p>
                      <p className="font-medium">{ride.driver.name}</p>
                      <p className="text-sm text-gray-500">{ride.driver.phone}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Distance</p>
                      <p className="font-medium">{ride.distance.toFixed(1)} km</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-medium">
                        {ride.actual_duration || ride.estimated_duration} min
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Payment</p>
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{ride.payment_method}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        ride.payment_status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ride.payment_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fare Breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Base Fare</p>
                    <p className="font-medium">৳{ride.fare.base_fare}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Distance Fare</p>
                    <p className="font-medium">৳{ride.fare.distance_fare}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Time Fare</p>
                    <p className="font-medium">৳{ride.fare.time_fare}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total</p>
                    <p className="font-bold text-lg">৳{ride.fare.total_fare}</p>
                  </div>
                </div>
                
                {ride.fare.surge_multiplier > 1 && (
                  <div className="mt-2 text-sm text-orange-600">
                    <span>Surge pricing applied (×{ride.fare.surge_multiplier})</span>
                  </div>
                )}
              </div>

              {ride.otp && ride.status !== 'completed' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-blue-800">Verification OTP:</span>
                      <p className="text-xs text-blue-600">Share with driver at pickup</p>
                    </div>
                    <span className="font-bold text-lg text-blue-600">{ride.otp}</span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RideHistory;
