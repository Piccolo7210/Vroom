import express from 'express';
import { 
  registerDriver, 
  loginDriver, 
  getDriverProfile, 
  updateDriverProfile,
  checkUsername,
  checkEmail,
  checkLicense,
  checkVehicleNo,
  validateDriverToken
} from '../controllers/driverController.js';
import { protectDriver, auth } from '../middlewares/auth.js';

const router = express.Router();

// Auth routes
router.post('/register', registerDriver);
router.post('/login', loginDriver);

// Token validation route
router.get('/validate-token', auth, validateDriverToken);

// Public routes (no authentication required)
router.get('/check-username', checkUsername);
router.get('/check-email', checkEmail);
router.get('/check-license', checkLicense);
router.get('/check-vehicle-no', checkVehicleNo);

// Protected routes (authentication required)
router.get('/profile', protectDriver, getDriverProfile);
router.put('/profile', protectDriver, updateDriverProfile);

export default router;