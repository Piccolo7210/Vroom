// Middleware for handling real-time ride updates and notifications
import Ride from '../models/Ride.js';

export class RideUpdateMiddleware {
  constructor(io) {
    this.io = io;
  }

  // Notify customer about ride status changes
  notifyRideUpdate(rideId, updateData) {
    this.io.to(`ride_${rideId}`).emit('ride_update', {
      ride_id: rideId,
      ...updateData,
      timestamp: new Date()
    });
  }

  // Notify about driver assignment
  notifyDriverAssigned(rideId, driverData) {
    this.io.to(`ride_${rideId}`).emit('driver_assigned', {
      ride_id: rideId,
      driver: driverData,
      timestamp: new Date()
    });
  }

  // Notify about location updates
  notifyLocationUpdate(rideId, locationData) {
    this.io.to(`ride_${rideId}`).emit('location_update', {
      ride_id: rideId,
      location: locationData,
      timestamp: new Date()
    });
  }

  // Notify about ride completion
  notifyRideCompleted(rideId, fareData) {
    this.io.to(`ride_${rideId}`).emit('ride_completed', {
      ride_id: rideId,
      fare: fareData,
      timestamp: new Date()
    });
  }

  // Notify about ride cancellation
  notifyRideCancelled(rideId, reason, cancelledBy) {
    this.io.to(`ride_${rideId}`).emit('ride_cancelled', {
      ride_id: rideId,
      reason,
      cancelled_by: cancelledBy,
      timestamp: new Date()
    });
  }

  // Send push notification simulation (would integrate with actual push service)
  sendPushNotification(userId, title, message, data = {}) {
    console.log(`Push notification to user ${userId}: ${title} - ${message}`);
    // In a real app, this would send to FCM, APNS, etc.
    
    // For now, emit to specific user if connected
    this.io.to(`user_${userId}`).emit('push_notification', {
      title,
      message,
      data,
      timestamp: new Date()
    });
  }

  // Handle driver going online/offline
  handleDriverAvailability(driverId, isOnline, location = null) {
    if (isOnline && location) {
      // Add driver to online drivers pool
      this.io.emit('driver_online', {
        driver_id: driverId,
        location,
        timestamp: new Date()
      });
    } else {
      // Remove driver from online pool
      this.io.emit('driver_offline', {
        driver_id: driverId,
        timestamp: new Date()
      });
    }
  }

  // Emergency notification
  sendEmergencyAlert(rideId, type, location, contacts) {
    // Notify emergency contacts
    contacts.forEach(contact => {
      this.sendPushNotification(contact.user_id, 
        'Emergency Alert', 
        `Emergency situation reported for ride ${rideId}`,
        { ride_id: rideId, type, location }
      );
    });

    // Notify admin
    this.io.emit('emergency_alert', {
      ride_id: rideId,
      type,
      location,
      timestamp: new Date()
    });
  }
}

// Factory function to create middleware with Socket.IO instance
export const createRideUpdateMiddleware = (io) => {
  return new RideUpdateMiddleware(io);
};
