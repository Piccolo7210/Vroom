'use strict';

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Token debugging utility
 * 
 * Usage: 
 * 1. Add your token string below
 * 2. Run with: node debugToken.js
 */

// Replace this with the token you want to debug
const TOKEN_TO_DEBUG = 'YOUR_TOKEN_HERE';

// Make sure we have a JWT secret
if (!process.env.JWT_SECRET) {
  console.error('Error: JWT_SECRET not found in environment variables');
  process.exit(1);
}

console.log('Token Debugger');
console.log('=============');

try {
  // Try to decode the token
  console.log('Attempting to decode token...');
  
  const decoded = jwt.verify(TOKEN_TO_DEBUG, process.env.JWT_SECRET);
  
  console.log('\nToken is VALID! Decoded payload:');
  console.log(JSON.stringify(decoded, null, 2));
  
  // Check for important fields
  console.log('\nToken Analysis:');
  
  if (decoded.id) {
    console.log('✅ User ID present:', decoded.id);
  } else {
    console.log('⚠️ Missing user ID');
  }
  
  if (decoded.role) {
    console.log('✅ Role present:', decoded.role);
  } else {
    console.log('⚠️ Missing role field');
  }
  
  if (decoded.exp) {
    const expDate = new Date(decoded.exp * 1000);
    const now = new Date();
    
    if (expDate > now) {
      console.log('✅ Token is not expired. Expires:', expDate.toLocaleString());
    } else {
      console.log('❌ Token has EXPIRED on:', expDate.toLocaleString());
    }
  } else {
    console.log('⚠️ Token has no expiration date');
  }
  
} catch (error) {
  console.log('\n❌ Token is INVALID');
  console.error('Error:', error.message);
  
  try {
    // Try to decode without verifying (to see payload even if signature is invalid)
    const decodedPayload = jwt.decode(TOKEN_TO_DEBUG, { complete: true });
    if (decodedPayload) {
      console.log('\nDecoded payload (NOT VERIFIED - SIGNATURE INVALID):');
      console.log(JSON.stringify(decodedPayload, null, 2));
    }
  } catch (e) {
    console.error('Failed to decode token structure:', e.message);
  }
}
