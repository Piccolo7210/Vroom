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
      { expiresIn: process.env.JWT_EXPIRE }
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
      { expiresIn: process.env.JWT_EXPIRE }
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
    const { userName } = req.params; // Get userName from URL parameter
    const customer = await Customer.findOne({ userName: userName.toLowerCase() }).select('-password');
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

// Update customer profile
export const updateCustomerProfile = async (req, res) => {
  try {
    const { userName, present_address } = req.body; // Accept userName and present_address from request body
    if (!userName || !present_address) {
      return res.status(400).json({ error: 'userName and present_address are required' });
    }

    const customer = await Customer.findOneAndUpdate(
      { userName: userName.toLowerCase() },
      { $set: { present_address } },
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