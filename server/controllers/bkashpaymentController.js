import { initiatePayment } from '../services/paymentService.js';
import Ride from '../models/Ride.js';
import Customer from '../models/Customer.js';

// Initiate payment for a completed ride
export const initiateRidePayment = async (req, res) => {
  try {
    const { ride_id } = req.params;
    
    // Find the ride
    const ride = await Ride.findById(ride_id).populate('customer driver');
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if ride is completed and payment is pending
    if (ride.status !== 'completed') {
      return res.status(400).json({ message: 'Ride must be completed before payment' });
    }

    if (ride.payment_status === 'paid') {
      return res.status(400).json({ message: 'Payment already completed for this ride' });
    }

    // Prepare payment data for bKash
    const paymentData = {
      tran_id: `VROOM_${ride_id}_${Date.now()}`, // Unique transaction ID
      amount: ride.fare.total_fare,
      product_name: 'Vroom Ride Service',
      product_category: 'Transportation',
      
      // Customer information
      cus_name: ride.customer.name,
      cus_email: ride.customer.email,
      cus_address: ride.pickup_location.address || 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: ride.customer.phoneNumber,
      
      // Shipping information (same as customer)
      ship_name: ride.customer.name,
      ship_address: ride.pickup_location.address || 'Dhaka',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: '1000',
      ship_country: 'Bangladesh',
      
      // For redirect URLs - using ride_id instead of sessionId
      ride_id: ride_id
    };

    // Update payment service to use ride_id
    const result = await initiatePayment(paymentData);
    
    if (result.status === 'SUCCESS') {
      // Update ride with transaction ID
      ride.transaction_id = paymentData.tran_id;
      ride.payment_status = 'pending';
      await ride.save();
      
      res.json({
        success: true,
        payment_url: result.GatewayPageURL,
        tran_id: paymentData.tran_id
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to initiate payment',
        error: result.failedreason
      });
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Handle successful payment
export const handlePaymentSuccess = async (req, res) => {
  try {
    const { ride_id } = req.params;
    const { tran_id, amount, currency } = req.body;

    // Find and update the ride
    const ride = await Ride.findById(ride_id);
    if (!ride) {
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed?error=ride_not_found`);
    }

    // Verify transaction ID matches
    if (ride.transaction_id !== tran_id) {
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed?error=invalid_transaction`);
    }

    // Update ride payment status
    ride.payment_status = 'paid';
    ride.payment_method = 'bkash';
    ride.paid_at = new Date();
    await ride.save();

    console.log(`Payment successful for ride ${ride_id}, transaction: ${tran_id}`);
    
    // Redirect to success page with ride details
    res.redirect(`${process.env.CLIENT_URL}/payment/success?ride_id=${ride_id}&amount=${amount}`);
  } catch (error) {
    console.error('Payment success handling error:', error);
    res.redirect(`${process.env.CLIENT_URL}/payment/failed?error=server_error`);
  }
};

// Handle failed payment
export const handlePaymentFailure = async (req, res) => {
  try {
    const { ride_id } = req.params;
    const { tran_id } = req.body;

    // Find and update the ride
    const ride = await Ride.findById(ride_id);
    if (ride && ride.transaction_id === tran_id) {
      ride.payment_status = 'failed';
      await ride.save();
    }

    console.log(`Payment failed for ride ${ride_id}, transaction: ${tran_id}`);
    
    // Redirect to failure page
    res.redirect(`${process.env.CLIENT_URL}/payment/failed?ride_id=${ride_id}&reason=payment_failed`);
  } catch (error) {
    console.error('Payment failure handling error:', error);
    res.redirect(`${process.env.CLIENT_URL}/payment/failed?error=server_error`);
  }
};

// Handle cancelled payment
export const handlePaymentCancel = async (req, res) => {
  try {
    const { ride_id } = req.params;
    const { tran_id } = req.body;

    // Find and update the ride
    const ride = await Ride.findById(ride_id);
    if (ride && ride.transaction_id === tran_id) {
      ride.payment_status = 'cancelled';
      await ride.save();
    }

    console.log(`Payment cancelled for ride ${ride_id}, transaction: ${tran_id}`);
    
    // Redirect to cancel page
    res.redirect(`${process.env.CLIENT_URL}/payment/cancelled?ride_id=${ride_id}`);
  } catch (error) {
    console.error('Payment cancel handling error:', error);
    res.redirect(`${process.env.CLIENT_URL}/payment/failed?error=server_error`);
  }
};

// Get payment status for a ride
export const getPaymentStatus = async (req, res) => {
  try {
    const { ride_id } = req.params;
    
    const ride = await Ride.findById(ride_id).select('payment_status payment_method transaction_id fare paid_at');
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.json({
      success: true,
      payment_status: ride.payment_status,
      payment_method: ride.payment_method,
      transaction_id: ride.transaction_id,
      amount: ride.fare.total_fare,
      paid_at: ride.paid_at
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};