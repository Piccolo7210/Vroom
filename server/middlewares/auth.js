import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';
import Driver from '../models/Driver.js';

// Protect routes for customers
export const protectCustomer = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is a customer
    if (decoded.role !== 'customer') {
      return res.status(403).json({ error: 'Not authorized as a customer' });
    }
    
    // Get customer from database
    const customer = await Customer.findById(decoded.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    req.customer = customer;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Not authorized to access this route' });
  }
};

// Protect routes for drivers
export const protectDriver = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is a driver
    if (decoded.role !== 'driver') {
      return res.status(403).json({ error: 'Not authorized as a driver' });
    }
    
    // Get driver from database
    const driver = await Driver.findById(decoded.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    req.driver = driver;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Not authorized to access this route' });
  }
};