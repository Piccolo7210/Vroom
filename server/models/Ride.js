import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  pickup_location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true,
        default: 23.8103 // Default to Dhaka coordinates
      },
      longitude: {
        type: Number,
        required: true,
        default: 90.4125
      }
    }
  },
  destination: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true,
        default: 23.8103
      },
      longitude: {
        type: Number,
        required: true,
        default: 90.4125
      }
    }
  },
  vehicle_type: {
    type: String,
    required: true,
    enum: ['bike', 'cng', 'car'],
    default: 'bike'
  },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'picked_up', 'in_progress', 'completed', 'cancelled'],
    default: 'requested'
  },
  fare: {
    base_fare: {
      type: Number,
      default: 0
    },
    distance_fare: {
      type: Number,
      default: 0
    },
    time_fare: {
      type: Number,
      default: 0
    },
    surge_multiplier: {
      type: Number,
      default: 1.0
    },
    total_fare: {
      type: Number,
      default: 0
    }
  },
  distance: {
    type: Number, // in kilometers
    default: 0
  },
  estimated_duration: {
    type: Number, // in minutes
    default: 0
  },
  actual_duration: {
    type: Number, // in minutes
    default: 0
  },
  payment_method: {
    type: String,
    enum: ['cash', 'bkash'],
    default: 'cash'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  ride_started_at: {
    type: Date
  },
  ride_completed_at: {
    type: Date
  },
  cancelled_by: {
    type: String,
    enum: ['customer', 'driver', 'admin']
  },
  cancellation_reason: {
    type: String
  },
  otp: {
    type: String,
    length: 4
  }
}, {
  timestamps: true
});

// Index for efficient queries
rideSchema.index({ customer: 1, createdAt: -1 });
rideSchema.index({ driver: 1, createdAt: -1 });
rideSchema.index({ status: 1 });
rideSchema.index({ 'pickup_location.coordinates.latitude': 1, 'pickup_location.coordinates.longitude': 1 });

const Ride = mongoose.model('Ride', rideSchema);

export default Ride;
