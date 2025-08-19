/**
 * Utility functions for token validation and authentication
 */

import jwt from 'jsonwebtoken';

/**
 * Validates and decodes a JWT token
 * @param {string} token - The JWT token to validate
 * @returns {Object} The decoded token payload
 * @throws {Error} If token is invalid
 */
export const validateToken = (token) => {
  try {
    if (!token) {
      throw new Error('No token provided');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token validation error:', error.message);
    throw new Error(`Token validation failed: ${error.message}`);
  }
};

/**
 * Check if a user has admin role from their token
 * @param {string} token - The JWT token
 * @returns {boolean} True if user is admin
 */
export const isAdminFromToken = (token) => {
  try {
    const decoded = validateToken(token);
    return decoded.role === 'admin';
  } catch (error) {
    return false;
  }
};
