# Payment System Documentation

## Overview
The Vroom ride-sharing platform now includes a comprehensive payment system that allows customers to pay for completed rides using cash or bKash (mobile banking). This system handles post-ride payment processing with secure transaction management.

## Components

### Frontend Components

#### 1. PaymentModal (`client/components/dashboard/customer/PaymentModal.jsx`)
- **Purpose**: Primary payment interface for customers
- **Features**:
  - Ride summary display
  - Payment method selection (Cash/bKash)
  - Cash payment processing (immediate completion)
  - bKash payment redirection
  - Success and error handling

#### 2. bKash Payment Page (`client/app/payment/bkash/page.js`)
- **Purpose**: Dedicated bKash payment interface
- **Features**:
  - bKash-branded UI
  - Phone number and PIN input
  - Payment simulation (for demo purposes)
  - Transaction ID generation
  - Success/failure states

#### 3. Enhanced RideHistory (`client/components/dashboard/customer/RideHistory.jsx`)
- **Purpose**: Displays payment options for completed rides
- **Features**:
  - "Pay Now" button for pending payments
  - Payment status indicators
  - Integration with PaymentModal

### Backend API

#### Payment Status Update Endpoint
```
POST /api/rides/:ride_id/payment
```

**Headers:**
```
Authorization: Bearer <customer_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "paymentMethod": "cash" | "bkash",
  "paymentStatus": "completed" | "pending" | "failed",
  "transactionId": "string" // Optional, for online payments
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment status updated successfully",
  "data": {
    "ride": {
      // Updated ride object
    }
  }
}
```

## Payment Flow

### Cash Payment Flow
1. Customer completes ride
2. Customer opens payment modal from ride history
3. Customer selects "Cash" payment method
4. Payment is immediately marked as completed
5. Driver earnings are updated
6. Payment status reflects "completed"

### bKash Payment Flow
1. Customer completes ride
2. Customer opens payment modal from ride history
3. Customer selects "bKash" payment method
4. System redirects to bKash payment page
5. Customer enters phone number and PIN
6. Payment simulation processes
7. On success:
   - Transaction ID is generated
   - Payment status updated to "completed"
   - Driver earnings updated
   - Customer redirected to dashboard

## Database Schema Updates

### Ride Model Enhancements
```javascript
{
  payment_method: {
    type: String,
    enum: ['cash', 'bkash', 'card'],
    default: 'cash'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  transaction_id: {
    type: String,
    default: null // For online payments
  }
}
```

## Security Features

### Authentication
- Customer JWT token required for payment updates
- Ride ownership verification
- Only completed rides can have payment status updated

### Validation
- Payment method validation
- Ride status verification
- Customer authorization checks

### Error Handling
- Invalid ride ID handling
- Unauthorized access prevention
- Payment processing error management

## Integration Points

### Frontend Integration
```javascript
// Import PaymentModal in components
import PaymentModal from './PaymentModal';

// Usage in RideHistory
const handlePaymentClick = (ride) => {
  setSelectedRide(ride);
  setShowPaymentModal(true);
};
```

### Backend Integration
```javascript
// Import in rideRoutes.js
import { updatePaymentStatus } from '../controllers/rideController.js';

// Route definition
router.post('/:ride_id/payment', protectCustomer, updatePaymentStatus);
```

## Testing the Payment System

### Prerequisites
1. Ensure server is running on `http://localhost:5000`
2. Ensure client is running on `http://localhost:3000`
3. Have completed rides with pending payment status

### Test Cash Payment
1. Login as customer
2. Navigate to ride history
3. Find completed ride with pending payment
4. Click "Pay Now"
5. Select "Cash Payment"
6. Click "Complete Payment"
7. Verify payment status updates to "completed"

### Test bKash Payment
1. Login as customer
2. Navigate to ride history
3. Find completed ride with pending payment
4. Click "Pay Now"
5. Select "Pay with bKash"
6. Enter mock phone number (01712345678)
7. Enter mock PIN (12345)
8. Click "Pay" and wait for simulation
9. Verify success state and transaction ID

## Error Scenarios

### Common Error Cases
1. **Invalid Ride ID**: Returns 400 Bad Request
2. **Unauthorized Access**: Returns 403 Forbidden
3. **Ride Not Completed**: Returns 400 Bad Request
4. **Payment Processing Failure**: Returns 500 Internal Server Error

### Error Handling in Frontend
- Toast notifications for all error states
- Retry mechanisms for failed payments
- Graceful fallbacks for network issues

## Production Considerations

### bKash Integration
- Replace simulation with actual bKash API
- Implement webhook for payment confirmation
- Add proper transaction verification
- Handle bKash-specific error codes

### Security Enhancements
- Add payment encryption
- Implement fraud detection
- Add transaction logging
- Secure webhook endpoints

### Performance Optimizations
- Cache payment status
- Optimize database queries
- Add payment analytics
- Implement payment retry mechanisms

## Configuration

### Environment Variables
```
# Add to server/.env
BKASH_API_URL=https://tokenized.pay.bka.sh/v1.2.0-beta
BKASH_APP_KEY=your_app_key
BKASH_APP_SECRET=your_app_secret
BKASH_USERNAME=your_username
BKASH_PASSWORD=your_password
```

### Frontend Configuration
```javascript
// client/lib/config.js
export const PAYMENT_CONFIG = {
  bkashEnabled: true,
  cashEnabled: true,
  cardEnabled: false, // Future feature
  demoMode: true // Set to false in production
};
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rides/:ride_id/payment` | Update payment status |
| GET | `/api/rides/history` | Get customer ride history |
| GET | `/api/rides/:ride_id` | Get ride details |

## Future Enhancements

### Planned Features
1. Credit/Debit card integration
2. Wallet system
3. Subscription payments
4. Payment splitting
5. Refund management

### Technical Improvements
1. Real-time payment status updates
2. Payment analytics dashboard
3. Automated reconciliation
4. Multi-currency support
5. Payment method preferences

## Support and Troubleshooting

### Common Issues
1. **Payment Modal Not Opening**: Check ride status and payment status
2. **bKash Redirect Fails**: Verify payment data in localStorage
3. **Payment Status Not Updating**: Check network connectivity and server status

### Debug Tools
- Browser Developer Tools for frontend debugging
- Server logs for backend issues
- Database queries for payment status verification

This documentation provides a comprehensive guide for understanding, implementing, and maintaining the payment system in the Vroom ride-sharing platform.
