// Pricing service for calculating ride fares
export class PricingService {
  constructor() {
    // Base fare configuration for different vehicle types
    this.fareConfig = {
      bike: {
        base_fare: 20, // BDT
        per_km: 8,
        per_minute: 1,
        minimum_fare: 30
      },
      cng: {
        base_fare: 30,
        per_km: 12,
        per_minute: 1.5,
        minimum_fare: 50
      },
      car: {
        base_fare: 50,
        per_km: 20,
        per_minute: 2,
        minimum_fare: 80
      }
    };

    // Surge pricing configuration
    this.surgeConfig = {
      peak_hours: [
        { start: 7, end: 9 },   // Morning rush
        { start: 17, end: 19 }   // Evening rush
      ],
      bad_weather_multiplier: 1.3,
      high_demand_multiplier: 1.5,
      weekend_multiplier: 1.1
    };
  }

  // Calculate distance between two coordinates using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRad(value) {
    return value * Math.PI / 180;
  }

  // Estimate trip duration based on distance and vehicle type
  estimateDuration(distance, vehicleType) {
    const averageSpeeds = {
      bike: 25, // km/h in Dhaka traffic
      cng: 20,
      car: 30
    };
    
    const speed = averageSpeeds[vehicleType] || 25;
    return Math.round((distance / speed) * 60); // in minutes
  }

  // Check if current time is peak hour
  isPeakHour(date = new Date()) {
    const hour = date.getHours();
    return this.surgeConfig.peak_hours.some(peak => 
      hour >= peak.start && hour < peak.end
    );
  }

  // Check if current day is weekend
  isWeekend(date = new Date()) {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }

  // Calculate surge multiplier based on various factors
  calculateSurgeMultiplier(options = {}) {
    let multiplier = 1.0;
    const now = new Date();

    // Peak hour surge
    if (this.isPeakHour(now)) {
      multiplier *= 1.5;
    }

    // Weekend surge
    if (this.isWeekend(now)) {
      multiplier *= this.surgeConfig.weekend_multiplier;
    }

    // Bad weather surge (simulated)
    if (options.badWeather) {
      multiplier *= this.surgeConfig.bad_weather_multiplier;
    }

    // High demand surge (simulated)
    if (options.highDemand) {
      multiplier *= this.surgeConfig.high_demand_multiplier;
    }

    return Math.round(multiplier * 100) / 100; // Round to 2 decimal places
  }

  // Main fare calculation method
  calculateFare(distance, estimatedDuration, vehicleType, options = {}) {
    const config = this.fareConfig[vehicleType];
    if (!config) {
      throw new Error(`Invalid vehicle type: ${vehicleType}`);
    }

    // Base calculations
    const baseFare = config.base_fare;
    const distanceFare = distance * config.per_km;
    const timeFare = estimatedDuration * config.per_minute;
    
    // Calculate surge multiplier
    const surgeMultiplier = this.calculateSurgeMultiplier(options);
    
    // Calculate total before applying minimum fare
    const subtotal = (baseFare + distanceFare + timeFare) * surgeMultiplier;
    const totalFare = Math.max(subtotal, config.minimum_fare);

    return {
      base_fare: Math.round(baseFare),
      distance_fare: Math.round(distanceFare),
      time_fare: Math.round(timeFare),
      surge_multiplier: surgeMultiplier,
      subtotal: Math.round(subtotal),
      minimum_fare: config.minimum_fare,
      total_fare: Math.round(totalFare),
      breakdown: {
        distance_km: Math.round(distance * 100) / 100,
        duration_minutes: estimatedDuration,
        rate_per_km: config.per_km,
        rate_per_minute: config.per_minute
      }
    };
  }

  // Get fare estimate for a trip
  getFareEstimate(pickup, destination, vehicleType, options = {}) {
    const distance = this.calculateDistance(
      pickup.latitude,
      pickup.longitude,
      destination.latitude,
      destination.longitude
    );

    const estimatedDuration = this.estimateDuration(distance, vehicleType);
    const fare = this.calculateFare(distance, estimatedDuration, vehicleType, options);

    return {
      distance,
      estimated_duration: estimatedDuration,
      fare,
      surge_active: fare.surge_multiplier > 1.0,
      vehicle_type: vehicleType
    };
  }

  // Get estimates for all vehicle types
  getAllVehicleEstimates(pickup, destination, options = {}) {
    const vehicleTypes = ['bike', 'cng', 'car'];
    const estimates = {};

    vehicleTypes.forEach(vehicleType => {
      estimates[vehicleType] = this.getFareEstimate(pickup, destination, vehicleType, options);
    });

    return estimates;
  }
}

// Export singleton instance
export const pricingService = new PricingService();
