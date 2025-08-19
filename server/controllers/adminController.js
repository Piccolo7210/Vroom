import Admin from '../models/Admin.js';
import Driver from '../models/Driver.js';
import Customer from '../models/Customer.js';
import Ride from '../models/Ride.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../services/emailService.js';

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
    console.log('Admin login attempt:', email);
    
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log('Admin not found:', email);
      return res.status(404).json({ message: 'Admin not found' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      console.log('Invalid password for admin:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token with admin role
    const accessToken = jwt.sign(
      { 
        id: admin._id, 
        role: 'admin',
        name: admin.name,
        email: admin.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Extended to 7 days
    );

    console.log('Admin login successful:', admin.userName);

    // Return admin data with token and role
    res.status(200).json({
      accessToken,
      name: admin.name,
      userName: admin.userName,
      email: admin.email,
      role: 'admin' // Explicitly include role in response
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get drivers pending verification
export const getPendingDrivers = async (req, res) => {
  try {
    console.log('Getting pending drivers, userId:', req.userId, 'role:', req.userRole);
    
    // Check if user is admin
    if (req.userRole !== 'admin') {
      console.error('Access denied: User is not an admin');
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied: Not authorized as admin' 
      });
    }
    
    // Query drivers with waiting status
    const drivers = await Driver.find({ verificationStatus: 'waiting' })
      .select('-password')
      .lean();
    
    console.log('Found pending drivers:', drivers?.length || 0);
    
    // Return the drivers data
    res.status(200).json({ 
      success: true, 
      count: drivers?.length || 0,
      data: drivers || []
    });
  } catch (error) {
    console.error('Error in getPendingDrivers:', error.message, error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching pending drivers', 
      error: error.message 
    });
  }
};

// Get all drivers with their verification status
export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get drivers with pagination and search (for driver management)
export const getDrivers = async (req, res) => {
  try {
    console.log('Getting drivers, userId:', req.userId, 'role:', req.userRole);
    
    // Check if user is admin
    if (req.userRole !== 'admin') {
      console.error('Access denied: User is not an admin');
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied: Not authorized as admin' 
      });
    }

    // Parse query parameters for pagination and search
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    
    // Build search query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { license: { $regex: search, $options: 'i' } },
        { 'vehicleDetails.licensePlate': { $regex: search, $options: 'i' } },
        { 'vehicleDetails.model': { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch drivers with pagination
    const drivers = await Driver.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const totalDrivers = await Driver.countDocuments(query);
    const totalPages = Math.ceil(totalDrivers / limit);
    
    console.log(`Found ${drivers.length} drivers. Total: ${totalDrivers}`);
    
    // Return drivers data
    res.status(200).json({
      success: true,
      drivers: drivers,
      totalPages,
      currentPage: page,
      totalDrivers
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching drivers', 
      error: error.message 
    });
  }
};

// Get driver by ID
export const getDriverById = async (req, res) => {
  try {
    const { driverId } = req.params;
    
    const driver = await Driver.findById(driverId).select('-password');
    
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    
    res.status(200).json({
      success: true,
      driver: driver
    });
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching driver', 
      error: error.message 
    });
  }
};

// Update driver
export const updateDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const updates = req.body;
    
    // Remove password from updates for security
    if (updates.password) {
      delete updates.password;
    }
    
    const driver = await Driver.findByIdAndUpdate(
      driverId,
      updates,
      { new: true }
    ).select('-password');
    
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Driver updated successfully',
      driver: driver
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating driver', 
      error: error.message 
    });
  }
};

// Delete driver
export const deleteDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    
    const driver = await Driver.findByIdAndDelete(driverId);
    
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting driver', 
      error: error.message 
    });
  }
};

