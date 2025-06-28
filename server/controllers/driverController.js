import Driver from '../models/Driver.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register new driver
export const registerDriver = async (req, res) => {
  try {
    const { 
      name, email, password, phone, license_no, photo_link,
      age, present_address, sex, vehicle_type, vehicle_no
    } = req.body;
    
    // Check if driver already exists
    const existingDriver = await Driver.findOne({ email });
    if (existingDriver) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Check if license number already exists
    const existingLicense = await Driver.findOne({ license_no });
    if (existingLicense) {
      return res.status(400).json({ error: 'License number already registered' });
    }
    
    // Check if vehicle number already exists
    const existingVehicle = await Driver.findOne({ vehicle_no });
    if (existingVehicle) {
      return res.status(400).json({ error: 'Vehicle number already registered' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new driver
    const driver = new Driver({
      name,
      email,
      password: hashedPassword,
      phone,
      license_no,
      photo_link: photo_link || '',
      age,
      present_address,
      sex,
      vehicle_type,
      vehicle_no
    });
    
    await driver.save();
    
    // Create JWT token
    const token = jwt.sign(
      { id: driver._id, role: 'driver' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    res.status(201).json({
      success: true,
      token,
      data: {
        id: driver._id,
        name: driver.name,
        email: driver.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login driver
export const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if driver exists
    const driver = await Driver.findOne({ email });
    if (!driver) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: driver._id, role: 'driver' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    res.json({
      success: true,
      token,
      data: {
        id: driver._id,
        name: driver.name,
        email: driver.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get driver profile
export const getDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver.id).select('-password');
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update driver profile
export const updateDriverProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent password update through this route
    if (updates.password) {
      delete updates.password;
    }
    
    const driver = await Driver.findByIdAndUpdate(
      req.driver.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    res.json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};