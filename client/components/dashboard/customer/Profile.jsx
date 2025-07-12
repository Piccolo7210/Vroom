'use client';

import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaPen, FaCamera } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';

const CustomerProfile = ({ userName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    present_address: '',
  });
  const [photoUrl, setPhotoUrl] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [widgetReady, setWidgetReady] = useState(false);
  const widgetRef = useRef();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/customer/profile/data/${userName.toLowerCase()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        if (data.success) {
          setProfileData(data.data);
          setFormData({ present_address: data.data.present_address || '' });
          setPhotoUrl(data.data.photo_link || '');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();

    const initializeWidget = () => {
      if (typeof window !== 'undefined' && window.cloudinary) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
          console.error('Missing Cloudinary environment variables:', { cloudName, uploadPreset });
          alert('Cloudinary configuration is missing. Check .env.local.');
          return;
        }

        widgetRef.current = window.cloudinary.createUploadWidget(
          {
            cloudName,
            uploadPreset,
            sources: ['local', 'url', 'camera'],
            multiple: false,
            resourceType: 'image',
            clientAllowedFormats: ['jpg', 'png', 'jpeg'],
            folder: 'customer_photos',
          },
          (error, result) => {
            if (error) {
              console.error('Upload Widget error:', error);
              alert('Failed to initialize upload widget');
              return;
            }
            if (result && result.event === 'success') {
              const uploadedUrl = result.info.secure_url;
              setPhotoUrl(uploadedUrl);
              updatePhotoInBackend(uploadedUrl);
            }
          }
        );
        console.log('Upload Widget initialized:', widgetRef.current);
        setWidgetReady(true);
      } else {
        console.error('Cloudinary script not loaded. Retrying...');
        if (!document.querySelector('script[src="https://widget.cloudinary.com/v2.0/global/all.js"]')) {
          const script = document.createElement('script');
          script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
          script.async = true;
          script.onload = () => initializeWidget();
          script.onerror = () => console.error('Failed to load Cloudinary script');
          document.head.appendChild(script);
        }
      }
    };

    initializeWidget();
  }, [userName]);

  const updatePhotoInBackend = async (photo_link) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/customer/profile/photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userName: userName.toLowerCase(), photo_link }),
      });

      if (!response.ok) {
        throw new Error('Failed to update photo');
      }
      console.log('Photo updated successfully');
    } catch (error) {
      console.error('Error updating photo:', error);
      alert('Failed to update profile photo');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userName: userName.toLowerCase(), present_address: formData.present_address }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedCustomer = await response.json();
      setIsEditing(false);
      setProfileData(updatedCustomer.data);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-gray-200/60">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
          >
            <FaPen className="mr-1" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 flex justify-center">
          <div className="relative w-32 h-32">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                className="w-full h-full object-cover rounded-full border border-gray-200"
              />
            ) : (
              <div className="bg-blue-100 p-6 rounded-full w-32 h-32 flex items-center justify-center">
                <FaUser className="text-5xl text-blue-600" />
              </div>
            )}
            {isEditing && widgetReady && (
              <button
                onClick={() => {
                  if (widgetRef.current) {
                    widgetRef.current.open();
                    console.log('Camera icon clicked, opening widget');
                  } else {
                    console.error('Widget not initialized');
                  }
                }}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
              >
                <FaCamera />
              </button>
            )}
          </div>
        </div>

        <div className="md:w-3/4 mt-6 md:mt-0 md:pl-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {profileData?.name || userName || 'Customer'}
              </h3>
              <p className="text-sm text-blue-600">@{userName}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center text-gray-700">
                <FaEnvelope className="mr-2 text-blue-500" />
                <span>{profileData?.email || 'No email available'}</span>
              </div>

              <div className="flex items-center text-gray-700">
                <FaPhone className="mr-2 text-blue-500" />
                <span>{profileData?.phone || 'No phone available'}</span>
              </div>

              <div className="flex items-center text-gray-700">
                <FaMapMarkerAlt className="mr-2 text-blue-500" />
                {isEditing ? (
                  <input
                    type="text"
                    name="present_address"
                    value={formData.present_address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 border-gray-300 focus:ring-2 focus:ring-blue-500/50"
                  />
                ) : (
                  <span>{profileData?.present_address || 'No address available'}</span>
                )}
              </div>

              <div className="flex items-center text-gray-700">
                <span className="mr-2 font-medium">Gender:</span>
                <span className="capitalize">{profileData?.sex || 'Not specified'}</span>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;