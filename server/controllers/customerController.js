// import Customer from '../models/Customer.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import cloudinaryConfig from '../services/cloudinary.js';
// // Register new customer
// export const registerCustomer = async (req, res) => {
//   try {
//     let { name, userName, email, password, phone, sex, present_address } = req.body;
//     email = email.toLowerCase(); // Ensure email is stored in lowercase
//     // Check if email already exists
//     const existingEmail = await Customer.findOne({ email });
//     if (existingEmail) {
//       return res.status(400).json({ error: 'Email already registered' });
//     }
    
//     // Check if username already exists
//     const existingUsername = await Customer.findOne({ userName });
//     if (existingUsername) {
//       return res.status(400).json({ error: 'Username already exists' });
//     }
    
//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
//     userName = userName.toLowerCase(); // Ensure username is stored in lowercase
    
//     // Create new customer
//     const customer = new Customer({
//       name,
//       userName,
//       email,
//       password: hashedPassword,
//       phone,
//       sex,
//       present_address
//     });
    
//     await customer.save();
    
//     // Create JWT token
//     const token = jwt.sign(
//       { id: customer._id, role: 'customer' },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRE }
//     );
    
//     res.status(201).json({
//       success: true,
//       token,
//       data: {
//         id: customer._id,
//         name: customer.name,
//         email: customer.email,
//         userName: customer.userName
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     // Check for MongoDB duplicate key error
//     if (error.code === 11000) {
//       if (error.keyPattern.email) {
//         return res.status(400).json({ error: 'Email already registered' });
//       }
//       if (error.keyPattern.userName) {
//         return res.status(400).json({ error: 'Username already exists' });
//       }
//     }
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // Login customer
// export const loginCustomer = async (req, res) => {
//   try {
//     let { email, password } = req.body;
//     email = email.toLowerCase(); // Ensure email is stored in lowercase
//     // Check if customer exists
//     const customer = await Customer.findOne({ email });
//     if (!customer) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }
    
//     // Verify password
//     const isMatch = await bcrypt.compare(password, customer.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }
    
//     // Create JWT token
//     const token = jwt.sign(
//       { id: customer._id, role: 'customer' },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRE }
//     );
    
//     res.json({
//       success: true,
//       token,
//       data: {
//         id: customer._id,
//         name: customer.name,
//         email: customer.email,
//         userName: customer.userName
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // Get customer profile
// export const getCustomerProfile = async (req, res) => {
//   try {
//     const customer = await Customer.findById(req.customer.id).select('-password');
//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }
//     res.json({
//       success: true,
//       data: customer
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // Update customer profile
// export const updateCustomerProfile = async (req, res) => {
//   try {
//     const updates = req.body;
    
//     // Prevent password update through this route
//     if (updates.password) {
//       delete updates.password;
//     }
    
//     const customer = await Customer.findByIdAndUpdate(
//       req.customer.id,
//       { $set: updates },
//       { new: true, runValidators: true }
//     ).select('-password');
    
//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }
    
//     res.json({
//       success: true,
//       data: customer
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };
// // Check if username exists
// export const checkUsername = async (req, res) => {
//   try {
//     let { userName } = req.query;
//     userName = userName.toLowerCase(); // Ensure username is stored in lowercase
//     // Check if customer with this username exists
//     const existingCustomer = await Customer.findOne({ userName });
//     console.log("Checking username API working, userName:", userName,);
    
//     res.json({
//       exists: !!existingCustomer
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };
// export const checkEmail = async (req, res) => {
//   try {
//     let { email } = req.query;
//     email = email.toLowerCase(); // Ensure email is stored in lowercase
//     // Check if customer with this email exists
//     const existingCustomer = await Customer.findOne({ email });
//     console.log("Checking email API working, email:", email);
//     res.json({
//       exists: !!existingCustomer
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };


// // Update customer profile photo
// export const updateCustomerPhoto = async (req, res) => {
//   try {
//     const { photo_link } = req.body;
//     if (!photo_link) {
//       return res.status(400).json({ error: 'Photo URL is required' });
//     }

//     const customer = await Customer.findByIdAndUpdate(
//       req.customer.id,
//       { $set: { photo_link } },
//       { new: true, runValidators: true }
//     ).select('-password');

//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     res.json({
//       success: true,
//       data: customer,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

import Customer from '../models/Customer.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cloudinary from '../services/cloudinary.js';

