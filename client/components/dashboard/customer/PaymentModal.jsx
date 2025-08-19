'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCreditCard, FaMoneyBillWave, FaSpinner, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  rideData, 
  onPaymentComplete 
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  if (!isOpen || !rideData) return null;

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleCashPayment = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/rides/${rideData._id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethod: 'cash',
          paymentStatus: 'completed'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process cash payment');
      }

      const result = await response.json();
      
      if (result.success) {
        setShowSuccess(true);
        toast.success('Cash payment confirmed! Ride completed successfully.');
        
        // Auto close after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
          onPaymentComplete && onPaymentComplete(result.ride);
          onClose();
        }, 3000);
      } else {
        throw new Error(result.message || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Cash payment error:', error);
      toast.error(error.message || 'Failed to process cash payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleBkashPayment = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      
      // First, update payment method to bkash
      const response = await fetch(`http://localhost:5000/api/rides/${rideData._id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethod: 'bkash',
          paymentStatus: 'pending'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initiate bKash payment');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.info('Redirecting to bKash payment gateway...');
        
        // Redirect to bKash payment page with ride data
        const paymentData = {
          rideId: rideData._id,
          amount: rideData.fare?.total_fare || 0,
          customerName: rideData.customer?.name || 'Customer',
          customerPhone: rideData.customer?.phone || '',
          description: `Vroom Ride Payment - ${rideData.pickup_location?.address} to ${rideData.destination?.address}`
        };
        
        // Store payment data in localStorage for the payment page
        localStorage.setItem('paymentData', JSON.stringify(paymentData));
        
        // Close modal and redirect
        onClose();
        router.push('/payment/bkash');
      } else {
        throw new Error(result.message || 'Failed to initiate bKash payment');
      }
    } catch (error) {
      console.error('bKash payment error:', error);
      toast.error(error.message || 'Failed to initiate bKash payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmPayment = () => {
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (selectedPaymentMethod === 'cash') {
      handleCashPayment();
    } else if (selectedPaymentMethod === 'bkash') {
      handleBkashPayment();
    }
  };

  // Success view
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-3xl text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-800">Payment Successful!</h3>
            <p className="text-gray-600">
              Your cash payment has been confirmed. Thank you for using Vroom!
            </p>
            <div className="animate-pulse text-sm text-gray-500">
              Redirecting to dashboard...
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={processing}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Ride Summary */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Ride Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">From:</span>
              <span className="font-medium text-right flex-1 ml-4">
                {rideData.pickup_location?.address || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">To:</span>
              <span className="font-medium text-right flex-1 ml-4">
                {rideData.destination?.address || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Distance:</span>
              <span className="font-medium">{rideData.distance?.toFixed(1) || '0'} km</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Vehicle Type:</span>
              <span className="font-medium capitalize">{rideData.vehicle_type || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-lg font-semibold text-gray-800">Total Fare:</span>
              <span className="text-2xl font-bold text-green-600">
                ৳{rideData.fare?.total_fare || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Choose Payment Method</h3>
          
          <div className="space-y-3">
            {/* Cash Payment Option */}
            <div
              onClick={() => handlePaymentMethodSelect('cash')}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedPaymentMethod === 'cash'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedPaymentMethod === 'cash' ? 'bg-green-500' : 'bg-gray-100'
                  }`}>
                    <FaMoneyBillWave className={`text-lg ${
                      selectedPaymentMethod === 'cash' ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-semibold">Cash Payment</h4>
                    <p className="text-sm text-gray-600">Pay directly to the driver</p>
                  </div>
                </div>
                
                <div className={`w-5 h-5 rounded-full border-2 ${
                  selectedPaymentMethod === 'cash'
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300'
                }`}>
                  {selectedPaymentMethod === 'cash' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>

            {/* bKash Payment Option */}
            <div
              onClick={() => handlePaymentMethodSelect('bkash')}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedPaymentMethod === 'bkash'
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedPaymentMethod === 'bkash' ? 'bg-pink-500' : 'bg-gray-100'
                  }`}>
                    <FaCreditCard className={`text-lg ${
                      selectedPaymentMethod === 'bkash' ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-semibold">bKash Payment</h4>
                    <p className="text-sm text-gray-600">Pay securely with bKash</p>
                  </div>
                </div>
                
                <div className={`w-5 h-5 rounded-full border-2 ${
                  selectedPaymentMethod === 'bkash'
                    ? 'border-pink-500 bg-pink-500'
                    : 'border-gray-300'
                }`}>
                  {selectedPaymentMethod === 'bkash' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={processing}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleConfirmPayment}
              className={`flex-1 ${
                selectedPaymentMethod === 'cash'
                  ? 'bg-green-600 hover:bg-green-700'
                  : selectedPaymentMethod === 'bkash'
                  ? 'bg-pink-600 hover:bg-pink-700'
                  : 'bg-gray-400'
              }`}
              disabled={!selectedPaymentMethod || processing}
            >
              {processing ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                `Confirm ${selectedPaymentMethod === 'cash' ? 'Cash' : 'bKash'} Payment`
              )}
            </Button>
          </div>
          
          {selectedPaymentMethod && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              {selectedPaymentMethod === 'cash' 
                ? 'Please ensure you have the exact amount ready for the driver.'
                : 'You will be redirected to bKash payment gateway.'
              }
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PaymentModal;
