'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUser, FaSearch, FaEdit, FaBan, FaTrash, FaCheck, FaEye, FaSpinner } from 'react-icons/fa';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, details, edit
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: ''
  });

  // Fetch customers
  useEffect(() => {
    fetchCustomers();
  }, [page, limit]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/customers?page=${page}&limit=${limit}&search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data.customers);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Error loading customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setViewMode('details');
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      status: customer.status || 'active'
    });
    setViewMode('edit');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/customers/${selectedCustomer._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update customer');
      }

      toast.success('Customer updated successfully');
      setViewMode('list');
      fetchCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Error updating customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (customerId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/customers/${customerId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update customer status');
      }

      toast.success(`Customer ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      
      // Update local state
      setCustomers(customers.map(cust => 
        cust._id === customerId ? { ...cust, status: newStatus } : cust
      ));
      
      if (selectedCustomer && selectedCustomer._id === customerId) {
        setSelectedCustomer({ ...selectedCustomer, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast.error('Error updating customer status. Please try again.');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }

      toast.success('Customer deleted successfully');
      
      // Update local state
      setCustomers(customers.filter(cust => cust._id !== customerId));
      
      if (selectedCustomer && selectedCustomer._id === customerId) {
        setViewMode('list');
        setSelectedCustomer(null);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Error deleting customer. Please try again.');
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

  // Render customer list view
  const renderCustomerList = () => (
    <>
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search customers by name or email..."
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
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
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
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {customer.photo ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={customer.photo}
                            alt={customer.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <FaUser className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.userName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        customer.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {customer.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewCustomer(customer)}
                      className="text-gray-600 hover:text-gray-900 mr-3"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEditCustomer(customer)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Edit Customer"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(customer._id, customer.status)}
                      className={`${
                        customer.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                      } mr-3`}
                      title={customer.status === 'active' ? 'Deactivate Customer' : 'Activate Customer'}
                    >
                      {customer.status === 'active' ? <FaBan /> : <FaCheck />}
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Customer"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  {loading ? 'Loading customers...' : 'No customers found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{customers.length}</span> of{' '}
          <span className="font-medium">{totalPages * limit}</span> customers
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

  // Render customer detail view
  const renderCustomerDetails = () => {
    if (!selectedCustomer) return null;
    
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Customer Details</h3>
          <button
            onClick={() => setViewMode('list')}
            className="text-gray-600 hover:text-gray-900"
          >
            Back to List
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
            {selectedCustomer.photo ? (
              <img
                className="h-40 w-40 rounded-full object-cover mb-4"
                src={selectedCustomer.photo}
                alt={selectedCustomer.name}
              />
            ) : (
              <div className="h-40 w-40 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                <FaUser className="text-gray-500 text-5xl" />
              </div>
            )}
            <span className={`px-4 py-1 text-sm font-semibold rounded-full ${
              selectedCustomer.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {selectedCustomer.status || 'active'}
            </span>
          </div>

          <div className="md:w-2/3 md:pl-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Name</h4>
                <p className="mt-1">{selectedCustomer.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Username</h4>
                <p className="mt-1">{selectedCustomer.userName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <p className="mt-1">{selectedCustomer.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                <p className="mt-1">{selectedCustomer.phone || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Address</h4>
                <p className="mt-1">{selectedCustomer.address || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Joined On</h4>
                <p className="mt-1">
                  {selectedCustomer.createdAt 
                    ? new Date(selectedCustomer.createdAt).toLocaleDateString() 
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                onClick={() => handleEditCustomer(selectedCustomer)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <FaEdit className="mr-2" />
                Edit Customer
              </button>
              <button
                onClick={() => handleToggleStatus(selectedCustomer._id, selectedCustomer.status)}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  selectedCustomer.status === 'active'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
              >
                {selectedCustomer.status === 'active' ? (
                  <>
                    <FaBan className="mr-2" />
                    Deactivate Customer
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Activate Customer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Recent Rides</h3>
          <p className="text-gray-500">No recent rides found for this customer.</p>
        </div>
      </div>
    );
  };

  // Render edit form
  const renderEditForm = () => {
    if (!selectedCustomer) return null;
    
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Edit Customer</h3>
          <button
            onClick={() => setViewMode('details')}
            className="text-gray-600 hover:text-gray-900"
          >
            Back to Details
          </button>
        </div>

        <form onSubmit={handleUpdateCustomer}>
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
                Address
              </label>
              <input
                type="text"
                name="address"
                value={editForm.address}
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
        <h2 className="text-2xl font-bold">Customer Management</h2>
        {viewMode !== 'list' && (
          <button
            onClick={() => setViewMode('list')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to All Customers
          </button>
        )}
      </div>

      {loading && viewMode === 'list' && customers.length === 0 ? (
        <div className="flex justify-center my-12">
          <FaSpinner className="animate-spin text-4xl text-gray-700" />
        </div>
      ) : (
        <>
          {viewMode === 'list' && renderCustomerList()}
          {viewMode === 'details' && renderCustomerDetails()}
          {viewMode === 'edit' && renderEditForm()}
        </>
      )}
    </div>
  );
};

export default CustomerManagement;
