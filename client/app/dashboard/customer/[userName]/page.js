// 'use client';
// import *as React from 'react';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { FaUser, FaTaxi, FaHistory, FaCreditCard, FaSignOutAlt } from 'react-icons/fa';

// export default function CustomerDashboard({ params }) {
//   const router = useRouter();
//   const { userName } = React.use(params);
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Check authentication
//     const token = localStorage.getItem('token');
//     const userType = localStorage.getItem('userType');
//     const storedUserData = localStorage.getItem('userData');
    
//     if (!token || userType !== 'customer') {
//       router.push('/login');
//       return;
//     }
    
//     try {
//       const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;
//       setUserData(parsedUserData);
//     } catch (error) {
//       console.error('Error parsing user data:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [router]);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('userType');
//     localStorage.removeItem('userData');
//     router.push('/login');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
//       <div className="container mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
//             Customer Dashboard
//           </h1>
//           <button 
//             onClick={handleLogout}
//             className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
//           >
//             <FaSignOutAlt className="mr-2" />
//             Logout
//           </button>
//         </div>

//         {/* User Profile Section */}
//         <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-gray-200/60">
//           <div className="flex items-center">
//             <div className="bg-blue-100 p-4 rounded-full">
//               <FaUser className="text-3xl text-blue-600" />
//             </div>
//             <div className="ml-6">
//               <h2 className="text-2xl font-bold">{userName || 'Customer'}</h2>
//               <p className="text-gray-600">{userData?.email || 'No email available'}</p>
//               <p className="text-gray-600">{userData?.phone || 'No phone available'}</p>
//             </div>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <Link href="/dashboard/customer/book-ride" className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/60 hover:shadow-xl transition-all transform hover:scale-[1.02]">
//             <div className="flex items-center">
//               <div className="bg-blue-100 p-4 rounded-full">
//                 <FaTaxi className="text-2xl text-blue-600" />
//               </div>
//               <div className="ml-4">
//                 <h3 className="text-lg font-semibold">Book a Ride</h3>
//                 <p className="text-gray-600">Request a new ride</p>
//               </div>
//             </div>
//           </Link>
          
//           <Link href="/dashboard/customer/ride-history" className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/60 hover:shadow-xl transition-all transform hover:scale-[1.02]">
//             <div className="flex items-center">
//               <div className="bg-blue-100 p-4 rounded-full">
//                 <FaHistory className="text-2xl text-blue-600" />
//               </div>
//               <div className="ml-4">
//                 <h3 className="text-lg font-semibold">Ride History</h3>
//                 <p className="text-gray-600">View your past rides</p>
//               </div>
//             </div>
//           </Link>
          
//           <Link href="/dashboard/customer/payment-methods" className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/60 hover:shadow-xl transition-all transform hover:scale-[1.02]">
//             <div className="flex items-center">
//               <div className="bg-blue-100 p-4 rounded-full">
//                 <FaCreditCard className="text-2xl text-blue-600" />
//               </div>
//               <div className="ml-4">
//                 <h3 className="text-lg font-semibold">Payment Methods</h3>
//                 <p className="text-gray-600">Manage your payment options</p>
//               </div>
//             </div>
//           </Link>
//         </div>
        
//         {/* Additional Dashboard Content */}
//         <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/60">
//           <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
//           <div className="text-gray-600">
//             <p>No recent activity to display.</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';
import *as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '../../../../components/dashboard/customer/DashboardLayout';

export default function CustomerDashboard({ params }) {
  const router = useRouter();
  const { userName } = React.use(params);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      
      // Verify that the URL username matches the logged in user
      if (parsedUserData && parsedUserData.userName && 
          parsedUserData.userName.toLowerCase() !== userName.toLowerCase()) {
        // If username in URL doesn't match the logged in user, redirect to the correct URL
        router.push(`/dashboard/customer/${parsedUserData.userName.toLowerCase()}`);
        return;
      }
      
      setUserData(parsedUserData);
    } catch (error) {
      console.error('Error parsing user data:', error);
    } finally {
      setLoading(false);
    }
  }, [router, userName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Get the section from URL hash if available
  let section = 'profile';
  if (typeof window !== 'undefined') {
    section = window.location.hash ? window.location.hash.slice(1) : 'profile';
  }

  return <DashboardLayout userName={userName} userData={userData} section={section} />;
}