// Register new customer
export const registerCustomer = async (req, res) => {
  try {
    let { name, userName, email, password, phone, sex, present_address } = req.body;
    email = email.toLowerCase();
    const existingEmail = await Customer.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const existingUsername = await Customer.findOne({ userName });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    userName = userName.toLowerCase();
    
    const customer = new Customer({
      name,
      userName,
      email,
      password: hashedPassword,
      phone,
      sex,
      present_address
    });
    
    await customer.save();
    
    const token = jwt.sign(
      { id: customer._id, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    res.status(201).json({
      success: true,
      token,
      data: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        userName: customer.userName,
        phone: customer.phone,
        sex: customer.sex,
        present_address: customer.present_address,
        photo_link: customer.photo_link
      }
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      if (error.keyPattern.email) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (error.keyPattern.userName) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Login customer
export const loginCustomer = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase();
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: customer._id, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    res.json({
      success: true,
      token,
      data: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        userName: customer.userName,
        phone: customer.phone,
        sex: customer.sex,
        present_address: customer.present_address,
        photo_link: customer.photo_link
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProfileData = async (req, res) => {
  try {
    let customer;
    
    // Check if customer comes from middleware (protected route)
    if (req.customer) {
      customer = req.customer;
      console.log('Using customer from middleware:', customer.userName);
      console.log('Customer payment_methods from middleware:', customer.payment_methods);
    } else {
      // Get userName from URL parameter (legacy route)
      const { userName } = req.params;
      customer = await Customer.findOne({ userName: userName.toLowerCase() }).select('-password');
      console.log('Fetched customer from DB by username:', customer?.userName);
      console.log('Customer payment_methods from DB:', customer?.payment_methods);
    }
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    console.log('Final payment_methods being sent:', customer.payment_methods);
    
    res.json({
      success: true,
      data: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        userName: customer.userName,
        phone: customer.phone,
        sex: customer.sex,
        present_address: customer.present_address,
        payment_methods: customer.payment_methods,
        photo_link: customer.photo_link
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update customer profile
export const updateCustomerProfile = async (req, res) => {
  try {
    const { userName, present_address, payment_methods } = req.body; // Accept userName, present_address, and payment_methods from request body
    if (!userName || !present_address) {
      return res.status(400).json({ error: 'userName and present_address are required' });
    }

    // Validate payment methods if provided
    if (payment_methods) {
      const validMethods = ['cash', 'bkash', 'card'];
      const isValidMethods = Array.isArray(payment_methods) && 
                           payment_methods.length > 0 && 
                           payment_methods.every(method => validMethods.includes(method));
      
      if (!isValidMethods) {
        return res.status(400).json({ 
          error: 'Invalid payment methods. Must be a non-empty array containing: cash, bkash, card' 
        });
      }
    }

    // Prepare update object
    const updateData = { present_address };
    if (payment_methods) {
      updateData.payment_methods = payment_methods;
    }

    const customer = await Customer.findOneAndUpdate(
      { userName: userName.toLowerCase() },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({
      success: true,
      data: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        userName: customer.userName,
        phone: customer.phone,
        sex: customer.sex,
        present_address: customer.present_address,
        payment_methods: customer.payment_methods,
        photo_link: customer.photo_link
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
// Update customer profile photo
export const updateCustomerPhoto = async (req, res) => {
  try {
    const { userName, photo_link } = req.body; // Add userName to the request body
    if (!userName || !photo_link) {
      return res.status(400).json({ error: 'userName and Photo URL are required' });
    }

    const customer = await Customer.findOneAndUpdate(
      { userName: userName.toLowerCase() },
      { $set: { photo_link } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({
      success: true,
      data: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        userName: customer.userName,
        phone: customer.phone,
        sex: customer.sex,
        present_address: customer.present_address,
        photo_link: customer.photo_link
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Check if username exists
export const checkUsername = async (req, res) => {
  try {
    let { userName } = req.query;
    userName = userName.toLowerCase();
    const existingCustomer = await Customer.findOne({ userName });
    console.log("Checking username API working, userName:", userName);
    
    res.json({
      exists: !!existingCustomer
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Check if email exists
export const checkEmail = async (req, res) => {
  try {
    let { email } = req.query;
    email = email.toLowerCase();
    const existingCustomer = await Customer.findOne({ email });
    console.log("Checking email API working, email:", email);
    res.json({
      exists: !!existingCustomer
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Validate customer token
export const validateCustomerToken = async (req, res) => {
  try {
    // If we reach here, the token is valid (passed through auth middleware)
    const customer = await Customer.findById(req.userId).select('-password');
    
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        userName: customer.userName,
        phone: customer.phone,
        sex: customer.sex,
        present_address: customer.present_address
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