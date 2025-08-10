'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUser, FaSearch, FaEdit, FaBan, FaTrash, FaCheck, FaEye, FaSpinner, FaCar, FaStar } from 'react-icons/fa';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, details, edit
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleDetails: {
      model: '',
      color: '',
      licensePlate: ''
    },
    status: ''
  });

  // Fetch drivers
  useEffect(() => {
    fetchDrivers();
  }, [page, limit]);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/drivers?page=${page}&limit=${limit}&search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch drivers');
      }

      const data = await response.json();
      setDrivers(data.drivers);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Error loading drivers. Please try again.');
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

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setEditForm({
      name: driver.name || '',
      email: driver.email || '',
      phone: driver.phone || '',
      vehicleDetails: {
        model: driver.vehicleDetails?.model || '',
        color: driver.vehicleDetails?.color || '',
        licensePlate: driver.vehicleDetails?.licensePlate || ''
      },
      status: driver.status || 'active'
    });
    setViewMode('edit');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('vehicle.')) {
      const vehicleField = name.split('.')[1];
      setEditForm(prev => ({
        ...prev,
        vehicleDetails: {
          ...prev.vehicleDetails,
          [vehicleField]: value
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdateDriver = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/drivers/${selectedDriver._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update driver');
      }

      toast.success('Driver updated successfully');
      setViewMode('list');
      fetchDrivers();
    } catch (error) {
      console.error('Error updating driver:', error);
      toast.error('Error updating driver. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (driverId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/drivers/${driverId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update driver status');
      }

      toast.success(`Driver ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      
      // Update local state
      setDrivers(drivers.map(driver => 
        driver._id === driverId ? { ...driver, status: newStatus } : driver
      ));
      
      if (selectedDriver && selectedDriver._id === driverId) {
        setSelectedDriver({ ...selectedDriver, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating driver status:', error);
      toast.error('Error updating driver status. Please try again.');
    }
  };

  const handleDeleteDriver = async (driverId) => {
    if (!window.confirm('Are you sure you want to delete this driver? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/drivers/${driverId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete driver');
      }

      toast.success('Driver deleted successfully');
      
      // Update local state
      setDrivers(drivers.filter(driver => driver._id !== driverId));
      
      if (selectedDriver && selectedDriver._id === driverId) {
        setViewMode('list');
        setSelectedDriver(null);
      }
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast.error('Error deleting driver. Please try again.');
    }
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
                        {driver.photo ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={driver.photo}
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
                          {driver.vehicleDetails?.model || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {driver.vehicleDetails?.licensePlate || 'No plate info'}
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
                        driver.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {driver.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDriver(driver)}
                      className="text-gray-600 hover:text-gray-900 mr-3"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEditDriver(driver)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Edit Driver"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(driver._id, driver.status)}
                      className={`${
                        driver.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                      } mr-3`}
                      title={driver.status === 'active' ? 'Deactivate Driver' : 'Activate Driver'}
                    >
                      {driver.status === 'active' ? <FaBan /> : <FaCheck />}
                    </button>
                    <button
                      onClick={() => handleDeleteDriver(driver._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Driver"
                    >
                      <FaTrash />
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
            {selectedDriver.photo ? (
              <img
                className="h-40 w-40 rounded-full object-cover mb-4"
                src={selectedDriver.photo}
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
              selectedDriver.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {selectedDriver.status || 'active'}
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
                <h4 className="text-sm font-medium text-gray-500">License</h4>
                <p className="mt-1">{selectedDriver.license || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Joined On</h4>
                <p className="mt-1">
                  {selectedDriver.createdAt 
                    ? new Date(selectedDriver.createdAt).toLocaleDateString() 
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Vehicle Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h5 className="text-xs text-gray-500">Model</h5>
                  <p className="font-medium">{selectedDriver.vehicleDetails?.model || 'N/A'}</p>
                </div>
                <div>
                  <h5 className="text-xs text-gray-500">Color</h5>
                  <p className="font-medium">{selectedDriver.vehicleDetails?.color || 'N/A'}</p>
                </div>
                <div>
                  <h5 className="text-xs text-gray-500">License Plate</h5>
                  <p className="font-medium">{selectedDriver.vehicleDetails?.licensePlate || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                onClick={() => handleEditDriver(selectedDriver)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <FaEdit className="mr-2" />
                Edit Driver
              </button>
              <button
                onClick={() => handleToggleStatus(selectedDriver._id, selectedDriver.status)}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  selectedDriver.status === 'active'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
              >
                {selectedDriver.status === 'active' ? (
                  <>
                    <FaBan className="mr-2" />
                    Deactivate Driver
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Activate Driver
                  </>
                )}
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

  // Render edit form
  const renderEditForm = () => {
    if (!selectedDriver) return null;
    
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Edit Driver</h3>
          <button
            onClick={() => setViewMode('details')}
            className="text-gray-600 hover:text-gray-900"
          >
            Back to Details
          </button>
        </div>

        <form onSubmit={handleUpdateDriver}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={editForm.phone}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={editForm.status}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-lg font-medium mb-4">Vehicle Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Model
                </label>
                <input
                  type="text"
                  name="vehicle.model"
                  value={editForm.vehicleDetails.model}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Color
                </label>
                <input
                  type="text"
                  name="vehicle.color"
                  value={editForm.vehicleDetails.color}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Plate
                </label>
                <input
                  type="text"
                  name="vehicle.licensePlate"
                  value={editForm.vehicleDetails.licensePlate}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('details')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
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
          {viewMode === 'edit' && renderEditForm()}
        </>
      )}
    </div>
  );
};

export default DriverManagement;