// Verify a driver (approve or reject)
export const verifyDriver = async (req, res) => {
  try {
    const { driverId, status, rejectionReason } = req.body;
    
    if (!['trusted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid verification status' });
    }
    
    const updateData = { verificationStatus: status };
    
    // Add rejection reason if status is rejected
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    
    const driver = await Driver.findByIdAndUpdate(
      driverId,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Send email notification to driver
    try {
      let emailSubject, emailContent;
      
      if (status === 'trusted') {
        emailSubject = 'Driver Verification Approved - Welcome to Vroom!';
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #22c55e; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
              </div>
              
              <h2 style="color: #333333; margin-bottom: 20px;">Dear ${driver.name},</h2>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Great news! Your driver application has been <strong>approved</strong> by our admin team. 
                You are now a verified driver on the Vroom platform.
              </p>
              
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
                <h3 style="color: #22c55e; margin: 0 0 10px 0;">What's Next?</h3>
                <ul style="color: #666666; margin: 0; padding-left: 20px;">
                  <li>You can now start accepting ride requests</li>
                  <li>Complete your profile if you haven't already</li>
                  <li>Familiarize yourself with our driver guidelines</li>
                  <li>Start earning by providing excellent service</li>
                </ul>
              </div>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Welcome to the Vroom family! We're excited to have you on board and look forward to 
                your success on our platform.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background-color: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Get Started Now
                </a>
              </div>
              
              <div style="border-top: 1px solid #eeeeee; padding-top: 20px; margin-top: 30px; text-align: center;">
                <p style="color: #999999; font-size: 14px; margin: 0;">
                  If you have any questions, please don't hesitate to contact our support team.
                </p>
                <p style="color: #999999; font-size: 14px; margin: 5px 0 0 0;">
                  Best regards,<br>
                  <strong>The Vroom Team</strong>
                </p>
              </div>
            </div>
          </div>
        `;
      } else {
        emailSubject = 'Driver Verification Update - Vroom';
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #ef4444; margin: 0; font-size: 28px;">Driver Application Update</h1>
              </div>
              
              <h2 style="color: #333333; margin-bottom: 20px;">Dear ${driver.name},</h2>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Thank you for your interest in becoming a driver with Vroom. After careful review, 
                we regret to inform you that your driver application has not been approved at this time.
              </p>
              
              ${rejectionReason ? `
                <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                  <h3 style="color: #ef4444; margin: 0 0 10px 0;">Reason for Rejection:</h3>
                  <p style="color: #666666; margin: 0;">${rejectionReason}</p>
                </div>
              ` : ''}
              
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h3 style="color: #3b82f6; margin: 0 0 10px 0;">What You Can Do:</h3>
                <ul style="color: #666666; margin: 0; padding-left: 20px;">
                  <li>Review and update your documents if necessary</li>
                  <li>Ensure all required information is complete and accurate</li>
                  <li>You may reapply after addressing any concerns</li>
                  <li>Contact our support team if you need clarification</li>
                </ul>
              </div>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                We appreciate your understanding and encourage you to reapply once you've addressed 
                any requirements mentioned above.
              </p>
              
              <div style="border-top: 1px solid #eeeeee; padding-top: 20px; margin-top: 30px; text-align: center;">
                <p style="color: #999999; font-size: 14px; margin: 0;">
                  If you have any questions about this decision, please contact our support team.
                </p>
                <p style="color: #999999; font-size: 14px; margin: 5px 0 0 0;">
                  Best regards,<br>
                  <strong>The Vroom Team</strong>
                </p>
              </div>
            </div>
          </div>
        `;
      }
      
      // Send the email
      await sendEmail(driver.email, emailSubject, emailContent);
      console.log(`Verification email sent to driver: ${driver.email}`);
      
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Don't fail the verification process if email fails
    }
    
    res.status(200).json({
      success: true,
      message: `Driver ${status === 'trusted' ? 'approved' : 'rejected'} successfully. Email notification sent.`,
      data: driver
    });
  } catch (error) {
    console.error('Error verifying driver:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all customers with pagination and search
export const getCustomers = async (req, res) => {
  try {
    console.log('Getting customers, userId:', req.userId, 'role:', req.userRole);
    
    // Check if user is admin
    if (req.userRole !== 'admin') {
      console.error('Access denied: User is not an admin');
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied: Not authorized as admin' 
      });
    }

    // Parse query parameters for pagination and search
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    
    // Build search query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch customers with pagination
    const customers = await Customer.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const totalCustomers = await Customer.countDocuments(query);
    const totalPages = Math.ceil(totalCustomers / limit);
    
    console.log(`Found ${customers.length} customers. Total: ${totalCustomers}`);
    
    // Return customers data
    res.status(200).json({
      success: true,
      customers: customers,
      totalPages,
      currentPage: page,
      totalCustomers
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching customers', 
      error: error.message 
    });
  }
};

// Get customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const customer = await Customer.findById(customerId).select('-password');
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    res.status(200).json({
      success: true,
      customer: customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching customer', 
      error: error.message 
    });
  }
};

// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const updates = req.body;
    
    // Remove password from updates for security
    if (updates.password) {
      delete updates.password;
    }
    
    const customer = await Customer.findByIdAndUpdate(
      customerId,
      updates,
      { new: true }
    ).select('-password');
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      customer: customer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating customer', 
      error: error.message 
    });
  }
};

// Delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const customer = await Customer.findByIdAndDelete(customerId);
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting customer', 
      error: error.message 
    });
  }
};

