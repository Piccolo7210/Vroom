'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaCar, FaHistory, FaMoneyBillWave, FaSignOutAlt, FaRoute, FaChartLine } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import driver components
import AvailableRides from '@/components/dashboard/driver/AvailableRides';
import ActiveRide from '@/components/dashboard/driver/ActiveRide';
import DriverEarnings from '@/components/dashboard/driver/DriverEarnings';
import DriverProfile from '@/components/dashboard/driver/DriverProfile';

export default function DriverDashboard({params}) {
  const {userName} = React.use(params);
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available-rides');

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
      toast.error('Error loading user data');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const menuItems = [
    {
      id: 'available-rides',
      label: 'Available Rides',
      icon: FaRoute,
      component: <AvailableRides />
    },
    {
      id: 'active-ride',
      label: 'Active Ride',
      icon: FaCar,
      component: <ActiveRide />
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: FaMoneyBillWave,
      component: <DriverEarnings />
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: FaUser,
      component: <DriverProfile userData={userData} />
    }
  ];

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
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Driver Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome back, {userData?.name || 'Driver'}!</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Summary */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6 border border-gray-200/60">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUser className="text-3xl text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg">{userData?.name || 'Driver'}</h3>
                <p className="text-gray-600 text-sm">{userData?.phone || 'No phone'}</p>
                <div className="mt-3 text-xs">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    {userData?.vehicle_type || 'Vehicle'} Driver
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/60 overflow-hidden">
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                        activeTab === item.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="h-5 w-5 mr-3" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Vehicle</span>
                  <span className="font-semibold text-gray-900 capitalize">
                    {userData?.vehicle_type || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">License</span>
                  <span className="font-semibold text-gray-900">
                    {userData?.license_no ? userData.license_no.slice(-4) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="text-green-600 font-semibold">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/60 p-8">
              {menuItems.find(item => item.id === activeTab)?.component}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}