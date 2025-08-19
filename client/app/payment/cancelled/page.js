'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaBan } from 'react-icons/fa';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PaymentCancelledPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rideId = searchParams.get('ride_id');

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
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBan className="text-4xl text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600 mb-4">
            You cancelled the payment process. You can retry the payment anytime.
          </p>
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
                <span className="font-medium text-yellow-600">Cancelled</span>
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

export default PaymentCancelledPage;
