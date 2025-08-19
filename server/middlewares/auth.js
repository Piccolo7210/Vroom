import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';
import Driver from '../models/Driver.js';
import Admin from '../models/Admin.js';

// Protect routes for customers
export const protectCustomer = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Customer auth: token received:', token.substring(0, 10) + '...');
    }
    
    if (!token) {
      console.log('Customer auth: No token provided');
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required', 
        message: 'No token provided' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Customer auth: Token decoded:', JSON.stringify(decoded));
    
    // Check if user is a customer
    if (decoded.role !== 'customer') {
      console.log('Customer auth: User is not a customer, role:', decoded.role);
      return res.status(403).json({ 
        success: false,
        error: 'Access denied', 
        message: 'Not authorized as a customer' 
      });
    }
    
    // Get customer from database
    const customer = await Customer.findById(decoded.id);
    if (!customer) {
      console.log('Customer auth: Customer not found in database for ID:', decoded.id);
      return res.status(404).json({ 
        success: false,
        error: 'Not found', 
        message: 'Customer account not found' 
      });
    }
    
    console.log('Customer auth: Successfully authenticated customer:', customer.userName);
    req.customer = customer;
    req.userId = decoded.id;
    req.userRole = 'customer';
    next();
  } catch (error) {
    console.error('Customer auth error:', error.message);
    res.status(401).json({ 
      success: false,
      error: 'Authentication failed',
      message: error.message || 'Token validation failed'
    });
  }
};

// General auth middleware
export const auth = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token received:', token.substring(0, 10) + '...');
    }
    
    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ error: 'Not authorized, no token provided' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);
    
    // Extract user ID and add to request
    req.userId = decoded.id;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

// Protect admin routes
export const protectAdmin = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Admin auth: token received:', token.substring(0, 10) + '...');
    }
    
    if (!token) {
      console.log('Admin auth: No token provided');
      return res.status(401).json({ error: 'Authentication required', message: 'No token provided' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Admin auth: Token decoded:', JSON.stringify(decoded));
    
    // Check if user is an admin
    if (decoded.role !== 'admin') {
      console.log('Admin auth: User is not an admin, role:', decoded.role);
      return res.status(403).json({ error: 'Access denied', message: 'Not authorized as an admin' });
    }
    
    // Get admin from database
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      console.log('Admin auth: Admin not found in database for ID:', decoded.id);
      return res.status(404).json({ error: 'Not found', message: 'Admin account not found' });
    }
    
    console.log('Admin auth: Successfully authenticated admin:', admin.userName);
    req.admin = admin;
    req.userId = decoded.id;
    req.userRole = 'admin';
    next();
  } catch (error) {
    console.error('Admin auth error:', error.message, error.stack);
    res.status(401).json({ 
      error: 'Authentication failed',
      message: error.message || 'Token validation failed'
    });
  }
};

// Protect routes for drivers
export const protectDriver = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Driver auth: token received:', token.substring(0, 10) + '...');
    }
    
    if (!token) {
      console.log('Driver auth: No token provided');
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required', 
        message: 'No token provided' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Driver auth: Token decoded:', JSON.stringify(decoded));
    
    // Check if user is a driver
    if (decoded.role !== 'driver') {
      console.log('Driver auth: User is not a driver, role:', decoded.role);
      return res.status(403).json({ 
        success: false,
        error: 'Access denied', 
        message: 'Not authorized as a driver' 
      });
    }
    
    // Get driver from database
    const driver = await Driver.findById(decoded.id);
    if (!driver) {
      console.log('Driver auth: Driver not found in database for ID:', decoded.id);
      return res.status(404).json({ 
        success: false,
        error: 'Not found', 
        message: 'Driver account not found' 
      });
    }
    
    console.log('Driver auth: Successfully authenticated driver:', driver.userName);
    req.driver = driver;
    req.userId = decoded.id;
    req.userRole = 'driver';
    next();
  } catch (error) {
    console.error('Driver auth error:', error.message);
    res.status(401).json({ 
      success: false,
      error: 'Authentication failed',
      message: error.message || 'Token validation failed'
    });
  }
};