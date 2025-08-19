'use client';

import Link from 'next/link';
import { FaArrowLeft, FaCar, FaUser } from 'react-icons/fa';

export default function SignupOptionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <div className="mb-6">
              <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-800">
                <FaArrowLeft className="mr-2" />
                <span>Back to Home</span>
              </Link>
            </div>

            <h1 className="text-2xl font-bold text-center mb-8">Choose Account Type</h1>

            <div className="space-y-4">
              <Link 
                href="/signup/driver" 
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <FaCar className="text-primary-600 text-xl" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">Driver</h3>
                    <p className="text-sm text-gray-500">Earn money by offering rides</p>
                  </div>
                </div>
              </Link>

              <Link 
                href="/signup/customer" 
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <FaUser className="text-primary-600 text-xl" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">Customer</h3>
                    <p className="text-sm text-gray-500">Book rides to your destinations</p>
                  </div>
                </div>
              </Link>
            </div>

            <p className="text-center mt-8 text-gray-600">
              Already have an account? <Link href="/login" className="text-primary-600 hover:text-primary-800 font-medium">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}