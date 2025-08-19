'use client';

import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaSpinner, FaSearch, FaIdCard, FaCarAlt, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';

const DriverVerification = () => {
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');

  // Fetch pending drivers
  const fetchPendingDrivers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      if (!token) {
        toast.error('Authentication required: No token found');
        return;
      }
      
      if (userData.role !== 'admin') {
        toast.error('Admin privileges required');
        return;
      }
      
      console.log('Fetching pending drivers with token:', token.substring(0, 10) + '...', 'Role:', userData.role);
      
      const response = await fetch('http://localhost:5000/api/admin/drivers/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      let result;
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error(`Invalid JSON response from server: ${responseText.substring(0, 100)}...`);
      }
      
      if (!response.ok) {
        console.error('Response error:', result);
        throw new Error(`API Error: ${response.status} - ${result.message || result.error || 'Unknown error'}`);
      }
      
      console.log('Fetched pending drivers:', result);
      
      if (!result.data) {
        throw new Error('Invalid response format - no data field');
      }
      
      setPendingDrivers(result.data);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching pending drivers:', error);
      setError(error.message || 'Failed to load driver data');
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchPendingDrivers();
  }, []);
  
  // Handle driver approval
  const handleApproveDriver = async (driverId) => {
    try {
      setProcessingId(driverId);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/admin/drivers/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          driverId,
          status: 'trusted'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve driver');
      }
      
      toast.success('Driver approved successfully');
      fetchPendingDrivers(); // Refresh the driver list
    } catch (error) {
      console.error('Error approving driver:', error);
      toast.error('Error approving driver');
    } finally {
      setProcessingId(null);
    }
  };
  
  // Open reject modal
  const openRejectModal = (driver) => {
    setSelectedDriver(driver);
    setRejectReason('');
    setShowRejectModal(true);
  };
  
  // Handle driver rejection
  const handleRejectDriver = async () => {
    if (!selectedDriver) return;
    
    try {
      setProcessingId(selectedDriver._id);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      if (!rejectReason.trim()) {
        toast.error('Please provide a reason for rejection');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/admin/drivers/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          driverId: selectedDriver._id,
          status: 'rejected',
          rejectionReason: rejectReason.trim()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject driver');
      }
      
      toast.success('Driver rejected successfully');
      fetchPendingDrivers(); // Refresh the driver list
      setShowRejectModal(false);
    } catch (error) {
      console.error('Error rejecting driver:', error);
      toast.error('Error rejecting driver');
    } finally {
      setProcessingId(null);
    }
  };
  
  // Filter drivers based on search term
  const filteredDrivers = pendingDrivers.filter(driver => {
    const searchString = searchTerm.toLowerCase();
    return (
      driver.name.toLowerCase().includes(searchString) ||
      driver.email.toLowerCase().includes(searchString) ||
      driver.userName.toLowerCase().includes(searchString) ||
      driver.phone.includes(searchString) ||
      driver.license_no.toLowerCase().includes(searchString) ||
      driver.vehicle_no.toLowerCase().includes(searchString) ||
      driver.nid_no.toLowerCase().includes(searchString)
    );
  });
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Driver Verification</h2>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-6">
          <FaTimes className="mx-auto text-4xl text-red-400 mb-2" />
          <h3 className="text-xl font-semibold text-red-600">Error Loading Data</h3>
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => {setError(''); fetchPendingDrivers();}}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-3xl text-blue-500" />
        </div>
      ) : !error && pendingDrivers.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <FaClock className="mx-auto text-4xl text-gray-400 mb-2" />
          <h3 className="text-xl font-semibold text-gray-600">No Pending Verifications</h3>
          <p className="text-gray-500">All driver applications have been processed.</p>
        </div>
      ) : !error && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact Info</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vehicle Details</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Documents</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((driver) => (
                <tr key={driver._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">{driver.name}</div>
                    <div className="text-sm text-gray-500">@{driver.userName}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{driver.email}</div>
                    <div className="text-sm text-gray-500">{driver.phone}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900 capitalize">{driver.vehicle_type}</div>
                    <div className="text-sm text-gray-500">{driver.vehicle_no}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-3">
                      <div className="flex items-center text-sm text-gray-700">
                        <FaIdCard className="mr-1 text-blue-500" />
                        <span>NID: {driver.nid_no}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <FaCarAlt className="mr-1 text-green-500" />
                        <span>License: {driver.license_no}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveDriver(driver._id)}
                        disabled={processingId === driver._id}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200 transition-colors flex items-center"
                      >
                        {processingId === driver._id ? (
                          <FaSpinner className="animate-spin mr-1" />
                        ) : (
                          <FaCheck className="mr-1" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(driver)}
                        disabled={processingId === driver._id}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200 transition-colors flex items-center"
                      >
                        <FaTimes className="mr-1" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Reject Driver Application</h3>
            <p className="mb-4 text-gray-600">
              Please provide a reason for rejecting {selectedDriver?.name}'s application:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              rows="3"
              placeholder="Reason for rejection..."
            ></textarea>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectDriver}
                disabled={processingId === selectedDriver?._id}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                {processingId === selectedDriver?._id ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaTimes className="mr-2" />
                )}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverVerification;
