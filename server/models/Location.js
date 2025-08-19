import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
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
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  heading: {
    type: Number, // Direction in degrees (0-360)
    default: 0
  },
  speed: {
    type: Number, // Speed in km/h
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient location queries
locationSchema.index({ ride: 1, timestamp: -1 });
locationSchema.index({ driver: 1, timestamp: -1 });
locationSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

const Location = mongoose.model('Location', locationSchema);

export default Location;
