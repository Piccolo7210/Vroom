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
  const [activeTab, setActiveTab] = useState('overview');
  const [totalRides, setTotalRides] = useState(0);
  const [monthlyRides, setMonthlyRides] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [profileData, setProfileData] = useState(null);

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
      
      // Fetch complete profile data to update sidebar
      if (parsedUserData) {
        fetchAndUpdateProfile();
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      toast.error('Error loading user data');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchAndUpdateProfile = async () => {
    try {
      const RideService = (await import('@/app/lib/rideService')).default;
      
      // Fetch profile data
      const profileResponse = await RideService.getDriverProfile();
      if (profileResponse.success && profileResponse.data) {
        setProfileData(profileResponse.data);
        setUserData(prev => ({
          ...prev,
          ...profileResponse.data,
          vehicle_type: profileResponse.data.vehicle_type,
          license_no: profileResponse.data.license_no,
          phone: profileResponse.data.phone
        }));
      }

      // Fetch earnings data for stats
      const earningsResponse = await RideService.getDriverEarnings();
      if (earningsResponse.success && earningsResponse.data) {
        const earningsData = earningsResponse.data;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyData = earningsData.filter(earning => {
          const earningDate = new Date(earning.date);
          return earningDate.getMonth() === currentMonth && 
                 earningDate.getFullYear() === currentYear;
        });

        setTotalRides(earningsData.length);
        setMonthlyRides(monthlyData.length);
        setMonthlyEarnings(monthlyData.reduce((sum, earning) => sum + earning.amount, 0));
      }
    } catch (error) {
      console.error('Error fetching complete profile:', error);
      // Don't show error toast as this is background update
    }
  };

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
            <p className="text-gray-800 mt-1 font-medium">Welcome back, {userData?.name || 'Driver'}!</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-sm"
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
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FaUser className="text-3xl text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">{userData?.name || 'Driver'}</h3>
                <p className="text-gray-700 text-sm font-medium">{userData?.phone || 'No phone'}</p>
                <div className="mt-3 text-xs">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                    {userData?.vehicle_type || 'Vehicle'} Driver
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-4 py-3 text-left transition-colors font-medium ${
                        activeTab === item.id
                          ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                          : 'text-gray-800 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <IconComponent className="h-5 w-5 mr-3" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Stats */}
                        {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Vehicle Type</span>
                  <span className="font-semibold text-gray-900">
                    {profileData?.vehicle_type || userData?.vehicle_type || 'Not Set'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">License No.</span>
                  <span className="font-semibold text-gray-900">
                    {profileData?.license_no || userData?.license_no || 'Not Set'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Rides</span>
                  <span className="font-semibold text-green-600">{totalRides}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-semibold text-blue-600">{monthlyRides}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly Earnings</span>
                  <span className="font-semibold text-green-600">৳{monthlyEarnings}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
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