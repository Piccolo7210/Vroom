'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PaymentFailedPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const rideId = searchParams.get('ride_id');
  const error = searchParams.get('error');
  const reason = searchParams.get('reason');

  const getErrorMessage = () => {
    switch (error || reason) {
      case 'ride_not_found':
        return 'Ride not found. Please contact support.';
      case 'invalid_transaction':
        return 'Invalid transaction. Please try again.';
      case 'payment_failed':
        return 'Payment was declined. Please check your payment method and try again.';
      case 'server_error':
        return 'Server error occurred. Please try again later.';
      default:
        return 'Payment failed. Please try again or contact support.';
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard/customer');
  };

  const handleRetryPayment = () => {
    if (rideId) {
      router.push(`/dashboard/customer?tab=history`);
    } else {
      router.push('/dashboard/customer');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-4xl text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-4">{getErrorMessage()}</p>
        </div>

        {rideId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold mb-3">Payment Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ride ID:</span>
                <span className="font-medium text-xs">{rideId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-red-600">Failed</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {rideId && (
            <Button 
              onClick={handleRetryPayment}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Try Payment Again
            </Button>
          )}
          <Button 
            onClick={handleBackToDashboard}
            variant="outline"
            className="w-full"
          >
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentFailedPage;
