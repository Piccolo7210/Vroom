import mongoose from 'mongoose';

const tripHistorySchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  pickup_location: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  destination: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  vehicle_type: {
    type: String,
    enum: ['bike', 'cng', 'car']
  },
  total_fare: {
    type: Number,
    required: true
  },
  distance: {
    type: Number // in kilometers
  },
  duration: {
    type: Number // in minutes
  },
  payment_method: {
    type: String,
    enum: ['cash', 'bkash']
  },
  trip_date: {
    type: Date,
    required: true
  },
  rating: {
    customer_rating: {
      type: Number,
      min: 1,
      max: 5
    },
    driver_rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
tripHistorySchema.index({ driver: 1, trip_date: -1 });
tripHistorySchema.index({ customer: 1, trip_date: -1 });
tripHistorySchema.index({ trip_date: -1 });

const TripHistory = mongoose.model('TripHistory', tripHistorySchema);

export default TripHistory;
