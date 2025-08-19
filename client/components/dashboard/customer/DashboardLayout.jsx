'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BookRide from './BookRide';
import { 
  FaUser, 
  FaTaxi, 
  FaHistory, 
  FaCreditCard, 
  FaSignOutAlt,
  FaHome
} from 'react-icons/fa';
import CustomerProfile from './Profile';

export const DashboardLayout = ({ userName, userData, section }) => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(section || 'profile');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashValue = window.location.hash.slice(1);
      setActiveSection(hashValue);
    }
  }, []);

  const handleSectionChange = (e, section) => {
    e.preventDefault();
    setActiveSection(section);
    router.push(`/dashboard/customer/${userName}/#${section}`);
  };

  const handleLogout = () => {
    setLoading(true);
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  const navItems = [
    { 
      name: 'Profile', 
      section: 'profile',
      icon: <FaUser className="h-5 w-5" />
    },
    { 
      name: 'Book Ride', 
      section: 'book-ride',
      icon: <FaTaxi className="h-5 w-5" />
    },
    { 
      name: 'Ride History', 
      section: 'ride-history',
      icon: <FaHistory className="h-5 w-5" />
    },
    { 
      name: 'Payment Methods', 
      section: 'payment-methods',
      icon: <FaCreditCard className="h-5 w-5" />
    },
    { 
      name: 'Logout', 
      section: 'logout',
      icon: <FaSignOutAlt className="h-5 w-5" />
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white/90 backdrop-blur-lg border-r border-gray-200/60 p-6 sticky top-0 h-screen shadow-xl">
        <div className="mb-8 p-4 bg-blue-50/50 rounded-xl">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            {userName}
          </h2>
          <p className="text-sm text-slate-600 capitalize mt-1 font-medium">Customer Dashboard</p>
        </div>
        <nav>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.section}>
                <button
                  onClick={(e) => item.section === 'logout' ? handleLogout() : handleSectionChange(e, item.section)}
                  className={`w-full flex items-center p-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeSection === item.section
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-blue-50/50 hover:translate-x-2'
                  }`}
                >
                  <span className={`mr-3 ${activeSection === item.section ? 'text-white' : 'text-blue-400'}`}>
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
        <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-8 shadow-lg">
          {activeSection === 'profile' && <CustomerProfile userData={userData} userName={userName} />}
         {activeSection === 'book-ride' && <BookRide userName={userName} />}
          {activeSection === 'ride-history' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Ride History</h2>
              <p className="text-gray-600">Your past rides will appear here</p>
            </div>
          )}
          {activeSection === 'payment-methods' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Payment Methods</h2>
              <p className="text-gray-600">Manage your payment options here</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;