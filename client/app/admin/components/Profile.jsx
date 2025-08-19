'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { FaCamera, FaSpinner, FaEdit, FaKey } from 'react-icons/fa';

const AdminProfile = ({ userData, userName }) => {
  const router = useRouter();
  const [profile, setProfile] = useState(userData || {});
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [cloudinaryWidget, setCloudinaryWidget] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  // Initialize form data when userData changes
  useEffect(() => {
    if (userData) {
      setProfile(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || ''
      });
    }
  }, [userData]);

  // Initialize Cloudinary widget when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only initialize widget after ensuring window is available
      const loadCloudinaryWidget = () => {
        if (window.cloudinary) {
          const widget = window.cloudinary.createUploadWidget(
            {
              cloudName: 'your-cloud-name', // Replace with your Cloudinary cloud name
              uploadPreset: 'your-upload-preset', // Replace with your upload preset
              sources: ['local', 'camera'],
              multiple: false,
              maxFiles: 1,
              cropping: true,
              resourceType: 'image',
              maxImageFileSize: 2000000,
            },
            (error, result) => {
              if (!error && result && result.event === 'success') {
                setImageLoading(false);
                const imageUrl = result.info.secure_url;
                
                // Update profile photo in the backend
                updateProfilePhoto(imageUrl);
              }
              
              if (error) {
                setImageLoading(false);
                toast.error('Error uploading image. Please try again.');
              }
            }
          );
          setCloudinaryWidget(widget);
        }
      };

      // Check if Cloudinary script is already loaded
      if (!window.cloudinary) {
        const script = document.createElement('script');
        script.src = 'https://upload-widget.cloudinary.com/global/all.js';
        script.async = true;
        script.onload = loadCloudinaryWidget;
        document.body.appendChild(script);
        
        return () => {
          document.body.removeChild(script);
        };
      } else {
        loadCloudinaryWidget();
      }
    }
  }, []);

  const updateProfilePhoto = async (imageUrl) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/updatePhoto`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ photo: imageUrl })
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(prev => ({
          ...prev,
          photo: imageUrl
        }));
        toast.success('Profile photo updated successfully');
        
        // Update user data in local storage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.photo = imageUrl;
        localStorage.setItem('userData', JSON.stringify(userData));
      } else {
        toast.error(data.message || 'Failed to update profile photo');
      }
    } catch (error) {
      console.error('Error updating profile photo:', error);
      toast.error('Error updating profile photo. Please try again.');
    }
  };

  const handleProfilePhotoClick = () => {
    if (cloudinaryWidget) {
      setImageLoading(true);
      cloudinaryWidget.open();
    } else {
      toast.error('Image upload feature is initializing. Please try again in a moment.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(prev => !prev);
    if (!isEditing) {
      // Reset form data to current profile when entering edit mode
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || ''
      });
    }
  };

  const handlePasswordToggle = () => {
    setIsChangingPassword(prev => !prev);
    if (!isChangingPassword) {
      // Reset password form when entering password change mode
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/updateProfile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Update the profile state
        setProfile(prev => ({
          ...prev,
          ...formData
        }));
        
        // Update user data in local storage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        localStorage.setItem('userData', JSON.stringify({
          ...userData,
          ...formData
        }));
        
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/updatePassword`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password updated successfully');
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Error updating password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Admin Profile</h2>
      
      <div className="bg-white rounded-xl overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-gray-800 to-black p-6 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200 relative">
              {profile?.photo ? (
                <Image 
                  src={profile.photo}
                  alt={profile.name || 'Admin'} 
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                  <FaCamera size={24} />
                </div>
              )}
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <FaSpinner className="animate-spin text-white" size={24} />
                </div>
              )}
            </div>
            <button 
              onClick={handleProfilePhotoClick}
              className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200"
            >
              <FaCamera className="text-gray-600" />
            </button>
          </div>
          <h3 className="text-xl font-bold text-white mt-4">{profile?.name || 'Admin'}</h3>
          <p className="text-gray-200">System Administrator</p>
        </div>

        <div className="p-6">
          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileInfoItem label="Name" value={profile?.name || 'Not set'} />
                <ProfileInfoItem label="Email" value={profile?.email || 'Not set'} />
                <ProfileInfoItem label="Phone" value={profile?.phone || 'Not set'} />
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleEditToggle}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <FaEdit className="mr-2" />
                  Edit Profile
                </button>
                <button
                  onClick={handlePasswordToggle}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <FaKey className="mr-2" />
                  Change Password
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {isChangingPassword && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Change Password</h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Updating...
                      </>
                    ) : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={handlePasswordToggle}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for displaying profile information
const ProfileInfoItem = ({ label, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <span className="block text-sm font-medium text-gray-500">{label}</span>
    <span className="block mt-1 text-base">{value}</span>
  </div>
);

export default AdminProfile;
