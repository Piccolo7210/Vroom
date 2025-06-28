import express from 'express';
import { 
  registerDriver, 
  loginDriver, 
  getDriverProfile, 
  updateDriverProfile 
} from '../controllers/driverController.js';
import { protectDriver } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerDriver);
router.post('/login', loginDriver);

// Protected routes
router.get('/profile', protectDriver, getDriverProfile);
router.put('/profile', protectDriver, updateDriverProfile);

export default router;