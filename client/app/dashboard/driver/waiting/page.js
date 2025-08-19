'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const WaitingForVerificationPage = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  const goToHomepage = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-4xl text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Account Verification Pending</h1>
          <p className="text-gray-600 mb-6">
            Your account is currently pending verification by our administrative team. This process may take 24-48 hours.
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
        If you have any questions, please contact our support team at support@vroom.com
      </p>
    </div>
  );
};

export default WaitingForVerificationPage;
