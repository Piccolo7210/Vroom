'use client';

import { useState } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaCar, FaIdCard, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DriverProfile = ({ userData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    vehicle_type: userData?.vehicle_type || '',
    vehicle_no: userData?.Vehicle_no || userData?.vehicle_no || '',
    license_no: userData?.license_no || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Here you would typically make an API call to update the profile
      // For now, we'll just show a success message
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userData?.name || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
      vehicle_type: userData?.vehicle_type || '',
      vehicle_no: userData?.Vehicle_no || userData?.vehicle_no || '',
      license_no: userData?.license_no || ''
    });
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Driver Profile
        </h2>
        
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <FaEdit className="mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button onClick={handleSave} size="sm">
              <FaSave className="mr-2" />
              Save
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm">
              <FaTimes className="mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Profile Photo Section */}
      <Card className="p-6 mb-6">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            <FaUser className="text-4xl text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">{formData.name || 'Driver'}</h3>
            <p className="text-gray-600">{formData.vehicle_type || 'N/A'} Driver</p>
            <p className="text-sm text-gray-500">Member since 2024</p>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaUser className="inline mr-2" />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.name || 'Not provided'}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaEnvelope className="inline mr-2" />
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.email || 'Not provided'}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaPhone className="inline mr-2" />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.phone || 'Not provided'}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Vehicle Information */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Vehicle Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCar className="inline mr-2" />
              Vehicle Type
            </label>
            {isEditing ? (
              <select
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Vehicle Type</option>
                <option value="bike">Bike</option>
                <option value="cng">CNG</option>
                <option value="car">Car</option>
              </select>
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-lg capitalize">{formData.vehicle_type || 'Not provided'}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCar className="inline mr-2" />
              Vehicle Number
            </label>
            {isEditing ? (
              <input
                type="text"
                name="vehicle_no"
                value={formData.vehicle_no}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., DHK-123456"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.vehicle_no || 'Not provided'}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaIdCard className="inline mr-2" />
              License Number
            </label>
            {isEditing ? (
              <input
                type="text"
                name="license_no"
                value={formData.license_no}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.license_no || 'Not provided'}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Account Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Account Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-600">Total Rides</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">5.0</p>
            <p className="text-sm text-gray-600">Rating</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">৳0</p>
            <p className="text-sm text-gray-600">Total Earnings</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">0</p>
            <p className="text-sm text-gray-600">This Month</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DriverProfile;
