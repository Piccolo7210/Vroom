'use client';

import { useState } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaCreditCard } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CustomerProfile = ({ userData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    address: userData?.address || ''
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
      address: userData?.address || ''
    });
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Customer Profile
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
            <h3 className="text-xl font-semibold">{formData.name || 'Customer'}</h3>
            <p className="text-gray-600">Vroom Customer</p>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaMapMarkerAlt className="inline mr-2" />
              Address
            </label>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your home address"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.address || 'Not provided'}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Payment Methods */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">
          <FaCreditCard className="inline mr-2" />
          Payment Methods
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FaCreditCard className="text-gray-600" />
              <span>Cash Payment</span>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Default</span>
          </div>
          <Button variant="outline" className="w-full">
            Add Payment Method
          </Button>
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
            <p className="text-2xl font-bold text-green-600">৳0</p>
            <p className="text-sm text-gray-600">Total Spent</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">5.0</p>
            <p className="text-sm text-gray-600">Your Rating</p>
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

export default CustomerProfile;


// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaCreditCard, FaCamera } from 'react-icons/fa';
// import { toast } from 'react-toastify';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';

// const CustomerProfile = ({ userData, userName }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({
//     name: userData?.name || '',
//     email: userData?.email || '',
//     phone: userData?.phone || '',
//     address: userData?.present_address || '',
//   });
//   const [photoUrl, setPhotoUrl] = useState(userData?.photo_link || '');
//   const [profileData, setProfileData] = useState(userData);
//   const [widgetReady, setWidgetReady] = useState(false);
//   const widgetRef = useRef();

//   useEffect(() => {
//     const fetchProfileData = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await fetch(`http://localhost:5000/api/customer/profile/data/${userName.toLowerCase()}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!response.ok) {
//           throw new Error('Failed to fetch profile data');
//         }

//         const data = await response.json();
//         if (data.success) {
//           setProfileData(data.data);
//           setFormData({
//             name: data.data.name || '',
//             email: data.data.email || '',
//             phone: data.data.phone || '',
//             address: data.data.present_address || '',
//           });
//           setPhotoUrl(data.data.photo_link || '');
//         }
//       } catch (error) {
//         console.error('Error fetching profile data:', error);
//         toast.error('Failed to fetch profile data');
//       }
//     };

//     fetchProfileData();

//     const initializeWidget = () => {
//       if (typeof window !== 'undefined' && window.cloudinary) {
//         const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
//         const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

//         if (!cloudName || !uploadPreset) {
//           console.error('Missing Cloudinary environment variables:', { cloudName, uploadPreset });
//           toast.error('Cloudinary configuration is missing. Check .env.local.');
//           return;
//         }

//         widgetRef.current = window.cloudinary.createUploadWidget(
//           {
//             cloudName,
//             uploadPreset,
//             sources: ['local', 'url', 'camera'],
//             multiple: false,
//             resourceType: 'image',
//             clientAllowedFormats: ['jpg', 'png', 'jpeg'],
//             folder: 'customer_photos',
//           },
//           (error, result) => {
//             if (error) {
//               console.error('Upload Widget error:', error);
//               toast.error('Failed to initialize upload widget');
//               return;
//             }
//             if (result && result.event === 'success') {
//               const uploadedUrl = result.info.secure_url;
//               setPhotoUrl(uploadedUrl);
//               updatePhotoInBackend(uploadedUrl);
//             }
//           }
//         );
//         setWidgetReady(true);
//       } else {
//         console.error('Cloudinary script not loaded. Retrying...');
//         if (!document.querySelector('script[src="https://widget.cloudinary.com/v2.0/global/all.js"]')) {
//           const script = document.createElement('script');
//           script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
//           script.async = true;
//           script.onload = () => initializeWidget();
//           script.onerror = () => console.error('Failed to load Cloudinary script');
//           document.head.appendChild(script);
//         }
//       }
//     };

//     initializeWidget();
//   }, [userName]);

//   const updatePhotoInBackend = async (photo_link) => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch('http://localhost:5000/api/customer/profile/photo', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ userName: userName.toLowerCase(), photo_link }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to update photo');
//       }
//       toast.success('Profile photo updated successfully');
//     } catch (error) {
//       console.error('Error updating photo:', error);
//       toast.error('Failed to update profile photo');
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSave = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch('http://localhost:5000/api/customer/profile', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ userName: userName.toLowerCase(), present_address: formData.address }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to update profile');
//       }

//       const updatedCustomer = await response.json();
//       setProfileData(updatedCustomer.data);
//       setIsEditing(false);
//       toast.success('Profile updated successfully');
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       toast.error('Failed to update profile');
//     }
//   };