// Get all rides with filtering and pagination
export const getRides = async (req, res) => {
  try {
    console.log('Getting rides, userId:', req.userId, 'role:', req.role);
    
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      startDate = '', 
      endDate = '' 
    } = req.query;

    // Build query filter
    let filter = {};
    
    // Status filter
    if (status) {
      filter.status = status;
    }
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add one day to include the entire end date
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        filter.createdAt.$lt = endDateObj;
      }
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get rides with populated customer and driver data
    let query = Ride.find(filter)
      .populate('customer', 'name email phone')
      .populate('driver', 'name email phone vehicle_type vehicle_no')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Search functionality
    if (search) {
      // For text search, we'll need to use a more complex query
      const searchRegex = new RegExp(search, 'i');
      
      // Find customers and drivers matching the search term
      const matchingCustomers = await Customer.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ]
      }).select('_id');

      const matchingDrivers = await Driver.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ]
      }).select('_id');

      const customerIds = matchingCustomers.map(c => c._id);
      const driverIds = matchingDrivers.map(d => d._id);

      // Update filter to include search criteria
      filter.$or = [
        { customer: { $in: customerIds } },
        { driver: { $in: driverIds } },
        { _id: searchRegex.test(search) ? search : null }
      ].filter(Boolean);

      // Recreate query with updated filter
      query = Ride.find(filter)
        .populate('customer', 'name email phone')
        .populate('driver', 'name email phone vehicle_type vehicle_no')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);
    }

    const rides = await query;
    
    // Get total count for pagination
    const totalRides = await Ride.countDocuments(filter);
    const totalPages = Math.ceil(totalRides / limitNum);

    console.log(`Found ${rides.length} rides, total: ${totalRides}`);

    // Transform rides data to match frontend expectations
    const transformedRides = rides.map(ride => ({
      _id: ride._id,
      customer: ride.customer ? {
        _id: ride.customer._id,
        name: ride.customer.name,
        email: ride.customer.email,
        phone: ride.customer.phone
      } : null,
      driver: ride.driver ? {
        _id: ride.driver._id,
        name: ride.driver.name,
        email: ride.driver.email,
        phone: ride.driver.phone,
        vehicle_type: ride.driver.vehicle_type,
        vehicle_no: ride.driver.vehicle_no
      } : null,
      pickupLocation: {
        address: ride.pickup_location?.address || 'N/A',
        coordinates: ride.pickup_location?.coordinates
      },
      dropoffLocation: {
        address: ride.destination?.address || 'N/A',
        coordinates: ride.destination?.coordinates
      },
      status: ride.status,
      price: ride.fare?.total_fare || 0,
      distance: ride.distance,
      paymentMethod: ride.payment_method,
      paymentStatus: ride.payment_status,
      createdAt: ride.createdAt,
      updatedAt: ride.updatedAt,
      rideStartedAt: ride.ride_started_at,
      rideCompletedAt: ride.ride_completed_at,
      vehicleType: ride.vehicle_type,
      estimatedDuration: ride.estimated_duration,
      actualDuration: ride.actual_duration,
      otp: ride.otp,
      cancelledBy: ride.cancelled_by,
      cancellationReason: ride.cancellation_reason
    }));

    res.status(200).json({
      success: true,
      rides: transformedRides,
      totalRides,
      totalPages,
      currentPage: pageNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    });

  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching rides', 
      error: error.message 
    });
  }
};

// Get ride by ID
export const getRideById = async (req, res) => {
  try {
    console.log('Getting ride by ID:', req.params.rideId, 'userId:', req.userId, 'role:', req.role);
    
    const { rideId } = req.params;
    
    const ride = await Ride.findById(rideId)
      .populate('customer', 'name email phone')
      .populate('driver', 'name email phone vehicle_type vehicle_no photo_link');
    
    if (!ride) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ride not found' 
      });
    }

    // Transform ride data to match frontend expectations
    const transformedRide = {
      _id: ride._id,
      customer: ride.customer ? {
        _id: ride.customer._id,
        name: ride.customer.name,
        email: ride.customer.email,
        phone: ride.customer.phone
      } : null,
      driver: ride.driver ? {
        _id: ride.driver._id,
        name: ride.driver.name,
        email: ride.driver.email,
        phone: ride.driver.phone,
        vehicle_type: ride.driver.vehicle_type,
        vehicle_no: ride.driver.vehicle_no,
        photo: ride.driver.photo_link
      } : null,
      pickupLocation: {
        address: ride.pickup_location?.address || 'N/A',
        coordinates: ride.pickup_location?.coordinates
      },
      dropoffLocation: {
        address: ride.destination?.address || 'N/A',
        coordinates: ride.destination?.coordinates
      },
      status: ride.status,
      price: ride.fare?.total_fare || 0,
      distance: ride.distance,
      paymentMethod: ride.payment_method,
      paymentStatus: ride.payment_status,
      createdAt: ride.createdAt,
      updatedAt: ride.updatedAt,
      rideStartedAt: ride.ride_started_at,
      rideCompletedAt: ride.ride_completed_at,
      vehicleType: ride.vehicle_type,
      estimatedDuration: ride.estimated_duration,
      actualDuration: ride.actual_duration,
      otp: ride.otp,
      cancelledBy: ride.cancelled_by,
      cancellationReason: ride.cancellation_reason
    };

    console.log('Ride found successfully');
    
    res.status(200).json({
      success: true,
      ride: transformedRide
    });
    
  } catch (error) {
    console.error('Error fetching ride:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching ride', 
      error: error.message 
    });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    console.log('Getting dashboard stats, userId:', req.userId, 'role:', req.role);
    
    // Get counts for all entities
    const [totalCustomers, totalDrivers, totalRides] = await Promise.all([
      Customer.countDocuments(),
      Driver.countDocuments(),
      Ride.countDocuments()
    ]);

    console.log(`Dashboard stats - Customers: ${totalCustomers}, Drivers: ${totalDrivers}, Rides: ${totalRides}`);

    res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalDrivers,
        totalRides
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching dashboard statistics', 
      error: error.message 
    });
  }
};

