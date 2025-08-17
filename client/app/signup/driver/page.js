// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useForm } from 'react-hook-form';
// import { FaArrowLeft, FaCar } from 'react-icons/fa';
// import { toast } from 'react-toastify';

// export default function DriverSignupPage() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
  
//   const { register, handleSubmit, formState: { errors }, watch } = useForm({
//     defaultValues: {
//       name: '',
//       email: '',
//       password: '',
//       confirmPassword: '',
//       phone: '',
//       license_no: '',
//       age: '',
//       present_address: '',
//       sex: '',
//       vehicle_type: '',
//       vehicle_no: ''
//     }
//   });

//   const onSubmit = async (data) => {
//     try {
//       setLoading(true);
//       const { confirmPassword, ...driverData } = data;
      
//       // Using fetch instead of axios
//       const response = await fetch('http://localhost:5000/api/driver/register', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(driverData)
//       });
      
//       const result = await response.json();
      
//       if (!response.ok) {
//         throw new Error(result.error || 'Registration failed');
//       }
      
//       setIsSuccess(true);
//       toast.success('Registration successful! Please log in.');
      
//       // Redirect after short delay
//       setTimeout(() => {
//         router.push('/login');
//       }, 1500);
//     } catch (error) {
//       console.error('Registration error:', error);
//       toast.error(error.message || 'Registration failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8">
//       <div className="container mx-auto px-4">
//         <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200/60 hover:shadow-xl transition-all duration-300">
//           <div className="p-8">
//             <div className="mb-6">
//               <Link href="/signup" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
//                 <FaArrowLeft className="mr-2" />
//                 <span>Back</span>
//               </Link>
//             </div>

//             <div className="text-center mb-8">
//               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
//                 <FaCar className="h-8 w-8 text-blue-600" />
//               </div>
//               <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
//                 Driver Registration
//               </h1>
//               <p className="text-gray-600">Join our driver network and earn money</p>
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Personal Information */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
//                   <input
//                     type="text"
//                     {...register('name', { required: 'Name is required' })}
//                     className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
//                     ${errors.name ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
//                     shadow-sm focus:shadow-blue-100 transition-all`}
//                   />
//                   {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Email Address*</label>
//                   <input
//                     type="email"
//                     {...register('email', { 
//                       required: 'Email is required',
//                       pattern: {
//                         value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                         message: 'Invalid email address'
//                       }
//                     })}
//                     className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
//                     ${errors.email ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
//                     shadow-sm focus:shadow-blue-100 transition-all`}
//                   />
//                   {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
//                   <input
//                     type="password"
//                     {...register('password', { 
//                       required: 'Password is required',
//                       minLength: {
//                         value: 8,
//                         message: 'Password must be at least 8 characters'
//                       }
//                     })}
//                     className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
//                     ${errors.password ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
//                     shadow-sm focus:shadow-blue-100 transition-all`}
//                   />
//                   {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password*</label>
//                   <input
//                     type="password"
//                     {...register('confirmPassword', { 
//                       required: 'Please confirm password',
//                       validate: value => value === watch('password') || 'Passwords do not match'
//                     })}
//                     className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
//                     ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
//                     shadow-sm focus:shadow-blue-100 transition-all`}
//                   />
//                   {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
//                   <input
//                     type="text"
//                     {...register('phone', { required: 'Phone number is required' })}
//                     className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
//                     ${errors.phone ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
//                     shadow-sm focus:shadow-blue-100 transition-all`}
//                   />
//                   {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Age*</label>
//                   <input
//                     type="number"
//                     {...register('age', { 
//                       required: 'Age is required',
//                       min: {
//                         value: 18,
//                         message: 'You must be at least 18 years old'
//                       }
//                     })}
//                     className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
//                     ${errors.age ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
//                     shadow-sm focus:shadow-blue-100 transition-all`}
//                   />
//                   {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Gender*</label>
//                   <select
//                     {...register('sex', { required: 'Gender is required' })}
//                     className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
//                     ${errors.sex ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
//                     shadow-sm focus:shadow-blue-100 transition-all`}
//                   >
//                     <option value="">Select Gender</option>
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                     <option value="others">Others</option>
//                   </select>
//                   {errors.sex && <p className="mt-1 text-sm text-red-600">{errors.sex.message}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Present Address*</label>
//                   <input
//                     type="text"
//                     {...register('present_address', { required: 'Present address is required' })}
//                     className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
//                     ${errors.present_address ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
//                     shadow-sm focus:shadow-blue-100 transition-all`}
//                   />
//                   {errors.present_address && <p className="mt-1 text-sm text-red-600">{errors.present_address.message}</p>}
//                 </div>

