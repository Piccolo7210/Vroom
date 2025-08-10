'use client';

import { useState, useEffect } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaCar, FaIdCard, FaEdit, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RideService from '@/app/lib/rideService';

const DriverProfile = ({ userData: initialUserData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [statsData, setStatsData] = useState({
    total_rides: 0,
    rating: 5.0,
    total_earnings: 0,
    monthly_rides: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle_type: '',
    vehicle_no: '',
    license_no: '',
    age: '',
    present_address: '',
    sex: ''
  });

  // Fetch complete profile data on component mount
  useEffect(() => {
    fetchProfileData();
    fetchStatsData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await RideService.getDriverProfile();
      
      if (response.success && response.data) {
        setProfileData(response.data);
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          vehicle_type: response.data.vehicle_type || '',
          vehicle_no: response.data.vehicle_no || '',
          license_no: response.data.license_no || '',
          age: response.data.age || '',
          present_address: response.data.present_address || '',
          sex: response.data.sex || ''
        });
      } else {
        // Fallback to initial userData if API fails
        console.warn('Failed to fetch profile data, using initial data');
        if (initialUserData) {
          setFormData({
            name: initialUserData.name || '',
            email: initialUserData.email || '',
            phone: initialUserData.phone || '',
            vehicle_type: initialUserData.vehicle_type || '',
            vehicle_no: initialUserData.Vehicle_no || initialUserData.vehicle_no || '',
            license_no: initialUserData.license_no || '',
            age: initialUserData.age || '',
            present_address: initialUserData.present_address || '',
            sex: initialUserData.sex || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
      
      // Fallback to initial userData
      if (initialUserData) {
        setFormData({
          name: initialUserData.name || '',
          email: initialUserData.email || '',
          phone: initialUserData.phone || '',
          vehicle_type: initialUserData.vehicle_type || '',
          vehicle_no: initialUserData.Vehicle_no || initialUserData.vehicle_no || '',
          license_no: initialUserData.license_no || '',
          age: initialUserData.age || '',
          present_address: initialUserData.present_address || '',
          sex: initialUserData.sex || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStatsData = async () => {
    try {
      // Fetch earnings data
      const earningsResponse = await RideService.getDriverEarnings('year');
      if (earningsResponse.success && earningsResponse.data) {
        const earnings = earningsResponse.data.summary;
        const monthlyEarnings = earningsResponse.data.daily_earnings || [];
        
        // Calculate monthly rides
        const currentMonth = new Date().getMonth() + 1;
        const monthlyRides = monthlyEarnings
          .filter(day => {
            const dayMonth = new Date(day.date).getMonth() + 1;
            return dayMonth === currentMonth;
          })
          .reduce((total, day) => total + (day.trips || 0), 0);

        setStatsData({
          total_rides: earnings.total_trips || 0,
          rating: 5.0, // Default rating since we don't have rating system
          total_earnings: earnings.total_earnings || 0,
          monthly_rides: monthlyRides
        });
      }
    } catch (error) {
      console.error('Error fetching stats data:', error);
      // Keep default values if fetching fails
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare data for update (exclude empty strings)
      const updateData = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] && formData[key].trim() !== '') {
          updateData[key] = formData[key].trim();
        }
      });
      
      console.log('Updating profile with data:', updateData);
      
      const response = await RideService.updateDriverProfile(updateData);
      
      if (response.success) {
        toast.success('Profile updated successfully!');
        setProfileData(response.data);
        setIsEditing(false);
        
        // Update localStorage with new data
        const updatedUserData = {
          ...JSON.parse(localStorage.getItem('userData') || '{}'),
          ...response.data
        };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
      } else {
        toast.error(response.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current profile data
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        vehicle_type: profileData.vehicle_type || '',
        vehicle_no: profileData.vehicle_no || '',
        license_no: profileData.license_no || '',
        age: profileData.age || '',
        present_address: profileData.present_address || '',
        sex: profileData.sex || ''
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Driver Profile
        </h2>
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-2xl text-blue-600" />
          <span className="ml-2 text-gray-800 font-medium">Loading profile...</span>
        </div>
      </div>
    );
  }

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
            <Button onClick={handleSave} size="sm" disabled={saving}>
              {saving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm" disabled={saving}>
              <FaTimes className="mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Profile Photo Section */}
      <Card className="p-6 mb-6 border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <FaUser className="text-4xl text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{formData.name || 'Driver'}</h3>
            <p className="text-gray-700 font-medium capitalize">{formData.vehicle_type || 'N/A'} Driver</p>
            <p className="text-sm text-gray-600 font-medium">Member since 2024</p>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-6 mb-6 border border-gray-200 bg-white shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              <FaUser className="inline mr-2 text-blue-600" />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900 font-medium">{formData.name || 'Not provided'}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              <FaEnvelope className="inline mr-2 text-blue-600" />
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900 font-medium">{formData.email || 'Not provided'}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              <FaPhone className="inline mr-2 text-blue-600" />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900 font-medium">{formData.phone || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              <FaUser className="inline mr-2 text-blue-600" />
              Age
            </label>
            {isEditing ? (
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                min="18"
                max="70"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900 font-medium">{formData.age || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              <FaUser className="inline mr-2 text-blue-600" />
              Gender
            </label>
            {isEditing ? (
              <select
                name="sex"
                value={formData.sex}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <p className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900 font-medium capitalize">{formData.sex || 'Not provided'}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-800 mb-2">
              <FaUser className="inline mr-2 text-blue-600" />
              Present Address
            </label>
            {isEditing ? (
              <textarea
                name="present_address"
                value={formData.present_address}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Enter your current address"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900 font-medium">{formData.present_address || 'Not provided'}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Vehicle Information */}
      <Card className="p-6 mb-6 border border-gray-200 bg-white shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Vehicle Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              <FaCar className="inline mr-2 text-blue-600" />
              Vehicle Type
            </label>
            {isEditing ? (
              <select
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">Select Vehicle Type</option>
                <option value="bike">Bike</option>
                <option value="cng">CNG</option>
                <option value="car">Car</option>
              </select>
            ) : (
              <p className="px-3 py-2 bg-gray-100 rounded-lg capitalize text-gray-900 font-medium">{formData.vehicle_type || 'Not provided'}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              <FaCar className="inline mr-2 text-blue-600" />
              Vehicle Number
            </label>
            {isEditing ? (
              <input
                type="text"
                name="vehicle_no"
                value={formData.vehicle_no}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="e.g., DHK-123456"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900 font-medium">{formData.vehicle_no || 'Not provided'}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              <FaIdCard className="inline mr-2 text-blue-600" />
              License Number
            </label>
            {isEditing ? (
              <input
                type="text"
                name="license_no"
                value={formData.license_no}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900 font-medium">{formData.license_no || 'Not provided'}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Account Statistics */}
      <Card className="p-6 border border-gray-200 bg-white shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Account Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <p className="text-2xl font-bold text-blue-700">{statsData.total_rides}</p>
            <p className="text-sm text-gray-700 font-medium">Total Rides</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <p className="text-2xl font-bold text-green-700">{statsData.rating.toFixed(1)}</p>
            <p className="text-sm text-gray-700 font-medium">Rating</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <p className="text-2xl font-bold text-purple-700">৳{statsData.total_earnings}</p>
            <p className="text-sm text-gray-700 font-medium">Total Earnings</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <p className="text-2xl font-bold text-orange-700">{statsData.monthly_rides}</p>
            <p className="text-sm text-gray-700 font-medium">This Month</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DriverProfile;
