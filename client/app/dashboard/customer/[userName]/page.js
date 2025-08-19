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
  const [statsData, setStatsData] = useState({
    totalRides: 0,
    monthlyRides: 0,
    totalSpent: 0
  });

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
      
      // Check for any active rides on page load
      checkForActiveRides();
      
      // Fetch stats data
      fetchStatsData();
    } catch (error) {
      console.error('Error parsing user data:', error);
      toast.error('Error loading user data');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchStatsData = async () => {
    try {
      const RideService = (await import('@/app/lib/rideService')).default;
      const response = await RideService.getRideHistory();
      
      if (response.success && response.data) {
        const rides = response.data;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyRides = rides.filter(ride => {
          const rideDate = new Date(ride.created_at || ride.ride_time);
          return rideDate.getMonth() === currentMonth && 
                 rideDate.getFullYear() === currentYear;
        });

        const totalSpent = rides
          .filter(ride => ride.status === 'completed')
          .reduce((sum, ride) => sum + (ride.fare || 0), 0);

        setStatsData({
          totalRides: rides.length,
          monthlyRides: monthlyRides.length,
          totalSpent: totalSpent
        });
      }
    } catch (error) {
      console.error('Error fetching stats data:', error);
    }
  };

  const checkForActiveRides = async () => {
    try {
      // You'll need to implement this API call to check for active rides
      // For now, we'll just check if there's a stored activeRideId
      const storedActiveRide = localStorage.getItem('activeRideId');
      if (storedActiveRide) {
        setActiveRideId(storedActiveRide);
      }
    } catch (error) {
      console.error('Error checking for active rides:', error);
    }
  };

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
    
    // Clear stored active ride ID
    localStorage.removeItem('activeRideId');
    
    toast.success('Ride completed! You can book another ride.');
  };

  const handleRideBooked = (rideId, targetTab) => {
    setActiveRideId(rideId);
    setActiveTab(targetTab);
    
    // Store active ride ID for persistence
    localStorage.setItem('activeRideId', rideId);
    
    toast.info('🗺️ Switched to live tracking view');
  };

  const menuItems = [
    {
      id: 'book-ride',
      label: 'Book Ride',
      icon: FaTaxi,
      component: <BookRide userName={userName} onRideBooked={handleRideBooked} />
    },
    {
      id: 'track-ride',
      label: 'Track Ride',
      icon: FaMapMarkerAlt,
      component: activeRideId ? 
        <RideTracking rideId={activeRideId} onRideComplete={handleRideComplete} /> : 
        <div className="text-center py-12">
          <FaMapMarkerAlt className="mx-auto text-6xl text-gray-300 mb-6" />
          <h3 className="text-xl font-semibold text-gray-600 mb-3">No Active Ride</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You don't have any active rides to track. Book a ride first to see live tracking information here.
          </p>
          <button
            onClick={() => setActiveTab('book-ride')}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaTaxi className="mr-2" />
            Book a Ride Now
          </button>
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
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors relative ${
                        activeTab === item.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 ${
                        activeTab === item.id ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span className="font-medium">{item.label}</span>
                      {item.id === 'track-ride' && activeRideId && (
                        <span className="ml-auto flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Live
                          </span>
                        </span>
                      )}
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
                  <span className="font-semibold text-gray-900">{statsData.totalRides}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-semibold text-blue-600">{statsData.monthlyRides}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Spent</span>
                  <span className="font-semibold text-green-600">৳{statsData.totalSpent}</span>
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