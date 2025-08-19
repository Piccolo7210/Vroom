import mongoose from 'mongoose';

const earningsSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  total_fare: {
    type: Number,
    required: true
  },
  platform_commission: {
    type: Number,
    default: 0
  },
  driver_earnings: {
    type: Number,
    required: true
  },
  trip_count: {
    type: Number,
    default: 1
  },
  vehicle_type: {
    type: String,
    enum: ['bike', 'cng', 'car']
  },
  payment_method: {
    type: String,
    enum: ['cash', 'bkash']
  }
}, {
  timestamps: true
});

// Index for efficient queries
earningsSchema.index({ driver: 1, date: -1 });
earningsSchema.index({ date: -1 });

const Earnings = mongoose.model('Earnings', earningsSchema);

export default Earnings;
