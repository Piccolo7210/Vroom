// Location service for handling geographical operations
export class LocationService {
  constructor() {
    // Dhaka city boundaries (approximate)
    this.dhakaBounds = {
      north: 23.9,
      south: 23.7,
      east: 90.5,
      west: 90.3
    };

    // Common landmarks in Dhaka for location suggestions
    this.landmarks = [
      { name: "Shahbagh", lat: 23.7379, lng: 90.3947 },
      { name: "Dhanmondi", lat: 23.7465, lng: 90.3760 },
      { name: "Gulshan", lat: 23.7925, lng: 90.4078 },
      { name: "Banani", lat: 23.7937, lng: 90.4007 },
      { name: "Uttara", lat: 23.8759, lng: 90.3795 },
      { name: "Motijheel", lat: 23.7330, lng: 90.4172 },
      { name: "Mirpur", lat: 23.8223, lng: 90.3654 },
      { name: "Wari", lat: 23.7158, lng: 90.4264 },
      { name: "Farmgate", lat: 23.7583, lng: 90.3897 },
      { name: "New Market", lat: 23.7272, lng: 90.3896 }
    ];
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRad(value) {
    return value * Math.PI / 180;
  }

  // Calculate bearing between two points
  calculateBearing(lat1, lng1, lat2, lng2) {
    const dLng = this.toRad(lng2 - lng1);
    const lat1Rad = this.toRad(lat1);
    const lat2Rad = this.toRad(lat2);
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    const bearing = Math.atan2(y, x);
    return (bearing * 180 / Math.PI + 360) % 360; // Convert to degrees and normalize
  }

  // Check if coordinates are within Dhaka city bounds
  isWithinDhaka(lat, lng) {
    return lat >= this.dhakaBounds.south && lat <= this.dhakaBounds.north &&
           lng >= this.dhakaBounds.west && lng <= this.dhakaBounds.east;
  }

  // Find nearest landmark to given coordinates
  findNearestLandmark(lat, lng) {
    let nearest = null;
    let minDistance = Infinity;

    this.landmarks.forEach(landmark => {
      const distance = this.calculateDistance(lat, lng, landmark.lat, landmark.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { ...landmark, distance };
      }
    });

    return nearest;
  }

  // Generate route points between two locations (simplified)
  generateRoutePoints(startLat, startLng, endLat, endLng, numPoints = 10) {
    const points = [];
    
    for (let i = 0; i <= numPoints; i++) {
      const ratio = i / numPoints;
      const lat = startLat + (endLat - startLat) * ratio;
      const lng = startLng + (endLng - startLng) * ratio;
      
      // Add some randomness to simulate real route
      const latJitter = (Math.random() - 0.5) * 0.002;
      const lngJitter = (Math.random() - 0.5) * 0.002;
      
      points.push({
        latitude: lat + latJitter,
        longitude: lng + lngJitter,
        sequence: i
      });
    }
    
    return points;
  }

  // Simulate driver movement with realistic path
  simulateDriverPath(startLat, startLng, endLat, endLng, steps = 20) {
    const path = [];
    const totalDistance = this.calculateDistance(startLat, startLng, endLat, endLng);
    const bearing = this.calculateBearing(startLat, startLng, endLat, endLng);
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      
      // Linear interpolation with some randomness
      let lat = startLat + (endLat - startLat) * progress;
      let lng = startLng + (endLng - startLng) * progress;
      
      // Add realistic movement variation
      if (i > 0 && i < steps) {
        const variation = 0.0005; // Small variation to simulate real driving
        lat += (Math.random() - 0.5) * variation;
        lng += (Math.random() - 0.5) * variation;
      }
      
      // Calculate speed based on vehicle type and location
      const speed = this.calculateRealisticSpeed(lat, lng, progress);
      
      path.push({
        latitude: lat,
        longitude: lng,
        heading: bearing + (Math.random() - 0.5) * 20, // Some bearing variation
        speed: speed,
        timestamp: new Date(Date.now() + i * 30000), // 30 seconds intervals
        distance_covered: totalDistance * progress
      });
    }
    
    return path;
  }

  // Calculate realistic speed based on location and traffic simulation
  calculateRealisticSpeed(lat, lng, progress) {
    // Base speeds for different areas
    let baseSpeed = 25; // km/h
    
    // Speed variations based on location (simplified)
    const landmark = this.findNearestLandmark(lat, lng);
    if (landmark && landmark.distance < 2) {
      // Slower in busy areas
      baseSpeed = 15;
    }
    
    // Traffic simulation based on time
    const hour = new Date().getHours();
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      baseSpeed *= 0.6; // Rush hour traffic
    }
    
    // Speed variation during trip (start slow, speed up, slow down at end)
    if (progress < 0.1 || progress > 0.9) {
      baseSpeed *= 0.7; // Slower at start and end
    }
    
    // Add random variation
    const variation = (Math.random() - 0.5) * 0.3;
    return Math.max(5, baseSpeed * (1 + variation)); // Minimum 5 km/h
  }

  // Find drivers within radius
  findDriversInRadius(centerLat, centerLng, radiusKm, drivers) {
    return drivers.filter(driver => {
      if (!driver.current_location) return false;
      
      const distance = this.calculateDistance(
        centerLat, centerLng,
        driver.current_location.latitude,
        driver.current_location.longitude
      );
      
      return distance <= radiusKm;
    }).map(driver => ({
      ...driver,
      distance: this.calculateDistance(
        centerLat, centerLng,
        driver.current_location.latitude,
        driver.current_location.longitude
      )
    })).sort((a, b) => a.distance - b.distance);
  }

  // Get area information based on coordinates
  getAreaInfo(lat, lng) {
    const landmark = this.findNearestLandmark(lat, lng);
    
    return {
      is_within_dhaka: this.isWithinDhaka(lat, lng),
      nearest_landmark: landmark,
      area_type: this.determineAreaType(lat, lng),
      traffic_level: this.estimateTrafficLevel(lat, lng)
    };
  }

  // Determine area type based on location
  determineAreaType(lat, lng) {
    // Simplified area classification
    const landmark = this.findNearestLandmark(lat, lng);
    
    if (!landmark) return 'suburban';
    
    const commercialAreas = ['Motijheel', 'Shahbagh', 'New Market', 'Farmgate'];
    const residentialAreas = ['Dhanmondi', 'Gulshan', 'Banani', 'Uttara'];
    const mixedAreas = ['Mirpur', 'Wari'];
    
    if (commercialAreas.includes(landmark.name)) return 'commercial';
    if (residentialAreas.includes(landmark.name)) return 'residential';
    if (mixedAreas.includes(landmark.name)) return 'mixed';
    
    return 'suburban';
  }

  // Estimate traffic level
  estimateTrafficLevel(lat, lng) {
    const hour = new Date().getHours();
    const areaType = this.determineAreaType(lat, lng);
    
    let baseTraffic = 'low';
    
    // Commercial areas have more traffic during business hours
    if (areaType === 'commercial' && hour >= 9 && hour <= 18) {
      baseTraffic = 'high';
    }
    
    // Rush hour traffic
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      baseTraffic = baseTraffic === 'high' ? 'very_high' : 'high';
    }
    
    return baseTraffic;
  }

  // Validate coordinates
  validateCoordinates(lat, lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    return {
      isValid: !isNaN(latitude) && !isNaN(longitude) &&
               latitude >= -90 && latitude <= 90 &&
               longitude >= -180 && longitude <= 180,
      latitude,
      longitude,
      isWithinDhaka: this.isWithinDhaka(latitude, longitude)
    };
  }
}

// Export singleton instance
export const locationService = new LocationService();
