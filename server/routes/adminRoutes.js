import express from 'express';
import { adminLogin, getAdminProfile } from '../controllers/adminController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', adminLogin);
router.get('/profile', auth, getAdminProfile);

export default router;
