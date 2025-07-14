// API service for ride-related operations
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class RideService {
  // Helper method to get auth headers
  getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get fare estimate for a single vehicle type
  async getFareEstimate(pickup_latitude, pickup_longitude, destination_latitude, destination_longitude, vehicle_type) {
    try {
      const response = await fetch(
        `${BASE_URL}/rides/fare-estimate?pickup_latitude=${pickup_latitude}&pickup_longitude=${pickup_longitude}&destination_latitude=${destination_latitude}&destination_longitude=${destination_longitude}&vehicle_type=${vehicle_type}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error getting fare estimate:', error);
      throw error;
    }
  }

  // Get fare estimates for all vehicle types
  async getAllFareEstimates(pickup_latitude, pickup_longitude, destination_latitude, destination_longitude) {
    try {
      const response = await fetch(
        `${BASE_URL}/rides/fare-estimate-all?pickup_latitude=${pickup_latitude}&pickup_longitude=${pickup_longitude}&destination_latitude=${destination_latitude}&destination_longitude=${destination_longitude}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error getting all fare estimates:', error);
      throw error;
    }
  }

  // Create a ride request
  async createRideRequest(rideData) {
    try {
      const response = await fetch(`${BASE_URL}/rides/request`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(rideData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating ride request:', error);
      throw error;
    }
  }

  // Get ride details
  async getRideDetails(rideId) {
    try {
      const response = await fetch(`${BASE_URL}/rides/${rideId}`, {
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting ride details:', error);
      throw error;
    }
  }

  // Get customer ride history
  async getRideHistory() {
    try {
      const response = await fetch(`${BASE_URL}/rides/history`, {
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting ride history:', error);
      throw error;
    }
  }

  // Get available rides (for drivers)
  async getAvailableRides(latitude, longitude, radius = 10) {
    try {
      const response = await fetch(
        `${BASE_URL}/rides/available?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
        {
          headers: this.getAuthHeaders()
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error getting available rides:', error);
      throw error;
    }
  }

  // Accept a ride (for drivers)
  async acceptRide(rideId) {
    try {
      const response = await fetch(`${BASE_URL}/rides/${rideId}/accept`, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Error accepting ride:', error);
      throw error;
    }
  }

  // Update ride status (for drivers)
  async updateRideStatus(rideId, status, otp = null, final_fare = null) {
    try {
      const body = { status };
      if (otp) body.otp = otp;
      if (final_fare) body.final_fare = final_fare;

      const response = await fetch(`${BASE_URL}/rides/${rideId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating ride status:', error);
      throw error;
    }
  }

  // Update driver location
  async updateDriverLocation(rideId, locationData) {
    try {
      const response = await fetch(`${BASE_URL}/rides/${rideId}/location`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(locationData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  }

  // Get driver location for a ride
  async getDriverLocation(rideId) {
    try {
      const response = await fetch(`${BASE_URL}/rides/${rideId}/location`);
      return await response.json();
    } catch (error) {
      console.error('Error getting driver location:', error);
      throw error;
    }
  }

  // Get driver dashboard data
  async getDriverDashboard() {
    try {
      const response = await fetch(`${BASE_URL}/rides/driver/dashboard`, {
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting driver dashboard:', error);
      throw error;
    }
  }

  // Get driver earnings
  async getDriverEarnings(period = 'month') {
    try {
      const response = await fetch(`${BASE_URL}/rides/driver/earnings?period=${period}`, {
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting driver earnings:', error);
      throw error;
    }
  }

  // Get driver status
  async getDriverStatus() {
    try {
      const response = await fetch(`${BASE_URL}/rides/driver/status`, {
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting driver status:', error);
      throw error;
    }
  }

  // Get nearby drivers
  async getNearbyDrivers(latitude, longitude, vehicle_type, radius = 5) {
    try {
      const response = await fetch(
        `${BASE_URL}/rides/nearby-drivers?latitude=${latitude}&longitude=${longitude}&vehicle_type=${vehicle_type}&radius=${radius}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error getting nearby drivers:', error);
      throw error;
    }
  }

  // Cancel a ride
  async cancelRide(rideId, reason) {
    try {
      const response = await fetch(`${BASE_URL}/rides/${rideId}/cancel`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      return await response.json();
    } catch (error) {
      console.error('Error canceling ride:', error);
      throw error;
    }
  }

  // Get driver earnings
  async getDriverEarnings(period = 'month') {
    try {
      const response = await fetch(`${BASE_URL}/driver/earnings?period=${period}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting driver earnings:', error);
      // Return default data for demo purposes
      return {
        success: false,
        data: null
      };
    }
  }
}

export default new RideService();
