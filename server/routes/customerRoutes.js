import express from 'express';
import { 
  registerCustomer, 
  loginCustomer, 
  getCustomerProfile, 
  updateCustomerProfile,
  checkUsername,
  checkEmail
} from '../controllers/customerController.js';
import { protectCustomer } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/check-username', checkUsername);
router.get('/check-email',checkEmail);

// Protected routes
router.get('/profile', protectCustomer, getCustomerProfile);
router.put('/profile', protectCustomer, updateCustomerProfile);

export default router;