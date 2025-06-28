// // 'use client';

// // import { useState } from 'react';
// // import { useRouter } from 'next/navigation';
// // import Link from 'next/link';
// // import { useForm } from 'react-hook-form';
// // import { FaArrowLeft, FaLock } from 'react-icons/fa';
// // import axios from 'axios';
// // import { toast } from 'react-toastify';

// // export default function LoginPage() {
// //   const router = useRouter();
// //   const [loading, setLoading] = useState(false);
  
// //   const { register, handleSubmit, formState: { errors } } = useForm({
// //     defaultValues: {
// //       email: '',
// //       password: ''
// //     }
// //   });

// //   const onSubmit = async (data) => {
// //     try {
// //       setLoading(true);
      
// //       // Try driver login first
// //       try {
// //         const driverResponse = await axios.post('http://localhost:5000/api/auth/driver/login', data);
// //         localStorage.setItem('token', driverResponse.data.token);
// //         localStorage.setItem('userType', 'driver');
// //         localStorage.setItem('userData', JSON.stringify(driverResponse.data.driver));
        
// //         toast.success('Login successful!');
// //         router.push('/dashboard/driver');
// //         return;
// //       } catch (driverError) {
// //         // If driver login fails, try customer login
// //         try {
// //           const customerResponse = await axios.post('http://localhost:5000/api/auth/customer/login', data);
// //           localStorage.setItem('token', customerResponse.data.token);
// //           localStorage.setItem('userType', 'customer');
// //           localStorage.setItem('userData', JSON.stringify(customerResponse.data.customer));
          
// //           toast.success('Login successful!');
// //           router.push('/dashboard/customer');
// //           return;
// //         } catch (customerError) {
// //           throw new Error('Invalid credentials');
// //         }
// //       }
// //     } catch (error) {
// //       console.error('Login error:', error);
// //       toast.error('Invalid email or password');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gray-50 py-12">
// //       <div className="container mx-auto px-4">
// //         <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
// //           <div className="p-8">
// //             <div className="mb-6">
// //               <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-800">
// //                 <FaArrowLeft className="mr-2" />
// //                 <span>Back to Home</span>
// //               </Link>
// //             </div>

// //             <div className="text-center mb-8">
// //               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
// //                 <FaLock className="h-8 w-8 text-primary-600" />
// //               </div>
// //               <h1 className="text-2xl font-bold">Sign in to your account</h1>
// //               <p className="text-gray-600 mt-2">Enter your credentials to access your account</p>
// //             </div>

// //             <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
// //                 <input
// //                   type="email"
// //                   {...register('email', { 
// //                     required: 'Email is required',
// //                     pattern: {
// //                       value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
// //                       message: 'Invalid email address'
// //                     }
// //                   })}
// //                   className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
// //                 />
// //                 {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
// //               </div>

// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
// //                 <input
// //                   type="password"
// //                   {...register('password', { required: 'Password is required' })}
// //                   className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
// //                 />
// //                 {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
// //               </div>

// //               <div className="flex items-center justify-between">
// //                 <div className="flex items-center">
// //                   <input
// //                     id="remember-me"
// //                     name="remember-me"
// //                     type="checkbox"
// //                     className="h-4 w-4 text-primary-600 border-gray-300 rounded"
// //                   />
// //                   <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
// //                 </div>

// //                 <div className="text-sm">
// //                   <a href="#" className="text-primary-600 hover:text-primary-500">Forgot password?</a>
// //                 </div>
// //               </div>

// //               <div>
// //                 <button
// //                   type="submit"
// //                   disabled={loading}
// //                   className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
// //                 >
// //                   {loading ? 'Signing in...' : 'Sign in'}
// //                 </button>
// //               </div>

