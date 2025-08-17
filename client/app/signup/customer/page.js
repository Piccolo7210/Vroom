'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function CustomerSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch, setError, clearErrors } = useForm({
    defaultValues: {
      name: '',
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      present_address: '',
      sex: ''
    }
  });

  // Watch username changes to validate uniqueness
  const usernameValue = watch("userName");
  const emailValue = watch("email");
  // Username validation with debounce
  useEffect(() => {
    if (!usernameValue || usernameValue.length < 3) return;
    
    const timeoutId = setTimeout(async () => {
      try {
        setCheckingUsername(true);
        // Call your API endpoint to check if username exists
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/check-username?userName=${encodeURIComponent(usernameValue)}`);
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
      } finally {
        setCheckingUsername(false);
      }
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [usernameValue, setError, clearErrors]);
useEffect(() => {
    // Basic email regex check before sending API request
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailValue || !emailRegex.test(emailValue)) return;
    
    const timeoutId = setTimeout(async () => {
      try {
        setCheckingEmail(true);
        // Call API endpoint to check if email exists
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/check-email?email=${encodeURIComponent(emailValue)}`);
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
      } finally {
        setCheckingEmail(false);
      }
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [emailValue, setError, clearErrors]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const { confirmPassword, ...customerData } = data;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Handle specific errors from backend
        if (result.error === 'Username already exists') {
          setError('userName', {
            type: 'manual',
            message: 'Username already taken'
          });
          throw new Error('Username already taken');
        } else if (result.error === 'Email already registered') {
          setError('email', {
            type: 'manual',
            message: 'Email already registered'
          });
          throw new Error('Email already registered');
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
        <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200/60 hover:shadow-xl transition-all duration-300">
          <div className="p-8">
            {/* Header and Back button */}
            <div className="mb-6">
              <Link href="/signup" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                <FaArrowLeft className="mr-2" />
                <span>Back</span>
              </Link>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Customer Registration
            </h1>
            <p className="text-center text-gray-600 mb-8">Join our community and book rides easily</p>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name field */}
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
                {/* Username field - NEW */}
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
                          message: 'Username can only contain letters, numbers and underscores'
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
                
              {/* Email field - UPDATED with validation feedback */}
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

                {/* Password field */}
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

                {/* Confirm Password field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
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

                {/* Phone field */}
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

                {/* Gender field */}
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

                {/* Address field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    {...register('present_address', { required: 'Address is required' })}
                    className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
                    ${errors.present_address ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/50'} 
                    shadow-sm focus:shadow-blue-100 transition-all`}
                  />
                  {errors.present_address && <p className="mt-1 text-sm text-red-600">{errors.present_address.message}</p>}
                </div>
              </div>

               {/* Submit button - UPDATED to include checkingEmail in disabled state */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading || isSuccess || checkingUsername || checkingEmail || Object.keys(errors).length > 0}
                  className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-md 
                    hover:from-blue-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-blue-200/40 disabled:opacity-70"
                >
                  {isSuccess ? "Registration Successful! 🎉" : 
                   loading ? "Registering..." : 
                   (checkingUsername || checkingEmail) ? "Validating..." : "Register as Customer"}
                </button>
              </div>

              <p className="text-center text-gray-600">
                Already have an account? <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">Login</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}