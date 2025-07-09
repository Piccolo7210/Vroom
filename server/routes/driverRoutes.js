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
} from '../controllers/driverController.js';
import { protectDriver } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerDriver);
router.post('/login', loginDriver);
router.get('/check-username', checkUsername);
router.get('/check-email', checkEmail);
router.get('/check-license', checkLicense);
router.get('/check-vehicle-no', checkVehicleNo);

// Protected routes
router.get('/profile', protectDriver, getDriverProfile);
router.put('/profile', protectDriver, updateDriverProfile);

export default router;