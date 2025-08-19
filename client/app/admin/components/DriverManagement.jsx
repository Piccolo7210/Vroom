'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUser, FaSearch, FaEye, FaSpinner, FaCar, FaStar } from 'react-icons/fa';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, details
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch drivers
  useEffect(() => {
    fetchDrivers();
  }, [page, limit]);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }
      
      console.log('Fetching drivers with token:', token.substring(0, 10) + '...');
      console.log('Making request to:', `http://localhost:5000/api/admin/drivers?page=${page}&limit=${limit}&search=${searchTerm}`);
      
      const response = await fetch(`http://localhost:5000/api/admin/drivers?page=${page}&limit=${limit}&search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to fetch drivers: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Drivers data:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch drivers');
      }
      
      setDrivers(data.drivers || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error(`Error loading drivers: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDrivers();
  };

  const handleViewDriver = (driver) => {
    setSelectedDriver(driver);
    setViewMode('details');
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  // Render driver list view
  const renderDriverList = () => (
    <>
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search drivers by name, email or license plate..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Search
          </button>
        </form>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Driver
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {drivers.length > 0 ? (
              drivers.map((driver) => (
                <tr key={driver._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {driver.photo_link ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={driver.photo_link}
                            alt={driver.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <FaUser className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {driver.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {driver.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 mr-2">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <FaCar className="text-gray-500" />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-900">
                          {driver.vehicle_type || 'N/A'} - {driver.vehicle_no || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          License: {driver.license_no || 'No license info'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span>{driver.rating ? driver.rating.toFixed(1) : 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        driver.verificationStatus === 'trusted'
                          ? 'bg-green-100 text-green-800'
                          : driver.verificationStatus === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {driver.verificationStatus || 'waiting'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDriver(driver)}
                      className="text-gray-600 hover:text-gray-900"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  {loading ? 'Loading drivers...' : 'No drivers found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{drivers.length}</span> of{' '}
          <span className="font-medium">{totalPages * limit}</span> drivers
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePreviousPage}
            disabled={page === 1}
            className={`inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md ${
              page === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <span className="inline-flex items-center px-3 py-1 border border-gray-300 bg-white text-gray-700 text-sm font-medium rounded-md">
            {page} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page >= totalPages}
            className={`inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md ${
              page >= totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );

  // Render driver detail view
  const renderDriverDetails = () => {
    if (!selectedDriver) return null;
    
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Driver Details</h3>
          <button
            onClick={() => setViewMode('list')}
            className="text-gray-600 hover:text-gray-900"
          >
            Back to List
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
            {selectedDriver.photo_link ? (
              <img
                className="h-40 w-40 rounded-full object-cover mb-4"
                src={selectedDriver.photo_link}
                alt={selectedDriver.name}
              />
            ) : (
              <div className="h-40 w-40 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                <FaUser className="text-gray-500 text-5xl" />
              </div>
            )}
            <div className="flex items-center mb-2">
              <FaStar className="text-yellow-400 mr-1" />
              <span className="font-semibold">
                {selectedDriver.rating ? selectedDriver.rating.toFixed(1) : 'N/A'}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                ({selectedDriver.totalRides || 0} rides)
              </span>
            </div>
            <span className={`px-4 py-1 text-sm font-semibold rounded-full ${
              selectedDriver.verificationStatus === 'trusted'
                ? 'bg-green-100 text-green-800'
                : selectedDriver.verificationStatus === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {selectedDriver.verificationStatus || 'waiting'}
            </span>
          </div>

          <div className="md:w-2/3 md:pl-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Name</h4>
                <p className="mt-1">{selectedDriver.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Username</h4>
                <p className="mt-1">{selectedDriver.userName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <p className="mt-1">{selectedDriver.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                <p className="mt-1">{selectedDriver.phone || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">License Number</h4>
                <p className="mt-1">{selectedDriver.license_no || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Age</h4>
                <p className="mt-1">{selectedDriver.age || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Gender</h4>
                <p className="mt-1">{selectedDriver.sex || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">NID Number</h4>
                <p className="mt-1">{selectedDriver.nid_no || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Present Address</h4>
                <p className="mt-1">{selectedDriver.present_address || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Permanent Address</h4>
                <p className="mt-1">{selectedDriver.permanent_address || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Joined On</h4>
                <p className="mt-1">
                  {selectedDriver.createdAt 
                    ? new Date(selectedDriver.createdAt).toLocaleDateString() 
                    : 'N/A'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Verification Status</h4>
                <p className="mt-1">{selectedDriver.verificationStatus || 'waiting'}</p>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Vehicle Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs text-gray-500">Vehicle Type</h5>
                  <p className="font-medium">{selectedDriver.vehicle_type || 'N/A'}</p>
                </div>
                <div>
                  <h5 className="text-xs text-gray-500">Vehicle Number</h5>
                  <p className="font-medium">{selectedDriver.vehicle_no || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                onClick={() => setViewMode('list')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Back to Driver List
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Recent Trips</h3>
          <p className="text-gray-500">No recent trips found for this driver.</p>
        </div>

        <div className="mt-10 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Earnings Overview</h3>
          <p className="text-gray-500">No earnings data available.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Driver Management</h2>
        {viewMode !== 'list' && (
          <button
            onClick={() => setViewMode('list')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to All Drivers
          </button>
        )}
      </div>

      {loading && viewMode === 'list' && drivers.length === 0 ? (
        <div className="flex justify-center my-12">
          <FaSpinner className="animate-spin text-4xl text-gray-700" />
        </div>
      ) : (
        <>
          {viewMode === 'list' && renderDriverList()}
          {viewMode === 'details' && renderDriverDetails()}
        </>
      )}
    </div>
  );
};

export default DriverManagement;
