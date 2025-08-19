'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const BkashPaymentPage = () => {
  const router = useRouter();
  const [paymentData, setPaymentData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState('form'); // form, processing, success, error
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    // Get payment data from localStorage
    const storedPaymentData = localStorage.getItem('paymentData');
    if (storedPaymentData) {
      setPaymentData(JSON.parse(storedPaymentData));
    } else {
      // If no payment data, redirect back to dashboard
      toast.error('No payment data found. Redirecting...');
      router.push('/dashboard/customer');
    }
  }, [router]);

  const handleGoBack = () => {
    // Clear payment data and go back
    localStorage.removeItem('paymentData');
    router.back();
  };

  const simulateBkashPayment = async () => {
    setProcessing(true);
    setPaymentStep('processing');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate payment processing
      const success = Math.random() > 0.1; // 90% success rate for demo

      if (success) {
        const mockTransactionId = 'BKS' + Date.now().toString().slice(-8);
        setTransactionId(mockTransactionId);
        setPaymentStep('success');

        // Update the ride payment status
        await updateRidePaymentStatus('completed', mockTransactionId);
        
        toast.success('bKash payment successful!');
      } else {
        setPaymentStep('error');
        toast.error('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStep('error');
      toast.error('Payment processing error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const updateRidePaymentStatus = async (status, transactionId = null) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/rides/${paymentData.rideId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethod: 'bkash',
          paymentStatus: status,
          transactionId: transactionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    
    if (!phoneNumber || !pin) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (phoneNumber.length !== 11) {
      toast.error('Please enter a valid 11-digit phone number');
      return;
    }

    if (pin.length !== 5) {
      toast.error('Please enter a valid 5-digit PIN');
      return;
    }

    simulateBkashPayment();
  };

  const handleRetryPayment = () => {
    setPaymentStep('form');
    setPin('');
  };

  const handleCompletePayment = () => {
    // Clear payment data and redirect to dashboard
    localStorage.removeItem('paymentData');
    router.push('/dashboard/customer');
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <FaSpinner className="animate-spin text-4xl text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payment details...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleGoBack}
            className="flex items-center text-pink-600 hover:text-pink-700 transition-colors"
            disabled={processing}
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
        </div>

        {/* bKash Logo Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">bKash</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">bKash Payment</h1>
          <p className="text-gray-600">Secure and fast payment</p>
        </div>

        {/* Payment Form */}
        {paymentStep === 'form' && (
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Ride ID:</span>
                  <span className="font-mono text-sm">{paymentData.rideId.slice(-8)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{paymentData.customerName}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Description:</span>
                  <span className="text-sm text-right">{paymentData.description}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-pink-600">৳{paymentData.amount}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  bKash Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter your bKash registered mobile number</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  bKash PIN
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="*****"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter your 5-digit bKash PIN</p>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 text-lg font-semibold"
                  disabled={processing}
                >
                  Pay ৳{paymentData.amount}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                This is a simulated bKash payment for demonstration purposes.
                <br />
                In production, this would integrate with actual bKash API.
              </p>
            </div>
          </Card>
        )}

        {/* Processing State */}
        {paymentStep === 'processing' && (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                <FaSpinner className="animate-spin text-3xl text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Processing Payment</h3>
              <p className="text-gray-600">
                Please wait while we process your bKash payment...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-pink-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
              <p className="text-sm text-gray-500">This may take a few seconds</p>
            </div>
          </Card>
        )}

        {/* Success State */}
        {paymentStep === 'success' && (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-3xl text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-800">Payment Successful!</h3>
              <p className="text-gray-600">
                Your bKash payment has been processed successfully.
              </p>
              
              {transactionId && (
                <div className="bg-green-50 rounded-lg p-4 w-full">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 font-medium">Transaction ID:</span>
                    <span className="font-mono text-green-800">{transactionId}</span>
                  </div>
                </div>
              )}
              
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-bold text-green-600">৳{paymentData.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">bKash</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">{new Date().toLocaleString()}</span>
                </div>
              </div>

              <Button
                onClick={handleCompletePayment}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 mt-6"
              >
                Return to Dashboard
              </Button>
            </div>
          </Card>
        )}

        {/* Error State */}
        {paymentStep === 'error' && (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-3xl text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-800">Payment Failed</h3>
              <p className="text-gray-600">
                We couldn't process your bKash payment. Please try again.
              </p>
              
              <div className="bg-red-50 rounded-lg p-4 w-full">
                <p className="text-red-700 text-sm">
                  Common reasons for payment failure:
                </p>
                <ul className="text-red-600 text-sm mt-2 space-y-1">
                  <li>• Insufficient balance</li>
                  <li>• Incorrect PIN</li>
                  <li>• Network connectivity issues</li>
                  <li>• Account temporarily blocked</li>
                </ul>
              </div>

              <div className="w-full space-y-3">
                <Button
                  onClick={handleRetryPayment}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3"
                >
                  Try Again
                </Button>
                
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="w-full py-3"
                >
                  Choose Different Payment Method
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Powered by bKash • Secure Payment Gateway
          </p>
        </div>
      </div>
    </div>
  );
};

export default BkashPaymentPage;
