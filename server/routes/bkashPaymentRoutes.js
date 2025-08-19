import express from 'express';
import {
  initiateRidePayment,
  handlePaymentSuccess,
  handlePaymentFailure,
  handlePaymentCancel,
  getPaymentStatus
} from '../controllers/bkashpaymentController.js';

const router = express.Router();

// Initiate payment for a completed ride
router.post('/initiate/:ride_id',initiateRidePayment);

// Payment callback routes (these are called by SSLCommerz)
router.post('/success/:ride_id', handlePaymentSuccess);
router.post('/fail/:ride_id', handlePaymentFailure);
router.post('/cancel/:ride_id', handlePaymentCancel);

// Get payment status for a ride
router.get('/status/:ride_id', getPaymentStatus);

// IPN (Instant Payment Notification) route for SSLCommerz
router.post('/ipn', (req, res) => {
  // Handle IPN notifications from SSLCommerz
  console.log('IPN received:', req.body);
  res.status(200).send('OK');
});

export default router;