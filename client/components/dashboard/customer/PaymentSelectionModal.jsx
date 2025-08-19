'use client';

import { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaCreditCard, FaSpinner, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PaymentSelectionModal = ({ 
  isOpen,
  rideId,
  onClose, 
  onPaymentComplete 
}) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [customerPaymentMethods, setCustomerPaymentMethods] = useState([]);
  const [ride, setRide] = useState(null);
  const router = useRouter();

  // Fetch ride details and customer payment methods when modal opens
  useEffect(() => {
    if (isOpen && rideId) {
      fetchRideAndPaymentMethods();
    }
  }, [isOpen, rideId]);

  const fetchRideAndPaymentMethods = async () => {
    try {
      console.log('Fetching ride and payment methods for rideId:', rideId);
      
      // Fetch ride details
      const rideResponse = await fetch(`http://localhost:5000/api/rides/${rideId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (rideResponse.ok) {
        const rideData = await rideResponse.json();
        console.log('Ride data fetched:', rideData);
        setRide(rideData.data);
      } else {
        console.error('Failed to fetch ride data:', rideResponse.status);
      }

      // Fetch customer profile for payment methods
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      console.log('User data from localStorage:', userData);
      
      const customerResponse = await fetch(`http://localhost:5000/api/customer/profile/data/${userData.userName.toLowerCase()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Customer response status:', customerResponse.status);
      
      if (customerResponse.ok) {
        const customerData = await customerResponse.json();
        console.log('Customer data fetched:', customerData);
        console.log('Payment methods from API:', customerData.data.payment_methods);
        const paymentMethods = customerData.data.payment_methods || ['cash','bkash'];
        console.log('Setting payment methods to:', paymentMethods);
        setCustomerPaymentMethods(paymentMethods);
      } else {
        console.error('Failed to fetch customer profile:', customerResponse.status);
        const errorText = await customerResponse.text();
        console.error('Error response:', errorText);
        setCustomerPaymentMethods(['cash']); // Default to cash
      }
    } catch (error) {
      console.error('Error fetching ride and payment methods:', error);
      setCustomerPaymentMethods(['cash']); // Default to cash
    }
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleCashPayment = async () => {
    setProcessing(true);
    try {
      // For cash payment, immediately mark as completed
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/rides/${rideId}/payment`, {
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
      
      toast.success('Cash payment completed successfully!');
      
      // Call the completion callback
      if (onPaymentComplete) {
        onPaymentComplete(result.data.ride);
      }
      
      onClose();
      
    } catch (error) {
      console.error('Cash payment error:', error);
      toast.error('Failed to process cash payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleBkashPayment = async () => {
    setProcessing(true);
    try {
      // Call backend to initiate bKash payment
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/payment/initiate/${rideId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to initiate bKash payment');
      }

      const result = await response.json();
      
      if (result.success && result.payment_url) {
        toast.success('Redirecting to bKash payment gateway...');
        
        // Redirect to SSLCommerz payment gateway
        window.location.href = result.payment_url;
      } else {
        throw new Error(result.message || 'Failed to initiate payment');
      }
      
    } catch (error) {
      console.error('bKash payment error:', error);
      toast.error('Failed to initiate bKash payment. Please try again.');
      setProcessing(false);
    }
  };

  const handleProceedWithPayment = () => {
    if (!selectedMethod) {
      toast.warning('Please select a payment method');
      return;
    }

    if (selectedMethod === 'cash') {
      handleCashPayment();
    } else if (selectedMethod === 'bkash') {
      handleBkashPayment();
    }
  };

  // Don't render if modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Complete Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={processing}
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">Your ride has been completed. Please select your payment method.</p>
        </div>

        {/* Ride Summary */}
        {ride && (
          <div className="p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">Ride Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="font-medium text-right">{ride.pickup_location?.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-medium text-right">{ride.destination?.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distance:</span>
                <span className="font-medium">{ride.distance?.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vehicle:</span>
                <span className="font-medium capitalize">{ride.vehicle_type}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-lg font-semibold">Total Fare:</span>
                <span className="text-2xl font-bold text-blue-600">৳{ride.fare?.total_fare}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method Selection */}
        {ride ? (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
            {/* Debug info */}
            <div className="mb-4 p-2 bg-yellow-100 rounded text-xs">
              <strong>Debug:</strong> Available methods: {JSON.stringify(customerPaymentMethods)}
            </div>
            <div className="space-y-3">
            {customerPaymentMethods.includes('cash') && (
              <div 
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedMethod === 'cash' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300'
                }`}
                onClick={() => handlePaymentMethodSelect('cash')}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'cash' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                  }`}>
                    {selectedMethod === 'cash' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <FaMoneyBillWave className="text-green-600 text-xl" />
                  <div>
                    <p className="font-semibold">Cash Payment</p>
                    <p className="text-sm text-gray-600">Pay with cash directly to the driver</p>
                  </div>
                </div>
              </div>
            )}

            {customerPaymentMethods.includes('bkash') && (
              <div 
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedMethod === 'bkash' 
                    ? 'border-pink-500 bg-pink-50' 
                    : 'border-gray-200 hover:border-pink-300'
                }`}
                onClick={() => handlePaymentMethodSelect('bkash')}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'bkash' ? 'border-pink-500 bg-pink-500' : 'border-gray-300'
                  }`}>
                    {selectedMethod === 'bkash' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <div className="w-8 h-8 bg-pink-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">bK</span>
                  </div>
                  <div>
                    <p className="font-semibold">bKash Payment</p>
                    <p className="text-sm text-gray-600">Pay securely with your bKash account</p>
                  </div>
                </div>
              </div>
            )}

            {customerPaymentMethods.includes('card') && (
              <div 
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all opacity-50 ${
                  selectedMethod === 'card' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                  <FaCreditCard className="text-blue-600 text-xl" />
                  <div>
                    <p className="font-semibold">Card Payment</p>
                    <p className="text-sm text-gray-600">Coming soon...</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {customerPaymentMethods.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No payment methods available. Please update your profile.</p>
            </div>
          )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading ride details...</p>
          </div>
        )}

        {/* Action Buttons */}
        {ride && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={processing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProceedWithPayment}
                disabled={!selectedMethod || processing}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
              {processing ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {selectedMethod === 'cash' && <FaMoneyBillWave className="mr-2" />}
                  {selectedMethod === 'bkash' && <span className="mr-2 font-bold">bK</span>}
                  {selectedMethod === 'card' && <FaCreditCard className="mr-2" />}
                  Proceed with {selectedMethod === 'cash' ? 'Cash' : selectedMethod === 'bkash' ? 'bKash' : 'Card'}
                </>
              )}
            </Button>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSelectionModal;