//   const handleCancel = () => {
//     setFormData({
//       name: profileData?.name || '',
//       email: profileData?.email || '',
//       phone: profileData?.phone || '',
//       address: profileData?.present_address || '',
//     });
//     setIsEditing(false);
//   };

//   return (
//     <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/60">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
//           Customer Profile
//         </h2>
//         {!isEditing ? (
//           <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
//             <FaEdit className="mr-2" />
//             Edit Profile
//           </Button>
//         ) : (
//           <div className="flex space-x-2">
//             <Button onClick={handleSave} size="sm">
//               <FaSave className="mr-2" />
//               Save
//             </Button>
//             <Button onClick={handleCancel} variant="outline" size="sm">
//               <FaTimes className="mr-2" />
//               Cancel
//             </Button>
//           </div>
//         )}
//       </div>

//       {/* Profile Photo Section */}
//       <Card className="p-6 mb-6">
//         <div className="flex items-center space-x-6">
//           <div className="relative w-24 h-24">
//             {photoUrl ? (
//               <img
//                 src={photoUrl}
//                 alt="Profile"
//                 className="w-full h-full object-cover rounded-full border border-gray-200"
//               />
//             ) : (
//               <div className="bg-blue-100 rounded-full w-24 h-24 flex items-center justify-center">
//                 <FaUser className="text-4xl text-blue-600" />
//               </div>
//             )}
//             {isEditing && widgetReady && (
//               <button
//                 onClick={() => widgetRef.current?.open()}
//                 className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
//               >
//                 <FaCamera />
//               </button>
//             )}
//           </div>
//           <div>
//             <h3 className="text-xl font-semibold">{formData.name || 'Customer'}</h3>
//             <p className="text-gray-600">Vroom Customer</p>
//             <p className="text-sm text-gray-500">Member since 2024</p>
//           </div>
//         </div>
//       </Card>

//       {/* Personal Information */}
//       <Card className="p-6 mb-6">
//         <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               <FaUser className="inline mr-2" />
//               Full Name
//             </label>
//             {isEditing ? (
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             ) : (
//               <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.name || 'Not provided'}</p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               <FaEnvelope className="inline mr-2" />
//               Email Address
//             </label>
//             {isEditing ? (
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             ) : (
//               <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.email || 'Not provided'}</p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               <FaPhone className="inline mr-2" />
//               Phone Number
//             </label>
//             {isEditing ? (
//               <input
//                 type="tel"
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             ) : (
//               <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.phone || 'Not provided'}</p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               <FaMapMarkerAlt className="inline mr-2" />
//               Address
//             </label>
//             {isEditing ? (
//               <input
//                 type="text"
//                 name="address"
//                 value={formData.address}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Your home address"
//               />
//             ) : (
//               <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.address || 'Not provided'}</p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
//             <p className="px-3 py-2 bg-gray-50 rounded-lg capitalize">{profileData?.sex || 'Not specified'}</p>
//           </div>
//         </div>
//       </Card>

//       {/* Payment Methods */}
//       <Card className="p-6 mb-6">
//         <h3 className="text-lg font-semibold mb-4">
//           <FaCreditCard className="inline mr-2" />
//           Payment Methods
//         </h3>
//         <div className="space-y-3">
//           <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//             <div className="flex items-center space-x-3">
//               <FaCreditCard className="text-gray-600" />
//               <span>Cash Payment</span>
//             </div>
//             <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Default</span>
//           </div>
//           <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//             <div className="flex items-center space-x-3">
//               <FaCreditCard className="text-gray-600" />
//               <span>bKash</span>
//             </div>
//             <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">Linked</span>
//           </div>
//           <Button variant="outline" className="w-full">
//             Add Payment Method
//           </Button>
//         </div>
//       </Card>

//       {/* Account Statistics */}
//       <Card className="p-6">
//         <h3 className="text-lg font-semibold mb-4">Account Statistics</h3>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <div className="text-center p-4 bg-blue-50 rounded-lg">
//             <p className="text-2xl font-bold text-blue-600">0</p>
//             <p className="text-sm text-gray-600">Total Rides</p>
//           </div>
//           <div className="text-center p-4 bg-green-50 rounded-lg">
//             <p className="text-2xl font-bold text-green-600">৳0</p>
//             <p className="text-sm text-gray-600">Total Spent</p>
//           </div>
//           <div className="text-center p-4 bg-purple-50 rounded-lg">
//             <p className="text-2xl font-bold text-purple-600">5.0</p>
//             <p className="text-sm text-gray-600">Your Rating</p>
//           </div>
//           <div className="text-center p-4 bg-orange-50 rounded-lg">
//             <p className="text-2xl font-bold text-orange-600">0</p>
//             <p className="text-sm text-gray-600">This Month</p>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default CustomerProfile;