'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FaArrowLeft, FaLock, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Forgot password states
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Customer');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Try driver login first
      try {
        const driverResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/driver/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        const driverResult = await driverResponse.json();
        
        if (driverResponse.ok) {
          localStorage.setItem('token', driverResult.token);
          localStorage.setItem('userType', 'driver');
          localStorage.setItem('userData', JSON.stringify(driverResult.driver || driverResult.data));
          
          setIsSuccess(true);
          toast.success('Login successful!!!');
          
          setTimeout(() => {
            router.push(`/dashboard/driver/${driverResult.data.userName}`);
          }, 1000);
          return;
        }
      } catch (driverError) {
        // If driver login fails, continue to customer login
      }
      
      // Try customer login
      try {
        const customerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        const customerResult = await customerResponse.json();
        
        if (customerResponse.ok) {
          localStorage.setItem('token', customerResult.token);
          localStorage.setItem('userType', 'customer');
          localStorage.setItem('userData', JSON.stringify(customerResult.customer || customerResult.data));
          
          setIsSuccess(true);
          toast.success('Login successful!');
          
          setTimeout(() => {
            router.push(`/dashboard/customer/${customerResult.data.userName}`);
          }, 1000);
          return;
        } else {
          throw new Error('Invalid credentials');
        }
      } catch (customerError) {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password request
  const handleForgotPassword = async () => {
    try {
      setForgotPasswordLoading(true);
      
      if (!email) {
        toast.error('Please enter your email');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/password/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, role })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setOtp(data.otp);
        setOtpSent(true);
        toast.success('OTP sent to your email');
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = () => {
    if (userOtp === otp) {
      setResetPasswordMode(true);
      toast.success('OTP verified');
    } else {
      toast.error('Invalid OTP');
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    try {
      setForgotPasswordLoading(true);
      
      if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      if (newPassword.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/password/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, role, newPassword })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Password reset successful');
        // Reset all states and return to login
        setForgotPasswordMode(false);
        setOtpSent(false);
        setResetPasswordMode(false);
        setEmail('');
        setRole('Customer');
        setOtp('');
        setUserOtp('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Close forgot password modal
  const closeForgotPasswordModal = () => {
    setForgotPasswordMode(false);
    setOtpSent(false);
    setResetPasswordMode(false);
    setEmail('');
    setRole('Customer');
    setOtp('');
    setUserOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200/60 hover:shadow-xl transition-all duration-300">
          <div className="p-8">
            <div className="mb-6">
              <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors">
                <FaArrowLeft className="mr-2" />
                <span>Back to Home</span>
              </Link>
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
                <FaLock className="h-8 w-8 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
                Sign in to your account
              </h1>
              <p className="text-gray-600 mt-2">Enter your credentials to access your account</p>
            </div>

            {!forgotPasswordMode ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    ${errors.email ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-primary-500/50'} 
                    shadow-sm focus:shadow-primary-100 transition-all`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    {...register('password', { required: 'Password is required' })}
                    className={`w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
                    ${errors.password ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-primary-500/50'} 
                    shadow-sm focus:shadow-primary-100 transition-all`}
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
                  </div>

                  <div className="text-sm">
                    <button 
                      type="button" 
                      onClick={() => setForgotPasswordMode(true)} 
                      className="text-primary-600 hover:text-primary-500 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading || isSuccess}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-lg
                      bg-gradient-to-r from-primary-600 to-indigo-500 text-white hover:from-primary-700 hover:to-indigo-600
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                      transition-all transform hover:scale-[1.02] hover:shadow-primary-200/40"
                  >
                    {isSuccess ? "Login Successful! 🎉" : 
                     loading ? "Signing in..." : "Sign in"}
                  </button>
                </div>

                <p className="text-center text-gray-600">
                  Don't have an account? <Link href="/signup" className="text-primary-600 hover:text-primary-800 font-medium hover:underline">Sign up</Link>
                </p>
              </form>
            ) : (
              <div className="space-y-6 relative">
                <button 
                  className="absolute top-0 right-0 text-gray-500 hover:text-gray-700" 
                  onClick={closeForgotPasswordModal}
                >
                  <FaTimes />
                </button>
                
                <h2 className="text-xl font-semibold text-center">
                  {resetPasswordMode ? "Reset Password" : otpSent ? "Enter OTP" : "Forgot Password"}
                </h2>
                
                {!otpSent ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
                        border-gray-300 focus:ring-2 focus:ring-primary-500/50 
                        shadow-sm focus:shadow-primary-100 transition-all"
                        placeholder="Enter your registered email"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
                        border-gray-300 focus:ring-2 focus:ring-primary-500/50 
                        shadow-sm focus:shadow-primary-100 transition-all"
                      >
                        <option value="Customer">Customer</option>
                        <option value="Driver">Driver</option>
                      </select>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={forgotPasswordLoading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-lg
                        bg-gradient-to-r from-primary-600 to-indigo-500 text-white hover:from-primary-700 hover:to-indigo-600
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                        transition-all transform hover:scale-[1.02] hover:shadow-primary-200/40"
                    >
                      {forgotPasswordLoading ? "Sending..." : "Send OTP"}
                    </button>
                  </>
                ) : resetPasswordMode ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
                        border-gray-300 focus:ring-2 focus:ring-primary-500/50 
                        shadow-sm focus:shadow-primary-100 transition-all"
                        placeholder="Enter new password"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
                        border-gray-300 focus:ring-2 focus:ring-primary-500/50 
                        shadow-sm focus:shadow-primary-100 transition-all"
                        placeholder="Confirm new password"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={forgotPasswordLoading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-lg
                        bg-gradient-to-r from-primary-600 to-indigo-500 text-white hover:from-primary-700 hover:to-indigo-600
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                        transition-all transform hover:scale-[1.02] hover:shadow-primary-200/40"
                    >
                      {forgotPasswordLoading ? "Resetting..." : "Reset Password"}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      We've sent a 4-digit OTP to <span className="font-medium">{email}</span>
                    </p>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                      <input
                        type="text"
                        value={userOtp}
                        onChange={(e) => setUserOtp(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-white/50 focus:bg-white/70 
                        border-gray-300 focus:ring-2 focus:ring-primary-500/50 
                        shadow-sm focus:shadow-primary-100 transition-all"
                        placeholder="Enter the 4-digit OTP"
                        maxLength={4}
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={verifyOTP}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-lg
                        bg-gradient-to-r from-primary-600 to-indigo-500 text-white hover:from-primary-700 hover:to-indigo-600
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                        transition-all transform hover:scale-[1.02] hover:shadow-primary-200/40"
                    >
                      Verify OTP
                    </button>
                    
                    <div className="text-center">
                      <button 
                        type="button" 
                        onClick={handleForgotPassword}
                        className="text-sm text-primary-600 hover:text-primary-500 hover:underline"
                      >
                        Resend OTP
                      </button>
                    </div>
                  </>
                )}
                
                <div className="text-center pt-4">
                  <button 
                    type="button"
                    onClick={closeForgotPasswordModal}
                    className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}