// //               <p className="text-center text-gray-600">
// //                 Don't have an account? <Link href="/signup" className="text-primary-600 hover:text-primary-800 font-medium">Sign up</Link>
// //               </p>
// //             </form>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useForm } from 'react-hook-form';
// import { FaArrowLeft, FaLock } from 'react-icons/fa';
// import { toast } from 'react-toastify';
// import { fetchApi } from '@/utils/fetchApi';

// export default function LoginPage() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
  
//   const { register, handleSubmit, formState: { errors } } = useForm({
//     defaultValues: {
//       email: '',
//       password: ''
//     }
//   });

//   const onSubmit = async (data) => {
//     try {
//       setLoading(true);
      
//       // Try driver login first
//       try {
//         const response = await fetchApi('/auth/driver/login', {
//           method: 'POST',
//           body: data
//         });
        
//         localStorage.setItem('token', response.token);
//         localStorage.setItem('userType', 'driver');
//         localStorage.setItem('userData', JSON.stringify(response.driver || response.data));
        
//         toast.success('Login successful!');
//         router.push('/dashboard/driver');
//         return;
//       } catch (driverError) {
//         // If driver login fails, try customer login
//         try {
//           const response = await fetchApi('/auth/customer/login', {
//             method: 'POST',
//             body: data
//           });
          
//           localStorage.setItem('token', response.token);
//           localStorage.setItem('userType', 'customer');
//           localStorage.setItem('userData', JSON.stringify(response.customer || response.data));
          
//           toast.success('Login successful!');
//           router.push('/dashboard/customer');
//           return;
//         } catch (customerError) {
//           throw new Error('Invalid credentials');
//         }
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       toast.error('Invalid email or password');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Rest of your component remains the same
//   return (
//     <div className="min-h-screen bg-gray-50 py-12">
//       {/* Existing JSX remains unchanged... */}
//       <div className="container mx-auto px-4">
//         <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
//           <div className="p-8">
//             <div className="mb-6">
//               <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-800">
//                 <FaArrowLeft className="mr-2" />
//                 <span>Back to Home</span>
//               </Link>
//             </div>

//             <div className="text-center mb-8">
//               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
//                 <FaLock className="h-8 w-8 text-primary-600" />
//               </div>
//               <h1 className="text-2xl font-bold">Sign in to your account</h1>
//               <p className="text-gray-600 mt-2">Enter your credentials to access your account</p>
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
//                 <input
//                   type="email"
//                   {...register('email', { 
//                     required: 'Email is required',
//                     pattern: {
//                       value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                       message: 'Invalid email address'
//                     }
//                   })}
//                   className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
//                 />
//                 {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//                 <input
//                   type="password"
//                   {...register('password', { required: 'Password is required' })}
//                   className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
//                 />
//                 {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
//               </div>

//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <input
//                     id="remember-me"
//                     name="remember-me"
//                     type="checkbox"
//                     className="h-4 w-4 text-primary-600 border-gray-300 rounded"
//                   />
//                   <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
//                 </div>

//                 <div className="text-sm">
//                   <a href="#" className="text-primary-600 hover:text-primary-500">Forgot password?</a>
//                 </div>
//               </div>

//               <div>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
//                 >
//                   {loading ? 'Signing in...' : 'Sign in'}
//                 </button>
//               </div>

//               <p className="text-center text-gray-600">
//                 Don't have an account? <Link href="/signup" className="text-primary-600 hover:text-primary-800 font-medium">Sign up</Link>
//               </p>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FaArrowLeft, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
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
        const driverResponse = await fetch('http://localhost:5000/api/driver/login', {
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
            router.push('/dashboard/driver');
          }, 1000);
          return;
        }
      } catch (driverError) {
        // If driver login fails, continue to customer login
      }
      
      // Try customer login
      try {
        const customerResponse = await fetch('http://localhost:5000/api/customer/login', {
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
            router.push('/dashboard/customer');
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
                  <a href="#" className="text-primary-600 hover:text-primary-500 hover:underline">Forgot password?</a>
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
          </div>
        </div>
      </div>
    </div>
  );
}