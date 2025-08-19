import Driver from '../models/Driver.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register a new driver
export const registerDriver = async (req, res) => {
  try {
    let { 
      name, email, password, phone, license_no, photo_link,
      age, present_address, sex, vehicle_type, vehicle_no, userName, nid_no
    } = req.body;
    email = email.toLowerCase(); // Ensure email is stored in lowercase
    userName = userName.toLowerCase();
    license_no = license_no.toUpperCase();
    vehicle_no = vehicle_no.toUpperCase(); // Correct variable for vehicle_no
    nid_no = nid_no.toUpperCase(); // Ensure NID is stored in uppercase
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
      userName,
      email,
      password: hashedPassword,
      phone,
      license_no,
      photo_link: photo_link || '',
      age,
      present_address,
      sex,
      vehicle_type,
      vehicle_no,
      nid_no,
      verificationStatus: 'waiting' // Default to waiting for verification
    });
    
    await driver.save();
    
    // Create JWT token
    const token = jwt.sign(
      { id: driver._id, role: 'driver', verificationStatus: 'waiting' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
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
    let { email, password } = req.body;
    email = email.toLowerCase(); // Ensure email is stored in lowercase
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
    
    // Check verification status
    if (driver.verificationStatus === 'rejected') {
      return res.status(403).json({ 
        error: 'Account blocked', 
        message: driver.rejectionReason || 'Your account has been rejected due to fraudulent credentials.',
        verificationStatus: 'rejected'
      });
    }
    
    if (driver.verificationStatus === 'waiting') {
      return res.status(202).json({
        success: true,
        message: 'Your account is pending approval from an administrator.',
        verificationStatus: 'waiting',
        data: {
          id: driver._id,
          name: driver.name,
          email: driver.email,
          userName: driver.userName
        }
      });
    }
    
    // Create JWT token for trusted drivers
    const token = jwt.sign(
      { id: driver._id, role: 'driver', verificationStatus: driver.verificationStatus },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    res.json({
      success: true,
      token,
      verificationStatus: driver.verificationStatus,
      data: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        userName: driver.userName,
        phone: driver.phone,
        license_no: driver.license_no,
        vehicle_type: driver.vehicle_type,
        vehicle_no: driver.vehicle_no
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
export const checkUsername = async (req, res) => {
  try{
 let {userName} = req.query;
 userName = userName.toLowerCase(); // Ensure username is stored in lowercase
  const existingDriver = await Driver.findOne({ userName });
  res.json({
      exists: !!existingDriver
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const checkEmail = async (req, res) => {
  try {
    let { email } = req.query;
    email = email.toLowerCase(); // Ensure email is stored in lowercase
    const existingDriver = await Driver.findOne({ email });
    res.json({
      exists: !!existingDriver
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
export const checkLicense = async (req, res) => {
  try {
    let { license_no } = req.query;
    license_no = license_no.toUpperCase(); // Ensure license number is stored in lowercase
    const existingDriver = await Driver.findOne({ license_no });
    res.json({
      exists: !!existingDriver
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const checkVehicleNo = async (req, res) => {
  try {
    let { vehicle_no } = req.query;
    vehicle_no = vehicle_no.toUpperCase(); // Ensure vehicle number is stored in uppercase
    const existingDriver = await Driver.findOne({ vehicle_no });
    res.json({
      exists: !!existingDriver
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Validate driver token
export const validateDriverToken = async (req, res) => {
  try {
    // If we reach here, the token is valid (passed through auth middleware)
    const driver = await Driver.findById(req.userId).select('-password');
    
    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        message: 'Driver not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      verificationStatus: driver.verificationStatus,
      data: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        userName: driver.userName,
        phone: driver.phone,
        verificationStatus: driver.verificationStatus
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during token validation', 
      error: error.message 
    });
  }
};

// // Validate driver token
// export const validateDriverToken = async (req, res) => {
//   try {
//     // If we reach here, the token is valid (passed through auth middleware)
//     const driver = await Driver.findById(req.userId).select('-password');
    
//     if (!driver) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Driver not found' 
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Token is valid',
//       verificationStatus: driver.verificationStatus,
//       data: {
//         id: driver._id,
//         name: driver.name,
//         email: driver.email,
//         userName: driver.userName,
//         phone: driver.phone,
//         verificationStatus: driver.verificationStatus
//       }
//     });
//   } catch (error) {
//     console.error('Token validation error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Server error during token validation', 
//       error: error.message 
//     });
//   }
// };