'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUsers, FiClock, FiTruck, FiLogOut, FiRefreshCw } from 'react-icons/fi';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Static data for dashboard
  const stats = {
    customers: 145,
    drivers: 58,
    rides: 1287,
    earnings: 28450.75
  };
  
  // Static customer data
  const customers = [
    { _id: '1', name: 'John Doe', email: 'john@example.com', phone: '555-123-4567' },
    { _id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '555-987-6543' },
    { _id: '3', name: 'Robert Johnson', email: 'robert@example.com', phone: '555-456-7890' },
    { _id: '4', name: 'Emily Davis', email: 'emily@example.com', phone: '555-789-0123' },
    { _id: '5', name: 'Michael Wilson', email: 'michael@example.com', phone: '555-321-6547' },
    { _id: '6', name: 'Sarah Thompson', email: 'sarah@example.com', phone: '555-654-9871' },
    { _id: '7', name: 'David Brown', email: 'david@example.com', phone: '555-258-3691' }
  ];
  
  // Static driver data
  const drivers = [
    { _id: '1', name: 'Alex Green', email: 'alex@example.com', phone: '555-147-2583' },
    { _id: '2', name: 'Olivia Taylor', email: 'olivia@example.com', phone: '555-369-1478' },
    { _id: '3', name: 'William Clark', email: 'william@example.com', phone: '555-753-9512' },
    { _id: '4', name: 'Sophia Martinez', email: 'sophia@example.com', phone: '555-852-9637' },
    { _id: '5', name: 'James Rodriguez', email: 'james@example.com', phone: '555-951-7532' }
  ];

  const handleLogout = () => {
    router.push('/admin');
  };

  const confirmDeleteUser = (user, type) => {
    setUserToDelete({ user, type });
    setShowConfirmation(true);
  };

  const handleDeleteUser = () => {
    // Simply close the confirmation dialog in static version
    setShowConfirmation(false);
    setUserToDelete(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-6 mb-8">
          <h1 className="text-2xl font-bold">Vroom Admin</h1>
        </div>
        <nav>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex items-center w-full py-3 px-6 ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
          >
            <FiClock className="mr-3" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('customers')} 
            className={`flex items-center w-full py-3 px-6 ${activeTab === 'customers' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
          >
            <FiUsers className="mr-3" />
            Customers
          </button>
          <button 
            onClick={() => setActiveTab('drivers')} 
            className={`flex items-center w-full py-3 px-6 ${activeTab === 'drivers' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
          >
            <FiTruck className="mr-3" />
            Drivers
          </button>
        </nav>
        <div className="absolute bottom-0 w-64 p-6">
          <button
            onClick={handleLogout}
            className="flex items-center text-red-400 hover:text-red-300"
          >
            <FiLogOut className="mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white p-6 shadow flex justify-between items-center">
          <h2 className="text-2xl font-semibold">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'customers' && 'Customer Management'}
            {activeTab === 'drivers' && 'Driver Management'}
          </h2>
          <button 
            className="px-4 py-2 flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiRefreshCw className="mr-2" /> Refresh Data
          </button>
        </div>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FiUsers className="text-blue-600 text-xl" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-gray-500 text-sm">Total Customers</h3>
                      <p className="text-2xl font-semibold">{stats.customers}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full">
                      <FiTruck className="text-green-600 text-xl" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-gray-500 text-sm">Total Drivers</h3>
                      <p className="text-2xl font-semibold">{stats.drivers}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <FiClock className="text-purple-600 text-xl" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-gray-500 text-sm">Total Rides</h3>
                      <p className="text-2xl font-semibold">{stats.rides}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <span className="text-yellow-600 text-xl font-bold">$</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-gray-500 text-sm">Total Earnings</h3>
                      <p className="text-2xl font-semibold">${stats.earnings.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-lg font-semibold mb-4">Recent Customers</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-4 text-left">Name</th>
                          <th className="py-2 px-4 text-left">Email</th>
                          <th className="py-2 px-4 text-left">Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.slice(0, 5).map((customer) => (
                          <tr key={customer._id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4">{customer.name}</td>
                            <td className="py-2 px-4">{customer.email}</td>
                            <td className="py-2 px-4">{customer.phone}</td>
                          </tr>
                        ))}
                        {customers.length === 0 && (
                          <tr>
                            <td colSpan="3" className="py-4 px-4 text-center text-gray-500">No customers found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-lg font-semibold mb-4">Recent Drivers</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-4 text-left">Name</th>
                          <th className="py-2 px-4 text-left">Email</th>
                          <th className="py-2 px-4 text-left">Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drivers.slice(0, 5).map((driver) => (
                          <tr key={driver._id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4">{driver.name}</td>
                            <td className="py-2 px-4">{driver.email}</td>
                            <td className="py-2 px-4">{driver.phone}</td>
                          </tr>
                        ))}
                        {drivers.length === 0 && (
                          <tr>
                            <td colSpan="3" className="py-4 px-4 text-center text-gray-500">No drivers found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold mb-4">All Customers</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-left">Name</th>
                      <th className="py-2 px-4 text-left">Email</th>
                      <th className="py-2 px-4 text-left">Phone</th>
                      <th className="py-2 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer._id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{customer.name}</td>
                        <td className="py-2 px-4">{customer.email}</td>
                        <td className="py-2 px-4">{customer.phone}</td>
                        <td className="py-2 px-4">
                          <button
                            onClick={() => confirmDeleteUser(customer, 'customer')}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-4 px-4 text-center text-gray-500">No customers found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Drivers Tab */}
          {activeTab === 'drivers' && (
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold mb-4">All Drivers</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-left">Name</th>
                      <th className="py-2 px-4 text-left">Email</th>
                      <th className="py-2 px-4 text-left">Phone</th>
                      <th className="py-2 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((driver) => (
                      <tr key={driver._id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{driver.name}</td>
                        <td className="py-2 px-4">{driver.email}</td>
                        <td className="py-2 px-4">{driver.phone}</td>
                        <td className="py-2 px-4">
                          <button
                            onClick={() => confirmDeleteUser(driver, 'driver')}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {drivers.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-4 px-4 text-center text-gray-500">No drivers found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-4">
              Are you sure you want to delete {userToDelete?.user.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}