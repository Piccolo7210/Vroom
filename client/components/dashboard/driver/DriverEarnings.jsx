'use client';

import { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaCalendarAlt, FaChartLine, FaSpinner, FaCar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import RideService from '@/app/lib/rideService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DriverEarnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchEarnings();
  }, [period]);

  const fetchEarnings = async () => {
    try {
      console.log('Fetching driver earnings for period:', period);
      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');
      const userData = localStorage.getItem('userData');
      
      console.log('Token exists:', !!token);
      console.log('Token length:', token?.length);
      console.log('User type:', userType);
      console.log('User data:', userData);
      
      // Try to decode the token to see what's inside
      if (token) {
        try {
          const parts = token.split('.');
          console.log('Token parts count:', parts.length);
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log('Token payload:', payload);
            console.log('Token role:', payload.role);
            console.log('Token exp:', payload.exp ? new Date(payload.exp * 1000) : 'No expiration');
          } else {
            console.error('Token does not have 3 parts, malformed JWT');
          }
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
        }
      }
      
      const response = await RideService.getDriverEarnings(period);
      console.log('Driver earnings response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      console.log('Response success field:', response?.success);
      console.log('Response data field:', response?.data);
      console.log('Response error field:', response?.error);
      
      if (response && response.success && response.data) {
        setEarnings(response.data);
        console.log('Earnings data loaded:', response.data);
      } else {
        console.error('API returned non-success response:', response);
        const errorMessage = response?.error || response?.message || 'Unknown error';
        toast.error(`Failed to load earnings data: ${errorMessage}`);
        
        // Set empty data to prevent errors
        setEarnings({
          summary: {
            total_earnings: 0,
            total_trips: 0,
            avg_earnings_per_trip: 0
          },
          daily_earnings: [],
          payment_breakdown: [],
          vehicle_breakdown: []
        });
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast.error(`Failed to load earnings data: ${error.message}`);
      
      // Set empty data to prevent errors
      setEarnings({
        summary: {
          total_earnings: 0,
          total_trips: 0,
          avg_earnings_per_trip: 0
        },
        daily_earnings: [],
        payment_breakdown: [],
        vehicle_breakdown: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Driver Earnings
        </h2>
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-2xl text-blue-600" />
          <span className="ml-2 text-gray-800 font-medium">Loading earnings...</span>
        </div>
      </div>
    );
  }

  const defaultEarnings = {
    summary: {
      total_earnings: 0,
      total_trips: 0,
      avg_earnings_per_trip: 0
    },
    daily_earnings: [],
    payment_breakdown: [],
    vehicle_breakdown: []
  };

  const earningsData = earnings || defaultEarnings;
  const summaryData = earningsData.summary || defaultEarnings.summary;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Driver Earnings
        </h2>
        
        <div className="flex space-x-2">
          {['week', 'month', 'year'].map((p) => (
            <Button
              key={p}
              onClick={() => setPeriod(p)}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              className="capitalize"
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-medium">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">৳{summaryData.total_earnings?.toFixed(2) || '0.00'}</p>
            </div>
            <FaMoneyBillWave className="text-3xl text-green-600" />
          </div>
          <p className="text-xs text-gray-600 mt-2 font-medium">All time</p>
        </Card>

        <Card className="p-6 border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-medium">Total Rides</p>
              <p className="text-2xl font-bold text-blue-600">{summaryData.total_trips || 0}</p>
            </div>
            <FaCar className="text-3xl text-blue-600" />
          </div>
          <p className="text-xs text-gray-600 mt-2 font-medium">Completed rides</p>
        </Card>

        <Card className="p-6 border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-medium">Average Earnings</p>
              <p className="text-2xl font-bold text-purple-600">৳{summaryData.avg_earnings_per_trip?.toFixed(2) || '0.00'}</p>
            </div>
            <FaChartLine className="text-3xl text-purple-600" />
          </div>
          <p className="text-xs text-gray-600 mt-2 font-medium">Per ride</p>
        </Card>
      </div>

      {/* Earnings Breakdown */}
      <Card className="p-6 mb-6 border border-gray-200 bg-white shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method Breakdown</h3>
        {earningsData.payment_breakdown.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {earningsData.payment_breakdown.map((method, index) => (
              <div key={index} className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 capitalize font-medium">{method.payment_method}</p>
                <p className="text-lg font-bold text-gray-900">৳{method.earnings.toFixed(2)}</p>
                <p className="text-xs text-gray-600 font-medium">{method.trips} trips</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-600">
            <p className="font-medium">No payment data available</p>
          </div>
        )}
      </Card>

      {/* Vehicle Type Breakdown */}
      <Card className="p-6 mb-6 border border-gray-200 bg-white shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Vehicle Type Breakdown</h3>
        {earningsData.vehicle_breakdown.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {earningsData.vehicle_breakdown.map((vehicle, index) => (
              <div key={index} className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 capitalize font-medium">{vehicle.vehicle_type}</p>
                <p className="text-lg font-bold text-gray-900">৳{vehicle.earnings.toFixed(2)}</p>
                <p className="text-xs text-gray-600 font-medium">{vehicle.trips} trips</p>
                <p className="text-xs text-gray-500">Avg: ৳{vehicle.avg_fare.toFixed(2)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-600">
            <p className="font-medium">No vehicle data available</p>
          </div>
        )}
      </Card>

      {/* Recent Earnings */}
      <Card className="p-6 border border-gray-200 bg-white shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Earnings</h3>
        {earningsData.daily_earnings.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <FaMoneyBillWave className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="font-medium">No earnings data available</p>
            <p className="text-sm mt-2 text-gray-500">Complete some rides to see your earnings here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {earningsData.daily_earnings.map((earning, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <div>
                  <p className="font-bold text-gray-900">{earning.date}</p>
                  <p className="text-sm text-gray-700 font-medium">{earning.trips} trips</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">৳{earning.earnings.toFixed(2)}</p>
                  <p className="text-xs text-gray-600 font-medium">Total: ৳{earning.total_fare.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DriverEarnings;