// Get revenue analytics data
export const getRevenueAnalytics = async (req, res) => {
  try {
    console.log('Getting revenue analytics, userId:', req.userId, 'role:', req.role);
    
    const { 
      startDate = '', 
      endDate = '' 
    } = req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add one day to include the entire end date
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        dateFilter.createdAt.$lt = endDateObj;
      }
    }

    // Get completed rides with fare data
    const completedRides = await Ride.find({
      ...dateFilter,
      status: 'completed',
      'fare.total_fare': { $gt: 0 }
    }).populate('driver', 'name photo_link')
    .populate('customer', 'name');

    // Calculate total revenue
    const totalRevenue = completedRides.reduce((sum, ride) => {
      return sum + (ride.fare?.total_fare || 0);
    }, 0);

    // Calculate today's revenue
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todayRides = completedRides.filter(ride => {
      const rideDate = new Date(ride.createdAt);
      return rideDate >= todayStart && rideDate < todayEnd;
    });
    const todayRevenue = todayRides.reduce((sum, ride) => sum + (ride.fare?.total_fare || 0), 0);

    // Calculate this week's revenue
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekRides = completedRides.filter(ride => {
      const rideDate = new Date(ride.createdAt);
      return rideDate >= weekStart;
    });
    const weekRevenue = weekRides.reduce((sum, ride) => sum + (ride.fare?.total_fare || 0), 0);

    // Calculate this month's revenue
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthRides = completedRides.filter(ride => {
      const rideDate = new Date(ride.createdAt);
      return rideDate >= monthStart;
    });
    const monthRevenue = monthRides.reduce((sum, ride) => sum + (ride.fare?.total_fare || 0), 0);

    // Calculate revenue by month for trend
    const monthlyRevenue = {};
    completedRides.forEach(ride => {
      const date = new Date(ride.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = {
          month: monthName,
          revenue: 0,
          rides: 0
        };
      }
      monthlyRevenue[monthKey].revenue += ride.fare?.total_fare || 0;
      monthlyRevenue[monthKey].rides += 1;
    });

    const revenueByMonth = Object.values(monthlyRevenue).sort((a, b) => a.month.localeCompare(b.month));

    // Calculate top earning drivers
    const driverEarnings = {};
    completedRides.forEach(ride => {
      if (ride.driver) {
        const driverId = ride.driver._id.toString();
        if (!driverEarnings[driverId]) {
          driverEarnings[driverId] = {
            name: ride.driver.name,
            photo: ride.driver.photo_link,
            earnings: 0,
            rides: 0
          };
        }
        driverEarnings[driverId].earnings += ride.fare?.total_fare || 0;
        driverEarnings[driverId].rides += 1;
      }
    });

    const topDrivers = Object.values(driverEarnings)
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);

    // Calculate popular areas (using pickup locations)
    const areaRevenue = {};
    completedRides.forEach(ride => {
      const area = ride.pickup_location?.address || 'Unknown Area';
      if (!areaRevenue[area]) {
        areaRevenue[area] = {
          name: area,
          revenue: 0,
          rides: 0
        };
      }
      areaRevenue[area].revenue += ride.fare?.total_fare || 0;
      areaRevenue[area].rides += 1;
    });

    const topAreas = Object.values(areaRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    console.log(`Revenue analytics - Total: $${totalRevenue}, Today: $${todayRevenue}, This Week: $${weekRevenue}, This Month: $${monthRevenue}`);

    res.status(200).json({
      success: true,
      totalRevenue,
      today: todayRevenue,
      lastWeekRevenue: weekRevenue,
      lastMonthRevenue: monthRevenue,
      revenueByMonth,
      topDrivers,
      topAreas,
      totalRides: completedRides.length,
      dateRange: {
        startDate: startDate || 'All time',
        endDate: endDate || 'Present'
      }
    });

  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching revenue analytics', 
      error: error.message 
    });
  }
};