'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaUsers,
  FaCarAlt, 
  FaChartBar, 
  FaSignOutAlt,
  FaClipboardList,
  FaMoneyBillWave,
  FaIdCard
} from 'react-icons/fa';
import { toast } from 'react-toastify';

// Import admin components
import CustomerManagement from './CustomerManagement';
import DriverManagement from './DriverManagement';
import DriverVerification from './DriverVerification';
import RideManagement from './RideManagement';
import RevenueAnalytics from './RevenueAnalytics';

export const DashboardLayout = ({ userName, userData, section }) => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(section || 'dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalCustomers: 0,
    totalDrivers: 0,
    totalRides: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashValue = window.location.hash.slice(1);
      setActiveSection(hashValue);
    }
    // Fetch dashboard stats when component mounts
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setStatsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const data = await response.json();
      if (data.success) {
        setDashboardStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSectionChange = (e, section) => {
    e.preventDefault();
    setActiveSection(section);
    router.push(`/admin/dashboard/${userName}/#${section}`);
  };

  const handleLogout = () => {
    setLoading(true);
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    router.push('/admin');
  };

  const navItems = [
    { 
      name: 'Dashboard', 
      section: 'dashboard',
      icon: <FaChartBar className="h-5 w-5" />
    },
    { 
      name: 'Customers', 
      section: 'customers',
      icon: <FaUsers className="h-5 w-5" />
    },
    { 
      name: 'Drivers', 
      section: 'drivers',
      icon: <FaCarAlt className="h-5 w-5" />
    },
    { 
      name: 'Driver Verification', 
      section: 'driver-verification',
      icon: <FaIdCard className="h-5 w-5" />
    },
    { 
      name: 'Rides', 
      section: 'rides',
      icon: <FaClipboardList className="h-5 w-5" />
    },
    { 
      name: 'Revenue', 
      section: 'revenue',
      icon: <FaMoneyBillWave className="h-5 w-5" />
    },
    { 
      name: 'Logout', 
      section: 'logout',
      icon: <FaSignOutAlt className="h-5 w-5" />
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 sticky top-0 h-screen shadow-xl">
        <div className="mb-8 p-4 bg-gray-100 rounded-xl">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-black bg-clip-text text-transparent">
            {userName}
          </h2>
          <p className="text-sm text-slate-600 capitalize mt-1 font-medium">Admin Dashboard</p>
        </div>
        <nav>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.section}>
                <button
                  onClick={(e) => item.section === 'logout' ? handleLogout() : handleSectionChange(e, item.section)}
                  className={`w-full flex items-center p-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeSection === item.section
                      ? 'bg-gradient-to-r from-gray-700 to-black text-white shadow-lg'
                      : 'text-slate-600 hover:bg-gray-100 hover:translate-x-2'
                  }`}
                >
                  <span className={`mr-3 ${activeSection === item.section ? 'text-white' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  {item.name}
                  {item.section === 'logout' && (
                    <span className="ml-auto text-red-200 hover:text-red-100">
                      <FaSignOutAlt className="h-4 w-4" />
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto bg-white border border-gray-200 rounded-xl shadow-lg p-8">
          {activeSection === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <DashboardCard 
                  title="Total Customers" 
                  value={statsLoading ? "Loading..." : dashboardStats.totalCustomers.toString()} 
                  icon={<FaUsers className="text-2xl text-white" />}
                  bgColor="bg-gradient-to-br from-blue-500 to-blue-700"
                  loading={statsLoading}
                />
                <DashboardCard 
                  title="Total Drivers" 
                  value={statsLoading ? "Loading..." : dashboardStats.totalDrivers.toString()} 
                  icon={<FaCarAlt className="text-2xl text-white" />}
                  bgColor="bg-gradient-to-br from-green-500 to-green-700"
                  loading={statsLoading}
                />
                <DashboardCard 
                  title="Total Rides" 
                  value={statsLoading ? "Loading..." : dashboardStats.totalRides.toString()} 
                  icon={<FaClipboardList className="text-2xl text-white" />}
                  bgColor="bg-gradient-to-br from-purple-500 to-purple-700"
                  loading={statsLoading}
                />
              </div>
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                <p className="text-gray-500">No recent activities to display.</p>
              </div>
            </div>
          )}
          {activeSection === 'customers' && <CustomerManagement />}
          {activeSection === 'drivers' && <DriverManagement />}
          {activeSection === 'driver-verification' && <DriverVerification />}
          {activeSection === 'rides' && <RideManagement />}
          {activeSection === 'revenue' && <RevenueAnalytics />}
        </div>
      </main>
    </div>
  );
};

// Dashboard Card Component
const DashboardCard = ({ title, value, icon, bgColor, loading }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className={`${bgColor} p-4 flex items-center justify-between`}>
      <h3 className="text-lg font-medium text-white">{title}</h3>
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
        {icon}
      </div>
    </div>
    <div className="p-6 flex items-center justify-between">
      <span className={`text-3xl font-bold ${loading ? 'text-gray-400' : ''}`}>
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
        ) : (
          value
        )}
      </span>
      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
        View Details
      </span>
    </div>
  </div>
);

export default DashboardLayout;