//                 {/* Driver Specific Information */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">License Number*</label>
//                   <input
//                     type="text"
//                     {...register('license_no', { required: 'License number is required' })}
//                     className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
//                     ${errors.license_no ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
//                     shadow-sm focus:shadow-blue-100 transition-all`}
//                   />
//                   {errors.license_no && <p className="mt-1 text-sm text-red-600">{errors.license_no.message}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type*</label>
//                   <select
//                     {...register('vehicle_type', { required: 'Vehicle type is required' })}
//                     className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
//                     ${errors.vehicle_type ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
//                     shadow-sm focus:shadow-blue-100 transition-all`}
//                   >
//                     <option value="">Select Vehicle Type</option>
//                     <option value="car">Car</option>
//                     <option value="bike">Bike</option>
//                   </select>
//                   {errors.vehicle_type && <p className="mt-1 text-sm text-red-600">{errors.vehicle_type.message}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number*</label>
//                   <input
//                     type="text"
//                     {...register('vehicle_no', { required: 'Vehicle number is required' })}
//                     className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
//                     ${errors.vehicle_no ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
//                     shadow-sm focus:shadow-blue-100 transition-all`}
//                   />
//                   {errors.vehicle_no && <p className="mt-1 text-sm text-red-600">{errors.vehicle_no.message}</p>}
//                 </div>
//               </div>

//               {/* Error message area */}
//               {errors.root && (
//                 <div className="py-3 px-4 text-sm border-red-400/50 bg-red-500/10 text-red-700 rounded-lg">
//                   {errors.root.message}
//                 </div>
//               )}

//               <div className="flex justify-center mt-8">
//                 <button
//                   type="submit"
//                   disabled={loading || isSuccess}
//                   className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-md 
//                     hover:from-blue-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
//                     transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-blue-200/40 font-medium"
//                 >
//                   {isSuccess ? "Registration Successful! 🎉" : 
//                    loading ? "Registering..." : "Register as Driver"}
//                 </button>
//               </div>

