import express from 'express';
import { 
  registerCustomer, 
  loginCustomer, 
  getProfileData, 
  updateCustomerProfile,
  checkUsername,
  checkEmail,
  updateCustomerPhoto
} from '../controllers/customerController.js';
import { protectCustomer } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/check-username', checkUsername);
router.get('/check-email',checkEmail);
router.post('/profile/photo', updateCustomerPhoto);
router.get('/profile/data/:userName',  getProfileData);

// Protected routes
// router.get('/profile', protectCustomer, getCustomerProfile);
router.put('/profile', protectCustomer, updateCustomerProfile);

export default router;