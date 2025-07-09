'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaCar, FaHistory, FaMoneyBillWave, FaSignOutAlt } from 'react-icons/fa';

export default function DriverDashboard({Params}) {
  const {userName} = React.use(Params);
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const storedUserData = localStorage.getItem('userData');
    
    if (!token || userType !== 'driver') {
      router.push('/login');
      return;
    }
    
    try {
      const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;
      setUserData(parsedUserData);
    } catch (error) {
      console.error('Error parsing user data:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            Driver Dashboard
          </h1>
          <button 
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>

        {/* Driver Profile Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-gray-200/60">
          <div className="flex items-center">
            <div className="bg-blue-100 p-4 rounded-full">
              <FaUser className="text-3xl text-blue-600" />
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold">{userData?.name || 'Driver'}</h2>
              <p className="text-gray-600">{userData?.email || 'No email available'}</p>
              <p className="text-gray-600">{userData?.phone || 'No phone available'}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <span className="font-medium">License:</span> {userData?.license_no || 'Not available'}
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <span className="font-medium">Vehicle Type:</span> {userData?.vehicle_type || 'Not available'}
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <span className="font-medium">Vehicle No:</span> {userData?.Vehicle_no || userData?.vehicle_no || 'Not available'}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/dashboard/driver/start-driving" className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/60 hover:shadow-xl transition-all transform hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="bg-blue-100 p-4 rounded-full">
                <FaCar className="text-2xl text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Start Driving</h3>
                <p className="text-gray-600">Go online and accept rides</p>
              </div>
            </div>
          </Link>
          
          <Link href="/dashboard/driver/ride-history" className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/60 hover:shadow-xl transition-all transform hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="bg-blue-100 p-4 rounded-full">
                <FaHistory className="text-2xl text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Ride History</h3>
                <p className="text-gray-600">View your completed rides</p>
              </div>
            </div>
          </Link>
          
          <Link href="/dashboard/driver/earnings" className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/60 hover:shadow-xl transition-all transform hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="bg-blue-100 p-4 rounded-full">
                <FaMoneyBillWave className="text-2xl text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Earnings</h3>
                <p className="text-gray-600">Track your income</p>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Additional Dashboard Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/60">
          <h2 className="text-xl font-semibold mb-4">Recent Rides</h2>
          <div className="text-gray-600">
            <p>No recent rides to display.</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-700">Ready to drive?</p>
              <p className="text-sm mt-2">Click "Start Driving" above to begin accepting ride requests in your area.</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/60">
            <h3 className="font-semibold text-lg mb-2">Total Rides</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/60">
            <h3 className="font-semibold text-lg mb-2">Rating</h3>
            <p className="text-3xl font-bold text-blue-600">N/A</p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/60">
            <h3 className="font-semibold text-lg mb-2">Total Earnings</h3>
            <p className="text-3xl font-bold text-blue-600">$0.00</p>
          </div>
        </div>
      </div>
    </div>
  );
}