//               <div className="text-center text-gray-600 pt-2">
//                 <p>
//                   Already have an account? <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">Log in</Link>
//                 </p>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FaArrowLeft, FaCar } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function DriverSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingLicense, setCheckingLicense] = useState(false);
  const [checkingVehicle, setCheckingVehicle] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setError, clearErrors } = useForm({
    defaultValues: {
      name: '',
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      license_no: '',
      age: '',
      present_address: '',
      sex: '',
      vehicle_type: '',
      vehicle_no: '',
    }
  });

  const usernameValue = watch('userName');
  const emailValue = watch('email');
  const licenseValue = watch('license_no');
  const vehicleValue = watch('vehicle_no');

  // Combined useEffect for username, email, license, and vehicle validation
  useEffect(() => {
    const checkUsername = async () => {
      if (!usernameValue || usernameValue.length < 3) return;
      try {
        setCheckingUsername(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/driver/check-username?userName=${encodeURIComponent(usernameValue)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to check username');
        }
        
        if (data.exists) {
          setError('userName', {
            type: 'manual',
            message: 'Username already taken'
          });
        } else {
          clearErrors('userName');
        }
      } catch (error) {
        console.error('Username check error:', error);
        toast.error('Failed to validate username. Please try again.');
      } finally {
        setCheckingUsername(false);
      }
    };

    const checkEmail = async () => {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!emailValue || !emailRegex.test(emailValue)) return;
      
      try {
        setCheckingEmail(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/driver/check-email?email=${encodeURIComponent(emailValue)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to check email');
        }
        
        if (data.exists) {
          setError('email', {
            type: 'manual',
            message: 'Email already registered'
          });
        } else {
          clearErrors('email');
        }
      } catch (error) {
        console.error('Email check error:', error);
        toast.error('Failed to validate email. Please try again.');
      } finally {
        setCheckingEmail(false);
      }
    };

    const checkLicense = async () => {
      if (!licenseValue || licenseValue.length < 3) return;
      try {
        setCheckingLicense(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/driver/check-license?license_no=${encodeURIComponent(licenseValue)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to check license number');
        }
        
        if (data.exists) {
          setError('license_no', {
            type: 'manual',
            message: 'License number already registered'
          });
        } else {
          clearErrors('license_no');
        }
      } catch (error) {
        console.error('License check error:', error);
        toast.error('Failed to validate license number. Please try again.');
      } finally {
        setCheckingLicense(false);
      }
    };

    const checkVehicle = async () => {
      if (!vehicleValue || vehicleValue.length < 3) return;
      try {
        setCheckingVehicle(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/driver/check-vehicle?vehicle_no=${encodeURIComponent(vehicleValue)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to check vehicle number');
        }
        
        if (data.exists) {
          setError('vehicle_no', {
            type: 'manual',
            message: 'Vehicle number already registered'
          });
        } else {
          clearErrors('vehicle_no');
        }
      } catch (error) {
        console.error('Vehicle check error:', error);
        toast.error('Failed to validate vehicle number. Please try again.');
      } finally {
        setCheckingVehicle(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (usernameValue) checkUsername();
      if (emailValue) checkEmail();
      if (licenseValue) checkLicense();
      if (vehicleValue) checkVehicle();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [usernameValue, emailValue, licenseValue, vehicleValue, setError, clearErrors]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const { confirmPassword, ...driverData } = data;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/driver/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(driverData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        if (result.error === 'Email already registered') {
          setError('email', { type: 'manual', message: 'Email already registered' });
          throw new Error('Email already registered');
        } else if (result.error === 'License number already registered') {
          setError('license_no', { type: 'manual', message: 'License number already registered' });
          throw new Error('License number already registered');
        } else if (result.error === 'Vehicle number already registered') {
          setError('vehicle_no', { type: 'manual', message: 'Vehicle number already registered' });
          throw new Error('Vehicle number already registered');
        } else if (result.error === 'Username already exists') {
          setError('userName', { type: 'manual', message: 'Username already taken' });
          throw new Error('Username already taken');
        } else {
          throw new Error(result.error || 'Registration failed');
        }
      }
      
      setIsSuccess(true);
      toast.success('Registration successful! Please log in.');
      
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200/60 hover:shadow-xl transition-all duration-300">
          <div className="p-8">
            <div className="mb-6">
              <Link href="/signup" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                <FaArrowLeft className="mr-2" />
                <span>Back</span>
              </Link>
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <FaCar className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                Driver Registration
              </h1>
              <p className="text-gray-600">Join our driver network and earn money</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
                    ${errors.name ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
                    shadow-sm focus:shadow-blue-100 transition-all`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register('userName', { 
                        required: 'Username is required',
                        minLength: {
                          value: 3,
                          message: 'Username must be at least 3 characters'
                        },
                        pattern: {
                          value: /^[a-zA-Z0-9_]+$/,
                          message: 'Username can only contain letters, numbers, and underscores'
                        }
                      })}
                      className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
                      ${errors.userName ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
                      shadow-sm focus:shadow-blue-100 transition-all`}
                    />
                    {checkingUsername && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 text-sm animate-pulse">
                        Checking...
                      </span>
                    )}
                  </div>
                  {errors.userName && <p className="mt-1 text-sm text-red-600">{errors.userName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
                      ${errors.email ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
                      shadow-sm focus:shadow-blue-100 transition-all`}
                    />
                    {checkingEmail && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 text-sm animate-pulse">
                        Checking...
                      </span>
                    )}
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                    className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
                    ${errors.password ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
                    shadow-sm focus:shadow-blue-100 transition-all`}
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password*</label>
                  <input
                    type="password"
                    {...register('confirmPassword', { 
                      required: 'Please confirm password',
                      validate: value => value === watch('password') || 'Passwords do not match'
                    })}
                    className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
                    ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
                    shadow-sm focus:shadow-blue-100 transition-all`}
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    {...register('phone', { required: 'Phone number is required' })}
                    className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
                    ${errors.phone ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
                    shadow-sm focus:shadow-blue-100 transition-all`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age*</label>
                  <input
                    type="number"
                    {...register('age', { 
                      required: 'Age is required',
                      min: {
                        value: 18,
                        message: 'You must be at least 18 years old'
                      }
                    })}
                    className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
                    ${errors.age ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
                    shadow-sm focus:shadow-blue-100 transition-all`}
                  />
                  {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    {...register('sex', { required: 'Gender is required' })}
                    className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
                    ${errors.sex ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
                    shadow-sm focus:shadow-blue-100 transition-all`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Others</option>
                  </select>
                  {errors.sex && <p className="mt-1 text-sm text-red-600">{errors.sex.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Present Address</label>
                  <input
                    type="text"
                    {...register('present_address', { required: 'Present address is required' })}
                    className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
                    ${errors.present_address ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
                    shadow-sm focus:shadow-blue-100 transition-all`}
                  />
                  {errors.present_address && <p className="mt-1 text-sm text-red-600">{errors.present_address.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register('license_no', { 
                        required: 'License number is required',
                        minLength: {
                          value: 3,
                          message: 'License number must be at least 3 characters'
                        }
                      })}
                      className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
                      ${errors.license_no ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
                      shadow-sm focus:shadow-blue-100 transition-all`}
                    />
                    {checkingLicense && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 text-sm animate-pulse">
                        Checking...
                      </span>
                    )}
                  </div>
                  {errors.license_no && <p className="mt-1 text-sm text-red-600">{errors.license_no.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <select
                    {...register('vehicle_type', { required: 'Vehicle type is required' })}
                    className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
                    ${errors.vehicle_type ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
                    shadow-sm focus:shadow-blue-100 transition-all`}
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                  </select>
                  {errors.vehicle_type && <p className="mt-1 text-sm text-red-600">{errors.vehicle_type.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register('vehicle_no', { 
                        required: 'Vehicle number is required',
                        minLength: {
                          value: 3,
                          message: 'Vehicle number must be at least 3 characters'
                        }
                      })}
                      className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
                      ${errors.vehicle_no ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
                      shadow-sm focus:shadow-blue-100 transition-all`}
                    />
                    {checkingVehicle && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 text-sm animate-pulse">
                        Checking...
                      </span>
                    )}
                  </div>
                  {errors.vehicle_no && <p className="mt-1 text-sm text-red-600">{errors.vehicle_no.message}</p>}
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo Link (Optional)</label>
                  <input
                    type="text"
                    {...register('photo_link')}
                    className="w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 border-gray-300 focus:ring-2 focus:ring-blue-500/50 shadow-sm focus:shadow-blue-100 transition-all"
                  />
                </div> */}
              </div>

              {/* Error message area */}
              {errors.root && (
                <div className="py-3 px-4 text-sm border-red-400/50 bg-red-500/10 text-red-700 rounded-lg">
                  {errors.root.message}
                </div>
              )}

              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  disabled={loading || isSuccess || checkingUsername || checkingEmail || checkingLicense || checkingVehicle || Object.keys(errors).length > 0}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-md 
                    hover:from-blue-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-blue-200/40 font-medium disabled:opacity-70"
                >
                  {isSuccess ? "Registration Successful! 🎉" : 
                   loading ? "Registering..." : 
                   (checkingUsername || checkingEmail || checkingLicense || checkingVehicle) ? "Validating..." : "Register as Driver"}
                </button>
              </div>

              <div className="text-center text-gray-600 pt-2">
                <p>
                  Already have an account? <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">Log in</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}