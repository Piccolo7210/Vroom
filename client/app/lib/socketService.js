import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.connected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Join a specific ride room
  joinRide(rideId) {
    if (this.socket && this.connected) {
      this.socket.emit('join_ride', rideId);
    }
  }

  // Leave a ride room
  leaveRide(rideId) {
    if (this.socket && this.connected) {
      this.socket.emit('leave_ride', rideId);
    }
  }

  // Send driver location update
  updateDriverLocation(rideId, locationData) {
    if (this.socket && this.connected) {
      this.socket.emit('location_update', {
        rideId,
        ...locationData,
        timestamp: new Date()
      });
    }
  }

  // Send ride status update
  updateRideStatus(rideId, status, message) {
    if (this.socket && this.connected) {
      this.socket.emit('ride_status_update', {
        rideId,
        status,
        message,
        timestamp: new Date()
      });
    }
  }

  // Listen for driver location updates
  onDriverLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('driver_location', callback);
    }
  }

  // Listen for ride status changes
  onRideStatusChange(callback) {
    if (this.socket) {
      this.socket.on('ride_status_changed', callback);
    }
  }

  // Listen for new ride requests (for drivers)
  onNewRideRequest(callback) {
    if (this.socket) {
      this.socket.on('new_ride_request', callback);
    }
  }

  // Remove specific event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
    }
  }

  // Check if socket is connected
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Export a singleton instance
export default new SocketService();
