import express from 'express';
import { 
  adminLogin, 
  getAdminProfile,
  getPendingDrivers,
  getAllDrivers,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  verifyDriver,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getRides,
  getRideById,
  getDashboardStats,
  getRevenueAnalytics
} from '../controllers/adminController.js';
import { auth, protectAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Auth routes
router.post('/login', adminLogin);
router.get('/profile', auth, getAdminProfile);

// Dashboard stats route
router.get('/dashboard/stats', protectAdmin, getDashboardStats);

// Revenue analytics route
router.get('/revenue', protectAdmin, getRevenueAnalytics);

// Driver verification routes
router.get('/drivers/pending', protectAdmin, getPendingDrivers);
router.get('/drivers/all', protectAdmin, getAllDrivers);
router.post('/drivers/verify', protectAdmin, verifyDriver);

// Driver management routes
router.get('/drivers', protectAdmin, getDrivers);
router.get('/drivers/:driverId', protectAdmin, getDriverById);
router.put('/drivers/:driverId', protectAdmin, updateDriver);
router.delete('/drivers/:driverId', protectAdmin, deleteDriver);

// Customer management routes
router.get('/customers', protectAdmin, getCustomers);
router.get('/customers/:customerId', protectAdmin, getCustomerById);
router.put('/customers/:customerId', protectAdmin, updateCustomer);
router.delete('/customers/:customerId', protectAdmin, deleteCustomer);

// Rides management routes
router.get('/rides', protectAdmin, getRides);
router.get('/rides/:rideId', protectAdmin, getRideById);

export default router;
