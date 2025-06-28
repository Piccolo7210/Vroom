'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function CustomerSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      present_address: '',
      sex: ''
      // Removed photo_link field
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const { confirmPassword, ...customerData } = data;
      
      // Fixed URL to use plural "customers" instead of "customer"
      const response = await fetch('http://localhost:5000/api/customer/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }
      
      setIsSuccess(true);
      toast.success('Registration successful! Please log in.');
      
      // Redirect after short delay
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

                {/* Email field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
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

              {/* Submit button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading || isSuccess}
                  className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-md 
                    hover:from-blue-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-blue-200/40"
                >
                  {isSuccess ? "Registration Successful! 🎉" : 
                   loading ? "Registering..." : "Register as Customer"}
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