'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaTaxi, FaHistory, FaSignOutAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import new components
import BookRide from '@/components/dashboard/customer/BookRide';
import RideHistory from '@/components/dashboard/customer/RideHistory';
import RideTracking from '@/components/dashboard/customer/RideTracking';
import CustomerProfile from '@/components/dashboard/customer/CustomerProfile';

export default function CustomerDashboard({ params }) {
  const router = useRouter();
  const { userName } = React.use(params);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('book-ride');
  const [activeRideId, setActiveRideId] = useState(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const storedUserData = localStorage.getItem('userData');
    
    if (!token || userType !== 'customer') {
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

  const handleRideComplete = () => {
    setActiveRideId(null);
    setActiveTab('book-ride');
    toast.success('Ride completed! You can book another ride.');
  };

  const menuItems = [
    {
      id: 'book-ride',
      label: 'Book Ride',
      icon: FaTaxi,
      component: <BookRide userName={userName} />
    },
    {
      id: 'track-ride',
      label: 'Track Ride',
      icon: FaMapMarkerAlt,
      component: activeRideId ? 
        <RideTracking rideId={activeRideId} onRideComplete={handleRideComplete} /> : 
        <div className="text-center py-8">
          <FaMapMarkerAlt className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No active ride to track</h3>
          <p className="text-gray-500">Book a ride first to see tracking information here.</p>
        </div>
    },
    {
      id: 'history',
      label: 'Ride History',
      icon: FaHistory,
      component: <RideHistory />
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: FaUser,
      component: <CustomerProfile userData={userData} />
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeMenuItem = menuItems.find(item => item.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
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
      />
      
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                  Vroom
                </h1>
              </div>
              <div className="hidden md:block">
                <span className="text-gray-600">Welcome back, </span>
                <span className="font-semibold text-gray-900">{userData?.name || userName}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <FaClock className="w-4 h-4" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <FaUser className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{userData?.name || userName}</h3>
                    <p className="text-sm text-gray-600">Customer</p>
                  </div>
                </div>
              </div>
              
              <nav className="p-2">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 ${
                        activeTab === item.id ? 'text-blue-600' : 'text-gray-500'
                      }`} />
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
                  <span className="text-sm text-gray-600">Total Rides</span>
                  <span className="font-semibold text-gray-900">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-semibold text-gray-900">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Spent</span>
                  <span className="font-semibold text-green-600">৳-</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[600px]">
              {activeMenuItem?.component}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}