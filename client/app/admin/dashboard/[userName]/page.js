'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import admin components
import AdminDashboardLayout from '../../components/DashboardLayout';

export default function AdminDashboard({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { userName } = unwrappedParams;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const storedUserData = localStorage.getItem('userData');
    
    if (!token || userType !== 'admin') {
      router.push('/admin'); // Redirect to admin login if not authenticated
      return;
    }
    
    try {
      const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;
      
      // Verify that URL username matches the logged in admin
      if (parsedUserData && parsedUserData.userName && 
          parsedUserData.userName.toLowerCase() !== userName.toLowerCase()) {
        // If username in URL doesn't match, redirect to correct URL
        router.push(`/admin/dashboard/${parsedUserData.userName.toLowerCase()}`);
        return;
      }
      
      setUserData(parsedUserData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      toast.error('Error loading user data');
    } finally {
      setLoading(false);
    }
  }, [router, userName]);

  // Fetch admin data from API
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/admin');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/admin/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }
      
      const result = await response.json();
      setUserData(result.data);
      
      // Update localStorage with the latest data
      localStorage.setItem('userData', JSON.stringify(result.data));
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Error fetching data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  // Get the section from URL hash if available
  let section = 'dashboard';
  if (typeof window !== 'undefined') {
    section = window.location.hash ? window.location.hash.slice(1) : 'dashboard';
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <AdminDashboardLayout 
        userName={userName} 
        userData={userData} 
        section={section}
        refreshUserData={fetchAdminData}
      />
    </>
  );
}
