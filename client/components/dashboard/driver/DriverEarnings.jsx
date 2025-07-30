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
      const response = await RideService.getDriverEarnings(period);
      if (response.success) {
        setEarnings(response.data);
      } else {
        toast.error('Failed to load earnings data');
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to load earnings data');
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
          <span className="ml-2 text-gray-600">Loading earnings...</span>
        </div>
      </div>
    );
  }

  const defaultEarnings = {
    total_earnings: 0,
    total_rides: 0,
    average_fare: 0,
    earnings_breakdown: {
      base_fare: 0,
      distance_fare: 0,
      time_fare: 0,
      surge_earnings: 0
    },
    recent_earnings: []
  };

  const earningsData = earnings || defaultEarnings;

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
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">৳{earningsData.total_earnings.toFixed(2)}</p>
            </div>
            <FaMoneyBillWave className="text-3xl text-green-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">This {period}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Rides</p>
              <p className="text-2xl font-bold text-blue-600">{earningsData.total_rides}</p>
            </div>
            <FaCar className="text-3xl text-blue-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Completed rides</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Fare</p>
              <p className="text-2xl font-bold text-purple-600">৳{earningsData.average_fare.toFixed(2)}</p>
            </div>
            <FaChartLine className="text-3xl text-purple-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Per ride</p>
        </Card>
      </div>

      {/* Earnings Breakdown */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Earnings Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Base Fare</p>
            <p className="text-lg font-bold">৳{earningsData.earnings_breakdown.base_fare.toFixed(2)}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Distance Fare</p>
            <p className="text-lg font-bold">৳{earningsData.earnings_breakdown.distance_fare.toFixed(2)}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Time Fare</p>
            <p className="text-lg font-bold">৳{earningsData.earnings_breakdown.time_fare.toFixed(2)}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Surge Earnings</p>
            <p className="text-lg font-bold">৳{earningsData.earnings_breakdown.surge_earnings.toFixed(2)}</p>
          </div>
        </div>
      </Card>

      {/* Recent Earnings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Earnings</h3>
        {earningsData.recent_earnings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaMoneyBillWave className="mx-auto text-4xl text-gray-400 mb-4" />
            <p>No earnings data available for this period</p>
            <p className="text-sm mt-2">Complete some rides to see your earnings here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {earningsData.recent_earnings.map((earning, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{earning.date}</p>
                  <p className="text-sm text-gray-600">{earning.rides_count} rides</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">৳{earning.amount.toFixed(2)}</p>
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
