'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaSearch, 
  FaEye, 
  FaSpinner, 
  FaCarSide, 
  FaUser, 
  FaMapMarkerAlt, 
  FaFilter, 
  FaCalendarAlt 
} from 'react-icons/fa';

const RideManagement = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRide, setSelectedRide] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, details
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    isFilterOpen: false
  });

  // Fetch rides
  useEffect(() => {
    fetchRides();
  }, [page, limit, filters]);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page,
        limit,
        search: searchTerm
      });
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      
      const response = await fetch(`/api/admin/rides?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rides');
      }

      const data = await response.json();
      setRides(data.rides);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching rides:', error);
      toast.error('Error loading rides. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRides();
  };

  const handleViewRide = (ride) => {
    setSelectedRide(ride);
    setViewMode('details');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleFilters = () => {
    setFilters(prev => ({
      ...prev,
      isFilterOpen: !prev.isFilterOpen
    }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRides();
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      startDate: '',
      endDate: '',
      isFilterOpen: true
    });
    setPage(1);
    fetchRides();
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

  // Helper function to format ride status
  const formatStatus = (status) => {
    switch(status) {
      case 'pending':
        return { label: 'Pending', class: 'bg-yellow-100 text-yellow-800' };
      case 'accepted':
        return { label: 'Accepted', class: 'bg-blue-100 text-blue-800' };
      case 'inProgress':
        return { label: 'In Progress', class: 'bg-purple-100 text-purple-800' };
      case 'completed':
        return { label: 'Completed', class: 'bg-green-100 text-green-800' };
      case 'cancelled':
        return { label: 'Cancelled', class: 'bg-red-100 text-red-800' };
      default:
        return { label: status || 'Unknown', class: 'bg-gray-100 text-gray-800' };
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Render ride list view
  const renderRideList = () => (
    <>
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search rides by ID, customer or driver..."
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
          <button
            type="button"
            onClick={toggleFilters}
            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <FaFilter className="mr-2" />
            Filter
          </button>
        </form>

        {filters.isFilterOpen && (
          <div className="mt-3 bg-white p-4 border border-gray-200 rounded-md shadow-sm">
            <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="inProgress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaCalendarAlt className="inline mr-1" /> Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaCalendarAlt className="inline mr-1" /> End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
              <div className="flex items-end space-x-2">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ride ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Driver
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
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
            {rides.length > 0 ? (
              rides.map((ride) => {
                const statusInfo = formatStatus(ride.status);
                return (
                  <tr key={ride._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{ride._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          {ride.customer?.photo ? (
                            <img
                              className="h-8 w-8 rounded-full object-cover"
                              src={ride.customer.photo}
                              alt={ride.customer.name}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <FaUser className="text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {ride.customer?.name || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {ride.driver ? (
                          <>
                            <div className="flex-shrink-0 h-8 w-8">
                              {ride.driver?.photo ? (
                                <img
                                  className="h-8 w-8 rounded-full object-cover"
                                  src={ride.driver.photo}
                                  alt={ride.driver.name}
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                  <FaCarSide className="text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {ride.driver?.name || 'N/A'}
                              </div>
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ride.price ? formatPrice(ride.price) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ride.createdAt ? formatDate(ride.createdAt) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewRide(ride)}
                        className="text-gray-600 hover:text-gray-900 mr-3"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  {loading ? 'Loading rides...' : 'No rides found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{rides.length}</span> of{' '}
          <span className="font-medium">{totalPages * limit}</span> rides
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

  // Render ride detail view
  const renderRideDetails = () => {
    if (!selectedRide) return null;
    
    const statusInfo = formatStatus(selectedRide.status);
    
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Ride Details</h3>
          <button
            onClick={() => setViewMode('list')}
            className="text-gray-600 hover:text-gray-900"
          >
            Back to List
          </button>
        </div>

        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-sm text-gray-500">Ride ID</span>
            <h4 className="text-lg font-bold">#{selectedRide._id}</h4>
          </div>
          <span className={`px-4 py-1 text-sm font-semibold rounded-full ${statusInfo.class}`}>
            {statusInfo.label}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Customer information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold mb-3 flex items-center">
              <FaUser className="mr-2 text-gray-600" /> Customer Information
            </h4>
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 h-12 w-12">
                {selectedRide.customer?.photo ? (
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={selectedRide.customer.photo}
                    alt={selectedRide.customer.name}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <FaUser className="text-gray-500" />
                  </div>
                )}
              </div>
              <div className="ml-4">
                <div className="font-medium">{selectedRide.customer?.name || 'N/A'}</div>
                <div className="text-sm text-gray-500">{selectedRide.customer?.email || 'N/A'}</div>
                <div className="text-sm text-gray-500">{selectedRide.customer?.phone || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Driver information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold mb-3 flex items-center">
              <FaCarSide className="mr-2 text-gray-600" /> Driver Information
            </h4>
            {selectedRide.driver ? (
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12">
                  {selectedRide.driver?.photo ? (
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src={selectedRide.driver.photo}
                      alt={selectedRide.driver.name}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <FaCarSide className="text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <div className="font-medium">{selectedRide.driver?.name || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{selectedRide.driver?.email || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{selectedRide.driver?.phone || 'N/A'}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No driver assigned to this ride</div>
            )}
          </div>
        </div>

        {/* Ride details section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <h4 className="text-md font-semibold mb-4 flex items-center">
            <FaMapMarkerAlt className="mr-2 text-gray-600" /> Ride Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-sm text-gray-500 block mb-1">Pickup Location</span>
              <div className="font-medium">
                {selectedRide.pickupLocation?.address || 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500 block mb-1">Destination</span>
              <div className="font-medium">
                {selectedRide.dropoffLocation?.address || 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500 block mb-1">Requested Date</span>
              <div className="font-medium">
                {selectedRide.createdAt ? formatDate(selectedRide.createdAt) : 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500 block mb-1">Distance</span>
              <div className="font-medium">
                {selectedRide.distance ? `${selectedRide.distance} km` : 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500 block mb-1">Price</span>
              <div className="font-medium text-lg">
                {selectedRide.price ? formatPrice(selectedRide.price) : 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500 block mb-1">Payment Method</span>
              <div className="font-medium">
                {selectedRide.paymentMethod || 'Cash'}
              </div>
            </div>
          </div>
        </div>

        {/* Ride status timeline */}
        <div className="mb-8">
          <h4 className="text-md font-semibold mb-4">Ride Timeline</h4>
          <div className="flex flex-col space-y-4">
            {selectedRide.statusUpdates && selectedRide.statusUpdates.length > 0 ? (
              selectedRide.statusUpdates.map((update, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 h-4 w-4 rounded-full bg-gray-400 mt-1"></div>
                  <div className="ml-4">
                    <div className="font-medium">{formatStatus(update.status).label}</div>
                    <div className="text-sm text-gray-500">
                      {update.timestamp ? formatDate(update.timestamp) : 'N/A'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No timeline information available</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ride Management</h2>
        {viewMode !== 'list' && (
          <button
            onClick={() => setViewMode('list')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to All Rides
          </button>
        )}
      </div>

      {loading && viewMode === 'list' && rides.length === 0 ? (
        <div className="flex justify-center my-12">
          <FaSpinner className="animate-spin text-4xl text-gray-700" />
        </div>
      ) : (
        <>
          {viewMode === 'list' && renderRideList()}
          {viewMode === 'details' && renderRideDetails()}
        </>
      )}
    </div>
  );
};

export default RideManagement;
