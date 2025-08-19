import express from 'express';
import { 
  registerCustomer, 
  loginCustomer, 
  getProfileData, 
  updateCustomerProfile,
  checkUsername,
  checkEmail,
  updateCustomerPhoto,
  validateCustomerToken
} from '../controllers/customerController.js';
import { protectCustomer, auth } from '../middlewares/auth.js';

const router = express.Router();

// Auth routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

// Token validation route
router.get('/validate-token', auth, validateCustomerToken);

// Public routes (no authentication required)
router.get('/check-username', checkUsername);
router.get('/check-email', checkEmail);

// Protected routes (authentication required)
router.get('/profile', protectCustomer, getProfileData);
router.put('/profile', protectCustomer, updateCustomerProfile);
router.post('/profile/photo', protectCustomer, updateCustomerPhoto);

// Legacy route (consider deprecating)
router.get('/profile/data/:userName', getProfileData);

export default router;