'use client';

import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaPen } from 'react-icons/fa';
import { useState } from 'react';

const CustomerProfile = ({ userData, userName }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-gray-200/60">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
        >
          <FaPen className="mr-1" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 flex justify-center">
          <div className="bg-blue-100 p-6 rounded-full w-32 h-32 flex items-center justify-center">
            <FaUser className="text-5xl text-blue-600" />
          </div>
        </div>
        
        <div className="md:w-3/4 mt-6 md:mt-0 md:pl-6">
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {userData?.name || userName || 'Customer'}
                </h3>
                <p className="text-sm text-blue-600">@{userName}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center text-gray-700">
                  <FaEnvelope className="mr-2 text-blue-500" />
                  <span>{userData?.email || 'No email available'}</span>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <FaPhone className="mr-2 text-blue-500" />
                  <span>{userData?.phone || 'No phone available'}</span>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <FaMapMarkerAlt className="mr-2 text-blue-500" />
                  <span>{userData?.present_address || 'No address available'}</span>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <span className="mr-2 font-medium">Gender:</span>
                  <span className="capitalize">{userData?.sex || 'Not specified'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text"
                    defaultValue={userData?.name || ''}
                    className="w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 border-gray-300 focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    type="text"
                    defaultValue={userData?.phone || ''}
                    className="w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 border-gray-300 focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input 
                    type="text"
                    defaultValue={userData?.present_address || ''}
                    className="w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 border-gray-300 focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    defaultValue={userData?.sex || ''}
                    className="w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 border-gray-300 focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Others</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;