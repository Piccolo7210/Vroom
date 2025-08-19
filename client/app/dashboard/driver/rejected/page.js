'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaBan, FaHome } from 'react-icons/fa';

const RejectedAccountPage = () => {
  const router = useRouter();
  const [rejectionReason, setRejectionReason] = useState('');
  
  useEffect(() => {
    // Get the rejection reason from localStorage if available
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setRejectionReason(parsed.rejectionReason || 'Your account has been rejected due to fraudulent credentials or failure to meet our requirements.');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Clear auth data
    localStorage.removeItem('token');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  const goToHomepage = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-pink-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-red-200">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBan className="text-4xl text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Account Rejected</h1>
          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <p className="text-red-700">
              {rejectionReason}
            </p>
          </div>
          <p className="text-gray-600 mb-6">
            Unfortunately, your driver account application has been rejected. If you believe this is a mistake, please contact our support team.
          </p>
          <div className="space-y-4">
            <button
              onClick={goToHomepage}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaHome className="mr-2" />
              Return to Homepage
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      <p className="mt-6 text-gray-500 text-sm">
        For any further assistance, please contact our support team at support@vroom.com
      </p>
    </div>
  );
};

export default RejectedAccountPage;
