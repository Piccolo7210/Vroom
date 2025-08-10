import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Get admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.userId).select('-password');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      data: {
        id: admin._id,
        name: admin.name,
        userName: admin.userName,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return admin data with token
    res.status(200).json({
      accessToken,
      name: admin.name,
      userName: admin.userName, // Use the correct userName field
      email: admin.email,
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};